<?php
require_once '../config/database.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// 檢查請求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => '僅支援 POST 請求']);
    exit;
}

// 獲取POST數據
$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? filter_var($input['email'], FILTER_VALIDATE_EMAIL) : false;

// 如果是表單提交
if (!$email && isset($_POST['email'])) {
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
}

// 驗證電子郵件
if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => '請提供有效的電子郵件地址']);
    exit;
}

/**
 * MySQL 版本的電子報訂閱
 */
function subscribeWithMySQL($email) {
    try {
        $pdo = DatabaseConfig::getMySQLConnection();
        if (!$pdo) {
            throw new Exception('無法連接到MySQL資料庫');
        }
        
        // 確保表格存在
        $createTableSQL = "
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                status ENUM('active', 'inactive') DEFAULT 'active',
                INDEX idx_email (email),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ";
        $pdo->exec($createTableSQL);
        
        // 檢查是否已訂閱
        $checkStmt = $pdo->prepare("SELECT id FROM newsletter_subscribers WHERE email = ?");
        $checkStmt->execute([$email]);
        
        if ($checkStmt->rowCount() > 0) {
            return [
                'success' => true,
                'message' => '此電子郵件已經訂閱過了',
                'already_subscribed' => true
            ];
        }
        
        // 新增訂閱者
        $insertStmt = $pdo->prepare("
            INSERT INTO newsletter_subscribers (email, ip_address) 
            VALUES (?, ?)
        ");
        $insertStmt->execute([
            $email,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        // 記錄訂閱日誌
        $logTableSQL = "
            CREATE TABLE IF NOT EXISTS newsletter_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                action ENUM('subscribe', 'unsubscribe', 'bounce') DEFAULT 'subscribe',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                user_agent TEXT,
                INDEX idx_email (email),
                INDEX idx_timestamp (timestamp)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ";
        $pdo->exec($logTableSQL);
        
        $logStmt = $pdo->prepare("
            INSERT INTO newsletter_logs (email, action, ip_address, user_agent) 
            VALUES (?, 'subscribe', ?, ?)
        ");
        $logStmt->execute([
            $email,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
        
        return [
            'success' => true,
            'message' => '感謝您的訂閱！我們會將最新的摩托車改裝資訊發送到您的信箱。',
            'email' => $email,
            'database' => 'mysql'
        ];
        
    } catch (PDOException $e) {
        error_log('MySQL Newsletter Error: ' . $e->getMessage());
        return [
            'success' => false,
            'error' => '資料庫錯誤，請稍後再試'
        ];
    } catch (Exception $e) {
        error_log('Newsletter Error: ' . $e->getMessage());
        return [
            'success' => false,
            'error' => '訂閱失敗，請稍後再試'
        ];
    }
}

/**
 * JSON 版本的電子報訂閱 (備用方案)
 */
function subscribeWithJSON($email) {
    try {
        $subscribersFile = 'subscribers.json';
        $subscribers = [];
        
        if (file_exists($subscribersFile)) {
            $subscribers = json_decode(file_get_contents($subscribersFile), true) ?: [];
        }
        
        // 檢查重複訂閱
        foreach ($subscribers as $subscriber) {
            if (is_array($subscriber) && isset($subscriber['email']) && $subscriber['email'] === $email) {
                return [
                    'success' => true,
                    'message' => '此電子郵件已經訂閱過了',
                    'already_subscribed' => true
                ];
            } elseif (is_string($subscriber) && $subscriber === $email) {
                return [
                    'success' => true,
                    'message' => '此電子郵件已經訂閱過了',
                    'already_subscribed' => true
                ];
            }
        }
        
        // 添加新訂閱者 (使用結構化格式)
        $newSubscriber = [
            'email' => $email,
            'subscribed_at' => date('Y-m-d H:i:s'),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'status' => 'active'
        ];
        
        $subscribers[] = $newSubscriber;
        file_put_contents($subscribersFile, json_encode($subscribers, JSON_PRETTY_PRINT));
        
        // 記錄日誌
        $logEntry = [
            'email' => $email,
            'action' => 'subscribe',
            'timestamp' => date('Y-m-d H:i:s'),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ];
        
        $logFile = 'newsletter_log.json';
        $logs = [];
        
        if (file_exists($logFile)) {
            $logs = json_decode(file_get_contents($logFile), true) ?: [];
        }
        
        $logs[] = $logEntry;
        file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT));
        
        return [
            'success' => true,
            'message' => '感謝您的訂閱！我們會將最新的摩托車改裝資訊發送到您的信箱。',
            'email' => $email,
            'database' => 'json'
        ];
        
    } catch (Exception $e) {
        error_log('JSON Newsletter Error: ' . $e->getMessage());
        return [
            'success' => false,
            'error' => '訂閱失敗，請稍後再試'
        ];
    }
}

// 決定使用哪種儲存方式
$databaseType = DatabaseConfig::getDatabaseType('newsletter');
$response = null;

if ($databaseType === 'mysql' && DatabaseConfig::isMySQLAvailable()) {
    $response = subscribeWithMySQL($email);
} else {
    $response = subscribeWithJSON($email);
}

// 輸出響應
echo json_encode($response);
?> 