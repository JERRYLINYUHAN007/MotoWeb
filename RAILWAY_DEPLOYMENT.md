# Railway 部署指南

## 部署步驟

### 1. 準備 Railway 帳號
1. 前往 [Railway.app](https://railway.app/)
2. 使用 GitHub 帳號登入
3. 連接您的 GitHub 儲存庫

### 2. 創建專案
1. 點擊 "New Project"
2. 選擇 "Deploy from GitHub repo"
3. 選擇您的 MotoWeb 儲存庫

### 3. 設置服務

#### 主要 Node.js 應用程式
Railway 會自動偵測您的 `package.json` 並部署 Node.js 應用程式。

#### PHP 後端服務
1. 在 Railway Dashboard 中點擊 "New Service"
2. 選擇 "GitHub Repo"
3. 設置 Root Directory 為 `php-backend`

### 4. 環境變數設置

在 Railway Dashboard 的 Variables 選項卡中添加以下環境變數：

#### Node.js 服務環境變數
```
NODE_ENV=production
MONGODB_URI=你的MongoDB連接字串
JWT_SECRET=你的JWT密鑰
PORT=自動分配
```

#### PHP 服務環境變數
```
APP_ENV=production
APP_KEY=你的Laravel應用密鑰
APP_DEBUG=false
DB_CONNECTION=mongodb
DB_HOST=你的MongoDB主機
DB_PORT=27017
DB_DATABASE=你的資料庫名稱
DB_USERNAME=你的用戶名
DB_PASSWORD=你的密碼
```

### 5. 自定義域名 (可選)
1. 在服務設置中點擊 "Settings"
2. 找到 "Domains" 區域
3. 添加您的自定義域名

### 6. 資料庫設置

#### MongoDB Atlas (推薦)
1. 使用 MongoDB Atlas 免費層
2. 將連接字串添加到環境變數

#### 或使用 Railway MongoDB
1. 在專案中點擊 "+ New"
2. 選擇 "Database" > "MongoDB"
3. Railway 會自動生成連接字串

## 部署後檢查

1. 檢查服務狀態
2. 查看建置日誌
3. 測試 API 端點
4. 確認資料庫連接

## 故障排除

### 常見問題
1. **建置失敗**: 檢查 `composer.json` 和 `package.json` 依賴
2. **環境變數**: 確保所有必要的環境變數都已設置
3. **資料庫連接**: 驗證 MongoDB 連接字串格式
4. **檔案權限**: PHP 確保寫入權限設置正確

### 有用的指令
```bash
# 查看 PHP 版本
php -v

# 檢查 Composer 安裝
composer --version

# 清除快取
php artisan cache:clear
php artisan config:clear
```

## 成本
- Railway 提供每月 $5 USD 的免費額度
- 超出後按使用量計費
- 對於小型專案通常免費額度就足夠了