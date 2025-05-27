# 🍃 MongoDB PHP擴展安裝指南

## 📋 **當前系統資訊**
- **XAMPP位置**: `C:\xampp\`
- **PHP版本**: 8.2.12 (ZTS Visual C++ 2019 x64)
- **作業系統**: Windows 10

## 🚀 **安裝方法**

### **方法1：下載預編譯DLL（推薦 - 最簡單）**

#### **步驟1：下載MongoDB PHP擴展**

**🎯 針對您的PHP版本，請下載以下檔案：**

**最新版本 (2.1.0) - 推薦**
```
下載連結：https://github.com/mongodb/mongo-php-driver/releases/download/2.1.0/php_mongodb-2.1.0-8.2-ts-vs16-x86_64.zip
檔案名稱：php_mongodb-2.1.0-8.2-ts-vs16-x86_64.zip
大小：約3MB
```

**備用版本 (1.17.x) - 如果最新版有問題**
```
下載連結：https://github.com/mongodb/mongo-php-driver/releases
選擇：php_mongodb-1.17.x-8.2-ts-vs16-x86_64.zip
```

**版本說明**:
- `8.2` = PHP 8.2版本
- `ts` = Thread Safe（XAMPP使用TS版本）
- `vs16` = Visual Studio 2019編譯
- `x86_64` = 64位元

#### **步驟2：安裝擴展**

**1. 解壓縮下載的檔案**
- 右鍵點擊下載的ZIP檔案
- 選擇「解壓縮」

**2. 複製DLL檔案**：
```bash
# 將 php_mongodb.dll 複製到擴展目錄
來源：解壓縮檔案中的 php_mongodb.dll
目標：C:\xampp\php\ext\php_mongodb.dll
```

**3. 編輯PHP配置檔案**：
```bash
# 編輯檔案
檔案位置：C:\xampp\php\php.ini

# 在檔案末尾或擴展區域添加以下行
extension=mongodb

# 注意：不要寫成 extension=php_mongodb.dll
```

**4. 重啟Apache服務**：
- 打開XAMPP Control Panel
- 點擊Apache旁的「Stop」
- 等待服務停止
- 點擊「Start」重新啟動Apache

#### **步驟3：驗證安裝**

**方法1：使用我們的測試頁面**
```
開啟瀏覽器訪問：http://localhost/motomod/test_mongodb.php
```

**方法2：使用命令行檢查**
```bash
# 檢查擴展是否載入
C:\xampp\php\php.exe -m | findstr mongodb

# 如果成功會顯示：mongodb
```

**方法3：檢查詳細資訊**
```bash
# 查看MongoDB擴展詳細資訊
C:\xampp\php\php.exe -i | findstr mongodb
```

### **方法2：使用Composer（備用方案）**

如果方法1失敗，可以嘗試使用Composer安裝MongoDB PHP庫：

```bash
# 進入專案目錄
cd C:\xampp\htdocs\motomod

# 安裝MongoDB PHP庫
C:\xampp\php\php.exe C:\xampp\composer.phar require mongodb/mongodb
```

**注意**：此方法安裝的是PHP庫，不是C擴展，效能會較差。

## 📁 **檔案位置參考**

```
C:\xampp\
├── php\
│   ├── php.ini                 # PHP配置檔案（重要！）
│   ├── ext\                    # 擴展目錄
│   │   ├── php_mongodb.dll     # 要複製到這裡
│   │   ├── php_mysql.dll       # 其他擴展
│   │   └── ...
│   └── php.exe                 # PHP執行檔
├── apache\
│   └── conf\
│       └── httpd.conf          # Apache配置
└── htdocs\
    └── motomod\                # 您的專案
