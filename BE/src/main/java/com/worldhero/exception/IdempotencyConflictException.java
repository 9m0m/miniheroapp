package com.worldhero.exception;

/**
 * Thrown when a mutation operationKey is reused with a different inputHash,
 * indicating a payload mismatch. HTTP 409 Conflict.
 */
public class IdempotencyConflictException extends RuntimeException {
    public IdempotencyConflictException(String message) {
        super(message);
    }

    public IdempotencyConflictException(String operationType, String operationKey) {
        super("Idempotency key conflict for " + operationType + ": key '" + operationKey +
              "' was previously committed with a different input payload. Use a new key for a different operation.");
    }
}
