<?php
/**
 * 報表控制器
 * 處理系統分析和報表生成
 */

class ReportController extends BaseController {
    
    /**
     * 用戶報表
     */
    public function getUserReport($params = []) {
        $user = $this->checkPermission('admin');
        $query_params = Router::getQueryParams();
        
        $date_from = $query_params['date_from'] ?? date('Y-m-01');
        $date_to = $query_params['date_to'] ?? date('Y-m-d');
        
        // 用戶註冊統計
        $user_stats = $this->db->users->aggregate([
            [
                '$match' => [
                    'created_at' => [
                        '$gte' => new MongoDB\BSON\UTCDateTime(strtotime($date_from) * 1000),
                        '$lte' => new MongoDB\BSON\UTCDateTime(strtotime($date_to . ' 23:59:59') * 1000)
                    ]
                ]
            ],
            [
                '$group' => [
                    '_id' => [
                        'year' => ['$year' => '$created_at'],
                        'month' => ['$month' => '$created_at'],
                        'day' => ['$dayOfMonth' => '$created_at']
                    ],
                    'count' => ['$sum' => 1]
                ]
            ],
            ['$sort' => ['_id' => 1]]
        ])->toArray();
        
        // 用戶角色分佈
        $role_distribution = $this->db->users->aggregate([
            [
                '$group' => [
                    '_id' => '$role',
                    'count' => ['$sum' => 1]
                ]
            ]
        ])->toArray();
        
        // 活躍用戶統計
        $active_users = $this->getActiveUsersCount($date_from, $date_to);
        
        $this->jsonSuccess([
            'period' => [
                'from' => $date_from,
                'to' => $date_to
            ],
            'registration_stats' => $user_stats,
            'role_distribution' => $role_distribution,
            'active_users' => $active_users,
            'total_users' => $this->db->users->countDocuments()
        ]);
    }
    
