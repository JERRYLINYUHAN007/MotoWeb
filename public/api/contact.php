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

// 支援表單提交和JSON提交
$name = $input['name'] ?? $_POST['name'] ?? '';
$email = $input['email'] ?? $_POST['email'] ?? '';
$subject = $input['subject'] ?? $_POST['subject'] ?? '';
$message = $input['message'] ?? $_POST['message'] ?? '';

// 驗證必填欄位
$errors = [];

if (empty($name)) {
    $errors[] = '姓名為必填欄位';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = '請提供有效的電子郵件地址';
}

if (empty($subject)) {
    $errors[] = '主旨為必填欄位';
}

if (empty($message)) {
    $errors[] = '訊息內容為必填欄位';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['error' => implode('、', $errors)]);
    exit;
}

// 建立聯絡資料
$contactData = [
    'id' => uniqid('contact_'),
    'name' => htmlspecialchars($name),
    'email' => htmlspecialchars($email),
    'subject' => htmlspecialchars($subject),
    'message' => htmlspecialchars($message),
    'timestamp' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'status' => 'new'
];

// 儲存到檔案
$contactsFile = 'contacts.json';
$contacts = [];

if (file_exists($contactsFile)) {
    $contacts = json_decode(file_get_contents($contactsFile), true) ?: [];
}

$contacts[] = $contactData;
file_put_contents($contactsFile, json_encode($contacts, JSON_PRETTY_PRINT));

// 模擬發送郵件通知（實際環境可使用PHPMailer）
$notificationData = [
    'to' => 'admin@motomod.com',
    'subject' => "新的聯絡訊息：{$subject}",
    'message' => "收到來自 {$name} ({$email}) 的新訊息：\n\n{$message}",
    'timestamp' => date('Y-m-d H:i:s')
];

$notificationsFile = 'notifications.json';
$notifications = [];

if (file_exists($notificationsFile)) {
    $notifications = json_decode(file_get_contents($notificationsFile), true) ?: [];
}

$notifications[] = $notificationData;
file_put_contents($notificationsFile, json_encode($notifications, JSON_PRETTY_PRINT));

// 發送成功響應
echo json_encode([
    'success' => true,
    'message' => '感謝您的聯絡！我們會盡快回覆您的訊息。',
    'contact_id' => $contactData['id']
]);
?> 