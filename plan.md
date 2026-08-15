# 🗺️ KẾ HOẠCH PHÁT TRIỂN: WORLD HERO MINI-APP

> **Phiên bản:** v1.0 — MVP Development Plan
> **Ngày cập nhật:** 2026-08-14
> **Thể loại:** 2D Pixel Idle Party Crawler (Lấy cảm hứng từ **TBH: Task Bar Hero** trên Steam)
> **Nền tảng đích:** WebView trong **World App** (World Network / MiniKit SDK)

---

## ⚖️ 0. TUÂN THỦ CHÍNH SÁCH WORLD APP & APP STORE (SMART HYBRID MODEL)

Áp dụng mô hình **Smart Hybrid Progression (Săn đồ theo mục tiêu + Nâng cấp bảo hiểm 100%)** — chuẩn mực game RPG hiện đại:

### 🔑 Nguyên Tắc Thiết Kế:
1. **Không sử dụng Loot Box mù quáng:** Thay vì mở rương ngẫu nhiên dễ gây ức chế và rủi ro chính sách, game áp dụng **Target Farming (Boss rơi đúng nguyên liệu/phôi theo hệ)** + **Thanh tích lũy Pity (chắc chắn nhận đồ chọn lọc sau N lần)**.
2. **The Cube Bảo Hiểm Thông Minh (Smart Fusion):** Ghép 3 món cùng loại ➔ chắc chắn nhận 1 món cùng loại cấp cao hơn (VD: 3 Kiếm Rare ➔ 1 Kiếm Epic, không bị lệch class).
3. **Phân tách hoàn toàn với Token WLD:** Gameplay cày cuốc 100% bằng Gold/Nguyên liệu in-game. MiniKit Pay chỉ phục vụ tiện ích (Pet, Skin, Mở rộng túi).
4. **Sẵn sàng cho cả World App & Native Store (iOS / Android):** Thiết kế này miễn nhiễm 100% với các rào cản pháp lý cấm cờ bạc/Loot box tại EU và App Store.

---

## 🎮 1. BÀI HỌC TỪ TBH: TASK BAR HERO (STEAM) — COPY GÌ, TRÁNH GÌ

### ✅ Học Theo (Best Practices từ TBH):
| Tính năng TBH | Áp dụng cho World Hero |
| :--- | :--- |
| **Idle trên Taskbar** — Nhỏ gọn, chạy nền | **Idle trong WebView World App** — Chạy nền mượt, tự động lưu cloud |
| **The Cube** — Trung tâm ghép đồ & chế tạo | **Smart Cube**: Ghép nâng phẩm cấp thông minh, Ghép ngọc Tier, Tẩy dòng có khóa |
| **Party nhiều Hero** — Knight, Ranger, Sorcerer | **Party 3 Tướng** — Warrior, Ranger, Mage, Priest (chọn 3/4) |
| **Wave-based progression** — 30 waves/stage | **30 Waves/Stage + Stage Boss**, 40 Stages qua 4 World |
| **Rune Tree** (sâu sắc) | **Skill Tree tiêu Gold** — Cây kỹ năng riêng từng Class |
| **Pets hỗ trợ** | **Pet tự động nhặt đồ & buff nhẹ** |

### ❌ Tránh Sai Lầm Của TBH:
| Vấn đề TBH gặp phải | Cách World Hero phòng tránh |
| :--- | :--- |
| **Botting & Lạm phát Marketplace** | World ID xác thực người thật (1 người = 1 tài khoản). Không tạo chợ P2P tự do để tránh đầu cơ bot. |
| **Anti-cheat client xung đột phần mềm** | Server-side validation toàn bộ logic và túi đồ. |
| **Ức chế vì tạch đồ khi ghép Cube** | Smart Fusion: Đảm bảo đúng loại trang bị khi thăng phẩm cấp. |

---

## 📊 2. KIẾN TRÚC CHỈ SỐ & CÔNG THỨC DAMAGE (BEST PRACTICE)

### A. Bảng Chỉ Số Tinh Gọn 4 Nhóm:

| Nhóm Tấn Công | Nhóm Phòng Thủ | Nhóm Kháng Hệ | Nhóm Tiện Ích |
| :--- | :--- | :--- | :--- |
| `physAtk` — Sát thương Vật lý | `maxHp` — Máu tối đa | `fireRes` — Kháng Lửa (cap 75%) | `cdr` — Giảm hồi chiêu (cap 50%) |
| `magicAtk` — Sát thương Phép | `armor` — Giáp (asymptotic) | `coldRes` — Kháng Băng (cap 75%) | `goldBonus` — % Tăng Gold |
| `atkPercent` — % Tăng tổng DMG | `dmgReduction` — % Giảm DMG (cap 75%) | `lightningRes` — Kháng Sét (cap 75%) | `chestDropBonus` — % Tăng Rương |
| `atkSpeed` — Tốc độ đánh | `hpRegen` — Hồi máu/giây | `chaosRes` — Kháng Chaos (cap 75%) | `expBonus` — % Tăng EXP |
| `critRate` — % Chí mạng (cap 100%) | `lifeSteal` — % Hút máu | | |
| `critDmg` — % Dame Crit (base 150%) | `physDodge` — % Né vật lý (cap 75%) | | |
| `elemDmgBonus` — % DMG nguyên tố | `spellEvasion` — % Né phép (cap 75%) | | |

