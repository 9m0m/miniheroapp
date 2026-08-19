/**
 * Durable Client-Side Idempotency and Pending Operation Manager.
 *
 * Contract:
 * - Persists a small, versioned schema in sessionStorage (fail-closed on economy mutations).
 * - Retains { operationType, payloadKey, operationKey, createdAt } per independent payload.
 * - Reuses the exact same operationKey across retries (network loss, timeout, 408, 429, 5xx, WebView reload)
 *   without blind timer-based expiration, aligning with backend ledger durability.
 * - Invalidates / clears key upon terminal success (200 OK) or deterministic 4xx terminal error.
 * - HTTP 409 Conflict invalidates the key immediately (cannot be retried with the same key).
 * - Bound synchronously to authoritative authenticated user (cleared on logout or account switch).
 * - Generates cryptographically secure UUIDs only (fails cleanly if secure crypto is absent).
 *
 * Storage-first guarantee (P0-1):
 *   inMemoryOperations is ONLY updated AFTER a successful sessionStorage write.
 *   RAM is never mutated before the write succeeds, so a storage failure leaves no phantom RAM entry.
 *
 * Cold-start account-switch guard (P0-new):
 *   setUserId() sets currentUserId BEFORE calling hydrate(), so hydrate() can compare
 *   the stored userId against the authoritative incoming userId and discard cross-account operations.
 *   hydrate() never infers or adopts currentUserId from storage.
 */

export type MutationType = 'LEVEL_UP' | 'STAR_UP' | 'ENHANCE' | 'TRANSFER' | 'SALVAGE';

export interface PendingOperation {
  operationType: MutationType;
  payloadKey: string;
  operationKey: string;
  createdAt: number;
}

const STORAGE_KEY = 'worldhero_pending_operations_v1';
const STORAGE_VERSION = 1;

interface StoredSchema {
  version: number;
  userId?: string;
  operations: Record<string, PendingOperation>;
}

// In-memory mirror — only ever mutated AFTER a successful sessionStorage write.
let inMemoryOperations: Record<string, PendingOperation> = {};
// currentUserId MUST be set by setUserId() before hydrate() is called.
// hydrate() NEVER reads or writes currentUserId from/to storage.
let currentUserId: string | undefined;
let isHydrated = false;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

/**
 * Loads operations from sessionStorage into the RAM mirror.
 * Requires currentUserId to be set BEFORE calling; rejects storage from a different userId.
 * Never infers or sets currentUserId — that is exclusively setUserId()'s responsibility.
 */
function hydrate(): void {
  if (!isBrowser() || isHydrated) return;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredSchema = JSON.parse(raw);
      if (parsed && parsed.version === STORAGE_VERSION && parsed.operations) {
        // Cross-user check: currentUserId must be set by setUserId() before hydrate().
        // If stored userId doesn't match the authoritative currentUserId, discard and wipe.
        if (parsed.userId && currentUserId && parsed.userId !== currentUserId) {
          // Storage belongs to a different user — discard it and remove from storage.
          inMemoryOperations = {};
          try {
            window.sessionStorage.removeItem(STORAGE_KEY);
          } catch {}
        } else if (!parsed.userId || !currentUserId || parsed.userId === currentUserId) {
          // Same user or first-ever hydration with no stored userId — load operations.
          inMemoryOperations = parsed.operations;
        } else {
          inMemoryOperations = {};
        }
      }
    }
  } catch {
    inMemoryOperations = {};
  }
  isHydrated = true;
}

/**
 * Writes the given snapshot to sessionStorage.
 * Does NOT touch inMemoryOperations.
 * Throws if the write fails.
 */
function persistRaw(snapshot: Record<string, PendingOperation>): void {
  if (!isBrowser()) {
    throw new Error('Durable client storage (sessionStorage) is required for idempotent economy mutations.');
  }
  const data: StoredSchema = {
    version: STORAGE_VERSION,
    userId: currentUserId,
    operations: snapshot,
  };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err: any) {
    throw new Error(
      'Failed to persist pending economy operation to durable storage: ' +
        (err?.message || 'storage unavailable')
    );
  }
}

/**
 * Generates an RFC-4122 v4 UUID using globalThis.crypto.
 * Fails cleanly if secure browser cryptography is not available.
 */
export function generateOperationKey(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const arr = new Uint8Array(16);
    globalThis.crypto.getRandomValues(arr);
    arr[6] = (arr[6] & 0x0f) | 0x40;
    arr[8] = (arr[8] & 0x3f) | 0x80;
    const hex = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  throw new Error('Secure platform cryptography (crypto.randomUUID / crypto.getRandomValues) is required.');
}

function registryKey(type: MutationType, payloadKey: string): string {
  return `${type}:${payloadKey}`;
}

