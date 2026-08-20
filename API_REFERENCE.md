# 📚 ĐẶC TẢ TÀI LIỆU REST API TOÀN DIỆN & SYSTEM ARCHITECTURE (WORLD HERO)

> **Phiên bản:** v2.5 (Production & Codex Architecture Review Ready)  
> **Backend Base URL:** `http://localhost:8080/api/v1`  
> **Swagger UI Trực Quan:** `http://localhost:8080/swagger-ui.html`  
> **OpenAPI JSON Spec:** `http://localhost:8080/v3/api-docs`  
> **Frontend Service Layer:** `FE/src/services/` (15 Domain Modules + Centralized Gateway `api.ts`)  

---

## 🗺️ 1. TỔNG QUAN KIẾN TRÚC API (DOMAIN-DRIVEN MODULAR ARCHITECTURE)

Hệ thống REST API được thiết kế theo cấu trúc Domain-Driven Design (DDD) với 15 Domain Modules độc lập, phục vụ cả Client Player và SuperAdmin LiveOps:

```text
FE/src/services/
├── client.ts             ──► Base Axios Instance + Color Coded Interceptors & Error Handlers
├── userApi.ts            ──► Domain 1: Hồ sơ tài khoản & Ví tài nguyên (Gold, Gems, Stones)
├── heroApi.ts            ──► Domain 2: 4 Tướng + Live Stats (StatEvaluator) & Live DPS
├── inventoryApi.ts       ──► Domain 3: Túi đồ, Trang bị, Tháo đồ & Mở 3 Cấp Rương
├── battleApi.ts          ──► Domain 4: Diệt quái 30 Waves, Rớt rương & Tích lũy Két Sắt
├── upgradeApi.ts         ──► Domain 5: Cường hóa +1 -> +15 & Bùa Bảo Hiểm Lucky Forge
├── cubeApi.ts            ──► Domain 6: The Magic Cube (Smart Fusion 3:1, Gem Fusion 3:1, Transmute 9)
├── craftingApi.ts        ──► Domain 7: Khảm Ngọc, Ép Bùa, Xưởng Thợ Rèn & Lò Giả Kim
├── monetizationApi.ts    ──► Domain 8: Két Sắt 0.5 WLD, Awakening Pass 1.0 WLD, Growth Fund 2.0 WLD
├── skillApi.ts           ──► Domain 9: Cây Kỹ Năng 4 Tướng (Skill Tree Upgrade tiêu Gold)
├── worldApi.ts           ──► Domain 10: 4 Thế Giới, 40 Stages & Master Boss Trấn Thủ
├── questApi.ts           ──► Domain 11: Dual Quest Engine (6 Daily Milestones + 6 Weekly Milestones)
├── trialApi.ts           ──► Domain 12: Đấu Trường Thử Nghiệm 30s DPS, Boss TTK & Opt-in Privacy
├── adminApi.ts           ──► Domain 13: SuperAdmin Auth, Stage Balancer, Monster/Item CMS & Monte Carlo Sim
├── api.ts                ──► Centralized Gateway (Tổng hợp toàn bộ APIs thành singleton `gameApi`)
└── index.ts              ──► Barrel Export (@/services)
```

---

## 🚀 2. CHI TIẾT TỪNG DOMAIN MODULE & ĐẶC TẢ ENDPOINTS

---

### 👤 DOMAIN 1: USER & WALLET PROFILE (`userApi.ts` ➔ `UserController.java`)
Quản lý tài khoản, số dư ví tiền tệ (Gold, Gems, Stones) và trạng thái tích lũy Két Sắt.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/user/profile` | `?userId=<UUID>` *(Optional, mặc định lấy hoặc tạo Demo User)* | Lấy toàn bộ thông tin hồ sơ tài khoản người chơi. | `UserProfileDto` |

#### Phản hồi mẫu `UserProfileDto`:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "HeroDemoUser",
  "gold": 1187798,
  "gems": 50,
  "enhanceStones": 611,
  "currentWorld": 1,
  "currentStage": 1,
  "currentWave": 6,
  "piggyBankGems": 150,
  "isGoldenPassActive": false,
  "growthFundUnlocked": false,
  "isBuildPublic": true,
  "createdAt": "2026-08-16T10:00:00Z"
}
```

