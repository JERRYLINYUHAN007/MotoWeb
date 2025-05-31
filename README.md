# MotoMod 摩托車改裝社群平台

## 專案概述
MotoMod 是一個專業的摩托車改裝社群平台，為車友提供改裝零件展示、技術交流、作品分享和活動參與的綜合服務平台。

## 系統架構

### 技術棧
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **後端**: Node.js, Express.js
- **資料庫**: MongoDB
- **認證**: JWT (JSON Web Tokens)
- **檔案上傳**: Multer
- **密碼加密**: bcryptjs

### 專案結構
```
MotoMod/
├── server.js                 # 主要後端伺服器檔案
├── config.js                 # 系統配置檔案
├── package.json              # Node.js 依賴管理
├── docker-compose.yml        # Docker 容器編排
├── Dockerfile               # Docker 映像檔配置
├── public/                  # 前端靜態檔案
│   ├── css/                 # 樣式檔案
│   │   ├── colors.css       # 全站配色變數
│   │   ├── style.css        # 共用樣式
│   │   ├── tech-theme.css   # 技術主題樣式
│   │   └── [其他頁面樣式]
│   ├── js/                  # JavaScript 檔案
│   │   ├── main.js          # 共用腳本
│   │   ├── auth-state.js    # 認證狀態管理
│   │   ├── api.js           # API 通訊
│   │   └── [各頁面腳本]
│   ├── images/              # 圖片資源
│   ├── uploads/             # 使用者上傳檔案
│   └── [HTML 頁面檔案]
├── scripts/                 # 工具腳本
└── 啟動指南.md              # 快速啟動指南
```

## 功能特點

### 1. 使用者系統
- **會員註冊/登入** (`register.html`, `login.html`)
- **個人資料管理** (`profile.html`)
- **密碼重置功能** (`forgot-password.html`, `reset-password.html`)
- **使用者設定** (`settings.html`)
- **個人車庫** (`garage.html`)

### 2. 改裝零件展示 (`products.html`)
- 分類瀏覽系統（引擎、排氣、懸吊、煞車等）
- 進階搜尋和篩選功能
- 品牌、價格範圍、適用車種篩選
- 詳細零件資訊展示
- 產品詳情頁面 (`product-detail.html`)

### 3. 社群討論區 (`community.html`)
- 分類討論區
- 熱門標籤系統
- 發表新主題功能
- 互動評論系統
- 討論詳情頁面 (`discussion-detail.html`)

### 4. 作品展示區 (`gallery.html`)
- 網格/列表檢視切換
- 作品上傳功能
- 圖片預覽和分享
- 標籤系統
- 互動評論

### 5. 活動專區 (`events.html`)
- 活動日曆
- 多視圖切換（網格/列表/日曆）
- 活動報名系統
- 活動篩選功能

### 6. 其他功能
- **改裝案例展示** (`showcase.html`)
- **車款圖庫** (`bikes-gallery.html`)
- **關於我們** (`about.html`)
- **隱私政策** (`privacy.html`)
- **服務條款** (`terms.html`)
- **Cookie 政策** (`cookies.html`)

## 安裝與啟動

### 方法一：Node.js 直接啟動

#### 準備工作
1. 安裝 Node.js (v18.0.0 或更高版本)
2. 安裝 MongoDB 並確保服務運行

#### 啟動步驟
```bash
# 1. 安裝依賴套件
npm install

# 2. 初始化資料庫 (選擇性)
npm run db:init

# 3. 啟動開發模式
npm run dev

# 或啟動生產模式
npm start
```

#### 訪問網站
開啟瀏覽器訪問: http://localhost:3001

### 方法二：Docker Compose 啟動 (推薦)

#### 準備工作
確保已安裝 Docker 和 Docker Compose

#### 啟動步驟
```bash
# 1. 啟動整個應用
docker-compose up -d

# 2. 初始化資料庫 (選擇性)
docker-compose exec app npm run db:init
```

#### 訪問網站
開啟瀏覽器訪問: http://localhost:3001

## 環境配置

### 環境變數
系統支援以下環境變數配置：

