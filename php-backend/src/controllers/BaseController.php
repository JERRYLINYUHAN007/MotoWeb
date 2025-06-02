<?php
/**
 * 基礎控制器
 * 提供共用功能和輔助方法
 */

abstract class BaseController {
    protected $db;
    protected $mysql;
    
    public function __construct() {
        // 初始化資料庫連接
        try {
            $this->db = get_database_connection('mongodb');
            $this->mysql = get_database_connection('mysql');
        } catch (Exception $e) {
            $this->jsonError('Database connection failed', 500);
        }
    }
    
    /**
     * 返回 JSON 成功響應
     */
    protected function jsonSuccess($data = null, $message = 'Success', $code = 200) {
        http_response_code($code);
        $response = [
            'status' => 'success',
            'message' => $message,
            'code' => $code,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    /**
     * 返回 JSON 錯誤響應
     */
    protected function jsonError($message = 'Error', $code = 400, $details = null) {
        http_response_code($code);
        $response = [
            'status' => 'error',
            'message' => $message,
            'code' => $code,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        if ($details !== null) {
            $response['details'] = $details;
        }
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    /**
     * 驗證必需參數
     */
    protected function validateRequired($data, $required_fields) {
        $missing = [];
        
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $missing[] = $field;
            }
        }
        
        if (!empty($missing)) {
            $this->jsonError('Missing required fields: ' . implode(', ', $missing), 400);
        }
        
        return true;
    }
    
    /**
     * 獲取當前用戶
     */
    protected function getCurrentUser() {
        $user = Router::validateToken();
        
        if (!$user) {
            $this->jsonError('Unauthorized', 401);
        }
        
        return $user;
    }
    
    /**
     * 檢查用戶權限
     */
    protected function checkPermission($required_role = 'user') {
        $user = $this->getCurrentUser();
        
        $roles_hierarchy = ['user', 'moderator', 'admin', 'super_admin'];
        $user_level = array_search($user['role'], $roles_hierarchy);
        $required_level = array_search($required_role, $roles_hierarchy);
        
        if ($user_level === false || $required_level === false || $user_level < $required_level) {
            $this->jsonError('Insufficient permissions', 403);
        }
        
        return $user;
    }
    
    /**
     * 記錄用戶活動
     */
    protected function logActivity($user_id, $action, $resource_type = null, $resource_id = null, $metadata = []) {
        try {
            $stmt = $this->mysql->prepare("
                INSERT INTO user_activities (user_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $user_id,
                $action,
                $resource_type,
                $resource_id,
                json_encode($metadata),
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
        } catch (Exception $e) {
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
    
    /**
     * 分頁輔助函數
     */
    protected function paginate($query_params, $default_limit = 20, $max_limit = 100) {
        $page = max(1, intval($query_params['page'] ?? 1));
        $limit = min($max_limit, max(1, intval($query_params['limit'] ?? $default_limit)));
        $offset = ($page - 1) * $limit;
        
        return [
            'page' => $page,
            'limit' => $limit,
            'offset' => $offset
        ];
    }
    
    /**
     * 清理輸入資料
     */
    protected function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([$this, 'sanitizeInput'], $data);
        }
        
        return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * 驗證電子郵件
     */
    protected function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * 生成唯一 ID
     */
    protected function generateId($prefix = '') {
        return $prefix . uniqid() . '_' . bin2hex(random_bytes(8));
    }
    
    /**
     * 格式化檔案大小
     */
    protected function formatFileSize($bytes) {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
    
    /**
     * 驗證檔案類型
     */
    protected function validateFileType($file_type, $allowed_types = []) {
        if (empty($allowed_types)) {
            $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        }
        
        return in_array($file_type, $allowed_types);
    }
    
    /**
     * 建立檔案上傳目錄
     */
    protected function createUploadDirectory($path) {
        if (!is_dir($path)) {
            return mkdir($path, 0755, true);
        }
        return true;
    }
}
?> 