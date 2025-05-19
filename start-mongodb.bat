@echo off
echo ===== 正在啟動 MotoWeb 系統 =====

echo 1. 安裝依賴套件...
npm install

echo 2. 初始化資料庫...
node initDB.js

echo 3. 啟動應用程式(開發模式)...
npm run dev

REM Docker 方式啟動(可選)
REM docker-compose up -d
REM docker-compose exec app node initDB.js 