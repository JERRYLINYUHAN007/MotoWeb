# MotoWeb 快速開始指南

## 🚀 5分鐘快速部署

### 方法一：Vercel 一鍵部署 (推薦)

1. **準備 MongoDB Atlas**
   ```
   1. 註冊 https://cloud.mongodb.com
   2. 創建免費集群
   3. 設定網路存取：允許所有IP (0.0.0.0/0)
   4. 創建資料庫用戶
   5. 複製連接字串
   ```

2. **部署到 Vercel**
   ```bash
   # 安裝 Vercel CLI
   npm install -g vercel
   
   # 登入 Vercel
   vercel login
   
   # 部署專案
   vercel
   
   # 設定環境變數
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   ```

3. **初始化資料庫**
   ```
   訪問：https://your-app.vercel.app/api/init-db
   ```

### 方法二：Heroku 部署

```bash
# 安裝 Heroku CLI
npm install -g heroku

# 登入並創建應用
heroku login
heroku create your-app-name

# 設定環境變數
heroku config:set MONGODB_URI="your_mongodb_connection_string"
heroku config:set JWT_SECRET="your_secret_key"
heroku config:set NODE_ENV=production

# 部署
git push heroku main

# 初始化資料庫
heroku run npm run db:init
```

### 方法三：本地開發

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數
cp env.example .env
# 編輯 .env 檔案，設定 MONGODB_URI 和 JWT_SECRET

# 3. 初始化資料庫
npm run db:init

# 4. 啟動開發服務器
npm run dev

# 5. 訪問 http://localhost:3002
```

## 🔧 環境變數設定

### 必要設定
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/motoweb
JWT_SECRET=your_32_character_secret_key_here
```

### 可選設定
```env
PORT=3002
NODE_ENV=production
ADMIN_EMAIL=admin@motoweb.com
ADMIN_PASSWORD=your_secure_password
```

### JWT 密鑰生成
```bash
# 方法1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法2: OpenSSL
openssl rand -hex 32

# 方法3: 線上生成器
# 訪問 https://generate-secret.vercel.app/32
```

## 📋 功能檢查

部署完成後，測試以下功能：

### 1. 基本功能
- [ ] 首頁載入正常
- [ ] 註冊新用戶
- [ ] 用戶登入
- [ ] 個人資料管理

### 2. 社群功能
- [ ] 改裝案例展示
- [ ] 零件商城瀏覽
- [ ] 社群討論
- [ ] 活動專區

### 3. 進階功能
- [ ] 圖片上傳
- [ ] 車庫管理
- [ ] 搜尋和篩選

## 🎯 預設帳號

### 管理員帳號
- 用戶名：`admin`
- 密碼：`admin123`

### 測試用戶
- 用戶名：`user`
- 密碼：`user123`

## 🛠️ 常見問題

### Q1: MongoDB 連接失敗
**A:** 檢查 MongoDB Atlas 的 Network Access 設定，確保允許您的 IP 或設定為 0.0.0.0/0

### Q2: JWT 錯誤
**A:** 確保設定了 JWT_SECRET 環境變數，且長度至少 32 字元

### Q3: 靜態檔案無法載入
**A:** 確認 public 目錄結構完整，檢查檔案路徑大小寫

### Q4: 資料庫初始化失敗
**A:** 確保 MongoDB 連接正常，手動執行 `npm run db:init`

## 📞 技術支援

- **文檔**: `DEPLOYMENT_GUIDE.md`
- **API文檔**: `/api-docs.html`
- **健康檢查**: `/api/health`
- **問題回報**: GitHub Issues

---

## 🎉 部署成功！

您的 MotoWeb 摩托車改裝社群平台現在已經上線運行！

立即開始：
1. 註冊新帳號或使用預設帳號登入
2. 探索各項功能
3. 上傳您的改裝作品
4. 與社群成員互動

祝您使用愉快！ 🏍️ 