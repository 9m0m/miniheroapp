package com.worldhero.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.IdempotencyConflictException;
import com.worldhero.model.entity.ResourceMutationLedgerEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.repository.ResourceMutationLedgerRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Stateless helper for the check-then-persist idempotency pattern used in economy mutation services.
 *
 * <p>Contract:
 * <ol>
 *   <li>Call {@link #requireKey} to validate that a non-blank key was supplied.</li>
 *   <li>Call {@link #computeHash} with all input parameters to obtain a canonical inputHash.</li>
 *   <li>Call {@link #checkAndReturn} inside the pessimistic-locked transaction to look up an
 *       existing ledger entry. If found and hash matches, deserialise and return the cached
 *       response. If found with a different hash, throw {@link IdempotencyConflictException} (→ HTTP 409).</li>
 *   <li>After the mutation, call {@link #persist} to store the response atomically.
 *       Any serialisation error throws {@link RuntimeException}, rolling back the transaction
 *       so the economy change is never committed without an idempotency record.</li>
 * </ol>
 */
public final class IdempotencyHelper {

    private IdempotencyHelper() {}

    // ------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------

    private static final java.util.regex.Pattern KEY_PATTERN =
            java.util.regex.Pattern.compile("^[a-zA-Z0-9_\\-:.]{1,100}$");

    /** Throws {@link GameRuleViolationException} if operationKey is null, blank, exceeds 100 chars or contains invalid characters. */
    public static void requireKey(String operationKey, String operationType) {
        if (operationKey == null || operationKey.isBlank()) {
            throw new GameRuleViolationException(
                    "operationKey is required for " + operationType + ". Generate a stable UUID per logical action on the client.");
        }
        if (operationKey.length() > 100 || !KEY_PATTERN.matcher(operationKey).matches()) {
            throw new GameRuleViolationException(
                    "operationKey for " + operationType + " must be between 1 and 100 valid characters (alphanumeric, hyphens, underscores, colons, dots).");
        }
    }

    // ------------------------------------------------------------------
    // Hashing
    // ------------------------------------------------------------------

    /**
     * Returns a SHA-256 hex digest of the concatenated string representation of the given inputs.
     * Input order matters — callers must always pass the same fields in the same order.
     */
    public static String computeHash(Object... inputs) {
        StringBuilder sb = new StringBuilder();
        for (Object o : inputs) {
            sb.append(o == null ? "null" : o.toString());
            sb.append('|');
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(sb.toString().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm unavailable", e);
        }
    }

    // ------------------------------------------------------------------
    // Check — must be called inside a PESSIMISTIC_WRITE user transaction
    // ------------------------------------------------------------------

    /**
     * Looks up the ledger.
     * <ul>
     *   <li>No entry → returns {@code null} (caller should proceed with mutation).</li>
     *   <li>Entry found, hash matches → deserialises and returns the cached response.</li>
     *   <li>Entry found, hash differs → throws {@link IdempotencyConflictException} (HTTP 409).</li>
     * </ul>
     *
     * @param responseType the Class to deserialise into
     */
    public static <T> T checkAndReturn(
            ResourceMutationLedgerRepository repo,
            ObjectMapper mapper,
            java.util.UUID userId,
            String operationType,
            String operationKey,
            String inputHash,
            Class<T> responseType) {

        var existing = repo.findLockedByUserAndTypeAndKey(userId, operationType, operationKey);
        if (existing.isEmpty()) {
            return null; // proceed with mutation
        }
        ResourceMutationLedgerEntity entry = existing.get();
        if (!entry.getInputHash().equals(inputHash)) {
            throw new IdempotencyConflictException(operationType, operationKey);
        }
        try {
            return mapper.readValue(entry.getResponseJson(), responseType);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to deserialize cached " + operationType + " response", e);
        }
    }

    // ------------------------------------------------------------------
    // Persist — fail-closed (exception rolls back the mutation transaction)
    // ------------------------------------------------------------------

    /**
     * Persists the committed response to the ledger.
     * Serialisation failure is fatal — it throws {@link IllegalStateException} so the enclosing
     * {@code @Transactional} rolls back, ensuring the economy mutation is never committed
     * without a corresponding idempotency record.
     */
    public static <T> void persist(
            ResourceMutationLedgerRepository repo,
            ObjectMapper mapper,
            UserEntity user,
            String operationType,
            String operationKey,
            String inputHash,
            T response) {
        try {
            repo.save(ResourceMutationLedgerEntity.builder()
                    .user(user)
                    .operationType(operationType)
                    .operationKey(operationKey)
                    .inputHash(inputHash)
                    .responseJson(mapper.writeValueAsString(response))
                    .build());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to persist idempotency ledger for " + operationType, e);
        }
    }
}
