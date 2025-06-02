#!/bin/bash

# MotoWeb PHP Backend 啟動腳本

echo "🚀 啟動 MotoWeb PHP Backend..."

# 檢查 PHP 版本
PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)
echo "📋 PHP 版本: $PHP_VERSION"

if [[ $(echo "$PHP_VERSION < 8.1" | bc) -eq 1 ]]; then
    echo "❌ 警告: 建議使用 PHP 8.1 或更高版本"
fi

# 檢查必要的 PHP 擴展
echo "🔍 檢查 PHP 擴展..."
REQUIRED_EXTENSIONS=("pdo" "pdo_mysql" "mongodb" "gd" "json" "mbstring")

for ext in "${REQUIRED_EXTENSIONS[@]}"
do
    if php -m | grep -i "^$ext$" > /dev/null; then
        echo "✅ $ext 已安裝"
    else
        echo "❌ $ext 未安裝 - 請安裝此擴展"
        MISSING_EXTENSIONS=true
    fi
done

if [ "$MISSING_EXTENSIONS" = true ]; then
    echo "⚠️  缺少必要的 PHP 擴展，某些功能可能無法正常工作"
fi

# 檢查 Composer
if command -v composer &> /dev/null; then
    echo "✅ Composer 已安裝"
    
    # 檢查是否有 composer.json
    if [ -f "composer.json" ]; then
        echo "📦 安裝 PHP 依賴..."
        composer install --no-dev --optimize-autoloader
    fi
else
    echo "⚠️  Composer 未安裝，跳過依賴安裝"
fi

# 創建必要的目錄
echo "📁 創建必要目錄..."
mkdir -p uploads/resized
mkdir -p exports
mkdir -p logs

# 設定目錄權限
chmod 755 uploads exports logs
chmod 755 uploads/resized

echo "🗄️  檢查資料庫連接..."

# 檢查 MongoDB 連接 (可選)
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    echo "✅ MongoDB 客戶端已安裝"
else
    echo "⚠️  MongoDB 客戶端未安裝，請確保 MongoDB 服務正在運行"
fi

# 檢查 MySQL 連接 (可選)
if command -v mysql &> /dev/null; then
    echo "✅ MySQL 客戶端已安裝"
else
    echo "⚠️  MySQL 客戶端未安裝"
fi

# 設定環境變數 (如果 .env 檔案存在)
if [ -f ".env" ]; then
    echo "🔧 載入環境變數..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# 啟動 PHP 內建伺服器
PORT=${PHP_PORT:-8080}
HOST=${PHP_HOST:-localhost}

echo "🌐 啟動 PHP 開發伺服器..."
echo "📍 URL: http://$HOST:$PORT"
echo "📂 文檔根目錄: $(pwd)"
echo "⏰ 啟動時間: $(date)"
echo ""
echo "🔗 API 端點:"
echo "   - 狀態檢查: http://$HOST:$PORT/api/php/status"
echo "   - 健康檢查: http://$HOST:$PORT/api/php/health"
echo "   - 檔案上傳: http://$HOST:$PORT/api/php/files/upload"
echo "   - 內容管理: http://$HOST:$PORT/api/php/content/posts"
echo "   - 報表系統: http://$HOST:$PORT/api/php/reports/analytics"
echo ""
echo "💡 提示:"
echo "   - 按 Ctrl+C 停止伺服器"
echo "   - 檢查 logs/ 目錄查看錯誤日誌"
echo "   - 使用 ?init_mysql=true 初始化 MySQL 表"
echo ""

# 啟動伺服器
php -S $HOST:$PORT -t . index.php

echo "�� PHP Backend 已停止" 