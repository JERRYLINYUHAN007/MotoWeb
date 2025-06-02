<?php
/**
 * MotoWeb PHP Backend API
 * 與現有 Node.js 系統整合的 PHP 服務
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3001');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 處理 CORS 預檢請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 載入配置
require_once 'config/database.php';
require_once 'src/Router.php';
require_once 'src/controllers/BaseController.php';
require_once 'src/controllers/ContentController.php';
require_once 'src/controllers/FileController.php';
require_once 'src/controllers/ReportController.php';

// 初始化路由器
$router = new Router();

// API 路由定義
$router->get('/api/php/status', function() {
    return json_response([
        'status' => 'success',
        'message' => 'MotoWeb PHP Backend is running',
        'version' => '1.0.0',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
});

// 內容管理 API
$router->group('/api/php/content', function($router) {
    $controller = new ContentController();
    
    $router->get('/posts', [$controller, 'getPosts']);
    $router->post('/posts', [$controller, 'createPost']);
    $router->put('/posts/{id}', [$controller, 'updatePost']);
    $router->delete('/posts/{id}', [$controller, 'deletePost']);
    
    $router->get('/categories', [$controller, 'getCategories']);
    $router->post('/categories', [$controller, 'createCategory']);
});

// 檔案處理 API
$router->group('/api/php/files', function($router) {
    $controller = new FileController();
    
    $router->post('/upload', [$controller, 'uploadFile']);
    $router->post('/resize', [$controller, 'resizeImage']);
    $router->get('/download/{id}', [$controller, 'downloadFile']);
    $router->delete('/delete/{id}', [$controller, 'deleteFile']);
});

// 報表系統 API
$router->group('/api/php/reports', function($router) {
    $controller = new ReportController();
    
    $router->get('/users', [$controller, 'getUserReport']);
    $router->get('/activities', [$controller, 'getActivityReport']);
    $router->get('/analytics', [$controller, 'getAnalyticsReport']);
    $router->post('/export', [$controller, 'exportReport']);
});

// 健康檢查
$router->get('/api/php/health', function() {
    return json_response([
        'status' => 'healthy',
        'services' => [
            'database' => check_database_connection(),
            'filesystem' => check_filesystem_access(),
            'memory' => [
                'used' => memory_get_usage(true),
                'peak' => memory_get_peak_usage(true),
                'limit' => ini_get('memory_limit')
            ]
        ]
    ]);
});

// 執行路由
try {
    $router->run();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error',
        'error' => $e->getMessage()
    ]);
}

// 輔助函數
function json_response($data, $status_code = 200) {
    http_response_code($status_code);
    return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

function check_database_connection() {
    try {
        $pdo = get_database_connection();
        return $pdo ? 'connected' : 'disconnected';
    } catch (Exception $e) {
        return 'error: ' . $e->getMessage();
    }
}

function check_filesystem_access() {
    $upload_dir = 'uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    return is_writable($upload_dir) ? 'writable' : 'readonly';
}
?> 