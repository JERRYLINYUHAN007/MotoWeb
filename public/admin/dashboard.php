<?php
// 簡單的管理面板
session_start();

// 簡單的密碼驗證
$admin_password = 'motomod2024'; // 在實際環境中應該使用更安全的認證

if (isset($_POST['login'])) {
    if ($_POST['password'] === $admin_password) {
        $_SESSION['admin_logged_in'] = true;
    } else {
        $error = '密碼錯誤';
    }
}

if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: dashboard.php');
    exit;
}

$isLoggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'];

// 讀取數據
$subscribers = [];
$contacts = [];
$notifications = [];

if ($isLoggedIn) {
    if (file_exists('../api/subscribers.json')) {
        $subscribers = json_decode(file_get_contents('../api/subscribers.json'), true) ?: [];
    }
    
    if (file_exists('../api/contacts.json')) {
        $contacts = json_decode(file_get_contents('../api/contacts.json'), true) ?: [];
    }
    
    if (file_exists('../api/notifications.json')) {
        $notifications = json_decode(file_get_contents('../api/notifications.json'), true) ?: [];
    }
}
?>

<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MotoMod 管理面板</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: #f5f5f5;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: #dc143c;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .login-form {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 400px;
            margin: 100px auto;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }
        
        input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        
        .btn {
            background: #dc143c;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
        }
        
        .btn:hover {
            background: #b71c1c;
        }
        
        .btn-logout {
            background: #666;
            float: right;
            width: auto;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #dc143c;
        }
        
        .stat-label {
            color: #666;
            margin-top: 8px;
        }
        
        .section {
            background: white;
            margin-bottom: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .section-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            background: #f8f9fa;
            border-radius: 8px 8px 0 0;
        }
        
        .section-content {
            padding: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        th {
            background: #f8f9fa;
            font-weight: bold;
        }
        
        .error {
            color: #dc143c;
            margin-top: 10px;
            text-align: center;
        }
        
        .empty-state {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <?php if (!$isLoggedIn): ?>
            <form class="login-form" method="POST">
                <h2>管理員登入</h2>
                <div class="form-group">
                    <label for="password">密碼：</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" name="login" class="btn">登入</button>
                <?php if (isset($error)): ?>
                    <div class="error"><?php echo $error; ?></div>
                <?php endif; ?>
            </form>
        <?php else: ?>
            <div class="header">
                <h1>🏍️ MotoMod 管理面板</h1>
                <form method="POST" style="display: inline;">
                    <button type="submit" name="logout" class="btn btn-logout">登出</button>
                </form>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number"><?php echo count($subscribers); ?></div>
                    <div class="stat-label">電子報訂閱者</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number"><?php echo count($contacts); ?></div>
                    <div class="stat-label">聯絡訊息</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number"><?php echo count($notifications); ?></div>
                    <div class="stat-label">系統通知</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2>📧 電子報訂閱者</h2>
                </div>
                <div class="section-content">
                    <?php if (empty($subscribers)): ?>
                        <div class="empty-state">尚無訂閱者</div>
                    <?php else: ?>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>電子郵件</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($subscribers as $index => $email): ?>
                                    <tr>
                                        <td><?php echo $index + 1; ?></td>
                                        <td><?php echo htmlspecialchars($email); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2>📨 聯絡訊息</h2>
                </div>
                <div class="section-content">
                    <?php if (empty($contacts)): ?>
                        <div class="empty-state">尚無聯絡訊息</div>
                    <?php else: ?>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>姓名</th>
                                    <th>電子郵件</th>
                                    <th>主旨</th>
                                    <th>時間</th>
                                    <th>狀態</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach (array_reverse($contacts) as $contact): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($contact['id']); ?></td>
                                        <td><?php echo htmlspecialchars($contact['name']); ?></td>
                                        <td><?php echo htmlspecialchars($contact['email']); ?></td>
                                        <td><?php echo htmlspecialchars($contact['subject']); ?></td>
                                        <td><?php echo htmlspecialchars($contact['timestamp']); ?></td>
                                        <td><?php echo htmlspecialchars($contact['status']); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>
                </div>
            </div>
        <?php endif; ?>
    </div>
</body>
</html> 