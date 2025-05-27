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
    header('Location: test_results.php');
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
        <title>系統測試報告 - 管理員登入</title>
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
            <h2>系統測試報告 - 管理員登入</h2>
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

// 執行系統測試
function runSystemTests() {
    $tests = [];
    
    // 1. PHP環境測試
    $tests['php'] = [
        'name' => 'PHP 環境',
        'tests' => [
            'php_version' => [
                'name' => 'PHP 版本',
                'result' => phpversion(),
                'status' => version_compare(phpversion(), '7.4.0', '>=') ? 'pass' : 'fail'
            ],
            'extensions' => [
                'name' => '必要擴展',
                'result' => [
                    'pdo_mysql' => extension_loaded('pdo_mysql'),
                    'json' => extension_loaded('json'),
                    'curl' => extension_loaded('curl'),
                    'openssl' => extension_loaded('openssl'),
                    'mongodb' => extension_loaded('mongodb')
                ],
                'status' => extension_loaded('pdo_mysql') && extension_loaded('json') ? 'pass' : 'fail'
            ]
        ]
    ];
    
    // 2. 資料庫連接測試
    $mongoStatus = DatabaseConfig::isMongoDBAvailable();
    $mysqlStatus = DatabaseConfig::isMySQLAvailable();
    
    $tests['database'] = [
        'name' => '資料庫連接',
        'tests' => [
            'mongodb' => [
                'name' => 'MongoDB 連接',
                'result' => $mongoStatus ? '連接成功' : '連接失敗（擴展未安裝或服務未啟動）',
                'status' => $mongoStatus ? 'pass' : 'warning'
            ],
            'mysql' => [
                'name' => 'MySQL 連接',
                'result' => $mysqlStatus ? '連接成功' : '連接失敗',
                'status' => $mysqlStatus ? 'pass' : 'fail'
            ]
        ]
    ];
    
    // 3. API功能測試
    $tests['api'] = [
        'name' => 'API 功能',
        'tests' => []
    ];
    
    // 測試電子報API
    try {
        $testEmail = 'test_' . time() . '@example.com';
        $response = testNewsletterAPI($testEmail);
        $tests['api']['tests']['newsletter'] = [
            'name' => '電子報訂閱 API',
            'result' => $response['success'] ? '訂閱成功，使用' . $response['database'] . '資料庫' : $response['error'],
            'status' => $response['success'] ? 'pass' : 'fail'
        ];
    } catch (Exception $e) {
        $tests['api']['tests']['newsletter'] = [
            'name' => '電子報訂閱 API',
            'result' => '測試失敗：' . $e->getMessage(),
            'status' => 'fail'
        ];
    }
    
    // 測試聯絡表單API
    try {
        $response = testContactAPI();
        $tests['api']['tests']['contact'] = [
            'name' => '聯絡表單 API',
            'result' => $response['success'] ? '提交成功，ID：' . $response['contact_id'] : $response['error'],
            'status' => $response['success'] ? 'pass' : 'fail'
        ];
    } catch (Exception $e) {
        $tests['api']['tests']['contact'] = [
            'name' => '聯絡表單 API',
            'result' => '測試失敗：' . $e->getMessage(),
            'status' => 'fail'
        ];
    }
    
    // 4. 檔案權限測試
    $directories = ['../api/', '../config/', '../css/', '../js/', '../images/'];
    $tests['permissions'] = [
        'name' => '檔案權限',
        'tests' => []
    ];
    
    foreach ($directories as $dir) {
        $readable = is_readable($dir);
        $writable = is_writable($dir);
        $tests['permissions']['tests'][basename($dir)] = [
            'name' => $dir . ' 目錄',
            'result' => '可讀：' . ($readable ? '是' : '否') . '，可寫：' . ($writable ? '是' : '否'),
            'status' => $readable ? 'pass' : 'fail'
        ];
    }
    
    return $tests;
}