---

### 🛡️ DOMAIN 2: HEROES & LIVE STATS ENGINE (`heroApi.ts` ➔ `HeroController.java`)
Lấy danh sách 4 Tướng, trang bị đang mặc trên từng ô trong 8 slot và 21 chỉ số Stats được tính toán tự động qua `StatEvaluator`.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/heroes` | `?userId=<UUID>` *(Optional)* | Lấy danh sách 4 Class Tướng kèm trang bị và chỉ số động. | `List<HeroDetailDto>` |

#### Phản hồi mẫu `HeroDetailDto`:
```json
[
  {
    "id": "h1-uuid",
    "heroClass": "WARRIOR",
    "level": 1,
    "equippedItems": [
      {
        "id": "item-001",
        "templateId": "wpn_iron_sword",
        "slot": "MAIN_HAND",
        "rarity": "UNCOMMON",
        "enhanceLevel": 3,
        "itemLevel": 1,
        "sockets": [],
        "blessingId": null
      }
    ],
    "computedStats": {
      "physAtk": 65.0,
      "magicAtk": 0.0,
      "armor": 120.0,
      "maxHp": 450.0,
      "critRate": 8.0,
      "critDmg": 50.0,
      "atkSpeed": 10.0,
      "dmgReduction": 5.0
    },
    "liveDps": 68.5
  }
]
```

---

### 🎒 DOMAIN 3: INVENTORY, EQUIPMENT & CHESTS (`inventoryApi.ts` ➔ `InventoryController.java`)
Quản lý túi đồ, thao tác mặc/tháo trang bị vào ma trận 8 ô và cơ chế mở 3 cấp rương.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/inventory` | `?userId=<UUID>` | Lấy danh sách toàn bộ vật phẩm & rương trong túi đồ. | `List<ItemInstanceDto>` |
| `POST` | `/api/v1/inventory/equip` | **Body:** `EquipRequestDto` (`userId`, `heroId`, `itemInstanceId`, `targetSlot`) | Mặc trang bị từ túi lên Tướng (tự tháo đồ cũ về túi nếu trùng ô). | `HeroDetailDto` |
| `POST` | `/api/v1/inventory/unequip` | **Body:** `UnequipRequestDto` (`userId`, `itemInstanceId`) | Tháo trang bị từ Tướng về lại túi đồ. | `HeroDetailDto` |
| `POST` | `/api/v1/inventory/open-chest` | **Body:** `OpenChestRequestDto` (`userId`, `chestInstanceId`) | Mở 1 rương, tiêu hủy rương trong DB và tạo trang bị mới unboxed (Authoritative loot drops). | `OpenChestResponseDto` |
| `POST` | `/api/v1/inventory/unlock-slots` | `?userId=<UUID>&targetSlots=<int>` | Mở rộng dung lượng ô túi đồ. | `Integer` |

#### Cấu trúc `OpenChestResponseDto`:
```json
{
  "unboxedItem": {
    "id": "unboxed-uuid-999",
    "templateId": "arm_knight_plate",
    "rarity": "RARE",
    "enhanceLevel": 0,
    "itemLevel": 1,
    "sockets": [],
    "blessingId": null
  },
  "remainingChestsCount": 6
}
```

---

