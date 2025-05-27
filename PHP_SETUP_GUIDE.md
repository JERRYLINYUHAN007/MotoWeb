# 📘 MotoWeb PHP 設置指南

## 🚀 快速開始

### 1. 安裝 XAMPP

#### 下載並安裝
1. 前往 [XAMPP 官網](https://www.apachefriends.org/download.html)
2. 下載最新版本（推薦 PHP 8.2.12）
3. 以管理員身份運行安裝程式
4. 安裝到預設路徑：`C:\xampp`

#### 啟動服務
1. 打開「XAMPP Control Panel」
2. 點擊 **Apache** 的「Start」按鈕
3. 點擊 **MySQL** 的「Start」按鈕（如需資料庫功能）
4. 確認狀態為綠色

### 2. 設置專案

#### 複製檔案到 XAMPP
```bash
# 將 MotoWeb 專案複製到 XAMPP 的 htdocs 目錄
cp -r /path/to/MotoWeb/public/* C:\xampp\htdocs\motomod\
```

#### 或者設置虛擬主機
在 `C:\xampp\apache\conf\extra\httpd-vhosts.conf` 中添加：
```apache
<VirtualHost *:80>
    DocumentRoot "C:/Users/USER/OneDrive/桌面/MotoWeb/public"
    ServerName motomod.local
    <Directory "C:/Users/USER/OneDrive/桌面/MotoWeb/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

在 `C:\Windows\System32\drivers\etc\hosts` 中添加：
```
127.0.0.1    motomod.local
```

## 🔧 已創建的 PHP 功能

### 1. 電子報訂閱系統
- **檔案位置**: `public/api/newsletter.php`, `public/subscribe.php`
- **功能**: 處理電子報訂閱請求，防止重複訂閱
- **數據儲存**: `public/api/subscribers.json`

#### 測試方法
```bash
# 使用 curl 測試
curl -X POST http://localhost/motomod/api/newsletter.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. 聯絡表單系統
- **檔案位置**: `public/api/contact.php`
- **功能**: 處理聯絡我們的表單提交
- **數據儲存**: `public/api/contacts.json`

#### 使用方法
```javascript
// 在前端 JavaScript 中使用
fetch('/api/contact.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: '張三',
        email: 'zhang@example.com',
        subject: '產品詢問',
        message: '我想了解更多產品資訊'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

### 3. 管理面板
- **檔案位置**: `public/admin/dashboard.php`
- **登入密碼**: `motomod2024`
- **功能**: 查看訂閱者、聯絡訊息、系統統計

#### 訪問方法
1. 打開瀏覽器
2. 前往 `http://localhost/motomod/admin/dashboard.php`
3. 輸入密碼 `motomod2024`

## 📋 文件結構

```
public/
├── api/
│   ├── newsletter.php      # 電子報 API
│   ├── contact.php         # 聯絡表單 API
│   ├── subscribers.json    # 訂閱者數據
│   ├── contacts.json       # 聯絡訊息數據
│   └── notifications.json  # 系統通知數據
├── admin/
│   └── dashboard.php       # 管理面板
├── subscribe.php           # 電子報訂閱入口
├── test_php.php           # PHP 測試頁面
└── [其他 HTML 文件...]
```

## 🧪 測試 PHP 安裝

### 基本測試
1. 在瀏覽器中訪問：`http://localhost/motomod/test_php.php`
2. 應該看到 PHP 版本資訊和系統詳情

### 功能測試
1. **電子報訂閱**：在任何頁面底部嘗試訂閱電子報
2. **管理面板**：訪問 `/admin/dashboard.php` 查看數據
3. **API測試**：使用瀏覽器開發工具查看 API 響應

## 🔒 安全考慮

### 生產環境設置
1. **更改管理密碼**：修改 `dashboard.php` 中的密碼
2. **文件權限**：確保數據文件有適當的讀寫權限
3. **HTTPS**：在生產環境中啟用 SSL
4. **輸入驗證**：已實現基本的輸入驗證和過濾

### 資料庫升級
如需要更強大的資料庫功能，可以：
1. 啟用 XAMPP 的 MySQL 服務
2. 使用 phpMyAdmin 創建資料庫
3. 修改 PHP 代碼以使用 MySQL 而非 JSON 文件

## 🚀 部署到網路主機

### 準備檔案
```bash
# 打包所有必要檔案
zip -r motomod-php.zip public/ -x "*.log" "*/node_modules/*"
```

### 虛擬主機需求
- PHP 7.4 或更高版本
- 支援文件讀寫權限
- 可選：MySQL 資料庫

### 環境變數
創建 `.env` 檔案：
```
ADMIN_PASSWORD=your_secure_password
ENVIRONMENT=production
```

## 📞 技術支援

如遇到問題：
1. 檢查 XAMPP 控制面板中 Apache 是否正常運行
2. 查看 Apache 錯誤日誌：`C:\xampp\apache\logs\error.log`
3. 確認檔案路徑和權限設置正確
4. 測試 PHP 基本功能：訪問 `test_php.php`

## 🎯 下一步擴展

### 可能的改進
1. **用戶註冊系統**：完整的用戶認證
2. **資料庫整合**：使用 MySQL 替代 JSON 文件
3. **郵件發送**：整合 PHPMailer 發送真實郵件
4. **API 安全**：添加 API 認證和限流
5. **內容管理**：動態管理網站內容

### 插件整合
- **PHPMailer**：發送郵件
- **Twig**：模板引擎
- **Monolog**：日誌記錄
- **Intervention Image**：圖片處理 