function testNewsletterAPI($email) {
    $url = 'http://localhost/motomod/api/newsletter_v2.php';
    $data = json_encode(['email' => $email]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

function testContactAPI() {
    $url = 'http://localhost/motomod/api/contact.php';
    $data = json_encode([
        'name' => '測試用戶',
        'email' => 'test@example.com',
        'subject' => '系統測試',
        'message' => '這是系統自動測試訊息'
    ]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

$testResults = runSystemTests();
?>

<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MotoMod 系統測試報告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: #f5f5f5; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #dc143c; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
        .btn-logout { background: #666; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; float: right; }
        .test-section { background: white; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .section-header { padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #eee; font-weight: bold; font-size: 1.1rem; }
        .test-item { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .test-item:last-child { border-bottom: none; }
        .test-name { font-weight: 500; }
        .test-result { color: #666; font-size: 0.9rem; margin-top: 5px; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
        .status-pass { background: #d4edda; color: #155724; }
        .status-fail { background: #f8d7da; color: #721c24; }
        .status-warning { background: #fff3cd; color: #856404; }
        .summary { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-top: 15px; }
        .summary-item { text-align: center; }
        .summary-number { font-size: 2rem; font-weight: bold; }
        .summary-label { color: #666; margin-top: 5px; }
        .pass-count { color: #28a745; }
        .fail-count { color: #dc3545; }
        .warning-count { color: #ffc107; }
        .refresh-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px; }
        .refresh-btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 MotoMod 系統測試報告</h1>
            <form method="POST" style="display: inline;">
                <button type="submit" name="logout" class="btn-logout">登出</button>
            </form>
        </div>
        
        <button class="refresh-btn" onclick="location.reload()">🔄 重新執行測試</button>
        
        <?php
        $totalTests = 0;
        $passedTests = 0;
        $failedTests = 0;
        $warningTests = 0;
        
        foreach ($testResults as $section) {
            foreach ($section['tests'] as $test) {
                $totalTests++;
                switch ($test['status']) {
                    case 'pass': $passedTests++; break;
                    case 'fail': $failedTests++; break;
                    case 'warning': $warningTests++; break;
                }
            }
        }
        ?>
        
        <div class="summary">
            <h2>📊 測試總覽</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-number"><?php echo $totalTests; ?></div>
                    <div class="summary-label">總測試數</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number pass-count"><?php echo $passedTests; ?></div>
                    <div class="summary-label">通過</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number fail-count"><?php echo $failedTests; ?></div>
                    <div class="summary-label">失敗</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number warning-count"><?php echo $warningTests; ?></div>
                    <div class="summary-label">警告</div>
                </div>
            </div>
        </div>
        
        <?php foreach ($testResults as $sectionKey => $section): ?>
        <div class="test-section">
            <div class="section-header">
                <?php
                $sectionIcons = [
                    'php' => '🐘',
                    'database' => '💾',
                    'api' => '🔌',
                    'permissions' => '📁'
                ];
                echo $sectionIcons[$sectionKey] ?? '🔧';
                ?>
                <?php echo $section['name']; ?>
            </div>
            
            <?php foreach ($section['tests'] as $testKey => $test): ?>
            <div class="test-item">
                <div>
                    <div class="test-name"><?php echo $test['name']; ?></div>
                    <div class="test-result">
                        <?php
                        if (is_array($test['result'])) {
                            foreach ($test['result'] as $key => $value) {
                                echo $key . ': ' . ($value ? '✅' : '❌') . ' ';
                            }
                        } else {
                            echo $test['result'];
                        }
                        ?>
                    </div>
                </div>
                <div class="status-badge status-<?php echo $test['status']; ?>">
                    <?php
                    $statusText = [
                        'pass' => '通過',
                        'fail' => '失敗', 
                        'warning' => '警告'
                    ];
                    echo $statusText[$test['status']];
                    ?>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endforeach; ?>
        
        <div class="summary">
            <h2>📋 測試結論</h2>
            <?php if ($failedTests == 0): ?>
                <p style="color: #28a745; font-weight: bold;">🎉 所有重要測試都已通過！系統運行正常。</p>
                <?php if ($warningTests > 0): ?>
                    <p style="color: #ffc107; margin-top: 10px;">⚠️ 有 <?php echo $warningTests; ?> 個警告項目，建議檢查但不影響基本功能。</p>
                <?php endif; ?>
            <?php else: ?>
                <p style="color: #dc3545; font-weight: bold;">❌ 有 <?php echo $failedTests; ?> 個測試失敗，需要修復。</p>
            <?php endif; ?>
            
            <h3 style="margin-top: 20px;">💡 建議措施：</h3>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <?php if (!extension_loaded('mongodb')): ?>
                    <li><strong>MongoDB擴展：</strong>安裝MongoDB PHP擴展以支援原有核心功能</li>
                <?php endif; ?>
                <?php if ($mysqlStatus): ?>
                    <li><strong>MySQL：</strong>✅ 正常運行，支援新的PHP功能</li>
                <?php else: ?>
                    <li><strong>MySQL：</strong>檢查XAMPP MySQL服務是否啟動</li>
                <?php endif; ?>
                <li><strong>混合架構：</strong>當前系統支援MongoDB+MySQL混合使用</li>
                <li><strong>備用方案：</strong>JSON檔案儲存已啟用作為備用</li>
            </ul>
            
            <p style="margin-top: 15px; padding: 15px; background: #e9ecef; border-radius: 5px;">
                <strong>測試時間：</strong><?php echo date('Y-m-d H:i:s'); ?><br>
                <strong>PHP版本：</strong><?php echo phpversion(); ?><br>
                <strong>系統狀態：</strong><?php echo $failedTests == 0 ? '良好' : '需要關注'; ?>
            </p>
        </div>
    </div>
</body>
</html> 