# World Hero Core v2 API Contract

Status: active local-development hard cut. All paths below are under `/api/v1`.

Frontend callers are the named service modules under `FE/src/services`; feature components call those services rather than backend URLs directly.

## Surviving backend endpoints and frontend callers

### Authentication and account

- `POST /auth/world-id`, `POST /auth/local-login`, `GET /auth/me` -> `authApi`/`client` authentication flow.
- `GET /health` -> health checks.
- `GET /user/profile` -> `userApi`, store hydration.
- `GET /config/features` -> `configApi`, Core navigation bootstrap. Response exposes Core availability only.
- `GET /onboarding/state`, `POST /onboarding/advance` -> `onboardingApi`, onboarding UI.

### Core heroes and recruitment

- `GET /heroes`, `POST /heroes/revive` -> `heroApi`, hero screens and revive flow.
- `POST /heroes/{heroId}/level-up`, `POST /heroes/{heroId}/star-up` -> `upgradeApi`/hero progression UI.
- `GET /heroes/{heroId}/skills`, `POST /heroes/skills/upgrade` -> `skillApi`, skill UI.
- `GET /hero-catalog`, `GET /hero-catalog/{templateId}`, `GET /hero-catalog/enabled` -> `heroCatalogApi`, roster and recruitment.
- `GET /recruitment/banners`, `POST /recruitment/pull`, `GET /recruitment/history` -> `recruitmentApi`, recruitment flow.

### Inventory and workshop

- `GET /inventory`, `POST /inventory/equip`, `POST /inventory/unequip`, `POST /inventory/open-chest`, `POST /inventory/unlock-slots` -> `inventoryApi`/`chestVaultApi`, inventory and equipment UI.
- `GET /item-templates` -> `itemTemplateApi`, inventory/admin UI.
- `POST /upgrade/enhance` -> `upgradeApi`, workshop.
- `POST /crafting/inlay-gem`, `POST /crafting/remove-gem`, `POST /crafting/bless`, `POST /crafting/blacksmith`, `POST /crafting/alchemy` -> `craftingApi`, workshop.
- `POST /cube/transmute-9`, `POST /cube/fuse`, `POST /cube/fuse-gems` -> `cubeApi`, workshop.
- `GET /chest-vault`, `POST /chest-vault/open` -> `chestVaultApi`, chest vault.

### Core progression and activities

- `GET /expeditions/config`, `GET /expeditions`, `POST /expeditions`, `POST /expeditions/{runId}/claim`, `POST /expeditions/{runId}/cancel` -> `expeditionApi`, expedition flow.
- `GET /quests/overview`, `POST /quests/claim`, `POST /quests/milestones/claim` -> `questApi`, quest UI.
- `GET /arena/leaderboard`, `POST /arena/submit`, `POST /arena/privacy`, `GET /arena/inspect`, `GET /arena/admin/audit` -> `trialApi`, Trial Arena.
- `GET /monetization/status`, `POST /monetization/smash-piggy-bank`, `POST /monetization/claim-daily-pass`, `POST /monetization/claim-growth-fund`, `POST /monetization/verify-payment` -> `monetizationApi`, local monetization UI.

### Core Progress Tower

- `GET /tower/progress/me` -> `towerApi.getMyProgress` (hydrates progress, seasonId, savedPartyV2, and unacknowledged attempts).
- `GET /tower/seasons/{seasonId}/floors` -> `towerApi.getFloors` (retrieves full 30-floor configs for current season).
- `POST /tower/party/v2` -> `towerApi.savePartyV2` (saves 3x2 grid placements, tactic, policies, energy priority).
- `POST /tower/attempts` -> `towerApi.createAttempt` (authoritative combat resolution, max 10 rounds, inline replayEvents).
- `POST /tower/attempts/{attemptId}/acknowledge` -> `towerApi.acknowledgeAttempt` (acknowledges completion or retreat).
- `GET /tower/seasons/{seasonId}/leaderboard` -> Tower leaderboard caller (top 50 ranking).
- Standalone / Admin Endpoints: `GET /tower/seasons/current`, `GET /tower/floors/{floorNumber}`, `GET /tower/party/v2`, `GET /tower/attempts/{attemptId}`, `GET /tower/attempts/{attemptId}/replay`.

### Admin and operational endpoints

- `POST /auth/admin/login` -> admin login.
- `GET /admin/dashboard/stats`, Core catalog/item/skill/quest admin endpoints -> `adminApi`, admin UI. Campaign stage/wave/monster endpoints are removed, not part of this contract.

## Removed endpoints

- All `/api/v1/worlds` endpoints.
- Any Campaign battle, Campaign party, stage, wave or World Map endpoint.
- `POST /api/v1/tower/party` and all `TowerPartyDto` request/response contracts.
- Any endpoint accepting `HeroClass` as owned identity, equipment owner, skill owner or party member.
- Any legacy feature configuration endpoint/field such as `legacyCampaignEnabled`.

## Contract rules

- Backend identity is derived from the authenticated user; optional local-development user IDs must not restore Legacy behavior.
- Core hero payloads carry `heroInstanceId`, `heroTemplateId` and `role` where applicable.
- Equipment mutations identify the owning hero with `heroInstanceId`.
- Tower party payloads use only hero instance IDs and grid slots.
- No compatibility fallback, alias, deprecation endpoint, backfill or dual response is allowed.