### ⚔️ DOMAIN 4: BATTLE PROGRESSION ENGINE (`battleApi.ts` ➔ `BattleController.java`)
Gửi kết quả vượt Wave, tính thưởng Vàng/Đá, tích lũy Gems Két Sắt và tính tỷ lệ rơi rương hợp lệ với Idempotency Key chống replay.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/battle/wave-clear` | **Body:** `WaveClearRequestDto` (`userId`, `world`, `stage`, `wave`, `isBossWave`, `runId`, `idempotencyKey`) | Gửi kết quả hoàn thành 1 Wave diệt quái. | `WaveClearResponseDto` |

#### Cấu trúc `WaveClearResponseDto`:
```json
{
  "goldEarned": 75,
  "enhanceStonesEarned": 1,
  "piggyBankGemsAdded": 5,
  "totalPiggyBankGems": 155,
  "droppedChest": true,
  "droppedChestTemplateId": "chest_normal",
  "totalGold": 1187873,
  "totalStones": 612
}
```

---

### 🔨 DOMAIN 5: ITEM ENHANCEMENT (+1 ĐẾN +15) (`upgradeApi.ts` ➔ `EnhanceController.java`)
Cường hóa trang bị từ +0 lên tối đa +15 với cơ chế bảo hiểm Lucky Forge.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/upgrade/enhance` | **Body:** `EnhanceRequestDto` (`userId`, `itemInstanceId`, `useInsurance`) | Cường hóa trang bị tiêu Vàng + Đá (+11..+15 có rủi ro tụt cấp). | `EnhanceResponseDto` |

#### Quy Tắc Tỷ Lệ Cường Hóa:
* $+1 \rightarrow +5$: 100% Thành công.
* $+6 \rightarrow +10$: 80% $\rightarrow$ 40% Thành công (Thất bại: giữ nguyên cấp).
* $+11 \rightarrow +15$: 30% $\rightarrow$ 10% Thành công (Thất bại: tụt 1 cấp, trừ khi `useInsurance: true`).

---

### 🎲 DOMAIN 6: THE MAGIC CUBE (`cubeApi.ts` ➔ `CubeController.java`)
Khối hợp nhất The Magic Cube với 3 cơ chế: Smart Fusion 3:1, Gem Fusion 3:1 và Transmute 9.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/cube/fuse` | **Body:** `SmartFusionRequestDto` (`userId`, `itemInstanceIds: [id1, id2, id3]`) | Ghép đúng 3 phôi cùng phẩm cấp ➔ Tạo 1 món phẩm cấp trên. | `ItemInstanceDto` |
| `POST` | `/api/v1/cube/fuse-gems` | **Body:** `GemFusionRequestDto` (`userId`, `gemType`, `sourceTier`) | Ghép 3 viên ngọc Tier $N \rightarrow$ 1 viên ngọc Tier $N+1$. | `String` (ID ngọc mới) |
| `POST` | `/api/v1/cube/transmute-9` | **Body:** `Transmute9RequestDto` (`userId`, `itemInstanceIds: [9 IDs]`) | Ma trận 9 món ➔ Tạo trang bị phẩm cấp cao kèm tỷ lệ Jackpot. | `Transmute9ResponseDto` |

---

### 🧪 DOMAIN 7: CRAFTING, SOCKETS & ALCHEMY (`craftingApi.ts` ➔ `CraftingController.java`)
Khảm ngọc vào ô chứa, tháo ngọc, ép Giấy Chúc Phúc và rèn phụ kiện.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/crafting/inlay-gem` | **Body:** `SocketOperationRequestDto` (`userId`, `itemInstanceId`, `gemId`) | Khảm 1 viên ngọc vào ô trống trên trang bị. | `ItemInstanceDto` |
| `POST` | `/api/v1/crafting/remove-gem` | **Body:** `SocketOperationRequestDto` (`userId`, `itemInstanceId`, `socketIndex`) | Gỡ ngọc ra khỏi trang bị và trả lại túi đồ. | `ItemInstanceDto` |
| `POST` | `/api/v1/crafting/bless` | **Body:** `BlessRequestDto` (`userId`, `itemInstanceId`, `blessingId`) | Ép Giấy Chúc Phúc lên trang bị (`SCROLL_OF_MIGHT`, `SCROLL_OF_AEGIS`...). | `ItemInstanceDto` |
| `POST` | `/api/v1/crafting/blacksmith` | **Body:** `CraftRequestDto` (`userId`, `recipeId`) | Rèn 4 Phụ Kiện Universal (Nhẫn Hồng Ngọc, Dây Chuyền, Bùa Hộ Mệnh). | `ItemInstanceDto` |
| `POST` | `/api/v1/crafting/alchemy` | **Body:** `CraftRequestDto` (`userId`, `recipeId`) | Nấu Giấy Chúc Phúc tại Lò Giả Kim. | `String` |

