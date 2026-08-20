# 📚 MASTER API & DEAD CODE AUDIT — TOÀN BỘ DỰ ÁN WORLD HERO

> **Phiên bản:** v2.0 (Toàn diện Backend & Frontend)  
> **Backend Base URL:** `/api/v1`  
> **Tổng số BE Controllers:** 25 Controllers (54 Endpoints)  
> **Tổng số FE API Services:** 20 Service files (68 Methods)

---

## 📊 1. BẢNG TỔNG KẾT TOÀN BỘ 25 BACKEND CONTROLLERS (54 ENDPOINTS)

| # | Controller | Base Path | Method | Endpoint Subpath | Chức năng | FE Caller | UI / Store Caller | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| **1** | `AdminAuthController` | `/api/v1/auth/admin` | POST | `/login` | Đăng nhập SuperAdmin | `adminApi.login` | `app/admin/login/page.tsx` | 🟡 Admin CMS |
| **2** | `AdminController` | `/api/v1/admin` | GET | `/dashboard/stats` | Thống kê LiveOps | `adminApi.getDashboardStats` | `app/admin/page.tsx` | 🟡 Admin CMS |
| | | | GET | `/item-templates` | Danh sách template đồ | `adminApi.getAllItemTemplates` | `features/admin/ItemBalancer.tsx` | 🟡 Admin CMS |
| | | | PUT | `/item-templates/{id}` | Cân bằng stats trang bị | `adminApi.updateItemTemplate` | `features/admin/ItemBalancer.tsx` | 🟡 Admin CMS |
| | | | GET | `/skills` | Config kỹ năng 4 class | `adminApi.getAllSkillConfigs` | `features/admin/SkillBalancer.tsx` | 🟡 Admin CMS |
| | | | PUT | `/skills/{skillId}` | Cân bằng kỹ năng & gold | `adminApi.updateSkillConfig` | `features/admin/SkillBalancer.tsx` | 🟡 Admin CMS |
| | | | GET | `/tower/validate` | Dry-run kiểm tra 30 tầng | *(None)* | Server diagnostic / Test probe | 🟡 Standalone |
| **3** | `AdminQuestController` | `/api/v1/admin/quests` | GET | `/` | Lấy template nhiệm vụ | `questApi.getAllTemplates` | `features/admin/QuestManager.tsx` | 🟡 Admin CMS |
| | | | POST | `/` | Tạo template nhiệm vụ | `questApi.createTemplate` | `features/admin/QuestManager.tsx` | 🟡 Admin CMS |
| | | | PUT | `/{id}` | Sửa template nhiệm vụ | `questApi.updateTemplate` | `features/admin/QuestManager.tsx` | 🟡 Admin CMS |
| | | | DELETE | `/{id}` | Xóa template nhiệm vụ | `questApi.deleteTemplate` | `features/admin/QuestManager.tsx` | 🟡 Admin CMS |
| **4** | `AuthController` | `/api/v1/auth` | POST | `/world-id` | Xác thực World ID MiniKit | `authenticateUser` (`minikit.ts`) | `useGameStore.ts`, `login/page.tsx` | 🟢 Active Prod |
| | | | POST | `/local-login` | Đăng nhập Local Dev | `authenticateUser`, `client.ts` | `services/client.ts` auto-recovery | 🟢 Active Prod |
| | | | GET | `/me` | Probe token user ID | *(None)* | Standalone Token probe | 🟡 Standalone |
| **5** | `ChestVaultController` | `/api/v1/chest-vault` | GET | `/` | Số lượng rương theo cấp | `chestVaultApi.getChestVault` | `store/useGameStore.ts` | 🟢 Active Prod |
| | | | POST | `/open` | Mở rương nhặt trang bị | `chestVaultApi.openChest` | `components/modals/ChestVaultSheet.tsx` | 🟢 Active Prod |
| **6** | `CraftingController` | `/api/v1/crafting` | POST | `/bless` | Ép bùa may mắn | `craftingApi.blessItem` | *(0 callers)* UI xử lý in-memory | 🔴 Dead Candidate |
| | | | POST | `/blacksmith` | Rèn trang sức | `craftingApi.craftAccessory` | *(0 callers)* UI xử lý in-memory | 🔴 Dead Candidate |
| | | | POST | `/alchemy` | Chế thuốc Giả kim | `craftingApi.brewAlchemy` | *(0 callers)* UI xử lý in-memory | 🔴 Dead Candidate |
| **7** | `CubeController` | `/api/v1/cube` | POST | `/transmute-9` | Ghép Cube 9 ô | `cubeApi.transmute9` | `store/slices/createWorkshopSlice.ts` | 🟢 Active Prod |
| | | | POST | `/fuse` | Ghép 3 trang bị | `cubeApi.smartFusion` | *(0 callers)* UI dùng `transmute9` | 🔴 Dead Candidate |
| | | | POST | `/fuse-gems` | Ghép 3 ngọc cùng loại | `cubeApi.gemFusion` | *(0 callers)* UI xử lý in-memory | 🔴 Dead Candidate |
| **8** | `EnhanceController` | `/api/v1/upgrade` | POST | `/enhance` | Cường hóa V1 (có rớt cấp) | `upgradeApi.enhanceItem` | *(0 callers)* Đã thay bằng `TowerGear` | 🔴 Obsolete |
| **9** | `ExpeditionController` | `/api/v1/expeditions` | GET | `/config` | Cấu hình & tỉ lệ thám hiểm | `expeditionApi.getConfig` | `components/modals/ExpeditionModal.tsx` | 🟢 Active Prod |
| | | | GET | `/` | Danh sách chuyến đang chạy | `expeditionApi.getActiveRuns` | `ExpeditionModal.tsx`, `useGameStore.ts` | 🟢 Active Prod |
| | | | POST | `/` | Phái tướng thám hiểm | `expeditionApi.dispatch` | `components/modals/ExpeditionModal.tsx` | 🟢 Active Prod |
| | | | POST | `/{runId}/claim` | Nhận thưởng thám hiểm | `expeditionApi.claim` | `components/modals/ExpeditionModal.tsx` | 🟢 Active Prod |
| | | | POST | `/{runId}/cancel` | Hủy chuyến thám hiểm | `expeditionApi.cancel` | `components/modals/ExpeditionModal.tsx` | 🟢 Active Prod |
| **10** | `FeatureConfigController`| `/api/v1/config` | GET | `/features` | Feature flags & Core gates | `configApi.getFeatureFlags` | `store/useGameStore.ts` | 🟢 Active Prod |
| **11** | `HealthController` | `/api/v1/health` | GET | `/` | Server Uptime probe | *(None)* | DevOps / Monitoring | 🟡 Standalone |
| **12** | `HeroCatalogController` | `/api/v1/hero-catalog` | GET | `/` | Master 24 template tướng | `heroCatalogApi.getCatalog` | *(0 callers)* FE dùng static template | 🟡 Standalone |
| | | | GET | `/{id}` | Chi tiết 1 template tướng | `heroCatalogApi.getTemplateById` | *(0 callers)* | 🟡 Standalone |
| | | | GET | `/enabled` | 18 template đang bật | `heroCatalogApi.getEnabledTemplates` | *(0 callers)* | 🟡 Standalone |
| **13** | `HeroController` | `/api/v1/heroes` | GET | `/` | 4 tướng của user + gear | `heroApi.getHeroes` | `useGameStore.ts`, `createHeroSlice.ts` | 🟢 Active Prod |
| | | | POST | `/revive` | Hồi sinh tướng bằng 10 Gems | `heroApi.reviveHero` | `store/slices/createHeroSlice.ts` | 🟢 Active Prod |
| **14** | `HeroProgressionController`| `/api/v1/heroes` | POST | `/{id}/level-up` | Nâng cấp Level tướng | `progressionApi.levelUpHero` | `store/slices/createHeroSlice.ts` | 🟢 Active Prod |
| | | | POST | `/{id}/star-up` | Tăng sao tướng (Star Up) | `progressionApi.starUpHero` | `store/slices/createHeroSlice.ts` | 🟢 Active Prod |
| **15** | `InventoryController` | `/api/v1/inventory` | GET | `/` | Lấy túi đồ người chơi | `inventoryApi.getInventory` | `useGameStore.ts`, `createInventorySlice.ts`| 🟢 Active Prod |
| | | | POST | `/equip` | Mặc trang bị lên tướng | `inventoryApi.equipItem` | `store/slices/createInventorySlice.ts` | 🟢 Active Prod |
| | | | POST | `/unequip` | Tháo trang bị về túi | `inventoryApi.unequipItem` | `store/slices/createInventorySlice.ts` | 🟢 Active Prod |
| | | | POST | `/open-chest` | Mở rương túi đồ cũ | `inventoryApi.openChest` | *(0 callers)* Đã thay bằng `ChestVault` | 🔴 Obsolete |
| | | | POST | `/unlock-slots` | Mở rộng ô chứa túi đồ | `inventoryApi.unlockSlots` | `store/slices/createInventorySlice.ts` | 🟢 Active Prod |
| **16** | `ItemTemplateController` | `/api/v1/item-templates` | GET | `/` | Master Catalog vật phẩm | `inventoryApi.getItemTemplates`| `store/useGameStore.ts` | 🟢 Active Prod |
| **17** | `MonetizationController` | `/api/v1/monetization` | GET | `/status` | Trạng thái Két & Pass | `monetizationApi.getStatus` | `store/useGameStore.ts` | 🟢 Active Prod |
| | | | POST | `/smash-piggy-bank` | Đập két sắt nhận Gems | `monetizationApi.smashPiggyBank`| *(0 callers)* UI xử lý client-side | 🔴 Dead Candidate |
| | | | POST | `/claim-daily-pass` | Nhận quà điểm danh ngày | `monetizationApi.claimDailyPass`| *(0 callers)* UI xử lý client-side | 🔴 Dead Candidate |
| | | | POST | `/verify-payment` | Xác thực giao dịch on-chain | `payWithWld` (`minikit.ts`) | MiniKit payment modal | 🟢 Active Prod |
| | | | POST | `/mock-wld-pay` | Mock thanh toán dev | `monetizationApi.mockWldPay` | *(0 callers)* UI mock client-side | 🔴 Dead Candidate |
| **18** | `OnboardingController` | `/api/v1/onboarding` | GET | `/state` | Trạng thái hướng dẫn tân thủ | `onboardingApi.getState` | `store/useGameStore.ts` | 🟢 Active Prod |
| | | | POST | `/advance` | Chuyển bước tutorial | `onboardingApi.advance` | `TutorialSpotlightOverlay.tsx` | 🟢 Active Prod |
| **19** | `QuestController` | `/api/v1/quests` | GET | `/overview` | Tiến độ nhiệm vụ ngày/tuần | `questApi.getQuestOverview` | `components/modals/QuestsModal.tsx` | 🟢 Active Prod |
| | | | POST | `/claim` | Nhận thưởng nhiệm vụ lẻ | `questApi.claimQuest` | `components/modals/QuestsModal.tsx` | 🟢 Active Prod |
| | | | POST | `/milestones/claim` | Nhận rương mốc tích lũy | `questApi.claimMilestone` | `components/modals/QuestsModal.tsx` | 🟢 Active Prod |
| **20** | `RecruitmentController` | `/api/v1/recruitment` | GET | `/banners` | Danh sách banner chiêu mộ | `recruitmentApi.getBanners` | `components/modals/RecruitmentModal.tsx`| 🟢 Active Prod |
| | | | POST | `/pull` | Quay gacha x1 / x10 | `recruitmentApi.pull` | `components/modals/RecruitmentModal.tsx`| 🟢 Active Prod |
| | | | GET | `/history` | Lịch sử quay gacha | `recruitmentApi.getHistory` | `components/modals/RecruitmentModal.tsx`| 🟢 Active Prod |
| **21** | `SkillController` | `/api/v1/heroes` | GET | `/{id}/skills` | Cây kỹ năng của tướng | `skillApi.getSkillTree` | *(0 callers)* UI dùng client calc | 🔴 Dead Candidate |
| | | | POST | `/skills/upgrade` | Nâng cấp điểm skill | `skillApi.upgradeSkill` | *(0 callers)* UI xử lý trong `heroSlice`| 🔴 Dead Candidate |
| **22** | `TowerController` | `/api/v1/tower` | GET | `/seasons/current` | Thông tin mùa giải Tower | *(None)* | Standalone season metadata | 🟡 Standalone |
| | | | GET | `/seasons/{id}/floors`| Cấu hình 30 tầng tháp | `towerApi.getFloors` | `features/tower/TowerManager.tsx` | 🟢 Active Prod |
| | | | GET | `/floors/{floorNum}` | Chi tiết 1 tầng tháp | *(None)* | Standalone floor lookup | 🟡 Standalone |
| | | | GET | `/progress/me` | Tiến độ tầng & saved party | `towerApi.getMyProgress` | `TowerManager.tsx`, `useGameStore.ts` | 🟢 Active Prod |
| | | | GET | `/party/v2` | Đội hình 3x2 đã lưu | *(None)* | Đã có trong `getMyProgress()` | 🟡 Standalone |
| | | | POST | `/party/v2` | Lưu vị trí 3x2 Grid & policy| `towerApi.savePartyV2` | `features/tower/TowerManager.tsx` | 🟢 Active Prod |
| | | | POST | `/attempts` | Khởi chạy Authoritative combat| `towerApi.createAttempt` | `features/tower/TowerManager.tsx` | 🟢 Active Prod |
| | | | GET | `/attempts/{id}` | Lấy log trận đấu | *(None)* | Standalone audit | 🟡 Standalone |
| | | | GET | `/attempts/{id}/replay`| Lấy chuỗi replay event | *(None)* | Đã trả inline trong `createAttempt`| 🟡 Standalone |
| | | | POST | `/attempts/{id}/acknowledge`| Xác nhận hoàn tất/đầu hàng | `towerApi.acknowledgeAttempt`| `features/tower/TowerManager.tsx` | 🟢 Active Prod |
| | | | GET | `/seasons/{id}/leaderboard` | Bảng xếp hạng Top 50 Tower | *(None)* | Sẵn sàng cho Tab BXH Tower | 🔵 Ready Tab |
| **23** | `TowerGearController` | `/api/v1/tower-gear` | POST | `/enhance` | Cường hóa 100% (+0 -> +15)| `progressionApi.enhanceItem` | `store/slices/createWorkshopSlice.ts` | 🟢 Active Prod |
| | | | POST | `/transfer` | Chuyển cấp cường hóa | `progressionApi.transferEnhance`| `store/slices/createWorkshopSlice.ts` | 🟢 Active Prod |
| | | | POST | `/salvage` | Phân tách đồ lấy đá | `progressionApi.salvageItems` | `store/slices/createInventorySlice.ts` | 🟢 Active Prod |
| **24** | `TrialArenaController` | `/api/v1/arena` | GET | `/leaderboard` | BXH Đấu trường DPS | `trialApi.getLeaderboard` | `components/modals/TrialArenaModal.tsx` | 🟢 Active Prod |
| | | | POST | `/submit` | Nộp điểm sát thương 30s | `trialApi.submitRecord` | `components/modals/TrialArenaModal.tsx` | 🟢 Active Prod |
| | | | POST | `/privacy` | Bật/tắt công khai build | `trialApi.togglePrivacy` | `components/modals/TrialArenaModal.tsx` | 🟢 Active Prod |
| | | | GET | `/inspect` | Soi trang bị người chơi khác| `trialApi.inspectBuild` | `TrialArenaModal`, `LeaderboardAudit` | 🟢 Active Prod |
| | | | GET | `/admin/audit` | LiveOps audit điểm dị thường| `trialApi.getAdminAuditList` | `features/admin/LeaderboardAudit.tsx` | 🟡 Admin Audit |
| **25** | `UserController` | `/api/v1/user` | GET | `/profile` | Lấy ví tiền tệ & level user | `userApi.getProfile`, `gameApi` | `useGameStore.ts`, all slices | 🟢 Active Prod |

