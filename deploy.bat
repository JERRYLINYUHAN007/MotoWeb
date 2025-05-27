@echo off
echo 🚀 開始部署 MotoWeb...

REM 檢查Node.js版本
echo 📋 檢查Node.js版本...
node -v

REM 安裝依賴
echo 📦 安裝依賴套件...
npm install

REM 檢查環境變數
echo 🔧 檢查環境變數...
if "%MONGODB_URI%"=="" (
    echo ⚠️  警告: MONGODB_URI 環境變數未設定
    echo 請設定您的MongoDB連接字串
)

if "%JWT_SECRET%"=="" (
    echo ⚠️  警告: JWT_SECRET 環境變數未設定
    echo 建議生成一個安全的JWT密鑰
)

REM 創建必要目錄
echo 📁 創建上傳目錄...
if not exist "public\uploads\gallery" mkdir "public\uploads\gallery"
if not exist "public\uploads\profile" mkdir "public\uploads\profile"
if not exist "public\uploads\garage" mkdir "public\uploads\garage"
if not exist "public\uploads\events" mkdir "public\uploads\events"
if not exist "public\uploads\showcase" mkdir "public\uploads\showcase"
if not exist "public\uploads\parts" mkdir "public\uploads\parts"

REM 檢查是否需要初始化數據庫
if "%1"=="--init-db" (
    echo 🗄️  正在初始化數據庫...
    node initDB.js
)

REM 啟動應用程式
echo 🎯 啟動應用程式...
if "%NODE_ENV%"=="production" (
    npm start
) else (
    npm run dev
) 