---

### 💎 DOMAIN 8: MONETIZATION & WORLD NETWORK (`monetizationApi.ts` ➔ `MonetizationController.java`)
Kinh tế vi mô tích hợp World App MiniKit (0.5 - 2.0 WLD).

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/monetization/status` | `?userId=<UUID>` | Lấy trạng thái Két Sắt, Chuỗi 7 Ngày và Quỹ Thám Hiểm. | `MonetizationStatusDto` |
| `POST` | `/api/v1/monetization/smash-piggy-bank` | `?userId=<UUID>` | Đập Két Sắt nhận toàn bộ Gems tích lũy (sau khi thanh toán 0.5 WLD). | `UserProfileDto` |
| `POST` | `/api/v1/monetization/claim-daily-pass` | `?userId=<UUID>` | Nhận thưởng ngày $N$ của Chuỗi 7 Ngày (Free hoặc Golden x5). | `UserProfileDto` |
| `POST` | `/api/v1/monetization/claim-growth-fund` | `?userId=<UUID>&stageMilestone=<int>` | Rút cổ tức Quỹ Thám Hiểm khi vượt Stage 10, 20, 30, 40. | `UserProfileDto` |
| `POST` | `/api/v1/monetization/mock-wld-pay` | **Body:** `MockWldPayRequestDto` (`userId`, `featureKey`, `amountWld`) | Mô phỏng thanh toán 1-touch WLD qua MiniKit Sandbox. | `UserProfileDto` |

---

### ⚡ DOMAIN 9: HERO SKILL TREE ENGINE (`skillApi.ts` ➔ `SkillController.java`)
Cây kỹ năng phân nhánh cho 4 Tướng tiêu thụ Gold.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/heroes/{heroId}/skills` | Path: `heroId` (UUID) | Lấy 3 nhánh kỹ năng, cấp độ (0-5) và chi phí Gold nâng cấp tiếp theo. | `HeroSkillTreeDto` |
| `POST` | `/api/v1/heroes/skills/upgrade` | **Body:** `UpgradeSkillRequestDto` (`userId`, `heroId`, `skillId`) | Nâng cấp 1 điểm kỹ năng tiêu Gold và cập nhật Stats ngay. | `HeroDetailDto` |

---

### 🗺️ DOMAIN 10: WORLDS & PROGRESSION (`worldApi.ts` ➔ `WorldController.java`)
Thông tin 4 Thế Giới (40 Stages), đặc tính nguyên tố và Boss trấn thủ.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/worlds` | *None* | Lấy danh mục 4 Thế Giới (Emerald Forest, Frozen Citadel, Volcanic, Void). | `List<WorldConfigDto>` |

---

### 📜 DOMAIN 11: DUAL QUEST ENGINE (`questApi.ts` ➔ `QuestController.java` & `AdminQuestController.java`)
Hệ thống nhiệm vụ kép 6 mốc năng động Daily (120p) và Weekly (600p).

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/quests/overview` | `?userId=<UUID>` | Lấy toàn bộ tiến độ nhiệm vụ Daily, Weekly và trạng thái 6 mốc nhận rương. | `QuestOverviewResponseDto` |
| `POST` | `/api/v1/quests/claim` | `?userId=<UUID>&questId=<String>` | Nhận thưởng điểm năng động từ 1 nhiệm vụ đã hoàn thành. | `QuestOverviewResponseDto` |
| `POST` | `/api/v1/quests/milestones/claim` | `?userId=<UUID>&questType=<DAILY\|WEEKLY>&milestoneIndex=<int>` | Nhận thưởng rương mốc tích lũy điểm năng động (Mốc 0..5). | `QuestOverviewResponseDto` |
| `GET` | `/api/v1/admin/quests` | *None* | [Admin] Lấy toàn bộ danh mục mẫu nhiệm vụ trong Database. | `List<QuestTemplateEntity>` |
| `POST` | `/api/v1/admin/quests` | **Body:** `QuestTemplateEntity` | [Admin] Tạo mới mẫu nhiệm vụ. | `QuestTemplateEntity` |
| `PUT` | `/api/v1/admin/quests/{id}` | Path: `id`, **Body:** `QuestTemplateEntity` | [Admin] Cập nhật điều kiện mục tiêu và điểm thưởng nhiệm vụ. | `QuestTemplateEntity` |
| `DELETE`| `/api/v1/admin/quests/{id}` | Path: `id` | [Admin] Xóa mẫu nhiệm vụ. | `Void` (204 No Content) |