---

## 📋 2. BẢNG TỔNG KẾT TOÀN BỘ 20 FRONTEND API SERVICE FILES

| # | File Service (`FE/src/services/`) | Các hàm Exported | Nơi gọi trong `FE/src/` | Số lượng Caller | Trạng thái |
|---|---|---|---|---|---|
| **1** | `adminApi.ts` | `login`, `getDashboardStats`, `getAllItemTemplates`, `updateItemTemplate`, `getAllSkillConfigs`, `updateSkillConfig`, `adminAuth.*` | `app/admin/*`, `features/admin/*` | 11 callers | 🟡 Admin CMS (Active) |
| **2** | `api.ts` | `gameApi.getProfile`, `getHeroes`, `getInventory`, `getChestVault`, `getMonetizationStatus`, `openVaultChest` + 13 re-exports | `useGameStore.ts`, `ChestVaultSheet.tsx` | 6 callers | 🟢 Active Prod |
| **3** | `chestVaultApi.ts` | `getChestVault`, `openChest` | `useGameStore.ts`, `ChestVaultSheet.tsx` | 2 callers | 🟢 Active Prod |
| **4** | `configApi.ts` | `getFeatureFlags` | `useGameStore.ts` | 1 caller | 🟢 Active Prod |
| **5** | `craftingApi.ts` | `blessItem`, `craftAccessory`, `brewAlchemy` | *Chỉ re-export trong `api.ts`* | **0 callers** | 🔴 Dead Candidate |
| **6** | `cubeApi.ts` | `transmute9`<br>`smartFusion`, `gemFusion` | `createWorkshopSlice.ts`<br>*Chỉ re-export trong `api.ts`* | 1 caller (`transmute9`)<br>**0 callers (`smartFusion`, `gemFusion`)** | 🟢 Active (`transmute9`)<br>🔴 Dead (`smartFusion`, `gemFusion`) |
| **7** | `expeditionApi.ts` | `getConfig`, `getActiveRuns`, `dispatch`, `claim`, `cancel` | `ExpeditionModal.tsx`, `useGameStore.ts` | 6 callers | 🟢 Active Prod |
| **8** | `heroApi.ts` | `getHeroes`, `reviveHero` | `useGameStore.ts`, `createHeroSlice.ts` | 5 callers | 🟢 Active Prod |
| **9** | `heroCatalogApi.ts` | `getCatalog`, `getTemplateById`, `getEnabledTemplates` | *Chỉ re-export trong `api.ts`* | **0 callers** | 🔴 Dead Candidate |
| **10** | `inventoryApi.ts` | `getItemTemplates`, `getInventory`, `equipItem`, `unequipItem`, `unlockSlots`<br>`openChest` | `useGameStore.ts`, `createInventorySlice.ts`, `createWorkshopSlice.ts`<br>*Không có nơi gọi* | 8 callers<br>**0 callers (`openChest`)** | 🟢 Active (5 methods)<br>🔴 Dead (`openChest`) |
| **11** | `monetizationApi.ts` | `getStatus`<br>`smashPiggyBank`, `claimDailyPass`, `mockWldPay` | `useGameStore.ts`<br>*Không có nơi gọi* | 1 caller (`getStatus`)<br>**0 callers (3 methods)** | 🟢 Active (`getStatus`)<br>🔴 Dead (3 methods) |
| **12** | `onboardingApi.ts` | `getState`, `advance` | `useGameStore.ts`, `TutorialSpotlightOverlay.tsx` | 3 callers | 🟢 Active Prod |
| **13** | `progressionApi.ts` | `levelUpHero`, `starUpHero`, `enhanceItem`, `transferEnhance`, `salvageItems` | `createHeroSlice.ts`, `createInventorySlice.ts`, `createWorkshopSlice.ts` | 5 callers | 🟢 Active Prod |
| **14** | `questApi.ts` | `getQuestOverview`, `claimQuest`, `claimMilestone`<br>`getAllTemplates`, `createTemplate`, `updateTemplate`, `deleteTemplate` | `QuestsModal.tsx`<br>`features/admin/QuestManager.tsx` | 7 callers | 🟢 Active Prod & 🟡 Admin CMS |
| **15** | `recruitmentApi.ts` | `getBanners`, `pull`, `getHistory` | `RecruitmentModal.tsx` | 3 callers | 🟢 Active Prod |
| **16** | `skillApi.ts` | `getSkillTree`, `upgradeSkill` | *Chỉ re-export trong `api.ts`* | **0 callers** | 🔴 Dead Candidate |
| **17** | `towerApi.ts` | `getFloors`, `getMyProgress`, `savePartyV2`, `createAttempt`, `acknowledgeAttempt` | `TowerManager.tsx`, `useGameStore.ts` | 7 callers | 🟢 Active Prod (100% clean) |
| **18** | `trialApi.ts` | `getLeaderboard`, `submitRecord`, `togglePrivacy`, `inspectBuild`, `getAdminAuditList` | `TrialArenaModal.tsx`, `LeaderboardAudit.tsx` | 7 callers | 🟢 Active Prod & 🟡 Admin Audit |
| **19** | `upgradeApi.ts` | `enhanceItem` | *Chỉ re-export trong `api.ts`* | **0 callers** | 🔴 Dead Candidate |
| **20** | `userApi.ts` | `getProfile` | `useGameStore.ts`, all Zustand slices | 9 callers | 🟢 Active Prod |

