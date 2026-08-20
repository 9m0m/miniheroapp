# 🗼 Progress Tower Core v2 — REST API & Flow Specification

> **Base URL:** `/api/v1/tower`  
> **Auth:** JWT Bearer Token (`@AuthenticationPrincipal UserPrincipal`)  
> **Swagger UI:** `http://localhost:8080/swagger-ui.html`

---

## 1. Luồng dữ liệu tổng thể (Combat Lifecycle Flow)

```
[1. Khởi động / Sảnh]
FE: getMyProgress() + getFloors(seasonId)
    └── BE: Trả về progress (highestFloorCleared, savedPartyV2, seasonId) & 30 tầng config

[2. Chọn tầng & Bắt đầu trận]
FE: createAttempt({ floorNumber, slots, tactic, heroPolicies, energyPriority, idempotencyKey })
    ├── BE: Pessimistic Lock trên User
    ├── BE: Validate @Min(1) @Max(30), unique heroId, unique 3x2 cells
    ├── BE: Kiểm tra gate mở khóa tầng (floorNum <= highestFloorCleared + 1)
    ├── BE: TurnBattleEngine chạy authoritative combat simulation (Seeded RNG, max 10 rounds)
    └── BE: Trả về TowerAttemptResponseDto (winner, score, replayEvents[], combatants[])

[3. Trình chiếu trận đấu (FE Replay)]
FE: TowerBattleBoard tiêu thụ tuần tự replayEvents[]
    ├── Manual Strike: Khóa `isExecutingTurnRef`, trigger sequence sub-events
    └── Pause / Resume: Freeze timer, freeze damage popup, lưu remaining countdown

[4. Kết thúc trận đấu / Đầu hàng]
FE: acknowledgeAttempt(attemptId)
    ├── BE: Đánh dấu attempt đã acknowledge (isAcknowledged = true)
    └── FE: fetchTowerData() đồng bộ lại progress mới nhất -> Chuyển sang màn hình RESULT / LOBBY
```

---

## 2. Đặc tả chi tiết các Endpoints

### 🟢 Nhóm 1: Tiến độ & Cấu hình (Progress & Config)

