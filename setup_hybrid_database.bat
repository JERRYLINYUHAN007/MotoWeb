@echo off
echo.
echo ===========================================
echo  🚀 MotoWeb 混合資料庫環境設置
echo ===========================================
echo.

echo 📋 正在檢查系統狀態...
echo.

REM 檢查XAMPP是否在運行
echo 🔍 檢查 Apache (端口 80)...
netstat -an | findstr ":80 " >nul
if %errorlevel%==0 (
    echo ✅ Apache 正在運行
) else (
    echo ❌ Apache 未運行 - 請啟動 XAMPP Control Panel
)

echo.
echo 🔍 檢查 MySQL (端口 3306)...
netstat -an | findstr ":3306 " >nul
if %errorlevel%==0 (
    echo ✅ MySQL 正在運行
) else (
    echo ❌ MySQL 未運行 - 請啟動 XAMPP Control Panel
)

echo.
echo 🔍 檢查 MongoDB (端口 27017)...
netstat -an | findstr ":27017 " >nul
if %errorlevel%==0 (
    echo ✅ MongoDB 正在運行
) else (
    echo ❌ MongoDB 未運行 - 請檢查 MongoDB 服務
)

echo.
echo 📁 檢查專案檔案結構...

if exist "public\config\database.php" (
    echo ✅ 資料庫配置檔案存在
) else (
    echo ❌ 資料庫配置檔案不存在
)

if exist "public\api\newsletter_v2.php" (
    echo ✅ 升級版API檔案存在
) else (
    echo ❌ 升級版API檔案不存在
)

if exist "public\admin\system_status.php" (
    echo ✅ 系統狀態頁面存在
) else (
    echo ❌ 系統狀態頁面不存在
)

echo.
echo 🌐 準備複製檔案到XAMPP目錄...

REM 檢查XAMPP安裝目錄
set XAMPP_DIR=C:\xampp\htdocs\motomod

if not exist "C:\xampp\" (
    echo ❌ 找不到XAMPP安裝目錄 C:\xampp\
    echo 💡 請確認XAMPP已正確安裝
    goto :end
)

echo ✅ 找到XAMPP目錄

REM 創建目標目錄
if not exist "%XAMPP_DIR%" (
    echo 📁 創建目錄 %XAMPP_DIR%
    mkdir "%XAMPP_DIR%"
)

echo.
echo 📋 複製檔案到XAMPP...

REM 複製整個public目錄
echo 📂 複製 public 目錄...
xcopy /E /Y "public\*" "%XAMPP_DIR%\" >nul

if %errorlevel%==0 (
    echo ✅ 檔案複製完成
) else (
    echo ❌ 檔案複製失敗
    goto :end
)

echo.
echo 🧪 測試設置...

REM 測試PHP基本功能
echo 🔧 測試PHP配置...
php -v >nul 2>&1
if %errorlevel%==0 (
    echo ✅ PHP 可用
) else (
    echo ❌ PHP 不可用或未加入PATH
)

echo.
echo ===========================================
echo  🎉 設置完成！
echo ===========================================
echo.
echo 📋 訪問以下網址測試系統：
echo.
echo 🏠 主頁面:
echo    http://localhost/motomod/
echo.
echo 🔧 系統狀態:
echo    http://localhost/motomod/admin/system_status.php
echo    密碼: motomod2024
echo.
echo 📊 管理面板:
echo    http://localhost/motomod/admin/dashboard.php
echo    密碼: motomod2024
echo.
echo 🧪 PHP測試:
echo    http://localhost/motomod/test_php.php
echo.
echo 💡 如果遇到問題：
echo    1. 確認XAMPP Control Panel中Apache和MySQL都已啟動
echo    2. 檢查防火牆設置
echo    3. 查看Apache錯誤日誌: C:\xampp\apache\logs\error.log
echo.

:end
echo.
echo 按任意鍵結束...
pause >nul 