---

### 🏆 DOMAIN 12: WEEKLY TRIAL ARENA & AUDIT (`trialApi.ts` ➔ `TrialArenaController.java`)
Đấu trường thử nghiệm 30s Target Dummy, Boss Speedrun (TTK) và bảo mật quyền riêng tư Build đồ.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/arena/leaderboard` | `?trialType=<DPS_30S\|BOSS_TTK>` | Lấy bảng xếp hạng Top người chơi theo tuần. | `List<TrialLeaderboardEntryDto>` |
| `POST` | `/api/v1/arena/submit` | **Body:** `TrialSubmitRequestDto` (`userId`, `trialType`, `scoreValue`, `detailsJson`) | Nộp kết quả thi đấu thử nghiệm lên Bảng Xếp Hạng. | `TrialLeaderboardEntryDto` |
| `POST` | `/api/v1/arena/privacy` | `?userId=<UUID>&isPublic=<boolean>` | Bật/Tắt quyền công khai Build đồ của người chơi (`true` = Công khai, `false` = Giấu đồ - Mặc định là false). | `Void` (200 OK) |
| `GET` | `/api/v1/arena/inspect` | `?targetUserId=<UUID>` | Soi trang bị và chỉ số của người chơi khác (yêu cầu quyền Admin hoặc đối tượng đã bật `isPublic`). | `BuildInspectResponseDto` |
| `GET` | `/api/v1/arena/admin/audit` | *None* | [Admin] Lấy toàn bộ lịch sử đấu kèm telemetry để kiểm tra gian lận/hack stats. | `List<TrialLeaderboardEntryDto>` |

---

### 👑 DOMAIN 13: SUPPERADMIN LIVEOPS CMS (`adminApi.ts` ➔ `AdminController.java` & `AdminAuthController.java`)
Trung tâm quản trị LiveOps, cấu hình Stage Wave, Drop Table, Master Monsters/Items và giả lập Monte Carlo.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/admin/login` | **Body:** `AdminLoginRequestDto` (`username`, `password`) | Đăng nhập SuperAdmin LiveOps Portal (Xác thực BCrypt). | `AdminAuthResponseDto` |
| `GET` | `/api/v1/admin/dashboard/stats` | *None* | Lấy thống kê tổng quan (Tổng User, Item Templates, Monsters, Stages). | `AdminDashboardStatsDto` |
| `GET` | `/api/v1/admin/stages/{world}/{stage}` | Path: `world`, `stage` | Lấy cấu hình 30 Waves (3-15 quái/wave) và Drop Table của Stage. | `StageDetailConfigDto` |
| `PUT` | `/api/v1/admin/stages/{world}/{stage}` | Path: `world`, `stage`, **Body:** `StageDetailConfigDto` | Lưu cấu hình 30 Waves & Drop Table vào PostgreSQL Database. | `StageDetailConfigDto` |
| `GET` | `/api/v1/admin/monsters` | *None* | Lấy danh mục 20+ Master Quái vật của 4 Thế giới. | `List<MonsterTemplateDto>` |
| `POST` | `/api/v1/admin/monsters` | **Body:** `MonsterTemplateDto` | Tạo Quái vật mới vào hệ thống. | `MonsterTemplateDto` |
| `PUT` | `/api/v1/admin/monsters/{id}` | Path: `id`, **Body:** `MonsterTemplateDto` | Cập nhật chỉ số Quái vật (HP, ATK, Def, Element). | `MonsterTemplateDto` |
| `DELETE`| `/api/v1/admin/monsters/{id}` | Path: `id` | Xóa Quái vật khỏi hệ thống. | `Void` (204 No Content) |
| `GET` | `/api/v1/admin/item-templates` | *None* | Lấy danh sách 30+ Master Item Templates kèm chỉ số gốc. | `List<ItemTemplateDto>` |
| `PUT` | `/api/v1/admin/item-templates/{id}` | Path: `id`, **Body:** `ItemTemplateDto` | Cập nhật chỉ số gốc và hệ số iLvl scaling của Master Item. | `ItemTemplateDto` |
| `GET` | `/api/v1/admin/skills` | *None* | Lấy danh sách cấu hình Cây Kỹ Năng của 4 Class. | `List<SkillConfigDto>` |
| `PUT` | `/api/v1/admin/skills/{skillId}` | Path: `skillId`, **Body:** `SkillConfigDto` | Cập nhật chi phí Gold và % chỉ số thưởng của nút Kỹ Năng. | `SkillConfigDto` |
| `POST` | `/api/v1/admin/simulate-battle` | **Body:** `BattleSimulationRequestDto` | Chạy mô phỏng 100 trận đấu Monte Carlo giữa Party và Quái vật. | `BattleSimulationResultDto` |