#### `GET /api/v1/tower/progress/me`
* **Mô tả:** Lấy thông tin tiến độ của người chơi hiện tại, đội hình đã lưu và attempt chưa acknowledge (nếu có để recovery).
* **Request Params:** `?userId` (Optional, fallback dev).
* **Response:** `200 OK`
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "seasonId": "season-1",
  "highestFloorCleared": 5,
  "totalAttempts": 12,
  "totalStars": 15,
  "unacknowledgedAttempt": null,
  "savedPartyV2": {
    "slots": [
      { "heroId": "uuid-1", "row": "FRONT", "col": "CENTER" },
      { "heroId": "uuid-2", "row": "BACK", "col": "LEFT" },
      { "heroId": "uuid-3", "row": "BACK", "col": "RIGHT" }
    ],
    "tactic": "BALANCED",
    "heroPolicies": {
      "uuid-1": "AUTO",
      "uuid-2": "CONSERVE",
      "uuid-3": "BURST"
    },
    "energyPriority": ["uuid-3", "uuid-1", "uuid-2"]
  }
}
```

#### `GET /api/v1/tower/seasons/{seasonId}/floors`
* **Mô tả:** Lấy danh sách toàn bộ cấu hình 30 tầng của mùa giải.
* **Path Variable:** `seasonId` (ví dụ: `season-1`)
* **Response:** `200 OK`
```json
[
  {
    "floorNumber": 1,
    "recommendedLevel": 1,
    "recommendedPower": 100,
    "baseScore": 1000,
    "modifiers": [],
    "botTrio": [
      {
        "templateId": "bot_goblin_warrior",
        "name": "Goblin Fighter",
        "role": "WARRIOR",
        "level": 1,
        "maxHp": 300,
        "physAtk": 25,
        "magicAtk": 0,
        "armor": 30,
        "speed": 85,
        "gridRow": "FRONT",
        "gridCol": "CENTER",
        "avatarUrl": "/assets/monsters/goblin.png"
      }
    ],
    "rewardsPreview": {
      "gold": 500,
      "essence": 50,
      "stones": 5,
      "shards": 0
    }
  }
]
```

---

### 🟢 Nhóm 2: Đội hình 3x2 Grid (`Party V2`)

#### `POST /api/v1/tower/party/v2`
* **Mô tả:** Lưu cấu hình đội hình 3 tướng (vị trí 3x2 grid, chiến thuật, chính sách kỹ năng, ưu tiên năng lượng).
* **Validation:** 
  - Đúng chính xác 3 slots.
  - Không trùng `heroId`.
  - Không trùng tọa độ ô (`row + col`).
  - Tướng phải thuộc sở hữu của user và không bận đi thám hiểm (`EXPEDITION_BUSY`).
* **Request Body:**
```json
{
  "slots": [
    { "heroId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "row": "FRONT", "col": "CENTER" },
    { "heroId": "7ca85f64-5717-4562-b3fc-2c963f66afb7", "row": "BACK", "col": "LEFT" },
    { "heroId": "9ea85f64-5717-4562-b3fc-2c963f66afc8", "row": "BACK", "col": "RIGHT" }
  ],
  "tactic": "BALANCED",
  "heroPolicies": {
    "3fa85f64-5717-4562-b3fc-2c963f66afa6": "AUTO"
  },
  "energyPriority": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"]
}
```
* **Response:** `200 OK` (Trả về `TowerPartyV2Dto` đã lưu).

---

### 🟢 Nhóm 3: Lượt đánh & Quyết định Kết quả (Combat Attempts)

#### `POST /api/v1/tower/attempts`
* **Mô tả:** Khởi chạy lượt đánh Tower. Server giải quyết toàn bộ trận đấu (authoritative) và trả về danh sách replay event để FE trình chiếu.
* **Validation:**
  - `@Min(1) @Max(30)` cho `floorNumber`.
  - `@NotNull @Size(min=3, max=3) @Valid` cho `slots`.
  - `@NotBlank` cho `idempotencyKey`.
  - Unique `heroId` và unique `cell` coordinates.
  - Tầng phải được mở khóa (`floorNumber <= highestFloorCleared + 1`).
* **Request Body:**
```json
{
  "floorNumber": 1,
  "slots": [
    { "heroId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "row": "FRONT", "col": "CENTER" },
    { "heroId": "7ca85f64-5717-4562-b3fc-2c963f66afb7", "row": "BACK", "col": "LEFT" },
    { "heroId": "9ea85f64-5717-4562-b3fc-2c963f66afc8", "row": "BACK", "col": "RIGHT" }
  ],
  "tactic": "BALANCED",
  "heroPolicies": {},
  "energyPriority": [],
  "idempotencyKey": "attempt_1_1740045600000_abc123"
}
```
* **Response:** `200 OK`
```json
{
  "attemptId": "4ba85f64-5717-4562-b3fc-2c963f66afd9",
  "floorNumber": 1,
  "winner": "PLAYER",
  "roundsUsed": 4,
  "remainingHpPercent": 78.5,
  "score": 1420,
  "isFirstClear": true,
  "rewardsGranted": {
    "gold": 500,
    "essence": 50,
    "stones": 5,
    "shards": 0
  },
  "combatants": [ /* Danh sách 6 combatants với vị trí grid và stats ban đầu */ ],
  "replayEvents": [
    { "round": 1, "eventType": "ROUND_START", "sourceEntityId": "system" },
    { "round": 1, "eventType": "ACTION_START", "sourceEntityId": "player_1" },
    { "round": 1, "eventType": "SKILL_USE", "sourceEntityId": "player_1", "targetEntityId": "bot_1", "skillId": "slash" },
    { "round": 1, "eventType": "DAMAGE_APPLIED", "sourceEntityId": "player_1", "targetEntityId": "bot_1", "amount": 120, "targetRemainingHp": 180 },
    { "round": 4, "eventType": "BATTLE_END", "winner": "PLAYER" }
  ]
}
```

#### `POST /api/v1/tower/attempts/{attemptId}/acknowledge`
* **Mô tả:** FE gửi sau khi đã hoàn thành trình chiếu (hoặc khi người chơi bấm Retreat đầu hàng) để chốt trạng thái và giải phóng unacknowledged attempt.
* **Request Body:** `{}`
* **Response:** `200 OK`

---

## 3. Bảng Kiểm Kê Dead Code & Đề Xuất Dọn Dẹp

| Layer | Method / Endpoint | Trạng thái hiện tại | Đề xuất hành động |
|---|---|---|---|
| **FE** `towerApi.ts` | `getCurrentSeason()` | 🟡 Unused (FE lấy qua `getMyProgress()`) | Dọn dẹp |
| **FE** `towerApi.ts` | `getFloorByNumber()` | 🟡 Unused (FE lấy cả list qua `getFloors()`) | Dọn dẹp |
| **FE** `towerApi.ts` | `getPartyV2()` | 🟡 Unused (FE đọc `savedPartyV2` trong progress) | Dọn dẹp |
| **FE** `towerApi.ts` | `getAttempt()` | 🟡 Unused (Replay inline trong `createAttempt`) | Dọn dẹp |
| **FE** `towerApi.ts` | `getAttemptReplay()` | 🟡 Unused | Dọn dẹp |
| **BE** `TowerController` | `GET /tower/seasons/current` | 🟢 Standalone | Giữ cho OpenAPI / External Tools |
| **BE** `TowerController` | `GET /tower/floors/{floorNumber}` | 🟢 Standalone | Giữ cho REST standard |
| **BE** `TowerController` | `GET /tower/party/v2` | 🟢 Standalone | Giữ cho REST standard |
| **BE** `TowerController` | `GET /tower/attempts/{id}` | 🟢 Standalone | Giữ cho Admin / Audit replay |
| **BE** `TowerController` | `GET /tower/attempts/{id}/replay`| 🟢 Standalone | Giữ cho Admin / Audit replay |
| **BE** `TowerController` | `GET /tower/seasons/{id}/leaderboard` | 🔵 Ready for Feature | Giữ sẵn để tích hợp Tab BXH Leaderboard |
