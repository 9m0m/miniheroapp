-- ==============================================================================
-- World Hero Core Game v2 -- Authoritative PostgreSQL Schema Migration Reference
-- Validated against all Hibernate JPA entities under ddl-auto=validate
-- ==============================================================================

-- 1. Summon Ledgers: Canonical Input Hash
ALTER TABLE summon_ledgers
    ADD COLUMN IF NOT EXISTS input_hash VARCHAR(64) NOT NULL DEFAULT '';

-- 2. Expedition Runs: Dispatch Idempotency Key & Input Hash (nullable=false matching entity)
ALTER TABLE expedition_runs
    ADD COLUMN IF NOT EXISTS dispatch_idempotency_key VARCHAR(100),
    ADD COLUMN IF NOT EXISTS dispatch_input_hash VARCHAR(64) NOT NULL DEFAULT '';

-- Safe backfill for existing rows so multiple historical runs per user get unique keys
UPDATE expedition_runs
    SET dispatch_idempotency_key = 'migrated_run_' || id::text
    WHERE dispatch_idempotency_key IS NULL OR dispatch_idempotency_key = '';

ALTER TABLE expedition_runs
    ALTER COLUMN dispatch_idempotency_key SET NOT NULL,
    ALTER COLUMN dispatch_idempotency_key SET DEFAULT '';

DO $BODY$
DECLARE
    r RECORD;
BEGIN
    -- Drop prior standalone/partial index on expedition_runs scoped by schema and table
    FOR r IN (
        SELECT n.nspname AS schemaname, c_idx.relname AS indexname
        FROM pg_index i
        JOIN pg_class c_idx ON c_idx.oid = i.indexrelid
        JOIN pg_class c_tbl ON c_tbl.oid = i.indrelid
        JOIN pg_namespace n ON n.oid = c_tbl.relnamespace
        WHERE c_tbl.relname = 'expedition_runs'
          AND c_idx.relname = 'uk_expedition_user_dispatch_idempotency'
          AND n.nspname = current_schema()
          AND NOT EXISTS (
              SELECT 1 FROM pg_constraint con
              WHERE con.conindid = i.indexrelid
          )
    ) LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(r.schemaname) || '.' || quote_ident(r.indexname);
    END LOOP;

    -- Add full table unique constraint strictly scoped to expedition_runs in current schema
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint con
        JOIN pg_class c_tbl ON c_tbl.oid = con.conrelid
        JOIN pg_namespace n ON n.oid = c_tbl.relnamespace
        WHERE con.conname = 'uk_expedition_user_dispatch_idempotency'
          AND c_tbl.relname = 'expedition_runs'
          AND n.nspname = current_schema()
    ) THEN
        ALTER TABLE expedition_runs
            ADD CONSTRAINT uk_expedition_user_dispatch_idempotency
            UNIQUE (user_id, dispatch_idempotency_key);
    END IF;
END
$BODY$;

-- 3. Expedition Reward Ledgers: Claim Input Hash
ALTER TABLE expedition_reward_ledgers
    ADD COLUMN IF NOT EXISTS claim_input_hash VARCHAR(64) NOT NULL DEFAULT '';

-- 4. Tower Attempts: Input Hash
ALTER TABLE tower_attempts
    ADD COLUMN IF NOT EXISTS input_hash VARCHAR(64);

-- 5. Onboarding States: Full schema with all 4 boolean tracking columns
CREATE TABLE IF NOT EXISTS onboarding_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    step VARCHAR(40) NOT NULL DEFAULT 'WELCOME',
    lifetime_pulls INT NOT NULL DEFAULT 0,
    knight_summoned BOOLEAN NOT NULL DEFAULT FALSE,
    ranger_summoned BOOLEAN NOT NULL DEFAULT FALSE,
    third_summon_completed BOOLEAN NOT NULL DEFAULT FALSE,
    first_expedition_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding_states(user_id);
