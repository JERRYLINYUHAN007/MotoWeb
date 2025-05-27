# MotoWeb 部署指南

本指南將協助您將 MotoWeb 摩托車改裝社群平台部署到各種雲端平台。

## 🚀 快速部署選項

### 1. Vercel 部署 (推薦)

Vercel 是最簡單的部署選項，適合快速上線。

#### 準備工作
1. 註冊 [Vercel 帳號](https://vercel.com)
2. 安裝 Vercel CLI：
```bash
npm install -g vercel
```

#### 部署步驟
1. 登入 Vercel：
```bash
vercel login
```

2. 在專案根目錄執行：
```bash
vercel
```

3. 按照提示設定：
   - Project name: `motoweb`
   - Framework preset: `Other`
   - Override settings: `No`

4. 設定環境變數：
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
```

#### MongoDB Atlas 設定
1. 註冊 [MongoDB Atlas](https://cloud.mongodb.com)
2. 創建新集群
3. 設定 Network Access (允許所有 IP：0.0.0.0/0)
4. 取得連接字串：
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/motoweb
```

### 2. Netlify 部署

#### 步驟
1. 註冊 [Netlify 帳號](https://netlify.com)
2. 連接 GitHub 儲存庫
3. 設定建置設定：
   - Build command: `npm run build`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`

4. 設定環境變數：
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### 3. Heroku 部署

#### 準備工作
1. 註冊 [Heroku 帳號](https://heroku.com)
2. 安裝 Heroku CLI
3. 創建 `Procfile`：
```
web: node server.js
```

#### 部署步驟
```bash
# 登入 Heroku
heroku login

# 創建應用程式
heroku create motoweb-app

# 設定環境變數
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set NODE_ENV=production

# 部署
git push heroku main
```

### 4. Railway 部署

#### 步驟
1. 註冊 [Railway 帳號](https://railway.app)
2. 點擊 "Deploy from GitHub repo"
3. 選擇您的儲存庫
4. 設定環境變數
5. 系統會自動部署

## 🔧 環境配置

### 必要環境變數

複製 `env.example` 為 `.env` 並設定以下變數：

```env
# 服務器設定
PORT=3002
NODE_ENV=production
HOST=0.0.0.0

# 資料庫連接
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/motoweb

# 安全金鑰
JWT_SECRET=your_super_secret_jwt_key_32_characters_long

# 檔案上傳
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp

# 管理員設定
ADMIN_EMAIL=admin@motoweb.com
ADMIN_PASSWORD=secure_admin_password_123
```

### JWT 金鑰生成

使用以下命令生成安全的 JWT 金鑰：

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

## 🗄️ 資料庫設定

### MongoDB Atlas (推薦)

1. **創建集群**：
   - 選擇免費的 M0 集群
   - 選擇地區（建議選擇離用戶最近的地區）

2. **設定網路存取**：
   - 點擊 "Network Access"
   - 點擊 "Add IP Address"
   - 選擇 "Allow Access from Anywhere" (0.0.0.0/0)

3. **創建資料庫用戶**：
   - 點擊 "Database Access"
   - 點擊 "Add New Database User"
   - 設定用戶名和密碼
   - 選擇 "Read and write to any database"

4. **取得連接字串**：
   - 點擊 "Connect"
   - 選擇 "Connect your application"
   - 複製連接字串並替換 `<password>`

### 本地 MongoDB

如果使用本地 MongoDB：

```bash
# 安裝 MongoDB
# Windows: 下載 MongoDB Community Edition
# macOS: brew install mongodb/brew/mongodb-community
# Ubuntu: sudo apt install mongodb

# 啟動服務
mongod

# 連接字串
MONGODB_URI=mongodb://localhost:27017/motoweb
```

## 🔄 資料庫初始化

部署後執行以下步驟初始化資料庫：

### 方法一：手動執行

```bash
# 連接到部署的應用程式
# Vercel
vercel exec npm run db:init

# Heroku
heroku run npm run db:init

# Railway/Netlify
# 需要透過平台控制台執行
```

### 方法二：API 呼叫

訪問以下 URL 觸發初始化：
```
https://your-domain.com/api/init-db
```

## 🎨 前端設定

### 靜態檔案

確保以下檔案能正確訪問：
- `/css/*` - 樣式檔案
- `/js/*` - JavaScript 檔案
- `/images/*` - 圖片資源
- `/uploads/*` - 使用者上傳檔案

### CDN 整合 (可選)

可以將靜態資源移至 CDN：

```javascript
// 在 config.js 中設定 CDN
const CDN_URL = process.env.CDN_URL || '';

// 在 HTML 中使用
<link rel="stylesheet" href="${CDN_URL}/css/style.css">
```

## 🔍 測試部署

### 功能檢查清單

部署完成後，請測試以下功能：

- [ ] 首頁載入正常
- [ ] 用戶註冊/登入
- [ ] 改裝案例展示
- [ ] 零件商城瀏覽
- [ ] 社群討論功能
- [ ] 活動專區
- [ ] 圖片上傳功能
- [ ] 個人資料管理
- [ ] API 端點回應正常

### 測試 API

```bash
# 測試伺服器狀態
curl https://your-domain.com/api/health

# 測試註冊功能
curl -X POST https://your-domain.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## 🛠️ 常見問題排解

### 1. MongoDB 連接失敗

**錯誤**：`MongoNetworkError: connection refused`

**解決方法**：
- 檢查 MongoDB Atlas 的 Network Access 設定
- 確認連接字串格式正確
- 檢查用戶名密碼是否正確

### 2. 靜態檔案 404 錯誤

**解決方法**：
- 確認 `public` 目錄結構完整
- 檢查服務器設定的靜態檔案路徑
- 確認檔案路徑大小寫正確

### 3. JWT 錯誤

**錯誤**：`Invalid token`

**解決方法**：
- 確認 JWT_SECRET 環境變數已設定
- 檢查前端是否正確傳送 Authorization header

### 4. 檔案上傳失敗

**解決方法**：
- 檢查 uploads 目錄權限
- 確認檔案大小限制設定
- 檢查檔案類型限制

## 🔒 安全性設定

### 生產環境安全檢查

1. **更改預設密碼**：
```env
ADMIN_PASSWORD=strong_unique_password_123!
```

2. **設定強壯的 JWT 密鑰**：
```env
JWT_SECRET=your_32_character_secret_key_here
```

3. **啟用 HTTPS**：
大部分雲端平台會自動提供 HTTPS

4. **設定 CORS**：
```javascript
// 在 server.js 中限制 CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3002']
}));
```

## 📈 效能優化

### 1. 資料庫索引

確保資料庫已建立適當索引：
```javascript
// 在 initDB.js 中
await db.collection('users').createIndex({ username: 1 }, { unique: true });
await db.collection('posts').createIndex({ title: 'text', content: 'text' });
```

### 2. 快取設定

設定靜態資源快取：
```javascript
// 在 server.js 中
app.use(express.static('public', {
  maxAge: '1d'
}));
```

### 3. 圖片優化

- 壓縮圖片檔案
- 使用適當的圖片格式（WebP, JPEG, PNG）
- 實施延遲載入

## 📝 部署檢查清單

### 部署前
- [ ] 所有環境變數已設定
- [ ] 資料庫連接字串正確
- [ ] JWT 密鑰已生成
- [ ] 靜態檔案完整

### 部署後
- [ ] 網站可正常訪問
- [ ] 資料庫已初始化
- [ ] 所有功能正常運作
- [ ] SSL 憑證已設定
- [ ] 錯誤監控已啟用

## 🎯 下一步

部署成功後，您可以：

1. **設定網域名稱**：購買自訂網域並設定 DNS
2. **設定監控**：使用工具如 Uptime Robot 監控網站狀態
3. **分析工具**：整合 Google Analytics 追蹤使用情況
4. **備份策略**：設定資料庫定期備份
5. **效能監控**：使用 New Relic 或類似工具監控效能

## 🆘 支援

如果遇到部署問題，請：

1. 檢查伺服器日誌
2. 確認環境變數設定
3. 測試資料庫連接
4. 查看本指南的故障排除章節

---

**祝您部署成功！** 🎉

如需更多協助，請參考各平台的官方文檔或聯繫技術支援。 