```

## 🧪 **測試MongoDB連接**

安裝完成後，您可以使用我們準備的測試檔案：

**1. 開啟測試頁面**
```
http://localhost/motomod/test_mongodb.php
```

**2. 檢查系統狀態**
```
http://localhost/motomod/admin/test_results.php
密碼：motomod2024
```

**3. 手動測試程式碼**
```php
<?php
// 檢查擴展
if (extension_loaded('mongodb')) {
    echo "✅ MongoDB擴展已載入\n";
    
    try {
        $client = new MongoDB\Client('mongodb://127.0.0.1:27017');
        $db = $client->selectDatabase('motomod');
        echo "✅ MongoDB連接成功\n";
    } catch (Exception $e) {
        echo "❌ 連接失敗：" . $e->getMessage() . "\n";
    }
} else {
    echo "❌ MongoDB擴展未載入\n";
}
?>
```

## 🔍 **常見問題解決**

### **問題1：DLL載入失敗**
**錯誤訊息**：`PHP Warning: PHP Startup: Unable to load dynamic library 'mongodb'`

**解決方案**：
1. **檢查DLL位置**：確認`php_mongodb.dll`在`C:\xampp\php\ext\`目錄
2. **檢查配置**：確認`php.ini`中有`extension=mongodb`
3. **版本匹配**：確認下載的是PHP 8.2的Thread Safe版本
4. **重啟服務**：重啟Apache和MySQL服務

### **問題2：找不到類別**
**錯誤訊息**：`Class 'MongoDB\Client' not found`

**解決方案**：
1. **確認擴展載入**：`php -m | findstr mongodb`
2. **檢查名稱空間**：使用`MongoDB\Client`而不是`MongoClient`
3. **安裝Composer庫**：`composer require mongodb/mongodb`

### **問題3：連接MongoDB失敗**
**錯誤訊息**：`Connection timeout`

**解決方案**：
```bash
# 檢查MongoDB服務狀態
net start | findstr -i mongo

# 啟動MongoDB服務（如果已安裝）
net start MongoDB

# 或者使用Docker運行MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### **問題4：權限問題**
**錯誤訊息**：`Access denied`

**解決方案**：
1. **以管理員身份運行**：命令提示字元以管理員身份開啟
2. **檢查檔案權限**：確保XAMPP有讀取DLL的權限
3. **防毒軟體**：暫時關閉防毒軟體進行測試

## 📊 **驗證系統完整性**

安裝完成後，請訪問以下頁面驗證：

1. **MongoDB測試頁面**：
   ```
   http://localhost/motomod/test_mongodb.php
   ```

2. **系統測試報告**：
   ```
   http://localhost/motomod/admin/test_results.php
   密碼：motomod2024
   ```

3. **PHP資訊頁面**：
   ```php
   // 創建 phpinfo.php
   <?php phpinfo(); ?>
   // 搜尋 "mongodb" 確認擴展已載入
   ```

## 🎯 **預期結果**

安裝成功後，您的系統將實現：

- ✅ **MongoDB**: 完全支援原有核心功能
- ✅ **MySQL**: 繼續支援新的PHP功能  
- ✅ **混合架構**: 發揮兩種資料庫的優勢
- ✅ **備用方案**: JSON檔案作為後備儲存

## 💡 **安裝後的優化建議**

1. **效能監控**：啟用MongoDB慢查詢記錄
2. **連接池**：配置適當的連接池大小
3. **索引優化**：為常用查詢建立索引
4. **備份策略**：定期備份MongoDB資料

## 🆘 **取得協助**

如果安裝過程中遇到問題：

1. **檢查錯誤日誌**：
   - Apache：`C:\xampp\apache\logs\error.log`
   - PHP：`C:\xampp\php\logs\php_error.log`

2. **使用我們的診斷工具**：
   - 系統測試報告會提供詳細的診斷資訊

3. **常用診斷命令**：
   ```bash
   # 檢查PHP版本和載入模組
   C:\xampp\php\php.exe -v
   C:\xampp\php\php.exe -m
   
   # 檢查配置
   C:\xampp\php\php.exe -i | findstr extension_dir
   C:\xampp\php\php.exe -i | findstr mongodb
   ```

完成安裝後，您的MotoMod平台將具備完整的MongoDB+MySQL混合資料庫支援！🏆 