```bash
# 伺服器設定
PORT=3001
NODE_ENV=development
HOST=localhost

# MongoDB 連接
MONGODB_URI=mongodb://localhost:27017/motoweb

# JWT 設定
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 檔案上傳設定
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp

# 管理員設定
ADMIN_EMAIL=admin@motoweb.com
ADMIN_PASSWORD=admin123

# 其他設定
LOG_LEVEL=info
ENABLE_CORS=true
```

### 資料庫配置
- **本地 MongoDB**: `mongodb://localhost:27017/motoweb`
- **Docker MongoDB**: `mongodb://mongo:27017/motoweb`
- **MongoDB Atlas**: 使用完整的連接字串

## API 文檔

### 認證相關 API
- `POST /api/register` - 使用者註冊
- `POST /api/login` - 使用者登入
- `POST /api/logout` - 使用者登出
- `POST /api/forgot-password` - 忘記密碼
- `POST /api/reset-password` - 重置密碼

### 使用者相關 API
- `GET /api/profile` - 獲取使用者資料
- `PUT /api/profile` - 更新使用者資料
- `POST /api/upload/avatar` - 上傳頭像

### 內容相關 API
- `GET /api/products` - 獲取產品列表
- `GET /api/products/:id` - 獲取產品詳情
- `GET /api/showcase` - 獲取改裝案例
- `GET /api/posts` - 獲取社群文章
- `GET /api/events` - 獲取活動列表
- `GET /api/galleries` - 獲取作品展示

### 檔案上傳 API
- `POST /api/upload/:type` - 上傳檔案 (type: gallery, showcase, avatar 等)

## 網站配色方案

### 主要顏色
- **深咖啡色** (`#534739`): 主要強調色，按鈕和標題
- **淺咖啡色** (`#9E8774`): 次要強調色，懸停狀態
- **淺灰白色** (`#F0F2F1`): 淺色背景
- **深藍灰色** (`#1F2D33`): 主要文字顏色
- **深黑色** (`#0D0D0C`): 特殊強調色

### CSS 變數系統
所有顏色定義在 `public/css/colors.css` 中，通過 CSS 變數實現全站一致的視覺風格。

## 常見問題

### 端口被佔用
修改環境變數中的 `PORT` 設定：
```bash
PORT=3002
```

### MongoDB 連接失敗
1. 確保 MongoDB 服務已啟動
2. 檢查連接字串是否正確
3. 如使用 MongoDB Atlas，確認 IP 白名單設定

### MongoDB Atlas 連接問題
1. 登入 MongoDB Atlas 控制台
2. 進入 Network Access 設定
3. 添加當前 IP 地址到白名單
4. 等待設定生效後重新啟動應用

### Windows 下運行 MongoDB
1. 下載 MongoDB Community Edition
2. 創建資料目錄: `mkdir C:\data\db`
3. 啟動服務: `mongod --dbpath="C:\data\db"`

## 預設帳號

### 管理員帳號
- 使用者名稱: `admin`
- 密碼: `admin123`

### 測試使用者帳號
- 使用者名稱: `user`
- 密碼: `user123`

## 部署選項

### Vercel 部署
```bash
npm run vercel-build
```

### Netlify 部署
使用 `netlify.toml` 配置檔案

### Docker 部署
```bash
docker build -t motomod .
docker run -p 3001:3001 motomod
```

## 開發指南

### 程式碼規範
- 使用語意化 HTML
- 遵循 BEM CSS 命名規範
- JavaScript 使用 ES6+ 語法
- 保持程式碼註釋完整

### 檔案組織
- CSS 檔案按功能模組化
- JavaScript 檔案按頁面分離
- 圖片資源分類存放
- API 路由邏輯分離

### 安全性考量
- 密碼使用 bcrypt 加密
- JWT 身份驗證
- 檔案上傳安全限制
- API 錯誤處理
- CORS 設定

## 瀏覽器支援
- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 響應式設計
- 手機：< 576px
- 平板：576px - 992px
- 桌面：> 992px

## 授權協議
本專案採用 MIT 授權協議。

## 聯絡資訊
- 專案名稱: MotoMod
- 版本: 1.0.0
- 作者: MotoWeb Team
- 電子郵件: contact@motoweb.com

## 貢獻指南
1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 發起 Pull Request

---

**注意**: 請確保在生產環境中更改預設密碼和 JWT 密鑰，並正確配置資料庫連接。 