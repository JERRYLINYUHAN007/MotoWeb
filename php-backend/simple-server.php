<?php
/**
 * MotoWeb 簡化 PHP 後端
 * 快速測試版本，無外部依賴
 */

// 啟用錯誤顯示和日誌記錄
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3001');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 日誌記錄函數
function logRequest($data) {
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'data' => $data
    ];
    file_put_contents('request_log.json', json_encode($log_entry, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
}

// 處理 CORS 預檢請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logRequest(['action' => 'CORS_PREFLIGHT', 'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'unknown']);
    http_response_code(200);
    exit;
}

// 簡單路由處理
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// 解析路徑
$path = parse_url($request_uri, PHP_URL_PATH);

// 記錄每個請求
logRequest([
    'method' => $request_method,
    'path' => $path,
    'headers' => getallheaders(),
    'get_data' => $_GET,
    'post_data' => $_POST,
    'files' => $_FILES,
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
]);

// 輸出到控制台
echo "🔍 [" . date('H:i:s') . "] $request_method $path\n";

// 路由處理
if ($path === '/api/php/status' && $request_method === 'GET') {
    $response = [
        'status' => 'success',
        'message' => 'MotoWeb PHP Backend is running!',
        'version' => '1.0.0 (Simple)',
        'timestamp' => date('Y-m-d H:i:s'),
        'php_version' => PHP_VERSION,
        'features' => [
            'file_upload' => true,
            'image_processing' => extension_loaded('gd'),
            'mysql_support' => extension_loaded('pdo_mysql'),
            'mongodb_support' => extension_loaded('mongodb')
        ]
    ];
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} elseif ($path === '/api/php/logs' && $request_method === 'GET') {
    // 新增：查看處理日誌
    if (file_exists('request_log.json')) {
        $logs = file_get_contents('request_log.json');
        $log_entries = array_filter(explode("\n", $logs));
        $parsed_logs = array_map(function($entry) {
            return json_decode($entry, true);
        }, array_slice($log_entries, -10)); // 顯示最近 10 筆
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Recent request logs',
            'count' => count($log_entries),
            'recent_logs' => array_filter($parsed_logs)
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No logs found']);
    }
    
} elseif ($path === '/api/php/data/view' && $request_method === 'GET') {
    // 新增：查看上傳的檔案列表
    $upload_dir = 'uploads/';
    $files = [];
    if (is_dir($upload_dir)) {
        $scan = scandir($upload_dir);
        foreach ($scan as $file) {
            if ($file !== '.' && $file !== '..') {
                $file_path = $upload_dir . $file;
                $files[] = [
                    'name' => $file,
                    'size' => filesize($file_path),
                    'modified' => date('Y-m-d H:i:s', filemtime($file_path)),
                    'type' => mime_content_type($file_path)
                ];
            }
        }
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Upload directory contents',
        'upload_dir' => realpath($upload_dir),
        'file_count' => count($files),
        'files' => $files
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} elseif ($path === '/api/php/health' && $request_method === 'GET') {
    echo json_encode([
        'status' => 'healthy',
        'memory_usage' => [
            'current' => memory_get_usage(true),
            'peak' => memory_get_peak_usage(true),
            'limit' => ini_get('memory_limit')
        ],
        'disk_space' => disk_free_space('.'),
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'extensions' => [
            'gd' => extension_loaded('gd'),
            'pdo' => extension_loaded('pdo'),
            'pdo_mysql' => extension_loaded('pdo_mysql'),
            'mongodb' => extension_loaded('mongodb'),
            'json' => extension_loaded('json'),
            'mbstring' => extension_loaded('mbstring')
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} elseif (strpos($path, '/api/php/files/upload') === 0 && $request_method === 'POST') {
    // 簡單檔案上傳功能
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
        exit;
    }
    
    $file = $_FILES['file'];
    $upload_dir = 'uploads/';
    
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    $filename = uniqid() . '_' . basename($file['name']);
    $target_path = $upload_dir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        $result = [
            'status' => 'success',
            'message' => 'File uploaded successfully',
            'file' => [
                'name' => $filename,
                'original_name' => $file['name'],
                'size' => $file['size'],
                'type' => $file['type'],
                'path' => $target_path,
                'upload_time' => date('Y-m-d H:i:s')
            ]
        ];
        
        // 記錄上傳詳情
        logRequest(['action' => 'FILE_UPLOAD', 'file_info' => $result['file']]);
        
        echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Upload failed']);
    }
    
} elseif ($path === '/api/php/test-db' && $request_method === 'GET') {
    // 測試資料庫連接
    try {
        $pdo = new PDO('mysql:host=localhost;dbname=test', 'root', '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        echo json_encode([
            'status' => 'success',
            'message' => 'MySQL connection successful',
            'server_info' => $pdo->getAttribute(PDO::ATTR_SERVER_INFO)
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'MySQL connection failed',
            'error' => $e->getMessage()
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
    
} elseif ($path === '/api/php/test-data' && $request_method === 'POST') {
    // 新增：測試數據處理端點
    $input = json_decode(file_get_contents('php://input'), true);
    
    $processed_data = [
        'received_at' => date('Y-m-d H:i:s'),
        'original_data' => $input,
        'processed_data' => [
            'data_type' => gettype($input),
            'item_count' => is_array($input) ? count($input) : 1,
            'has_nested_data' => is_array($input) && count(array_filter($input, 'is_array')) > 0
        ],
        'server_info' => [
            'php_version' => PHP_VERSION,
            'memory_usage' => memory_get_usage(true)
        ]
    ];
    
    // 記錄處理的數據
    logRequest(['action' => 'DATA_PROCESSING', 'processed' => $processed_data]);
    
    echo json_encode($processed_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} else {
    // 404 處理
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'Endpoint not found',
        'path' => $path,
        'method' => $request_method,
        'available_endpoints' => [
            'GET /api/php/status',
            'GET /api/php/health',
            'GET /api/php/logs',
            'GET /api/php/data/view',
            'POST /api/php/files/upload',
            'POST /api/php/test-data',
            'GET /api/php/test-db'
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?> 