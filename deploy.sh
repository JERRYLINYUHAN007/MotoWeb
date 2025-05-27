#!/bin/bash

# MotoWeb 自動部署腳本

echo "🚀 開始部署 MotoWeb..."

# 檢查Node.js版本
echo "📋 檢查Node.js版本..."
node_version=$(node -v)
echo "Node.js版本: $node_version"

# 安裝依賴
echo "📦 安裝依賴套件..."
npm install

# 檢查環境變數
echo "🔧 檢查環境變數..."
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  警告: MONGODB_URI 環境變數未設定"
    echo "請設定您的MongoDB連接字串"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  警告: JWT_SECRET 環境變數未設定"
    echo "建議生成一個安全的JWT密鑰"
fi

# 創建必要目錄
echo "📁 創建上傳目錄..."
mkdir -p public/uploads/{gallery,profile,garage,events,showcase,parts}

# 檢查數據庫連接（可選）
echo "🗄️  檢查數據庫連接..."
if [ "$1" = "--init-db" ]; then
    echo "正在初始化數據庫..."
    node initDB.js
fi

# 啟動應用程式
echo "🎯 啟動應用程式..."
if [ "$NODE_ENV" = "production" ]; then
    npm start
else
    npm run dev
fi 