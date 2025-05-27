<?php
require_once '../config/database.php';
session_start();

// 簡單認證
$admin_password = 'motomod2024';
if (isset($_POST['login'])) {
    if ($_POST['password'] === $admin_password) {
        $_SESSION['admin_logged_in'] = true;
    } else {
        $error = '密碼錯誤';
    }
}

if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: system_status.php');
    exit;
}

$isLoggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'];

if (!$isLoggedIn) {
    ?>
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>系統狀態 - 管理員登入</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .login-form { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; margin: 100px auto; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 8px; font-weight: bold; }
            input[type="password"] { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
            .btn { background: #dc143c; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; width: 100%; }
            .btn:hover { background: #b71c1c; }
            .error { color: #dc143c; margin-top: 10px; text-align: center; }
        </style>
    </head>
    <body>
        <form class="login-form" method="POST">
            <h2>系統狀態 - 管理員登入</h2>
            <div class="form-group">
                <label for="password">密碼：</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" name="login" class="btn">登入</button>
            <?php if (isset($error)): ?>
                <div class="error"><?php echo $error; ?></div>
            <?php endif; ?>
        </form>
    </body>
    </html>
    <?php
    exit;
}

// 檢查各種服務狀態
function checkServiceStatus() {
    $status = [];
    
    // MongoDB 狀態
    try {
        $mongo = DatabaseConfig::getMongoConnection();
        $status['mongodb'] = [
            'status' => $mongo ? 'online' : 'offline',
            'host' => DatabaseConfig::MONGODB_HOST,
            'port' => DatabaseConfig::MONGODB_PORT,
            'database' => DatabaseConfig::MONGODB_DATABASE
        ];
        
        if ($mongo) {
            $collections = $mongo->listCollectionNames();
            $status['mongodb']['collections'] = iterator_to_array($collections);
        }
    } catch (Exception $e) {
        $status['mongodb'] = [
            'status' => 'error',
            'error' => $e->getMessage()
        ];
    }
    
    // MySQL 狀態
    try {
        $mysql = DatabaseConfig::getMySQLConnection();
        $status['mysql'] = [
            'status' => $mysql ? 'online' : 'offline',
            'host' => DatabaseConfig::MYSQL_HOST,
            'port' => DatabaseConfig::MYSQL_PORT,
            'database' => DatabaseConfig::MYSQL_DATABASE
        ];
        
        if ($mysql) {
            $tables = $mysql->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            $status['mysql']['tables'] = $tables;
        }
    } catch (Exception $e) {
        $status['mysql'] = [
            'status' => 'error',
            'error' => $e->getMessage()
        ];
    }
    
    // 檢查網路端口
    $ports = [
        'HTTP Server (Python)' => 8080,
        'Apache (XAMPP)' => 80,
        'MySQL (XAMPP)' => 3306,
        'MongoDB' => 27017
    ];
    
    $status['ports'] = [];
    foreach ($ports as $service => $port) {
        $connection = @fsockopen('127.0.0.1', $port, $errno, $errstr, 1);
        $status['ports'][$service] = [
            'port' => $port,
            'status' => $connection ? 'listening' : 'closed'
        ];
        if ($connection) fclose($connection);
    }
    
    // 檢查檔案權限
    $directories = ['../api/', '../config/', './'];
    $status['permissions'] = [];
    foreach ($directories as $dir) {
        $status['permissions'][$dir] = [
            'readable' => is_readable($dir),
            'writable' => is_writable($dir),
            'exists' => file_exists($dir)
        ];
    }
    
    return $status;
}

$systemStatus = checkServiceStatus();
?>

<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MotoMod 系統狀態監控</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: #f5f5f5; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #dc143c; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
        .btn-logout { background: #666; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; float: right; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .status-card { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .card-header { padding: 15px 20px; font-weight: bold; font-size: 1.1rem; }
        .card-content { padding: 20px; }
        .status-online { background: #4CAF50; color: white; }
        .status-offline { background: #f44336; color: white; }
        .status-error { background: #ff9800; color: white; }
        .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
        .indicator-online { background: #4CAF50; }
        .indicator-offline { background: #f44336; }
        .indicator-error { background: #ff9800; }
        .info-list { list-style: none; padding: 0; }
        .info-list li { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
        .info-list li:last-child { border-bottom: none; }
        .refresh-btn { background: #2196F3; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px; }
        .refresh-btn:hover { background: #1976D2; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: bold; }
        .architecture-info { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏍️ MotoMod 系統狀態監控</h1>
            <form method="POST" style="display: inline;">
                <button type="submit" name="logout" class="btn-logout">登出</button>
            </form>
        </div>
        
        <button class="refresh-btn" onclick="location.reload()">🔄 重新整理狀態</button>
        
        <div class="architecture-info">
            <h2>📋 系統架構說明</h2>
            <p><strong>混合資料庫架構：</strong></p>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li><strong>MongoDB</strong> - 核心業務數據（用戶、車輛、改裝、社群等）</li>
                <li><strong>MySQL</strong> - 輔助功能數據（電子報、聯絡表單、分析、日誌）</li>
                <li><strong>JSON 檔案</strong> - 備用存儲方案（當資料庫不可用時）</li>
            </ul>
        </div>
        
        <div class="status-grid">
            <!-- MongoDB 狀態 -->
            <div class="status-card">
                <div class="card-header <?php echo $systemStatus['mongodb']['status'] === 'online' ? 'status-online' : ($systemStatus['mongodb']['status'] === 'error' ? 'status-error' : 'status-offline'); ?>">
                    🍃 MongoDB 狀態
                </div>
                <div class="card-content">
                    <ul class="info-list">
                        <li>
                            <span>狀態</span>
                            <span>
                                <span class="status-indicator <?php echo $systemStatus['mongodb']['status'] === 'online' ? 'indicator-online' : ($systemStatus['mongodb']['status'] === 'error' ? 'indicator-error' : 'indicator-offline'); ?>"></span>
                                <?php echo ucfirst($systemStatus['mongodb']['status']); ?>
                            </span>
                        </li>
                        <?php if (isset($systemStatus['mongodb']['host'])): ?>
                        <li><span>主機</span><span><?php echo $systemStatus['mongodb']['host']; ?></span></li>
                        <li><span>端口</span><span><?php echo $systemStatus['mongodb']['port']; ?></span></li>
                        <li><span>資料庫</span><span><?php echo $systemStatus['mongodb']['database']; ?></span></li>
                        <?php endif; ?>
                        <?php if (isset($systemStatus['mongodb']['collections'])): ?>
                        <li><span>集合數量</span><span><?php echo count($systemStatus['mongodb']['collections']); ?></span></li>
                        <?php endif; ?>
                        <?php if (isset($systemStatus['mongodb']['error'])): ?>
                        <li><span>錯誤</span><span style="color: #f44336;"><?php echo $systemStatus['mongodb']['error']; ?></span></li>
                        <?php endif; ?>
                    </ul>
                    
                    <?php if (isset($systemStatus['mongodb']['collections']) && !empty($systemStatus['mongodb']['collections'])): ?>
                    <h4 style="margin-top: 15px;">集合列表：</h4>
                    <ul style="margin-left: 20px;">
                        <?php foreach ($systemStatus['mongodb']['collections'] as $collection): ?>
                        <li><?php echo $collection; ?></li>
                        <?php endforeach; ?>
                    </ul>
                    <?php endif; ?>
                </div>
            </div>
            
            <!-- MySQL 狀態 -->
            <div class="status-card">
                <div class="card-header <?php echo $systemStatus['mysql']['status'] === 'online' ? 'status-online' : ($systemStatus['mysql']['status'] === 'error' ? 'status-error' : 'status-offline'); ?>">
                    🐬 MySQL 狀態
                </div>
                <div class="card-content">
                    <ul class="info-list">
                        <li>
                            <span>狀態</span>
                            <span>
                                <span class="status-indicator <?php echo $systemStatus['mysql']['status'] === 'online' ? 'indicator-online' : ($systemStatus['mysql']['status'] === 'error' ? 'indicator-error' : 'indicator-offline'); ?>"></span>
                                <?php echo ucfirst($systemStatus['mysql']['status']); ?>
                            </span>
                        </li>
                        <?php if (isset($systemStatus['mysql']['host'])): ?>
                        <li><span>主機</span><span><?php echo $systemStatus['mysql']['host']; ?></span></li>
                        <li><span>端口</span><span><?php echo $systemStatus['mysql']['port']; ?></span></li>
                        <li><span>資料庫</span><span><?php echo $systemStatus['mysql']['database']; ?></span></li>
                        <?php endif; ?>
                        <?php if (isset($systemStatus['mysql']['tables'])): ?>
                        <li><span>表格數量</span><span><?php echo count($systemStatus['mysql']['tables']); ?></span></li>
                        <?php endif; ?>
                        <?php if (isset($systemStatus['mysql']['error'])): ?>
                        <li><span>錯誤</span><span style="color: #f44336;"><?php echo $systemStatus['mysql']['error']; ?></span></li>
                        <?php endif; ?>
                    </ul>
                    
                    <?php if (isset($systemStatus['mysql']['tables']) && !empty($systemStatus['mysql']['tables'])): ?>
                    <h4 style="margin-top: 15px;">表格列表：</h4>
                    <ul style="margin-left: 20px;">
                        <?php foreach ($systemStatus['mysql']['tables'] as $table): ?>
                        <li><?php echo $table; ?></li>
                        <?php endforeach; ?>
                    </ul>
                    <?php endif; ?>
                </div>
            </div>
            
            <!-- 網路端口狀態 -->
            <div class="status-card">
                <div class="card-header" style="background: #2196F3; color: white;">
                    🌐 網路服務狀態
                </div>
                <div class="card-content">
                    <table>
                        <thead>
                            <tr>
                                <th>服務</th>
                                <th>端口</th>
                                <th>狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($systemStatus['ports'] as $service => $info): ?>
                            <tr>
                                <td><?php echo $service; ?></td>
                                <td><?php echo $info['port']; ?></td>
                                <td>
                                    <span class="status-indicator <?php echo $info['status'] === 'listening' ? 'indicator-online' : 'indicator-offline'; ?>"></span>
                                    <?php echo $info['status']; ?>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- 檔案權限狀態 -->
            <div class="status-card">
                <div class="card-header" style="background: #9C27B0; color: white;">
                    📁 檔案權限狀態
                </div>
                <div class="card-content">
                    <table>
                        <thead>
                            <tr>
                                <th>目錄</th>
                                <th>存在</th>
                                <th>可讀</th>
                                <th>可寫</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($systemStatus['permissions'] as $dir => $perms): ?>
                            <tr>
                                <td><?php echo $dir; ?></td>
                                <td>
                                    <span class="status-indicator <?php echo $perms['exists'] ? 'indicator-online' : 'indicator-offline'; ?>"></span>
                                    <?php echo $perms['exists'] ? '是' : '否'; ?>
                                </td>
                                <td>
                                    <span class="status-indicator <?php echo $perms['readable'] ? 'indicator-online' : 'indicator-offline'; ?>"></span>
                                    <?php echo $perms['readable'] ? '是' : '否'; ?>
                                </td>
                                <td>
                                    <span class="status-indicator <?php echo $perms['writable'] ? 'indicator-online' : 'indicator-offline'; ?>"></span>
                                    <?php echo $perms['writable'] ? '是' : '否'; ?>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="architecture-info">
            <h2>📊 資料庫分工策略</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 15px;">
                <div>
                    <h4 style="color: #4CAF50;">🍃 MongoDB 負責：</h4>
                    <ul style="margin-left: 20px;">
                        <li>用戶管理</li>
                        <li>車輛資料</li>
                        <li>改裝記錄</li>
                        <li>社群討論</li>
                        <li>活動管理</li>
                        <li>商品目錄</li>
                        <li>作品展示</li>
                    </ul>
                </div>
                <div>
                    <h4 style="color: #2196F3;">🐬 MySQL 負責：</h4>
                    <ul style="margin-left: 20px;">
                        <li>電子報訂閱</li>
                        <li>聯絡表單</li>
                        <li>網站分析</li>
                        <li>系統日誌</li>
                        <li>用戶會話</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</body>
</html> 