### B. Công Thức Damage — Multiplicative Stacking + Asymptotic DR:

```
Damage Per Hit:
  FinalATK       = (BaseATK + FlatBonusATK) × (1 + ∑atkPercent / 100)
  SkillMultiplier = Hệ số chiêu thức (Auto: 1.0, Skill: 1.5 ~ 3.0)
  CritLayer      = if (random < critRate) then (critDmg / 100) else 1.0
  ElemLayer      = 1.0 + (elemDmgBonus - targetElemRes) / 100

  DPH = FinalATK × SkillMultiplier × CritLayer × max(ElemLayer, 0.1)

Damage Taken (Asymptotic):
  ArmorReduction    = 1 - Armor / (Armor + K)        // K = 500
  DmgReductionLayer = 1 - min(dmgReduction, 75) / 100
  ElemResLayer      = 1 - min(targetElemRes, 75) / 100

  DamageTaken = IncomingDMG × ArmorReduction × DmgReductionLayer × ElemResLayer

DPS hiển thị trên UI:
  AvgCritMult = 1 + (critRate/100) × (critDmg/100 - 1)
  DPS = FinalATK × SkillMultiplier × AvgCritMult × ElemLayer × atkSpeed
```

---

## 🎯 3. THIẾT KẾ MVP FOMO & RETENTION HOOKS

| Hook | Mô tả | Tuân thủ chính sách |
| :--- | :--- | :---: |
| **🏆 Season Progress Bar** | Thanh tiến trình mùa giải hiển thị luôn trên HUD | ✅ Skill-based |
| **⏰ Season Countdown** | Đếm ngược mùa giải 28 ngày | ✅ |
| **🎯 Daily Quests (4/ngày)** | Diệt quái, Cường hóa, Ghép Cube, Nấu Giả Kim ➔ Thưởng Gold/Ngọc cố định | ✅ Deterministic |
| **📅 Login Streak 7 Ngày** | Ngày 7: Trang bị Epic xác định cho Class đang dùng | ✅ Deterministic |
| **🔥 First Clear Bonus** | x3 Gold lần đầu vượt Stage mới | ✅ Skill-based |
| **🌟 Verify World ID** | Nhận Gói Khởi Đầu: 1 Trang Bị Rare + 5000 Gold + 10 Ngọc | ✅ Human verification |

---

## 🔮 4. HỆ THỐNG NÂNG CẤP 3 LỚP, THE CUBE & CRAFTING

### Cơ Chế Nâng Cấp (RNG in-game hợp lệ — chỉ tiêu tài nguyên cày miễn phí):

| Hệ thống | Cơ chế | Ghi chú |
| :--- | :--- | :--- |
| **Cường Hóa +1 ➔ +15** | Tiêu Gold + Đá. +1~+5: 100%. +6~+10: Tỉ lệ thất bại tăng dần (giữ cấp). +11~+15: Thất bại tụt 1 cấp. | RNG có tỉ lệ — tạo thử thách & hồi hộp |
| **The Cube — Ghép Phẩm Cấp** | 3 cùng phẩm cấp ➔ 1 phẩm cấp cao hơn (**ngẫu nhiên loại đồ** trong pool của Class). | RNG loại đồ — khuyến khích ghép nhiều lần |
| **The Cube — Reforge** | Reroll sub-stats ngẫu nhiên trên đồ Rare+. Tiêu Đá Tẩy Luyện. | RNG sub-stats — tạo min-max build |
| **The Cube — Ghép Ngọc** | 3 Ngọc Tier thấp ➔ 1 Ngọc Tier cao hơn (cùng loại). | Xác định (deterministic) |
| **Khảm Ngọc** | Đục lỗ + khảm ngọc: Ruby (ATK), Emerald (Crit), Sapphire (ASPD), Topaz (Lifesteal), Diamond (DmgReduction). | Xác định — chọn ngọc nào gắn ngọc đó |
| **Blessing Scrolls** | Ép lên trang bị tăng stats cố định, biết trước hiệu ứng. | Xác định |
| **Alchemy Lab** | Nấu thuốc kháng hệ, tiên dược vĩnh viễn. Công thức rõ ràng. | Xác định |
| **Blacksmith Crafting** | Chế tạo phụ kiện 4 ô từ nguyên liệu + công thức cụ thể. | Xác định |

---

## 📋 5. BẢNG CHECKLIST TIẾN ĐỘ THEO GIAI ĐOẠN