---

### 📦 DOMAIN 14: MASTER ITEM TEMPLATES & MATH SIMULATION (`ItemTemplateController.java` & `MathSimulationController.java`)
Nạp catalog vật phẩm cho Client và kiểm tra mô phỏng công thức toán học.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/item-templates` | *None* | Nạp toàn bộ danh mục Item Templates từ Database vào Frontend Cache. | `List<ItemTemplateDto>` |
| `POST` | `/api/v1/math-engine/simulate-dph` | **Body:** `StatsDto`, Query params: `skillMultiplier`, `targetArmor`... | Mô phỏng tính toán sát thương 1 đòn đánh (DPH & Damage Taken). | `DamageResult` |
| `GET` | `/api/v1/math-engine/simulate-demo-item`| *None* | Mô phỏng tính chỉ số thực tế của Kiếm Huyền Thoại (Template + Instance + Ngọc + Blessing). | `Map<String, Object>` |

---

### 🗼 DOMAIN 14: PROGRESS TOWER CORE V2 (`towerApi.ts` ➔ `TowerController.java`)
Hệ thống Tháp Tiến Độ 30 Tầng, 3v3 Grid, Authoritative Combat Resolution (Seeded RNG, max 10 hiệp) & Tiến độ người chơi.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/tower/progress/me` | `?userId=<UUID>` *(Optional)* | Lấy tiến độ Tower của user, seasonId, savedPartyV2 và unacknowledged attempt. | `TowerProgressDto` |
| `GET` | `/api/v1/tower/seasons/{seasonId}/floors` | *None* | Lấy danh sách cấu hình 30 tầng của mùa giải. | `List<TowerFloorDto>` |
| `POST` | `/api/v1/tower/party/v2` | `TowerPartyV2Dto` (3 slots, tactic, policies, energy) | Lưu vị trí 3x2 Grid, chính sách kỹ năng và ưu tiên năng lượng. | `TowerPartyV2Dto` |
| `POST` | `/api/v1/tower/attempts` | `TowerAttemptRequestDto` (floorNumber, slots, idempotencyKey) | Khởi chạy lượt đánh Tower. Server giải quyết toàn bộ trận đấu và trả về replay events. | `TowerAttemptResponseDto` |
| `POST` | `/api/v1/tower/attempts/{attemptId}/acknowledge` | *None* | Xác nhận hoàn thành xem trận đấu hoặc đầu hàng. | `TowerAttemptResponseDto` |
| `GET` | `/api/v1/tower/seasons/{seasonId}/leaderboard` | *None* | Bảng xếp hạng Top 50 người chơi xuất sắc nhất. | `List<TowerLeaderboardEntryDto>` |

---

### 🩺 DOMAIN 15: HEALTH & SYSTEM DIAGNOSTICS (`HealthController.java`)
Kiểm tra tình trạng sẵn sàng của hệ thống Server.