export const idempotencyManager = {
  /**
   * Sets the active authenticated userId.
   *
   * Cold-start / account-switch guarantee:
   *   Sets currentUserId BEFORE calling hydrate(), so hydrate() can compare the stored userId
   *   against the authoritative userId and discard cross-account operations.
   *
   * Logout: pass null/undefined to clear all pending operations.
   */
  setUserId(userId?: string | null): void {
    if (!userId) {
      // Logout — clear everything first, then reset hydration state.
      inMemoryOperations = {};
      currentUserId = undefined;
      isHydrated = false;
      if (isBrowser()) {
        try {
          window.sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // best-effort on logout clear
        }
      }
      return;
    }

    if (currentUserId && userId !== currentUserId) {
      // Account switch — discard old user's operations and reset hydration state
      // so the next hydrate() loads fresh for the incoming user.
      inMemoryOperations = {};
      isHydrated = false;
    }

    // Set currentUserId BEFORE hydrate() so the user-mismatch check inside hydrate() works.
    currentUserId = userId;
    hydrate();

    // Persist the (possibly empty) operations map stamped with the new userId.
    persistRaw(inMemoryOperations);
  },

  /**
   * Retrieves an existing pending key for (operationType, payloadKey), or creates and durably registers a new one.
   *
   * Fail-closed guarantees:
   * 1. Throws immediately if called before setUserId() (no authenticated user).
   * 2. Generates the new operationKey FIRST, writes to sessionStorage SECOND.
   *    Only on write success is the RAM mirror updated.
   *    If sessionStorage throws, the RAM mirror is NOT updated, so the next call attempts a fresh write.
   */
  getOrCreateKey(type: MutationType, payloadKey: string): string {
    hydrate();

    // Block economy mutations if no authenticated user is bound
    if (!currentUserId) {
      throw new Error(
        `Cannot create idempotency key for ${type}:${payloadKey} — no authenticated user bound. Call setUserId() first.`
      );
    }

    const fullKey = registryKey(type, payloadKey);
    const existing = inMemoryOperations[fullKey];

    if (existing) {
      // Existing entry is in RAM — meaning a prior persistRaw succeeded for this entry.
      return existing.operationKey;
    }

    // Build the new entry and write to sessionStorage BEFORE updating RAM.
    const operationKey = generateOperationKey();
    const newEntry: PendingOperation = {
      operationType: type,
      payloadKey,
      operationKey,
      createdAt: Date.now(),
    };
    const nextOperations = { ...inMemoryOperations, [fullKey]: newEntry };

    // Throws if storage fails — RAM is NOT updated, maintaining fail-closed guarantee.
    persistRaw(nextOperations);

    // Only reach here on successful write.
    inMemoryOperations = nextOperations;

    return operationKey;
  },

  /**
   * Clears the pending operation on terminal success or non-retryable 4xx client error.
   * Storage-first: RAM is updated only after a successful write.
   * On storage failure, the stale RAM entry is left intact; the backend ledger will
   * correctly reject any future retry with an already-committed key.
   */
  clearKey(type: MutationType, payloadKey: string): void {
    hydrate();
    const fullKey = registryKey(type, payloadKey);
    if (!inMemoryOperations[fullKey]) return;

    const nextOperations = { ...inMemoryOperations };
    delete nextOperations[fullKey];

    try {
      persistRaw(nextOperations);
      // Only update RAM after successful write.
      inMemoryOperations = nextOperations;
    } catch {
      // clearKey on the success path — storage failure leaves a harmless stale entry.
      // Do NOT update RAM so the entry remains accurately reflected as still durable.
    }
  },

  /**
   * Determines if an error is retryable with the same operationKey.
   * - Network error, timeout, HTTP 408, HTTP 429, HTTP 5xx -> RETRYABLE (true).
   * - HTTP 409 Conflict -> NOT retryable with same key (false).
   * - Other 4xx (400, 401, 403, 404, 422) -> NOT retryable (false).
   */
  isRetryableError(err: any): boolean {
    if (!err || !err.response) {
      return true;
    }
    const status = err.response.status;
    if (status === 408 || status === 429 || status >= 500) {
      return true;
    }
    return false;
  },

  /**
   * Central error classifier for all 5 mutations.
   * Clears key on non-retryable errors or 409 conflicts. Retains key on retryable network/5xx/408/429.
   */
  handleMutationError(type: MutationType, payloadKey: string, err: any): void {
    if (!this.isRetryableError(err)) {
      this.clearKey(type, payloadKey);
    }
  },

  /**
   * Checks if an operation is currently pending.
   */
  hasPending(type: MutationType, payloadKey: string): boolean {
    hydrate();
    const fullKey = registryKey(type, payloadKey);
    return !!inMemoryOperations[fullKey];
  },

  /**
   * Clears all pending operations for a given type.
   * Storage-first: RAM is updated only after a successful write.
   */
  invalidateType(type: MutationType): void {
    hydrate();
    let modified = false;
    const nextOperations = { ...inMemoryOperations };
    for (const [k, op] of Object.entries(nextOperations)) {
      if (op.operationType === type) {
        delete nextOperations[k];
        modified = true;
      }
    }
    if (modified) {
      try {
        persistRaw(nextOperations);
        // Only update RAM after successful write.
        inMemoryOperations = nextOperations;
      } catch {
        // best-effort invalidation — storage failure leaves stale entries intact.
      }
    }
  },

  /**
   * Clears the entire registry on logout / session reset.
   */
  clearAll(): void {
    inMemoryOperations = {};
    currentUserId = undefined;
    isHydrated = false;
    if (isBrowser()) {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // best-effort
      }
    }
  },
};
