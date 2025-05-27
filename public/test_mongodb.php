<?php
// MongoDB連接測試檔案
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MongoDB連接測試</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { padding: 15px; margin: 10px 0; border-radius: 5px; font-weight: bold; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        h1 { color: #dc143c; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .step { margin: 20px 0; }
        .step h3 { color: #333; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍃 MongoDB PHP擴展測試</h1>
        
        <div class="step">
            <h3>1. PHP環境檢查</h3>
            <div class="info">
                PHP版本：<?php echo phpversion(); ?><br>
                作業系統：<?php echo php_uname(); ?>
            </div>
        </div>
        
        <div class="step">
            <h3>2. MongoDB擴展檢查</h3>
            <?php
            $mongoExtensionLoaded = extension_loaded('mongodb');
            if ($mongoExtensionLoaded):
            ?>
                <div class="success">
                    ✅ MongoDB擴展已載入！
                </div>
                
                <?php
                // 顯示擴展詳細資訊
                $reflection = new ReflectionExtension('mongodb');
                ?>
                <div class="info">
                    <strong>擴展版本：</strong><?php echo $reflection->getVersion(); ?><br>
                    <strong>擴展狀態：</strong>已載入並可用
                </div>
                
            <?php else: ?>
                <div class="error">
                    ❌ MongoDB擴展未載入
                </div>
                
                <div class="warning">
                    <strong>需要安裝MongoDB PHP擴展</strong><br>
                    請按照安裝指南進行安裝。
                </div>
            <?php endif; ?>
        </div>
        
        <div class="step">
            <h3>3. MongoDB類別檢查</h3>
            <?php
            $classes = [
                'MongoDB\Client',
                'MongoDB\Driver\Manager',
                'MongoDB\BSON\Document'
            ];
            
            foreach ($classes as $class) {
                echo "<div class='info'>";
                if (class_exists($class)) {
                    echo "✅ {$class} - 可用";
                } else {
                    echo "❌ {$class} - 不可用";
                }
                echo "</div>";
            }
            ?>
        </div>
        
        <?php if ($mongoExtensionLoaded): ?>
        <div class="step">
            <h3>4. MongoDB連接測試</h3>
            <?php
            try {
                // 嘗試連接MongoDB
                $client = new MongoDB\Client('mongodb://127.0.0.1:27017');
                $admin = $client->selectDatabase('admin');
                
                // 測試連接
                $result = $admin->command(['ping' => 1]);
                
                echo '<div class="success">✅ MongoDB連接成功！</div>';
                
                // 顯示伺服器資訊
                try {
                    $buildInfo = $admin->command(['buildInfo' => 1]);
                    echo '<div class="info">';
                    echo '<strong>MongoDB版本：</strong>' . $buildInfo['version'] . '<br>';
                    echo '<strong>平台：</strong>' . $buildInfo['platform'] . '<br>';
                    echo '<strong>儲存引擎：</strong>' . (isset($buildInfo['storageEngines']) ? implode(', ', $buildInfo['storageEngines']) : '未知');
                    echo '</div>';
                } catch (Exception $e) {
                    echo '<div class="warning">無法獲取伺服器詳細資訊</div>';
                }
                
                // 測試motomod資料庫
                echo '<h4>5. MotoMod資料庫測試</h4>';
                $motoDB = $client->selectDatabase('motomod');
                $collections = $motoDB->listCollectionNames();
                
                echo '<div class="info">';
                echo '<strong>motomod資料庫集合：</strong><br>';
                if (empty($collections)) {
                    echo '資料庫為空（這是正常的，如果是第一次運行）';
                } else {
                    foreach ($collections as $collection) {
                        echo '- ' . $collection . '<br>';
                    }
                }
                echo '</div>';
                
            } catch (MongoDB\Driver\Exception\ConnectionTimeoutException $e) {
                echo '<div class="error">❌ MongoDB連接逾時</div>';
                echo '<div class="warning">請確認MongoDB服務是否正在運行</div>';
                echo '<pre>錯誤：' . $e->getMessage() . '</pre>';
            } catch (MongoDB\Driver\Exception\ServerException $e) {
                echo '<div class="error">❌ MongoDB伺服器錯誤</div>';
                echo '<pre>錯誤：' . $e->getMessage() . '</pre>';
            } catch (Exception $e) {
                echo '<div class="error">❌ 連接失敗</div>';
                echo '<pre>錯誤：' . $e->getMessage() . '</pre>';
            }
            ?>
        </div>
        <?php endif; ?>
        
        <div class="step">
            <h3>📝 安裝指南</h3>
            <div class="info">
                <strong>針對您的系統 (PHP 8.2.12 Windows)：</strong><br><br>
                
                <strong>1. 下載適當的DLL檔案：</strong><br>
                <a href="https://github.com/mongodb/mongo-php-driver/releases/download/2.1.0/php_mongodb-2.1.0-8.2-ts-vs16-x86_64.zip" target="_blank">
                    📥 php_mongodb-2.1.0-8.2-ts-vs16-x86_64.zip
                </a><br><br>
                
                <strong>2. 安裝步驟：</strong><br>
                • 解壓縮下載的檔案<br>
                • 複製 php_mongodb.dll 到：<code>C:\xampp\php\ext\</code><br>
                • 編輯 <code>C:\xampp\php\php.ini</code><br>
                • 在檔案末尾添加：<code>extension=mongodb</code><br>
                • 重啟Apache服務<br><br>
                
                <strong>3. 驗證安裝：</strong><br>
                • 重新載入此頁面<br>
                • 檢查是否顯示"MongoDB擴展已載入"<br>
            </div>
        </div>
        
        <div class="step">
            <h3>🔧 已載入的PHP擴展</h3>
            <div class="info">
                <details>
                    <summary>點擊查看所有已載入的擴展</summary>
                    <pre><?php print_r(get_loaded_extensions()); ?></pre>
                </details>
            </div>
        </div>
    </div>
</body>
</html> 