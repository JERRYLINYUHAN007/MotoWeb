<?php
/**
 * 簡單的 PHP 路由器
 * 支援 RESTful API 路由
 */

class Router {
    private $routes = [];
    private $groupPrefix = '';
    
    public function __construct() {
        // 初始化路由
    }
    
    /**
     * 添加 GET 路由
     */
    public function get($pattern, $callback) {
        $this->addRoute('GET', $pattern, $callback);
    }
    
    /**
     * 添加 POST 路由
     */
    public function post($pattern, $callback) {
        $this->addRoute('POST', $pattern, $callback);
    }
    
    /**
     * 添加 PUT 路由
     */
    public function put($pattern, $callback) {
        $this->addRoute('PUT', $pattern, $callback);
    }
    
    /**
     * 添加 DELETE 路由
     */
    public function delete($pattern, $callback) {
        $this->addRoute('DELETE', $pattern, $callback);
    }
    
    /**
     * 路由群組
     */
    public function group($prefix, $callback) {
        $originalPrefix = $this->groupPrefix;
        $this->groupPrefix = $originalPrefix . $prefix;
        
        $callback($this);
        
        $this->groupPrefix = $originalPrefix;
    }
    
    /**
     * 添加路由
     */
    private function addRoute($method, $pattern, $callback) {
        $fullPattern = $this->groupPrefix . $pattern;
        $this->routes[] = [
            'method' => $method,
            'pattern' => $fullPattern,
            'callback' => $callback
        ];
    }
    
    /**
     * 執行路由匹配
     */
    public function run() {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        foreach ($this->routes as $route) {
            if ($route['method'] === $method) {
                $params = $this->matchRoute($route['pattern'], $uri);
                if ($params !== false) {
                    return $this->executeCallback($route['callback'], $params);
                }
            }
        }
        
        // 404 Not Found
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Route not found',
            'path' => $uri,
            'method' => $method
        ]);
    }
    
    /**
     * 匹配路由模式
     */
    private function matchRoute($pattern, $uri) {
        // 將路由模式轉換為正則表達式
        $regex = preg_replace('/\{([^}]+)\}/', '([^/]+)', $pattern);
        $regex = '#^' . $regex . '$#';
        
        if (preg_match($regex, $uri, $matches)) {
            array_shift($matches); // 移除完整匹配
            
            // 提取參數名稱
            preg_match_all('/\{([^}]+)\}/', $pattern, $paramNames);
            $paramNames = $paramNames[1];
            
            $params = [];
            foreach ($paramNames as $index => $name) {
                $params[$name] = $matches[$index] ?? null;
            }
            
            return $params;
        }
        
        return false;
    }
    
    /**
     * 執行回調函數
     */
    private function executeCallback($callback, $params = []) {
        if (is_callable($callback)) {
            if (is_array($callback) && count($callback) === 2) {
                // 控制器方法
                $controller = $callback[0];
                $method = $callback[1];
                
                if (method_exists($controller, $method)) {
                    return $controller->$method($params);
                }
            } else {
                // 匿名函數
                return $callback($params);
            }
        }
        
        throw new Exception('Invalid callback');
    }
    
    /**
     * 獲取請求體內容
     */
    public static function getRequestBody() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }
    
    /**
     * 獲取查詢參數
     */
    public static function getQueryParams() {
        return $_GET;
    }
    
    /**
     * 獲取上傳的檔案
     */
    public static function getUploadedFiles() {
        return $_FILES;
    }
    
    /**
     * 獲取請求標頭
     */
    public static function getHeaders() {
        return getallheaders() ?: [];
    }
    
    /**
     * 驗證 JWT Token
     */
    public static function validateToken() {
        $headers = self::getHeaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
            
            // 這裡應該驗證 JWT token
            // 現在先返回模擬的用戶信息
            return [
                'user_id' => 'test_user',
                'username' => 'test',
                'role' => 'user'
            ];
        }
        
        return null;
    }
}
?> 