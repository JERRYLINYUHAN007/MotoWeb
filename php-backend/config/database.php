<?php
/**
 * 資料庫配置
 * 支援 MongoDB (主要) 和 MySQL (輔助)
 */

// 環境配置
$env = $_ENV['APP_ENV'] ?? 'development';

// MongoDB 配置
$mongodb_config = [
    'host' => $_ENV['MONGODB_HOST'] ?? 'localhost',
    'port' => $_ENV['MONGODB_PORT'] ?? 27017,
    'database' => $_ENV['MONGODB_DATABASE'] ?? 'motoweb',
    'username' => $_ENV['MONGODB_USERNAME'] ?? null,
    'password' => $_ENV['MONGODB_PASSWORD'] ?? null,
    'options' => [
        'connectTimeoutMS' => 5000,
        'socketTimeoutMS' => 5000,
    ]
];

// MySQL 配置 (用於複雜查詢和報表)
$mysql_config = [
    'host' => $_ENV['MYSQL_HOST'] ?? 'localhost',
    'port' => $_ENV['MYSQL_PORT'] ?? 3306,
    'database' => $_ENV['MYSQL_DATABASE'] ?? 'motoweb_analytics',
    'username' => $_ENV['MYSQL_USERNAME'] ?? 'root',
    'password' => $_ENV['MYSQL_PASSWORD'] ?? '',
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
];

/**
 * 獲取 MongoDB 連接
 */
function get_mongodb_connection() {
    global $mongodb_config;
    static $connection = null;
    
    if ($connection === null) {
        try {
            $uri = "mongodb://";
            
            if ($mongodb_config['username'] && $mongodb_config['password']) {
                $uri .= urlencode($mongodb_config['username']) . ':' . 
                       urlencode($mongodb_config['password']) . '@';
            }
            
            $uri .= $mongodb_config['host'] . ':' . $mongodb_config['port'] . '/' . 
                   $mongodb_config['database'];
            
            $connection = new MongoDB\Client($uri, $mongodb_config['options']);
        } catch (Exception $e) {
            error_log("MongoDB connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }
    
    return $connection->selectDatabase($mongodb_config['database']);
}

/**
 * 獲取 MySQL 連接
 */
function get_mysql_connection() {
    global $mysql_config;
    static $connection = null;
    
    if ($connection === null) {
        try {
            $dsn = "mysql:host={$mysql_config['host']};port={$mysql_config['port']};dbname={$mysql_config['database']};charset={$mysql_config['charset']}";
            $connection = new PDO($dsn, $mysql_config['username'], $mysql_config['password'], $mysql_config['options']);
        } catch (PDOException $e) {
            error_log("MySQL connection failed: " . $e->getMessage());
            throw new Exception("Analytics database connection failed");
        }
    }
    
    return $connection;
}

/**
 * 通用資料庫連接 (預設 MongoDB)
 */
function get_database_connection($type = 'mongodb') {
    switch ($type) {
        case 'mysql':
            return get_mysql_connection();
        case 'mongodb':
        default:
            return get_mongodb_connection();
    }
}

/**
 * 初始化資料庫表結構 (MySQL)
 */
function init_mysql_tables() {
    $pdo = get_mysql_connection();
    
    // 用戶活動記錄表
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_activities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            action VARCHAR(100) NOT NULL,
            resource_type VARCHAR(50),
            resource_id VARCHAR(50),
            metadata JSON,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_action (action),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // 頁面瀏覽記錄表
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS page_views (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50),
            page_url VARCHAR(500) NOT NULL,
            referrer VARCHAR(500),
            session_id VARCHAR(100),
            duration INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_page_url (page_url(255)),
            INDEX idx_user_id (user_id),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // 檔案上傳記錄表
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS file_uploads (
            id INT AUTO_INCREMENT PRIMARY KEY,
            file_id VARCHAR(50) UNIQUE NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            stored_name VARCHAR(255) NOT NULL,
            file_type VARCHAR(100),
            file_size INT,
            upload_path VARCHAR(500),
            user_id VARCHAR(50),
            status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
            metadata JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_file_id (file_id),
            INDEX idx_user_id (user_id),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

// 初始化 MySQL 表結構 (如果需要)
if (isset($_GET['init_mysql']) && $_GET['init_mysql'] === 'true') {
    try {
        init_mysql_tables();
        echo json_encode(['status' => 'success', 'message' => 'MySQL tables initialized']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}
?> 