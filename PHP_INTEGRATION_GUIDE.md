<!-- Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY -->
# MotoWeb PHP 整合指南

## 🎯 整合概述

本指南詳細說明如何將 PHP 後端整合到現有的 MotoWeb 系統中，實現 Node.js 和 PHP 的混合架構。

## 🏗️ 架構設計

### 混合微服務架構
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Nginx Proxy   │
│   (HTML/CSS/JS) │────│   (Port 80)     │
└─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │                   │
         ┌─────────────────┐  ┌─────────────────┐
         │   Node.js       │  │   PHP Backend   │
         │   (Port 3001)   │  │   (Port 8080)   │
         │                 │  │                 │
         │ • 用戶認證      │  │ • 檔案處理     │
         │ • 實時功能      │  │ • 內容管理     │
         │ • WebSocket     │  │ • 報表系統     │
         │ • 靜態檔案      │  │ • 圖片處理     │
         └─────────────────┘  └─────────────────┘
                    │                   │
         ┌─────────────────┐  ┌─────────────────┐
         │   MongoDB       │  │   MySQL         │
         │   (主要資料)    │  │   (分析資料)    │
         └─────────────────┘  └─────────────────┘
```

## 🚀 快速開始

### 1. 環境需求

**PHP 環境:**
- PHP 8.1+ 
- 必要擴展：PDO, PDO_MySQL, MongoDB, GD, JSON, MBString
- Composer (可選，用於依賴管理)

**資料庫:**
- MongoDB (主要資料存儲)
- MySQL 8.0+ (分析和報表資料)

**Web 伺服器:**
- Nginx (生產環境推薦)
- Apache (替代方案)

### 2. 啟動 PHP 後端

**Windows:**
```bash
cd php-backend
start-php.bat
```

**Linux/macOS:**
```bash
cd php-backend
chmod +x start-php.sh
./start-php.sh
```

**手動啟動:**
```bash
cd php-backend
php -S localhost:8080 index.php
```

### 3. 驗證安裝

訪問以下 URL 確認服務正常：
- 狀態檢查: http://localhost:8080/api/php/status
- 健康檢查: http://localhost:8080/api/php/health

## 📡 API 路由分配

### Node.js 負責的 API (現有)
```
/api/auth/*          - 用戶認證
/api/users/*         - 用戶管理
/api/realtime/*      - 實時通訊
/socket.io/*         - WebSocket 連接
```

### PHP 負責的 API (新增)
```
/api/php/files/*     - 檔案處理
/api/php/content/*   - 內容管理
/api/php/reports/*   - 報表系統
/api/php/health      - 健康檢查
```

## 🗄️ 資料庫設計

### MongoDB 集合 (現有 + 新增)
```javascript
// 現有集合
users                // 用戶資料
sessions            // 會話資料

// PHP 新增集合
posts               // 文章內容
categories          // 文章分類
```

### MySQL 表 (PHP 專用)
```sql
-- 用戶活動記錄
user_activities (
    id, user_id, action, resource_type, 
    resource_id, metadata, ip_address, 
    user_agent, created_at
)

-- 頁面瀏覽統計
page_views (
    id, user_id, page_url, referrer, 
    session_id, duration, created_at
)

-- 檔案上傳記錄
file_uploads (
    id, file_id, original_name, stored_name,
    file_type, file_size, upload_path, user_id,
    status, metadata, created_at, updated_at
)
```

## 🔧 功能分工

### Node.js 功能
✅ **保持現有功能**
- 用戶註冊/登入/認證
- 即時通訊和 WebSocket
- 基本 API 服務
- 靜態檔案服務

### PHP 新增功能
🆕 **檔案處理服務**
- 檔案上傳 (`POST /api/php/files/upload`)
- 圖片縮放 (`POST /api/php/files/resize`) 
- 檔案下載 (`GET /api/php/files/download/{id}`)
- 檔案刪除 (`DELETE /api/php/files/delete/{id}`)

🆕 **內容管理系統**
- 文章 CRUD (`/api/php/content/posts`)
- 分類管理 (`/api/php/content/categories`)

🆕 **報表分析系統**
- 用戶報表 (`GET /api/php/reports/users`)
- 活動報表 (`GET /api/php/reports/activities`)
- 分析報表 (`GET /api/php/reports/analytics`)
- 報表導出 (`POST /api/php/reports/export`)

## 🔒 安全機制

### 認證整合
PHP 後端使用與 Node.js 相同的 JWT Token 進行認證：

```php
// 在 PHP 中驗證 Node.js 發放的 Token
$user = Router::validateToken();
if (!$user) {
    $this->jsonError('Unauthorized', 401);
}
```

### CORS 設定
```php
header('Access-Control-Allow-Origin: http://localhost:3001');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

## 🌐 Nginx 代理配置

```nginx
# API 路由分發
location /api/php/ {
    proxy_pass http://localhost:8080;
    # ... 其他設定
}

location /api/ {
    proxy_pass http://localhost:3001;
    # ... 其他設定
}
```

## 📊 效能考量

### 快取策略
- **靜態檔案**: Nginx 直接服務
- **API 響應**: Redis 快取 (未來實施)
- **資料庫查詢**: MongoDB 索引 + MySQL 查詢優化

### 負載均衡
```nginx
upstream php_cluster {
    server 127.0.0.1:8080 weight=2;
    server 127.0.0.1:8081 weight=1;
}
```

## 🚦 部署流程

### 開發環境
1. 啟動 MongoDB 和 MySQL
2. 啟動 Node.js 服務: `npm start`
3. 啟動 PHP 服務: `./start-php.sh`
4. 訪問 http://localhost:3001

### 生產環境
1. 配置 Nginx 代理
2. 設定 SSL 證書
3. 配置資料庫連接
4. 啟動所有服務
5. 設定監控和日誌

## 🧪 測試

### API 測試
```bash
# 測試 PHP 狀態
curl http://localhost:8080/api/php/status

# 測試檔案上傳
curl -X POST -F "file=@test.jpg" http://localhost:8080/api/php/files/upload

# 測試內容 API
curl http://localhost:8080/api/php/content/posts
```

### 整合測試
確保前端可以無縫調用兩個後端的 API：
```javascript
// 調用 Node.js API
fetch('/api/users/profile')

// 調用 PHP API  
fetch('/api/php/files/upload', {
    method: 'POST',
    body: formData
})
```

## 🔍 監控和日誌

### 日誌位置
- **PHP 錯誤日誌**: `php-backend/logs/`
- **Nginx 日誌**: `/var/log/nginx/`
- **Node.js 日誌**: 控制台輸出

### 監控指標
- API 響應時間
- 錯誤率
- 記憶體使用量
- 資料庫連接數

## 🛠️ 疑難排解

### 常見問題

**Q: PHP 服務無法啟動**
```bash
# 檢查 PHP 版本和擴展
php -v
php -m
```

**Q: 跨域請求失敗**
```bash
# 檢查 CORS 設定
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:8080/api/php/status
```

**Q: 資料庫連接失敗**
```bash
# 測試 MongoDB 連接
mongosh
use motoweb
db.users.findOne()

# 測試 MySQL 連接  
mysql -u root -p
```

## 📚 進階配置

### 環境變數
創建 `.env` 檔案：
```env
# 資料庫設定
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=motoweb

MYSQL_HOST=localhost  
MYSQL_PORT=3306
MYSQL_DATABASE=motoweb_analytics
MYSQL_USERNAME=root
MYSQL_PASSWORD=

# 伺服器設定
PHP_HOST=localhost
PHP_PORT=8080
```

### Docker 部署
```dockerfile
# PHP 服務容器
FROM php:8.1-fpm
RUN docker-php-ext-install pdo pdo_mysql
# ... 其他配置
```

## 🎉 完成！

恭喜！您已成功將 PHP 整合到 MotoWeb 系統中。現在您可以：

✅ 使用 PHP 處理檔案上傳和圖片處理  
✅ 利用 PHP 強大的報表生成能力  
✅ 保持 Node.js 的實時通訊優勢  
✅ 享受兩種技術的最佳組合  

如有任何問題，請查看疑難排解章節或聯繫開發團隊。 