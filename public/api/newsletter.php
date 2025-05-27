<?php
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

// 檢查是否已訂閱（模擬）
$subscribersFile = 'subscribers.json';
$subscribers = [];

if (file_exists($subscribersFile)) {
    $subscribers = json_decode(file_get_contents($subscribersFile), true) ?: [];
}

// 檢查重複訂閱
if (in_array($email, $subscribers)) {
    echo json_encode(['message' => '此電子郵件已經訂閱過了']);
    exit;
}

// 添加新訂閱者
$subscribers[] = $email;
file_put_contents($subscribersFile, json_encode($subscribers, JSON_PRETTY_PRINT));

// 記錄訂閱
$logEntry = [
    'email' => $email,
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

// 發送成功響應
echo json_encode([
    'success' => true,
    'message' => '感謝您的訂閱！我們會將最新的摩托車改裝資訊發送到您的信箱。',
    'email' => $email
]);
?> 