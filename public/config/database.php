<?php
// 資料庫配置檔案 - 支援多種資料庫

class DatabaseConfig {
    // MongoDB 配置 (保留原有功能)
    const MONGODB_HOST = '127.0.0.1';
    const MONGODB_PORT = 27017;
    const MONGODB_DATABASE = 'motomod';
    
    // MySQL 配置 (新增功能)
    const MYSQL_HOST = '127.0.0.1';
    const MYSQL_PORT = 3306;
    const MYSQL_USERNAME = 'root';
    const MYSQL_PASSWORD = '';
    const MYSQL_DATABASE = 'motomod_php';
    
    // 功能分配策略
    const FEATURE_DATABASE_MAP = [
        // 使用 MongoDB 的功能 (原有核心功能)
        'users' => 'mongodb',
        'bikes' => 'mongodb',
        'modifications' => 'mongodb',
        'community_posts' => 'mongodb',
        'events' => 'mongodb',
        'products' => 'mongodb',
        'gallery' => 'mongodb',
        
        // 使用 MySQL 的功能 (新增輔助功能)
        'newsletter' => 'mysql',
        'contacts' => 'mysql',
        'analytics' => 'mysql',
        'logs' => 'mysql',
        'sessions' => 'mysql'
    ];
    
    /**
     * 檢查MongoDB擴展是否可用
     */
    public static function isMongoExtensionAvailable() {
        return extension_loaded('mongodb') && class_exists('MongoDB\Client');
    }
    
    /**
     * 獲取MongoDB連接
     */
    public static function getMongoConnection() {
        try {
            if (!self::isMongoExtensionAvailable()) {
                error_log('MongoDB PHP extension not available');
                return null;
            }
            
            $connectionString = sprintf(
                'mongodb://%s:%d',
                self::MONGODB_HOST,
                self::MONGODB_PORT
            );
            
            $client = new MongoDB\Client($connectionString);
            return $client->selectDatabase(self::MONGODB_DATABASE);
        } catch (Exception $e) {
            error_log('MongoDB connection failed: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * 獲取MySQL連接
     */
    public static function getMySQLConnection() {
        try {
            // 先嘗試連接不指定資料庫，如果資料庫不存在則創建
            $dsn = sprintf(
                'mysql:host=%s;port=%d;charset=utf8mb4',
                self::MYSQL_HOST,
                self::MYSQL_PORT
            );
            
            $pdo = new PDO($dsn, self::MYSQL_USERNAME, self::MYSQL_PASSWORD, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            
            // 創建資料庫（如果不存在）
            $pdo->exec("CREATE DATABASE IF NOT EXISTS " . self::MYSQL_DATABASE . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE " . self::MYSQL_DATABASE);
            
            return $pdo;
        } catch (Exception $e) {
            error_log('MySQL connection failed: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * 根據功能名稱獲取對應的資料庫類型
     */
    public static function getDatabaseType($feature) {
        return self::FEATURE_DATABASE_MAP[$feature] ?? 'json'; // 預設使用JSON文件
    }
    
    /**
     * 檢查MongoDB是否可用
     */
    public static function isMongoDBAvailable() {
        if (!self::isMongoExtensionAvailable()) {
            return false;
        }
        return self::getMongoConnection() !== null;
    }
    
    /**
     * 檢查MySQL是否可用
     */
    public static function isMySQLAvailable() {
        return self::getMySQLConnection() !== null;
    }
    
    /**
     * 獲取系統狀態
     */
    public static function getSystemStatus() {
        return [
            'mongodb' => [
                'extension_loaded' => self::isMongoExtensionAvailable(),
                'connection_available' => self::isMongoDBAvailable()
            ],
            'mysql' => [
                'extension_loaded' => extension_loaded('pdo_mysql'),
                'connection_available' => self::isMySQLAvailable()
            ],
            'php_version' => phpversion(),
            'loaded_extensions' => get_loaded_extensions()
        ];
    }
}

// 只在非直接訪問時記錄狀態
if (!isset($_SERVER['REQUEST_URI']) || !strpos($_SERVER['REQUEST_URI'], 'database.php')) {
    // 資料庫狀態檢查
    $dbStatus = [
        'mongodb' => DatabaseConfig::isMongoDBAvailable(),
        'mysql' => DatabaseConfig::isMySQLAvailable()
    ];
    
    // 記錄資料庫狀態
    error_log('Database Status: ' . json_encode($dbStatus));
}
?> 