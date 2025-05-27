@echo off
chcp 65001 >nul
echo =====================================
echo 🍃 MongoDB PHP擴展安裝助手
echo =====================================
echo.

:: 檢查XAMPP是否存在
if not exist "C:\xampp\php\php.exe" (
    echo ❌ 找不到XAMPP PHP！
    echo 請確認XAMPP已安裝在 C:\xampp\ 目錄
    pause
    exit /b 1
)

:: 顯示當前PHP版本
echo 🔍 檢查PHP版本...
C:\xampp\php\php.exe -v | findstr "PHP"
echo.

:: 檢查MongoDB擴展狀態
echo 🔍 檢查MongoDB擴展狀態...
C:\xampp\php\php.exe -m | findstr mongodb >nul
if %errorlevel% == 0 (
    echo ✅ MongoDB擴展已安裝！
    echo.
    echo 🧪 測試連接...
    C:\xampp\php\php.exe -r "try { $c = new MongoDB\Client(); echo '✅ MongoDB類別可用'; } catch(Exception $e) { echo '❌ 無法載入MongoDB類別'; }"
    echo.
    echo 📊 開啟系統測試報告查看詳細狀態：
    echo http://localhost/motomod/test_mongodb.php
) else (
    echo ❌ MongoDB擴展未安裝
    echo.
    echo 📥 請按照以下步驟安裝：
    echo.
    echo 1. 下載DLL檔案：
    echo    https://github.com/mongodb/mongo-php-driver/releases/download/2.1.0/php_mongodb-2.1.0-8.2-ts-vs16-x86_64.zip
    echo.
    echo 2. 解壓縮並複製 php_mongodb.dll 到：
    echo    C:\xampp\php\ext\
    echo.
    echo 3. 編輯 C:\xampp\php\php.ini 並添加：
    echo    extension=mongodb
    echo.
    echo 4. 重啟Apache服務
    echo.
    echo 5. 重新運行此腳本進行驗證
)

echo.
echo 📋 系統資訊：
echo    PHP版本： 
C:\xampp\php\php.exe -r "echo phpversion();"
echo.
echo    擴展目錄：
C:\xampp\php\php.exe -r "echo ini_get('extension_dir');"
echo.
echo    已載入的擴展數量：
C:\xampp\php\php.exe -r "echo count(get_loaded_extensions());"
echo.

:: 檢查必要的檔案
echo 🔍 檢查必要檔案...
if exist "C:\xampp\php\ext\php_mongodb.dll" (
    echo ✅ php_mongodb.dll 存在
) else (
    echo ❌ php_mongodb.dll 不存在於 C:\xampp\php\ext\
)

if exist "C:\xampp\php\php.ini" (
    echo ✅ php.ini 檔案存在
    findstr /C:"extension=mongodb" "C:\xampp\php\php.ini" >nul
    if %errorlevel% == 0 (
        echo ✅ php.ini 包含 MongoDB 配置
    ) else (
        echo ❌ php.ini 缺少 MongoDB 配置
    )
) else (
    echo ❌ php.ini 檔案不存在
)

echo.
echo 🚀 快速操作：
echo [1] 開啟 PHP 擴展目錄
echo [2] 開啟 php.ini 檔案編輯
echo [3] 開啟 MongoDB 測試頁面
echo [4] 開啟系統測試報告
echo [5] 下載 MongoDB 擴展
echo [Q] 退出
echo.

set /p choice="請選擇操作 [1-5/Q]: "

if /i "%choice%"=="1" (
    start explorer "C:\xampp\php\ext"
    goto menu
)
if /i "%choice%"=="2" (
    start notepad "C:\xampp\php\php.ini"
    goto menu
)
if /i "%choice%"=="3" (
    start http://localhost/motomod/test_mongodb.php
    goto menu
)
if /i "%choice%"=="4" (
    start http://localhost/motomod/admin/test_results.php
    goto menu
)
if /i "%choice%"=="5" (
    start https://github.com/mongodb/mongo-php-driver/releases/download/2.1.0/php_mongodb-2.1.0-8.2-ts-vs16-x86_64.zip
    goto menu
)
if /i "%choice%"=="Q" (
    exit /b 0
)

:menu
echo.
echo 按任意鍵返回選單...
pause >nul
goto :eof

echo.
echo 📖 詳細安裝指南請參考：
echo    INSTALL_MONGODB_PHP.md
echo.
pause 