---

## 🧹 3. DANH MỤC DEAD CODE & LỘ TRÌNH DỌN DẸP CHI TIẾT

### 🔴 Nhóm 1: Frontend Service Functions không còn nơi gọi (0 Callers)
1. **`FE/src/services/upgradeApi.ts`** (`enhanceItem`): Đã được thay thế hoàn toàn bằng `progressionApi.enhanceItem` gọi sang `/api/v1/tower-gear/enhance` (Cường hóa 100% không rớt cấp).
2. **`FE/src/services/craftingApi.ts`** (`blessItem`, `craftAccessory`, `brewAlchemy`): Các tính năng này UI Blacksmith/Alchemy hiện tại đang tính toán và cập nhật state in-memory phía client.
3. **`FE/src/services/cubeApi.ts`** (`smartFusion`, `gemFusion`): UI gộp đồ đều đi qua `cubeApi.transmute9`, tính năng fuse 3 đồ và fuse ngọc không còn gọi 2 API này.
4. **`FE/src/services/heroCatalogApi.ts`** (`getCatalog`, `getTemplateById`, `getEnabledTemplates`): FE đang dùng trực tiếp static constant `starterTemplates.ts`.
5. **`FE/src/services/skillApi.ts`** (`getSkillTree`, `upgradeSkill`): `SkillTreeModal.tsx` và `createHeroSlice.ts` xử lý nâng cấp điểm kỹ năng trực tiếp qua state store.
6. **`FE/src/services/monetizationApi.ts`** (`smashPiggyBank`, `claimDailyPass`, `mockWldPay`): `createMonetizationSlice.ts` xử lý cộng gems/trạng thái pass trực tiếp trên client.
7. **`FE/src/services/inventoryApi.ts`** (`openChest`): Mở rương đã chuyển sang dùng `chestVaultApi.openChest` (`/api/v1/chest-vault/open`).

### 🔴 Nhóm 2: Backend Controllers / Endpoints đã bị thay thế (Obsolete)
1. **`EnhanceController.java`** (`POST /api/v1/upgrade/enhance`): Endpoint cường hóa V1 kèm cơ chế may rủi và bùa bảo hiểm. Đã bị thay thế bởi `TowerGearController.java` (`POST /api/v1/tower-gear/enhance`).
2. **`InventoryController.java`** (`POST /api/v1/inventory/open-chest`): Endpoint mở rương cũ. Đã bị thay thế bởi `ChestVaultController.java` (`POST /api/v1/chest-vault/open`).