    /**
     * 活動報表
     */
    public function getActivityReport($params = []) {
        $user = $this->checkPermission('admin');
        $query_params = Router::getQueryParams();
        
        $date_from = $query_params['date_from'] ?? date('Y-m-01');
        $date_to = $query_params['date_to'] ?? date('Y-m-d');
        
        // 從 MySQL 獲取活動統計
        $stmt = $this->mysql->prepare("
            SELECT 
                action,
                COUNT(*) as count,
                DATE(created_at) as date
            FROM user_activities 
            WHERE created_at BETWEEN ? AND ?
            GROUP BY action, DATE(created_at)
            ORDER BY date DESC, count DESC
        ");
        
        $stmt->execute([$date_from, $date_to . ' 23:59:59']);
        $activity_stats = $stmt->fetchAll();
        
        // 熱門操作
        $stmt = $this->mysql->prepare("
            SELECT 
                action,
                COUNT(*) as count
            FROM user_activities 
            WHERE created_at BETWEEN ? AND ?
            GROUP BY action
            ORDER BY count DESC
            LIMIT 10
        ");
        
        $stmt->execute([$date_from, $date_to . ' 23:59:59']);
        $popular_actions = $stmt->fetchAll();
        
        // 頁面瀏覽統計
        $stmt = $this->mysql->prepare("
            SELECT 
                page_url,
                COUNT(*) as views,
                COUNT(DISTINCT user_id) as unique_visitors,
                AVG(duration) as avg_duration
            FROM page_views 
            WHERE created_at BETWEEN ? AND ?
            GROUP BY page_url
            ORDER BY views DESC
            LIMIT 20
        ");
        
        $stmt->execute([$date_from, $date_to . ' 23:59:59']);
        $page_stats = $stmt->fetchAll();
        
        $this->jsonSuccess([
            'period' => [
                'from' => $date_from,
                'to' => $date_to
            ],
            'activity_stats' => $activity_stats,
            'popular_actions' => $popular_actions,
            'page_stats' => $page_stats
        ]);
    }
    
    /**
     * 分析報表
     */
    public function getAnalyticsReport($params = []) {
        $user = $this->checkPermission('admin');
        $query_params = Router::getQueryParams();
        
        // 內容統計
        $content_stats = [
            'posts' => [
                'total' => $this->db->posts->countDocuments(),
                'published' => $this->db->posts->countDocuments(['status' => 'published']),
                'draft' => $this->db->posts->countDocuments(['status' => 'draft'])
            ],
            'categories' => $this->db->categories->countDocuments(),
            'users' => $this->db->users->countDocuments()
        ];
        
        // 熱門文章
        $popular_posts = $this->db->posts->find(
            ['status' => 'published'],
            [
                'sort' => ['views' => -1, 'likes' => -1],
                'limit' => 10,
                'projection' => ['title' => 1, 'views' => 1, 'likes' => 1, 'created_at' => 1]
            ]
        )->toArray();
        
        // 檔案上傳統計
        $stmt = $this->mysql->prepare("
            SELECT 
                file_type,
                COUNT(*) as count,
                SUM(file_size) as total_size,
                AVG(file_size) as avg_size
            FROM file_uploads 
            WHERE status = 'completed'
            GROUP BY file_type
            ORDER BY count DESC
        ");
        
        $stmt->execute();
        $file_stats = $stmt->fetchAll();
        
        // 系統性能指標
        $system_info = [
            'php_version' => PHP_VERSION,
            'memory_usage' => [
                'current' => memory_get_usage(true),
                'peak' => memory_get_peak_usage(true),
                'limit' => ini_get('memory_limit')
            ],
            'disk_usage' => [
                'free' => disk_free_space('.'),
                'total' => disk_total_space('.')
            ]
        ];
        
        $this->jsonSuccess([
            'content_stats' => $content_stats,
            'popular_posts' => $popular_posts,
            'file_stats' => $file_stats,
            'system_info' => $system_info
        ]);
    }
    
    /**
     * 導出報表
     */
    public function exportReport($params = []) {
        $user = $this->checkPermission('admin');
        $data = Router::getRequestBody();
        
        $this->validateRequired($data, ['report_type', 'format']);
        
        $report_type = $data['report_type'];
        $format = $data['format']; // csv, json, pdf
        $date_from = $data['date_from'] ?? date('Y-m-01');
        $date_to = $data['date_to'] ?? date('Y-m-d');
        
        switch ($report_type) {
            case 'users':
                $report_data = $this->generateUserReport($date_from, $date_to);
                break;
            case 'activities':
                $report_data = $this->generateActivityReport($date_from, $date_to);
                break;
            case 'analytics':
                $report_data = $this->generateAnalyticsReport();
                break;
            default:
                $this->jsonError('Invalid report type', 400);
        }
        
        $filename = $report_type . '_report_' . date('Y-m-d_H-i-s');
        
        switch ($format) {
            case 'csv':
                $file_path = $this->exportToCsv($report_data, $filename);
                break;
            case 'json':
                $file_path = $this->exportToJson($report_data, $filename);
                break;
            case 'pdf':
                $file_path = $this->exportToPdf($report_data, $filename);
                break;
            default:
                $this->jsonError('Invalid export format', 400);
        }
        
        // 記錄活動
        $this->logActivity($user['user_id'], 'report_export', 'report', null, [
            'report_type' => $report_type,
            'format' => $format,
            'file_path' => $file_path
        ]);
        
        $this->jsonSuccess([
            'file_path' => $file_path,
            'download_url' => '/php-backend/' . $file_path
        ], 'Report exported successfully');
    }
    
    /**
     * 獲取活躍用戶數量
     */
    private function getActiveUsersCount($date_from, $date_to) {
        $stmt = $this->mysql->prepare("
            SELECT COUNT(DISTINCT user_id) as active_users
            FROM user_activities 
            WHERE created_at BETWEEN ? AND ?
        ");
        
        $stmt->execute([$date_from, $date_to . ' 23:59:59']);
        $result = $stmt->fetch();
        
        return $result['active_users'] ?? 0;
    }
    
    /**
     * 生成用戶報表數據
     */
    private function generateUserReport($date_from, $date_to) {
        $users = $this->db->users->find([
            'created_at' => [
                '$gte' => new MongoDB\BSON\UTCDateTime(strtotime($date_from) * 1000),
                '$lte' => new MongoDB\BSON\UTCDateTime(strtotime($date_to . ' 23:59:59') * 1000)
            ]
        ])->toArray();
        
        return array_map(function($user) {
            return [
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'created_at' => $user['created_at']->toDateTime()->format('Y-m-d H:i:s'),
                'last_login' => $user['last_login'] ?? null
            ];
        }, $users);
    }
    
    /**
     * 導出為 CSV
     */
    private function exportToCsv($data, $filename) {
        $file_path = 'exports/' . $filename . '.csv';
        $this->createUploadDirectory(dirname($file_path));
        
        $fp = fopen($file_path, 'w');
        
        if (!empty($data)) {
            // 寫入標題行
            fputcsv($fp, array_keys($data[0]));
            
            // 寫入數據行
            foreach ($data as $row) {
                fputcsv($fp, $row);
            }
        }
        
        fclose($fp);
        return $file_path;
    }
    
    /**
     * 導出為 JSON
     */
    private function exportToJson($data, $filename) {
        $file_path = 'exports/' . $filename . '.json';
        $this->createUploadDirectory(dirname($file_path));
        
        file_put_contents($file_path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        return $file_path;
    }
    
    /**
     * 導出為 PDF (簡單實作)
     */
    private function exportToPdf($data, $filename) {
        // 這裡需要 PDF 生成庫，暫時返回 HTML 格式
        $file_path = 'exports/' . $filename . '.html';
        $this->createUploadDirectory(dirname($file_path));
        
        $html = '<html><head><title>Report</title></head><body>';
        $html .= '<h1>Report Generated on ' . date('Y-m-d H:i:s') . '</h1>';
        $html .= '<table border="1"><tr>';
        
        if (!empty($data)) {
            // 標題行
            foreach (array_keys($data[0]) as $header) {
                $html .= '<th>' . htmlspecialchars($header) . '</th>';
            }
            $html .= '</tr>';
            
            // 數據行
            foreach ($data as $row) {
                $html .= '<tr>';
                foreach ($row as $cell) {
                    $html .= '<td>' . htmlspecialchars($cell) . '</td>';
                }
                $html .= '</tr>';
            }
        }
        
        $html .= '</table></body></html>';
        
        file_put_contents($file_path, $html);
        
        return $file_path;
    }
}
?> 