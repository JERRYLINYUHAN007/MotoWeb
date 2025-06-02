# MotoWeb 摩托車社群平台

## 專案概述
MotoWeb 是一個現代化的摩托車愛好者社群平台，提供會員管理、個人資料、活動資訊、產品展示等功能。採用科技風格的深色主題設計，支援響應式佈局，為摩托車愛好者打造專業的線上交流空間。

## 系統架構

### 技術棧
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **後端**: Node.js, Express.js
- **資料庫**: MongoDB
- **認證**: JWT (JSON Web Tokens) + localStorage
- **檔案處理**: Multer (多媒體上傳)
- **密碼加密**: bcryptjs
- **UI 風格**: 科技深色主題 + 響應式設計

### 專案結構
```
MotoWeb/
├── server.js                     # Node.js 後端伺服器
├── package.json                  # 依賴管理和啟動腳本
├── public/                       # 前端靜態資源
│   ├── css/                      # 樣式檔案系統
│   │   ├── colors.css            # 科技風格配色方案
│   │   ├── style.css             # 全域樣式 (75%縮放優化)
│   │   ├── tech-theme.css        # 科技主題樣式
│   │   ├── common.css            # 共用元件樣式
│   │   ├── profile.css           # 個人資料頁面樣式
│   │   ├── events.css            # 活動頁面樣式
│   │   └── navbar.css            # 導航欄樣式
│   ├── js/                       # JavaScript 模組
│   │   ├── main.js               # 主要腳本和初始化
│   │   ├── auth-state.js         # 認證狀態管理
│   │   ├── api.js                # API 通訊層
│   │   ├── profile.js            # 個人資料功能
│   │   ├── navbar.js             # 導航欄互動
│   │   └── events.js             # 活動頁面功能
│   ├── images/                   # 圖片資源
│   ├── uploads/                  # 使用者上傳內容
│   ├── index.html                # 首頁 (英雄區域 + 特色功能)
│   ├── login.html                # 登入頁面
│   ├── register.html             # 註冊頁面
│   ├── profile.html              # 個人資料頁面
│   ├── events.html               # 活動頁面
│   ├── products.html             # 產品展示頁面
│   ├── gallery.html              # 作品展示頁面
│   ├── showcase.html             # 改裝案例頁面
│   ├── community.html            # 社群討論頁面
│   └── [其他頁面]
└── README.md                     # 專案說明文件
```

## 核心功能特點

### 1. 使用者認證系統
- **註冊/登入** - 完整的使用者認證流程
- **JWT Token 管理** - 安全的身份驗證
- **狀態持久化** - localStorage 儲存登入狀態
- **使用者角色** - 支援 admin 和一般用戶
- **密碼安全** - bcrypt 加密保護

### 2. 個人資料管理
- **動態用戶資料** - 根據登入用戶顯示個人資訊
- **多標籤頁介面** - 個人資訊/文章/照片/喜歡的內容
- **固定封面背景** - 不可編輯的專業背景
- **模擬內容展示** - 文章、照片、喜歡項目的展示
- **響應式設計** - 適配各種螢幕尺寸

### 3. 活動管理系統
- **活動日曆** - 視覺化活動時間表
- **進階搜尋** - 完整的搜尋欄功能
- **多視圖切換** - 網格/列表/日曆檢視
- **活動篩選** - 按類型、時間、地點篩選
- **活動詳情** - 完整的活動資訊展示

### 4. 響應式UI設計
- **75% 縮放優化** - 針對 100% 瀏覽器縮放優化顯示
- **科技深色主題** - 專業的視覺風格
- **漸層效果** - 豐富的視覺層次
- **動畫過渡** - 流暢的使用者體驗
- **卡片佈局** - 現代化的內容展示

### 5. 產品與內容展示
- **產品目錄** (`products.html`) - 摩托車相關產品展示
- **作品展示** (`gallery.html`) - 使用者作品集
- **改裝案例** (`showcase.html`) - 專業改裝案例
- **社群討論** (`community.html`) - 車友交流平台

## 設計系統

### 配色方案 (科技深色主題)
```css
/* 主要配色 */
--primary-color: #00d4ff;          /* 霓虹藍 - 主要強調色 */
--secondary-color: #7c3aed;        /* 紫色 - 次要強調色 */
--accent-color: #00ff88;           /* 霓虹綠 - 輔助強調色 */
--success-color: #10b981;          /* 成功色 */

/* 背景色系 */
--background-color: #0a0a0a;       /* 深黑背景 */
--dark-surface: #1a1a1a;          /* 深色表面 */
--mid-surface: #2a2a2a;           /* 中色表面 */
--light-surface: #3a3a3a;         /* 淺色表面 */

/* 文字色系 */
--text-color: #ffffff;             /* 主要文字 */
--metallic-silver: #b0b0b0;       /* 次要文字 */
--carbon-gray: #404040;           /* 邊框色 */
```

### 響應式斷點
- **桌面**: > 992px (完整功能顯示)
- **平板**: 768px - 992px (適配中等螢幕)
- **手機**: < 768px (移動端優化)

### 字體系統 (75% 縮放)
- **基準字體**: 12px (原 16px 的 75%)
- **Body 字體**: 1.2rem (補償縮放)
- **標題層級**: h1(2.25rem) → h6(0.75rem)
- **按鈕**: 0.9rem

## 安裝與啟動

