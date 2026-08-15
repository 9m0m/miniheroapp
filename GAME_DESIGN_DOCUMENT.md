# 📄 TÀI LIỆU THIẾT KẾ TRÒ CHƠI (GAME DESIGN DOCUMENT)
## DỰ ÁN: WORLD HERO (IDLE PARTY RPG)

> **Mã dự án:** `WORLD-HERO-MINIAPP`  
> **Phiên bản tài liệu:** `v1.0 - Official Publishing Spec`  
> **Thể loại:** 2D Pixel Idle Party RPG (Auto-battler / Dungeon Crawler)  
> **Nền tảng vận hành:** WebView tích hợp trong **World App** (World Network)  
> **Bộ công cụ kỹ thuật:** React (Frontend Canvas 2D), Node.js / Prisma (Backend API), MiniKit SDK (World ID & MiniKit Pay)  

---

## 📌 MỤC LỤC
1. [Tổng Quan Sản Phẩm & Định Vị](#1-tổng-quan-sản-phẩm--định-vị)
2. [Vòng Lặp Gameplay Cốt Lõi (Core Loop)](#2-vòng-lặp-gameplay-cốt-lõi-core-loop)
3. [Hệ Thống 4 Class & Đội Hình 3 Tướng](#3-hệ-thống-4-class--đội-hình-3-tướng)
4. [Hệ Thống Trang Bị 10 Ô & 5 Phẩm Cấp](#4-hệ-thống-trang-bị-10-ô--5-phẩm-cấp)
5. [Kiến Trúc Chỉ Số & Công Thức Chiến Đấu](#5-kiến-trúc-chỉ-số--công-thức-chiến-đấu)
6. [Hệ Thống Nâng Cấp Trang Bị 3 Lớp](#6-hệ-thống-nâng-cấp-trang-bị-3-lớp)
7. [Hệ Thống Chiều Sâu: The Cube, Giả Kim & Thợ Rèn](#7-hệ-thống-chiều-sâu-the-cube-giả-kim--thợ-rèn)
8. [Tiến Trình Màn Chơi & Hệ Thống Boss](#8-tiến-trình-màn-chơi--hệ-thống-boss)
9. [Kiến Trúc Cân Bằng Động (Template - Instance)](#9-kiến-trúc-cân-bằng-động-template---instance)
10. [Tích Hợp Nền Tảng & Mô Hình Doanh Thu](#10-tích-hợp-nền-tảng--mô-hình-doanh-thu)

---

## 1. TỔNG QUAN SẢN PHẨM & ĐỊNH VỊ

### 1.1. Tóm Tắt Ý Tưởng (High-Concept Pitch)
**World Hero** là một trò chơi nhập vai nhàn rỗi (Idle RPG) 2D phong cách Pixel Art hiện đại, lấy cảm hứng từ lối chơi quản lý party và dungeon crawler của các tựa game thành công trên Steam. Game được tối ưu hóa giao diện dọc để chạy mượt mà bên trong WebView của ứng dụng World App.

Người chơi thiết lập một **Đội hình 3 Tướng (Trio Party)** từ 4 hệ Class cơ bản, tự động vượt qua các đợt quái vật (Waves), thu thập tài nguyên, rèn luyện trang bị qua hệ thống **The Cube**, **Khảm Ngọc**, **Giả Kim** và phát triển cây kỹ năng để chinh phục các tầng hầm ngục 4 Thế Giới.

### 1.2. Trụ Cột Thiết Kế (Design Pillars)
- **Zero Friction (Tối Giản Thao Tác):** Chiến đấu 100% tự động, tự động nhặt đồ, tự động chuyển màn khi thắng và tự động quay lại farm khi thua mà không cần thao tác thủ công liên tục.
- **Deep Itemization (Chiều Sâu Trang Bị):** 10 ô trang bị với 5 phẩm cấp, hệ thống khảm ngọc 5 tầng và giấy chúc phúc tạo ra hàng trăm biến thể build đồ chuyên sâu.
- **Live Balancing (Cân Bằng Thời Gian Thực):** Kiến trúc Template-Instance cho phép điều chỉnh chỉ số toàn bộ server tức thì thông qua Admin Dashboard mà không cần cập nhật mã nguồn client.

---

## 2. VÒNG LẶP GAMEPLAY CỐT LÕI (CORE LOOP)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CORE GAMEPLAY LOOP                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ 1. CHIẾN ĐẤU TỰ ĐỘNG ] ──► Đội hình 3 Heroes vượt 30 Waves quái        │
│             │                                                               │
│             ▼                                                               │
│  [ 2. THU THẬP TÀI NGUYÊN ] ─► Gold, Đá Cường Hóa, Ngọc Thô, Rương Trang Bị │
│             │                                                               │
│             ▼                                                               │
│  [ 3. PHÁT TRIỂN & CHẾ TÁC ]                                                │
│     ├── Cường hóa trang bị (+1 ➔ +15)                                       │
│     ├── The Cube: Ghép trang bị, Ghép Ngọc, Tẩy dòng phụ (Reforge)          │
│     ├── Giả Kim: Nấu Giấy Chúc Phúc (Blessing) & Thuốc bổ trợ               │
│     ├── Thợ Rèn: Đục lỗ khảm ngọc & Chế tạo 4 món Phụ Kiện                  │
│     └── Nâng Cấp Cây Kỹ Năng (Gold Skill Tree) theo Class                   │
│             │                                                               │
│             ▼                                                               │
│  [ 4. CHINH PHỤC BOSS ]                                                     │
│     ├── Stage Boss (Wave 30): Thắng ➔ Sang màn | Thua ➔ Auto Farm lại       │
│     └── World Boss (X-10): Dùng Đá Phong Ấn từ X-9 để mở khóa               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. HỆ THỐNG 4 CLASS & ĐỘI HÌNH 3 TƯỚNG

Người chơi mở khóa 4 Class nhân vật và lựa chọn **3 Tướng** tham gia đội hình chính:

```text
       ┌───────────────┐
       │ 🛡️ WARRIOR    │ (Hàng Đầu: Đỡ Đòn / Thu Hút Quái)
       └───────┬───────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐ ┌──────▼──────┐
│ 🏹 RANGER   │ │ 🔮 MAGE     │ (Hàng Giữa/Sau: Sát Thương Chủ Lực)
└─────────────┘ └─────────────┘
       │               │
       └───────┬───────┘
               │
       ┌───────▼───────┐
       │ 💖 PRIEST     │ (Hàng Sau: Hồi Máu / Hộ Thuẫn / Giải Debuff)
       └───────────────┘
```

### Chi Tiết Phân Lớp Nhân Vật:

| Class | Vai Trò | Chỉ Số Trọng Tâm | Vũ Khí Chính | Vũ Khí Phụ | Bộ Giáp |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🛡️ **Warrior** | Tanker / Đấu Sĩ | `maxHp`, `armor`, `dmgReduction` | Kiếm / Rìu | Khiên Hộ Mệnh | Giáp Tấm (Plate) |
| 🏹 **Ranger** | DPS Vật Lý Tốc Độ | `atkSpeed`, `critRate`, `critDmg`, `physDodge` | Cung / Nỏ | Ống Tên | Giáp Da (Leather) |
| 🔮 **Mage** | DPS Phép / AOE | `magicAtk`, `atkPercent`, `spellEvasion` | Trượng Phép | Sách Phép / Cầu Ma Pháp | Áo Choàng (Robe) |
| 💖 **Priest** | Hồi Máu / Hỗ Trợ | `hpRegen`, `cdr`, `maxHp` | Trượng Thánh | Chuông Thánh / Thánh Giá | Áo Tế Lễ (Vestment) |

---

## 4. HỆ THỐNG TRANG BỊ 10 Ô & 5 PHẨM CẤP

### 4.1. Bố Cục 10 Ô Trang Bị Mỗi Tướng:
- **6 Ô Trang Bị Đặc Trưng (Class Gear):** Main-Hand (Vũ khí chính), Off-Hand (Vũ khí phụ/Khiên), Helmet (Mũ), Armor (Áo), Pants (Quần), Boots (Giày).
- **4 Ô Phụ Kiện Dùng Chung (Universal Accessories):** Ring 1 (Nhẫn 1), Ring 2 (Nhẫn 2), Necklace (Dây chuyền), Talisman (Bùa chú).

### 4.2. 5 Phẩm Cấp Cốt Lõi (Core Rarities):

| Phẩm Cấp | Màu Nhận Diện | Số Dòng Phụ (Sub-stats) | Số Lỗ Khảm Ngọc Tối Đa | Nguồn Thu Thập |
| :--- | :---: | :---: | :---: | :--- |
| ⚪ **Common** | Xám | 0 | 0 | Rớt từ quái thường World 1 |
| 🟢 **Uncommon** | Xanh lục | 1 | 0 | Quái thường, Rương Thường |
| 🔵 **Rare** | Xanh lam | 2 | 1 Lỗ Khảm | Rương Stage Boss, The Cube |
| 🟣 **Epic** | Tím | 3 | 2 Lỗ Khảm | Rương Boss Thế Giới, The Cube |
| 🟠 **Legendary** | Cam | 4 (Chỉ số Max) | 3 Lỗ Khảm | Boss Thế Giới X-10, Ghép 3 Epic qua Cube |

---

## 5. KIẾN TRÚC CHỈ SỐ & CÔNG THỨC CHIẾN ĐẤU

### 5.1. Bảng 4 Nhóm Chỉ Số Chuẩn Hóa:

```text
┌────────────────────────────────┬────────────────────────────────┐
│ 1. NHÓM TẤN CÔNG (OFFENSIVE)   │ 2. NHÓM PHÒNG THỦ (DEFENSIVE)  │
│ • physAtk (Sát thương vật lý)  │ • maxHp (Máu tối đa)           │
│ • magicAtk (Sát thương phép)   │ • armor (Giáp vật lý)          │
│ • atkPercent (% Tăng tổng DMG) │ • dmgReduction (% Giảm sát     │
│ • atkSpeed (Tốc độ đánh đòn/s) │   thương toàn diện, cap 75%)   │
│ • critRate (% Chí mạng cap100%)│ • hpRegen (Máu hồi phục/giây)  │
│ • critDmg (% Sát thương Crit)  │ • lifeSteal (% Hút máu)        │
│ • elemDmgBonus (% DMG nguyên tố│ • physDodge (% Né vật lý cap75)│
│   Hỏa / Băng / Lôi / Hỗn Mang) │ • spellEvasion (% Né phép cap75│
├────────────────────────────────┼────────────────────────────────┤
│ 3. NHÓM KHÁNG NGUYÊN TỐ (RES)  │ 4. NHÓM TIỆN ÍCH & KINH TẾ     │
│ • fireRes (% Kháng Lửa cap 75%)│ • cdr (% Giảm hồi chiêu cap50%)│
│ • coldRes (% Kháng Băng cap75%)│ • goldBonus (% Tăng Gold nhặt) │
│ • lightningRes (% Kháng Sét)   │ • chestDropBonus (% Tăng rương)│
│ • chaosRes (% Kháng Độc/Chaos) │ • expBonus (% Tăng kinh nghiệm)│
└────────────────────────────────┴────────────────────────────────┘
```

### 5.2. Công Thức Tính Sát Thương Tuyệt Đối (Standard Damage Formula):

#### A. Sát thương Đầu Ra (Damage Per Hit - DPH):
$$\text{FinalATK} = (\text{BaseATK} + \text{FlatBonusATK}) \times \Big(1 + \frac{\sum \text{atkPercent}}{100}\Big)$$

$$\mathbf{DPH} = \text{FinalATK} \times \text{SkillMultiplier} \times \text{CritMultiplier} \times \text{ElemMultiplier}$$

- **Hệ số Chí Mạng ($\text{CritMultiplier}$):** Nếu $\text{Random}(0, 100) < \text{critRate}$ thì lấy $\frac{\text{critDmg}}{100}$, ngược lại $= 1.0$.
- **Hệ số Nguyên Tố ($\text{ElemMultiplier}$):** $\max\Big(1.0 + \frac{\text{elemDmgBonus} - \text{TargetRes}}{100}, 0.1\Big)$.

#### B. Sát thương Nhận Vào (Damage Taken - Cơ chế Asymptotic DR):
$$\mathbf{DamageTaken} = \text{IncomingDamage} \times \Big(1 - \frac{\text{Armor}}{\text{Armor} + 500}\Big) \times \Big(1 - \frac{\min(\text{dmgReduction}, 75)}{100}\Big)$$

*Ghi chú:* Giá trị $K = 500$ đảm bảo chỉ số Armor không bao giờ triệt tiêu 100% sát thương (500 Armor giảm 50%, 1000 Armor giảm 67%, 2000 Armor giảm 80%).

---

## 6. HỆ THỐNG NÂNG CẤP TRANG BỊ 3 LỚP

```text
[ TRANG BỊ GỐC (Common ➔ Legendary) ]
                  │
   ┌──────────────┼──────────────┐
   ▼              ▼              ▼
[ TẦNG 1 ]     [ TẦNG 2 ]     [ TẦNG 3 ]
CƯỜNG HÓA      KHẢM NGỌC      CHÚC PHÚC
(+1 đến +15)   (1 - 3 Lỗ)     (Blessing Scroll)
```

### 6.1. Tầng 1: Cường Hóa Trang Bị (+1 ➔ +15)
- **Tài nguyên tiêu tốn:** Gold + Đá Cường Hóa (nhận được khi phân giải trang bị thừa).
- **Quy tắc cấp bậc:**
  - Cấp $+1 \rightarrow +5$: Tỉ lệ thành công 100%.
  - Cấp $+6 \rightarrow +10$: Có tỉ lệ thất bại, thất bại giữ nguyên cấp.
  - Cấp $+11 \rightarrow +15$: Có tỉ lệ thất bại, thất bại tụt 1 cấp (có mốc bảo hộ an toàn tại $+10$).

### 6.2. Tầng 2: Hệ Thống Ngọc & Lỗ Khảm (Sockets & Gems)
Đồ từ phẩm **Rare** trở lên có thể đục từ 1 đến 3 Lỗ Khảm tại Thợ Rèn:
- 🔴 **Ruby (Hồng Ngọc):** Tăng `physAtk` / `magicAtk` phẳng.
- 🟢 **Emerald (Ngọc Lục Bảo):** Tăng `critRate` và `critDmg`.
- 🔵 **Sapphire (Lam Ngọc):** Tăng `atkSpeed` và `cdr`.
- 🟡 **Topaz (Hoàng Ngọc):** Tăng `lifeSteal` và `hpRegen`.
- 💎 **Diamond (Kim Cương):** Tăng `dmgReduction` và Kháng 4 Hệ Nguyên Tố.
*Cấp bậc ngọc:* Mỗi loại ngọc có 5 Cấp (Tier 1 ➔ Tier 5).

### 6.3. Tầng 3: Giấy Chúc Phúc (Blessing Scrolls)
Trang bị có thể ép thêm 1 ấn chú ma thuật được chế tác từ Lò Giả Kim:
- **Scroll of Might:** Ép vũ khí ➔ Tăng $+10\%$ `atkPercent`.
- **Scroll of Aegis:** Ép áo giáp ➔ Tăng $+5\%$ `dmgReduction`.
- **Scroll of Fortune:** Ép phụ kiện ➔ Tăng $+20\%$ `goldBonus` & `chestDropBonus`.

---

## 7. HỆ THỐNG CHIỀU SÂU: THE CUBE, GIẢ KIM & THỢ RÈN

### 7.1. Khối Hợp Nhất Ma Thuật (The Cube)
- **Ghép Trang Bị (Smart Item Fusion):** Đặt 3 trang bị cùng loại và cùng phẩm cấp (vd: 3 Kiếm Rare) ➔ Chắc chắn nhận được 1 trang bị cùng loại ở phẩm cấp cao hơn (1 Kiếm Epic).
- **Ghép Ngọc (Gem Fusion):** 3 Viên ngọc Tier N cùng loại ➔ 1 Viên ngọc Tier N+1.
- **Tẩy Luyện Dòng Phụ (Sub-stat Reforge):** Tiêu tốn Đá Tẩy Luyện để reroll toàn bộ dòng phụ của trang bị. Cho phép khóa tối đa 1 dòng chỉ số mong muốn.

### 7.2. Lò Giả Kim (Alchemy Lab)
- Sử dụng Thảo mộc, Quặng và Tinh chất quái để nấu các loại **Giấy Chúc Phúc**.
- Nấu **Dược Phẩm Kháng Hệ (Elixirs)** tăng kháng nguyên tố tạm thời hoặc vĩnh viễn cho Party.

### 7.3. Xưởng Thợ Rèn (Blacksmith)
- **Đục Lỗ Trang Bị:** Mở thêm ô khảm ngọc cho trang bị Rare, Epic, Legendary.
- **Chế Tạo Phụ Kiện:** Dùng Lõi Rơi Từ Boss + Kim Loại để rèn 4 vị trí phụ kiện (Nhẫn 1, Nhẫn 2, Dây Chuyền, Bùa Chú).

---

## 8. TIẾN TRÌNH MÀN CHƠI & HỆ THỐNG BOSS

### 8.1. Cấu Trúc Phân Tầng 4 Thế Giới (40 Stages):
- **World 1: Rừng Thảo Mộc (Verdant Forest)** — Thuộc tính Thường / Độc (Chaos).
- **World 2: Hầm Ngục Băng Giá (Frozen Crypt)** — Thuộc tính Băng (Cold).
- **World 3: Núi Lửa Dung Nham (Molten Peak)** — Thuộc tính Hỏa (Fire).
- **World 4: Vực Thẳm Hư Không (Void Sanctum)** — Thuộc tính Lôi / Hỗn Mang (Lightning / Void).

### 8.2. Cấu Trúc Mỗi Stage (30 Waves + Boss):
- **Wave 1 ➔ Wave 30:** Quái thường xuất hiện liên tục. Rớt Gold, Đá Cường Hóa, Thảo mộc và Tỉ lệ $2-3\%$ rớt Rương Trang Bị.
- **Wave 30 (Stage Boss):**
  - Vượt ải lần đầu (First Clear): $100\%$ nhận Rương Boss + Lượng lớn Gold thưởng.
  - Cắm máy farm lại: Tỉ lệ rớt rương $20\% - 25\%$.
  - **Cơ chế Thắng / Thua:** Thắng tự động chuyển sang Stage kế tiếp. Thua tự động lặp lại chu kỳ farm 30 waves hiện tại.
- **World Boss (Màn X-10):** Đòi hỏi 1 **Đá Phong Ấn** thu thập từ Màn X-9 để mở khóa. Đánh bại nhận trang bị Epic/Legendary và mở khóa Thế giới tiếp theo.

---

## 9. KIẾN TRÚC CÂN BẰNG ĐỘNG (TEMPLATE - INSTANCE)

Nhằm đảm bảo khả năng cân bằng game linh hoạt mà không gây lỗi dữ liệu túi đồ người chơi:

```text
[ ADMIN PANEL DASHBOARD ]
          │
          ▼
[ Item Template Master DB ] ──► (Chỉnh sửa Base Stat, Hệ số Scaling, Drop Rate)
          │
          │ (Tính toán tự động theo công thức tại Runtime)
          ▼
[ Player Inventory (Item Instance) ]
  Chỉ lưu: { templateId, iLvl, rarity, enhanceLevel, sockets[], blessingId }
  ➔ Stats thực tế = CalculateStats(templateId, iLvl, rarity, enhanceLevel, sockets, blessingId)
```

1. **Dữ liệu phân tách:** Dữ liệu người chơi không lưu các con số cứng (Hardcoded Stats). Toàn bộ chỉ số được hàm tính toán động (`CalculateStats`) diễn giải tại thời điểm load game.
2. **Cập nhật tức thời:** Khi thay đổi thông số vũ khí trên Admin Panel, toàn bộ người chơi nhận chỉ số cân bằng mới ngay lập tức.

---

## 10. TÍCH HỢP NỀN TẢNG & MÔ HÌNH DOANH THU

### 10.1. Tích Hợp World App & MiniKit SDK
- **World ID Authentication:** Người chơi đăng nhập và đồng bộ tiến trình Cloud Save thông qua định danh World ID (`nullifier_hash`), đảm bảo mỗi tài khoản gắn liền với một người dùng thực.
- **Giao Diện Chuẩn Mobile WebView:** Thiết kế tỷ lệ 35% màn hình trên hiển thị Canvas 2D chiến đấu, 65% màn hình dưới dành cho hệ thống Tab Quản lý (Túi đồ, The Cube, Giả Kim, Skill Tree).

### 10.2. Mô Hình Doanh Thu (Monetization Architecture)
- **MiniKit Pay (IAP Tiện Ích & Làm Đẹp):**
  - Mở khóa Skin nhân vật & Hiệu ứng kỹ năng Pixel đặc sắc.
  - Thú cưng hỗ trợ tự động nhặt đồ (Auto-loot Pets).
  - Mở rộng giới hạn ô chứa túi đồ (Inventory Expansion).
- **World Developer Rewards:** Doanh thu thụ động từ quỹ phân phối nhà phát triển của World Network dựa trên chỉ số hoạt động của người dùng đã xác thực (Verified Human Engagement).