| Method | Endpoint | Query / Body Params | Mô tả chi tiết | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | *None* | Trả về trạng thái hoạt động của Backend Spring Boot. | `Map<String, Object>` (`status: "UP"`) |

---

## 🛡️ 3. QUY CHUẨN ENUMERATIONS (DATA DICTIONARY)

* **HeroClass:** `WARRIOR`, `RANGER`, `MAGE`, `PRIEST`
* **ItemSlot:** `MAIN_HAND`, `OFF_HAND`, `HELMET`, `ARMOR`, `PANTS`, `BOOTS`, `RING`, `TALISMAN`
* **ItemRarity:** `COMMON`, `UNCOMMON`, `RARE`, `EPIC`, `LEGENDARY`
* **ElementalType:** `PHYSICAL`, `FIRE`, `FROST`, `LIGHTNING`, `VOID`, `HOLY`
* **QuestType:** `DAILY`, `WEEKLY`
* **TrialType:** `DPS_30S`, `BOSS_TTK`
* **ActionType (Quests):** `KILL_MONSTERS`, `KILL_BOSSES`, `CLEAR_STAGES`, `ENHANCE_ITEMS`, `FUSE_CUBE`, `OPEN_CHESTS`

---

## 🔍 4. GIAO THỨC BẮT LỖI & DEBUG TRÊN FRONTEND (`client.ts`)

Axios Interceptor được cấu hình log trực quan theo màu trong Browser DevTools Console:
* 🔵 **`[API Request]` (Cyan/Vàng):** Log URL, HTTP Method và Request Body.
* 🟢 **`[API Response]` (Xanh lá):** Log HTTP 200 OK kèm Object dữ liệu phản hồi.
* 🔴 **`[API Error]` (Đỏ):** Bắt lỗi kèm HTTP Status Code, URL và Thông báo tiếng Việt từ Backend (`error.response.data.message`).

### Bảng Mã Lỗi Chuẩn:
| HTTP Status | Nguyên nhân | Khắc phục |
| :---: | :--- | :--- |
| **`400 Bad Request`** | Dữ liệu thiếu trường bắt buộc, không đủ Gold/Đá, hoặc vi phạm quy tắc nghiệp vụ. | Kiểm tra thông báo chi tiết trong response payload. |
| **`404 Not Found`** | ID vật phẩm, Tướng hoặc User không tồn tại trong Database. | Kiểm tra UUID hoặc gọi `GET /api/v1/user/profile` để lấy demo user hợp lệ. |
| **`500 Internal Error`** | Lỗi runtime exception hoặc kết nối cơ sở dữ liệu. | Xem log của terminal Spring Boot (`BE/`). |
| **`Network Error`** | Server Spring Boot chưa được bật tại port `8080`. | Chạy lệnh `mvn spring-boot:run` tại thư mục `BE/`. |

---

## 💡 5. HƯỚNG DẪN IMPORT TRONG SOURCE CODE

### Cách 1: Sử dụng Centralized Gateway `gameApi` (Khuyên dùng)
```typescript
import { gameApi } from '@/services';

// 1. Mở rương
const res = await gameApi.openChest(userId, 'chest-instance-id');

// 2. Cường hóa trang bị
const enhanceRes = await gameApi.enhance(userId, 'item-instance-id', true);

// 3. Nộp kết quả Trial Arena
await gameApi.submitTrialRecord({
  userId,
  trialType: 'DPS_30S',
  scoreValue: 637.5,
  detailsJson: JSON.stringify({ peakDps: 820.0, totalDamage: 19125 })
});
```

### Cách 2: Sử dụng Module API Độc Lập
```typescript
import { questApi } from '@/services/questApi';
import { adminApi, adminAuth } from '@/services/adminApi';

// Nhận mốc thưởng Daily Quest
await questApi.claimMilestoneReward(userId, 'DAILY', 0);

// Đăng nhập SuperAdmin và lưu Stage Wave Config
const auth = await adminApi.login('superadmin', 'adminpassword123');
adminAuth.setSession(auth.token, auth.username);
await adminApi.updateStageDetailConfig(1, 1, newStageConfig);
```