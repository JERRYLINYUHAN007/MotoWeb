<?php
// PHP 測試檔案
echo "<h1>🎉 PHP 運行成功！</h1>";
echo "<h2>PHP 版本資訊：</h2>";
echo "PHP Version: " . phpversion() . "<br>";
echo "Server: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "Current Time: " . date('Y-m-d H:i:s') . "<br>";

// 顯示 PHP 配置資訊（可選）
// phpinfo();
?>

<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP 測試頁面</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 { color: #4CAF50; }
        h2 { color: #2196F3; }
        .info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="info">
        <h2>📊 系統資訊</h2>
        <p><strong>作業系統：</strong><?php echo php_uname('s') . ' ' . php_uname('r'); ?></p>
        <p><strong>PHP SAPI：</strong><?php echo php_sapi_name(); ?></p>
        <p><strong>最大執行時間：</strong><?php echo ini_get('max_execution_time'); ?> 秒</p>
        <p><strong>記憶體限制：</strong><?php echo ini_get('memory_limit'); ?></p>
        
        <h2>🔧 已載入的 PHP 擴充模組</h2>
        <?php
        $extensions = get_loaded_extensions();
        sort($extensions);
        echo "<ul>";
        foreach($extensions as $ext) {
            echo "<li>$ext</li>";
        }
        echo "</ul>";
        ?>
    </div>
</body>
</html> 