### 🟢 GIAI ĐOẠN 1 — CORE ENGINE, PARTY SYSTEM & DATA PERSISTENCE (P0 - ĐANG TRIỂN KHAI)
- [x] Khởi tạo Repository Git (`main` & `dev`), cấu hình `.gitignore` chuẩn.
- [x] **Backend Skeleton:** Java 21, Spring Boot 3.3.4, Maven, Swagger OpenAPI, CORS.
- [x] **Game Math Engine:** `DamageCalculator` (DPH, Asymptotic Armor, Caps), `StatEvaluator`, `CubeEngine`.
- [x] **Frontend Skeleton:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Zustand Store.
- [x] **Canvas 2D Battle Engine:** Render 3 Heroes vs Monster, thanh máu, 60FPS loop, Floating Damage text.
- [x] **Giao diện 10 Ô Trang Bị:** Chuyển đổi 4 Class, bảng chỉ số Live DPS, hiển thị đồ theo phẩm cấp.
- [ ] **Backend Database JPA & PostgreSQL Schema:**
  - [ ] Entity `User` (Gold, Gems, Stones, World/Stage/Wave progress, World ID nullifier hash).
  - [ ] Entity `Hero` (User ID, Class, Level, Exp, Skill Points).
  - [ ] Entity `ItemTemplate` (Master Data do Admin chỉnh sửa, Cache trong Redis).
  - [ ] Entity `ItemInstance` (Túi đồ người chơi, gắn vào Hero slot).
- [ ] **Backend REST APIs & FE Integration:**
  - [ ] API lấy thông tin User & Party 3 Heroes (`GET /api/v1/heroes`).
  - [ ] API trang bị / tháo đồ (`POST /api/v1/inventory/equip`, `POST /api/v1/inventory/unequip`).
  - [ ] API lưu tiến trình 30 Waves & phần thưởng (`POST /api/v1/battle/advance-wave`).
- [ ] **Earning Hooks & Retention UI:**
  - [x] Season Progress Bar + Countdown Timer (18 days).
  - [ ] Hệ thống Daily Quests (4 nhiệm vụ/ngày).
  - [ ] Chuỗi Đăng Nhập 7 Ngày (Login Streak Rewards).

---

### 🟡 GIAI ĐOẠN 2 — UPGRADE ECOSYSTEM & CRAFTING (P1)
- [ ] Cường hóa trang bị $+1 \rightarrow +15$ (Tiêu Gold + Đá Cường Hóa).
- [x] Giao diện The Cube UI (Smart Fusion, Gem Fusion, Reforge).
- [ ] Backend API The Cube: Ghép 3 món cùng phẩm lên phẩm trên, Ghép ngọc Tier, Reforge khóa dòng.
- [ ] Khảm Ngọc (1-3 Sockets) & Ép Giấy Chúc Phúc (Blessing Scrolls).
- [ ] Lò Giả Kim (Nấu giấy phù phép & dược phẩm) + Xưởng Thợ Rèn (Rèn 4 Phụ Kiện).

---

### 🟠 GIAI ĐOẠN 3 — SKILL TREE & TIẾN TRÌNH 4 THẾ GIỚI (P2)
- [ ] Cây Kỹ Năng tiêu Gold riêng cho 4 Class.
- [ ] 40 Stages qua 4 Thế Giới (Rừng, Băng, Lửa, Hư Không) + Hệ thống Đá Phong Ấn mở Boss X-10.
- [ ] Lưu kỷ lục Speedrun vượt ải nhanh nhất (Redis Sorted Sets `ZADD`).

---

### 🔴 GIAI ĐOẠN 4 — ADMIN DASHBOARD & CÂN BẰNG ĐỘNG (P3)
- [ ] Admin Dashboard UI (Quản lý Item Templates, chỉ số Quái/Boss, Drop rates).
- [ ] Cơ chế Hot-reload Redis cache khi Admin sửa template (Stats tự động tính lại tức thì).

---

### 🟣 GIAI ĐOẠN 5 — WORLD ID, MINIKIT PAY & DEPLOY (P4)
- [ ] Tích hợp World ID Verification (`nullifier_hash`) qua MiniKit SDK.
- [ ] Tích hợp MiniKit Pay (Thanh toán WLD/USDC mua Skin, Pet nhặt đồ, Mở rộng túi).
- [ ] Submit duyệt trên World Developer Portal & Deploy Production.

---

## 💰 6. MÔ HÌNH KINH TẾ & EARNING

```text
┌─────────────────────────────────────────────────────────────────┐
│                    DÒNG TIỀN & EARNING MODEL                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [ Người Chơi ]                                                 │
│       │                                                         │
│       ├── Cày Gold/Materials MIỄN PHÍ trong game                │
│       │       └─► Cường hóa, Cube, Crafting, Alchemy            │
│       │                                                         │
│       ├── Nạp WLD/USDC mua tiện ích (MiniKit Pay)               │
│       │       └─► Skin, Pet nhặt đồ, Mở rộng túi, Cosmetics   │
│       │                                                         │
│       └── Verify World ID ➔ Đủ điều kiện nhận thưởng Developer  │
│               Rewards từ World Network (WLD hàng tháng)         │
│                                                                 │
│  [ Nhà Phát Triển ]                                             │
│       │                                                         │
│       ├── Thu nhập từ MiniKit Pay (IAP)                          │
│       │                                                         │
│       └── World Developer Rewards Program                       │
│               (WLD hàng tháng dựa trên Verified Human Traffic)  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