### 環境要求
- Node.js 18.0.0 或更高版本
- MongoDB (本地或遠端)
- 現代瀏覽器 (Chrome, Firefox, Safari, Edge)

### 快速啟動
```bash
# 1. 安裝依賴
npm install

# 2. 啟動 MongoDB (如果使用本地)
mongod

# 3. 啟動開發伺服器
npm start
# 或
node server.js

# 4. 開啟瀏覽器
http://localhost:3001
```

### 環境配置
```bash
# .env 檔案 (可選)
PORT=3001
MONGODB_URI=mongodb://localhost:27017/motoweb
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## 預設測試帳號

### 管理員帳號
- **用戶名**: `admin`
- **電子信箱**: `admin@motoweb.com`
- **密碼**: `admin123`
- **權限**: 完整管理權限

### 一般用戶帳號
- **用戶名**: `JohnRider`
- **電子信箱**: `john@motoweb.com`
- **密碼**: `password123`
- **權限**: 標準用戶權限

## API 端點

### 認證相關
```javascript
POST /api/auth/register    // 用戶註冊
POST /api/auth/login       // 用戶登入
POST /api/auth/logout      // 用戶登出
GET  /api/auth/verify      // 驗證 Token
```

### 用戶相關
```javascript
GET  /api/users/profile    // 獲取用戶資料
PUT  /api/users/profile    // 更新用戶資料
GET  /api/users/:id        // 獲取指定用戶
```

### 內容相關
```javascript
GET  /api/products         // 獲取產品列表
GET  /api/events           // 獲取活動列表
GET  /api/gallery          // 獲取作品展示
GET  /api/posts            // 獲取社群文章
```

## 特色功能詳解

### 1. 智能響應式設計
- **75% 縮放優化**: 所有元素針對 100% 瀏覽器縮放進行精確調整
- **水平卡片對齊**: 使用 flexbox 確保卡片在同一水平線
- **最小寬度控制**: 防止在小螢幕上內容過度壓縮

### 2. 現代科技風格
- **深色主題**: 專業的視覺體驗
- **霓虹配色**: 未來科技感的配色方案
- **漸層效果**: 豐富的視覺層次
- **動畫過渡**: 平滑的互動反饋

### 3. 用戶體驗優化
- **狀態管理**: 完整的登入狀態追蹤
- **錯誤處理**: 友善的錯誤提示
- **載入狀態**: 視覺化的載入反饋
- **導航記憶**: 頁面間的狀態保持

## 開發指南

### 程式碼結構
```javascript
// 模組化設計範例
// auth-state.js - 認證狀態管理
const AuthState = {
    getCurrentUser: () => { /* 獲取當前用戶 */ },
    isUserLoggedIn: () => { /* 檢查登入狀態 */ },
    login: (credentials) => { /* 登入處理 */ },
    logout: () => { /* 登出處理 */ }
};

// profile.js - 動態用戶資料
function loadUserProfile() {
    const currentUser = getCurrentUser();
    // 根據實際登入用戶載入資料
}
```

### CSS 架構
```css
/* 75% 縮放系統 */
:root {
    --font-size-base: 12px;    /* 基準字體 75% */
    --spacing-md: 0.75rem;     /* 間距 75% */
    --border-radius-md: 6px;   /* 圓角 75% */
}

/* 響應式設計 */
@media (max-width: 768px) {
    .features-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
```

## 部署建議

### 生產環境設定
```bash
# 設定環境變數
NODE_ENV=production
JWT_SECRET=your_secure_secret_key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/motoweb

# 啟動生產模式
npm start
```

### 安全性檢查清單
- [ ] 更改預設密碼
- [ ] 設定安全的 JWT 密鑰
- [ ] 配置 HTTPS
- [ ] 設定檔案上傳限制
- [ ] 配置 CORS 政策
- [ ] 啟用日誌記錄

## 常見問題 FAQ

### Q: 網站在 100% 縮放時卡片上下排列？
A: 系統已針對此問題進行優化，將卡片最小寬度調整為 200px，確保在 100% 縮放時仍能水平排列。

### Q: 用戶資料顯示錯誤？
A: 確保已正確登入，系統會根據實際登入用戶動態載入對應資料。

### Q: 搜尋欄顯示不完整？
A: 已修復搜尋欄樣式，確保在所有螢幕尺寸下完整顯示。

### Q: MongoDB 連接失敗？
A: 檢查 MongoDB 服務狀態，確認連接字串正確，並檢查防火牆設定。

## 瀏覽器支援
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (部分功能限制)

## 版本資訊
- **目前版本**: 2.0.0
- **最後更新**: 2024年12月
- **Node.js**: 18.0.0+
- **MongoDB**: 4.4+

## 授權與聯絡

### 授權協議
本專案採用 MIT 授權協議，允許自由使用、修改和分發。

### 聯絡資訊
- **專案名稱**: MotoWeb
- **開發團隊**: MotoWeb Development Team
- **技術支援**: tech@motoweb.com
- **GitHub**: [專案連結]

### 貢獻指南
1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/NewFeature`)
3. 提交變更 (`git commit -m 'Add NewFeature'`)
4. 推送分支 (`git push origin feature/NewFeature`)
5. 建立 Pull Request

---

**🏍️ 歡迎來到 MotoWeb - 專為摩托車愛好者打造的數位社群平台！**

*注意: 請在生產環境中務必更改所有預設密碼和安全設定。* 