@echo off
chcp 65001 >nul
title MotoWeb PHP Backend

echo 🚀 啟動 MotoWeb PHP Backend...
echo.

REM 檢查 PHP 是否已安裝
php -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤: PHP 未安裝或未在 PATH 中
    echo 請安裝 PHP 8.1+ 並確保在系統 PATH 中
    pause
    exit /b 1
)

REM 顯示 PHP 版本
echo 📋 PHP 版本:
php -v | findstr "PHP"

echo.
echo 🔍 檢查 PHP 擴展...

REM 檢查必要的 PHP 擴展
php -m | findstr /i "pdo" >nul && echo ✅ PDO 已安裝 || echo ❌ PDO 未安裝
php -m | findstr /i "pdo_mysql" >nul && echo ✅ PDO MySQL 已安裝 || echo ❌ PDO MySQL 未安裝
php -m | findstr /i "mongodb" >nul && echo ✅ MongoDB 已安裝 || echo ⚠️  MongoDB 未安裝
php -m | findstr /i "gd" >nul && echo ✅ GD 已安裝 || echo ❌ GD 未安裝
php -m | findstr /i "json" >nul && echo ✅ JSON 已安裝 || echo ❌ JSON 未安裝
php -m | findstr /i "mbstring" >nul && echo ✅ MBString 已安裝 || echo ❌ MBString 未安裝

echo.
echo 📁 創建必要目錄...

REM 創建必要的目錄
if not exist "uploads" mkdir uploads
if not exist "uploads\resized" mkdir uploads\resized
if not exist "exports" mkdir exports
if not exist "logs" mkdir logs

echo ✅ 目錄創建完成

echo.
echo 🗄️  檢查資料庫連接...

REM 檢查 MongoDB 連接
mongosh --version >nul 2>&1 && echo ✅ MongoDB Shell 已安裝 || echo ⚠️  MongoDB Shell 未安裝

REM 檢查 MySQL 連接
mysql --version >nul 2>&1 && echo ✅ MySQL 客戶端已安裝 || echo ⚠️  MySQL 客戶端未安裝

echo.
echo 🌐 啟動 PHP 開發伺服器...

REM 設定伺服器參數
set PHP_HOST=localhost
set PHP_PORT=8080

echo 📍 URL: http://%PHP_HOST%:%PHP_PORT%
echo 📂 文檔根目錄: %CD%
echo ⏰ 啟動時間: %date% %time%
echo.
echo 🔗 API 端點:
echo    - 狀態檢查: http://%PHP_HOST%:%PHP_PORT%/api/php/status
echo    - 健康檢查: http://%PHP_HOST%:%PHP_PORT%/api/php/health
echo    - 檔案上傳: http://%PHP_HOST%:%PHP_PORT%/api/php/files/upload
echo    - 內容管理: http://%PHP_HOST%:%PHP_PORT%/api/php/content/posts
echo    - 報表系統: http://%PHP_HOST%:%PHP_PORT%/api/php/reports/analytics
echo.
echo 💡 提示:
echo    - 按 Ctrl+C 停止伺服器
echo    - 檢查 logs\ 目錄查看錯誤日誌
echo    - 使用 ?init_mysql=true 初始化 MySQL 表
echo.

REM 啟動 PHP 內建伺服器
php -S %PHP_HOST%:%PHP_PORT% -t . index.php

echo.
echo 🛑 PHP Backend 已停止
pause 