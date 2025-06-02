<?php
/**
 * 檔案處理控制器
 * 處理檔案上傳、圖片處理、檔案管理等功能
 */

class FileController extends BaseController {
    private $upload_path = 'uploads/';
    private $max_file_size = 10485760; // 10MB
    
    public function __construct() {
        parent::__construct();
        $this->createUploadDirectory($this->upload_path);
    }
    
    /**
     * 檔案上傳
     */
    public function uploadFile($params = []) {
        $user = $this->getCurrentUser();
        $files = Router::getUploadedFiles();
        
        if (empty($files['file'])) {
            $this->jsonError('No file uploaded', 400);
        }
        
        $file = $files['file'];
        
        // 驗證檔案
        $this->validateFile($file);
        
        // 生成檔案 ID 和路徑
        $file_id = $this->generateId('file_');
        $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $stored_name = $file_id . '.' . $file_extension;
        $file_path = $this->upload_path . $stored_name;
        
        // 移動檔案
        if (!move_uploaded_file($file['tmp_name'], $file_path)) {
            $this->jsonError('Failed to upload file', 500);
        }
        
        // 記錄到資料庫
        $file_record = [
            'file_id' => $file_id,
            'original_name' => $file['name'],
            'stored_name' => $stored_name,
            'file_type' => $file['type'],
            'file_size' => $file['size'],
            'upload_path' => $file_path,
            'user_id' => $user['user_id'],
            'status' => 'completed',
            'metadata' => json_encode([
                'upload_time' => date('Y-m-d H:i:s'),
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null
            ])
        ];
        
        $this->saveFileRecord($file_record);
        
        // 記錄活動
        $this->logActivity($user['user_id'], 'file_upload', 'file', $file_id, [
            'file_name' => $file['name'],
            'file_size' => $this->formatFileSize($file['size'])
        ]);
        
        $this->jsonSuccess([
            'file_id' => $file_id,
            'file_name' => $file['name'],
            'file_size' => $this->formatFileSize($file['size']),
            'file_url' => '/php-backend/' . $file_path
        ], 'File uploaded successfully');
    }
    
    /**
     * 圖片調整大小
     */
    public function resizeImage($params = []) {
        $user = $this->getCurrentUser();
        $data = Router::getRequestBody();
        
        $this->validateRequired($data, ['file_id', 'width', 'height']);
        
        $file_record = $this->getFileRecord($data['file_id']);
        
        if (!$file_record) {
            $this->jsonError('File not found', 404);
        }
        
        $source_path = $file_record['upload_path'];
        
        if (!file_exists($source_path)) {
            $this->jsonError('Source file not found', 404);
        }
        
        // 檢查是否為圖片
        if (!$this->isImage($file_record['file_type'])) {
            $this->jsonError('File is not an image', 400);
        }
        
        $width = intval($data['width']);
        $height = intval($data['height']);
        
        // 生成新檔案名稱
        $resized_id = $this->generateId('resized_');
        $file_extension = pathinfo($file_record['stored_name'], PATHINFO_EXTENSION);
        $resized_name = $resized_id . '_' . $width . 'x' . $height . '.' . $file_extension;
        $resized_path = $this->upload_path . 'resized/' . $resized_name;
        
        $this->createUploadDirectory(dirname($resized_path));
        
        // 調整圖片大小
        if ($this->resizeImageFile($source_path, $resized_path, $width, $height)) {
            // 記錄新檔案
            $resized_record = [
                'file_id' => $resized_id,
                'original_name' => 'resized_' . $file_record['original_name'],
                'stored_name' => $resized_name,
                'file_type' => $file_record['file_type'],
                'file_size' => filesize($resized_path),
                'upload_path' => $resized_path,
                'user_id' => $user['user_id'],
                'status' => 'completed',
                'metadata' => json_encode([
                    'original_file_id' => $data['file_id'],
                    'resize_dimensions' => $width . 'x' . $height,
                    'processed_time' => date('Y-m-d H:i:s')
                ])
            ];
            
            $this->saveFileRecord($resized_record);
            
            $this->jsonSuccess([
                'file_id' => $resized_id,
                'file_name' => $resized_record['original_name'],
                'file_size' => $this->formatFileSize($resized_record['file_size']),
                'file_url' => '/php-backend/' . $resized_path,
                'dimensions' => $width . 'x' . $height
            ], 'Image resized successfully');
        } else {
            $this->jsonError('Failed to resize image', 500);
        }
    }
    
    /**
     * 檔案下載
     */
    public function downloadFile($params = []) {
        if (!isset($params['id'])) {
            $this->jsonError('File ID required', 400);
        }
        
        $file_record = $this->getFileRecord($params['id']);
        
        if (!$file_record) {
            $this->jsonError('File not found', 404);
        }
        
        $file_path = $file_record['upload_path'];
        
        if (!file_exists($file_path)) {
            $this->jsonError('File not found on disk', 404);
        }
        
        // 設定下載標頭
        header('Content-Type: ' . $file_record['file_type']);
        header('Content-Disposition: attachment; filename="' . $file_record['original_name'] . '"');
        header('Content-Length: ' . filesize($file_path));
        
        readfile($file_path);
        exit;
    }
    
    /**
     * 刪除檔案
     */
    public function deleteFile($params = []) {
        $user = $this->getCurrentUser();
        
        if (!isset($params['id'])) {
            $this->jsonError('File ID required', 400);
        }
        
        $file_record = $this->getFileRecord($params['id']);
        
        if (!$file_record) {
            $this->jsonError('File not found', 404);
        }
        
        // 檢查權限 (只能刪除自己的檔案或管理員可以刪除任何檔案)
        if ($file_record['user_id'] !== $user['user_id'] && $user['role'] !== 'admin') {
            $this->jsonError('Permission denied', 403);
        }
        
        // 刪除實際檔案
        if (file_exists($file_record['upload_path'])) {
            unlink($file_record['upload_path']);
        }
        
        // 從資料庫刪除記錄
        $this->deleteFileRecord($params['id']);
        
        // 記錄活動
        $this->logActivity($user['user_id'], 'file_delete', 'file', $params['id'], [
            'file_name' => $file_record['original_name']
        ]);
        
        $this->jsonSuccess(null, 'File deleted successfully');
    }
    
    /**
     * 驗證檔案
     */
    private function validateFile($file) {
        // 檢查上傳錯誤
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $error_messages = [
                UPLOAD_ERR_INI_SIZE => 'File too large (server limit)',
                UPLOAD_ERR_FORM_SIZE => 'File too large (form limit)',
                UPLOAD_ERR_PARTIAL => 'File upload incomplete',
                UPLOAD_ERR_NO_FILE => 'No file uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'No temporary directory',
                UPLOAD_ERR_CANT_WRITE => 'Cannot write to disk',
                UPLOAD_ERR_EXTENSION => 'Upload stopped by extension'
            ];
            
            $message = $error_messages[$file['error']] ?? 'Upload error';
            $this->jsonError($message, 400);
        }
        
        // 檢查檔案大小
        if ($file['size'] > $this->max_file_size) {
            $this->jsonError('File too large. Maximum size: ' . $this->formatFileSize($this->max_file_size), 400);
        }
        
        // 檢查檔案類型
        $allowed_types = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'application/json'
        ];
        
        if (!$this->validateFileType($file['type'], $allowed_types)) {
            $this->jsonError('File type not allowed', 400);
        }
        
        return true;
    }
    
    /**
     * 調整圖片大小 (簡單實作)
     */
    private function resizeImageFile($source, $destination, $width, $height) {
        $info = getimagesize($source);
        
        if (!$info) {
            return false;
        }
        
        $mime = $info['mime'];
        
        switch ($mime) {
            case 'image/jpeg':
                $source_image = imagecreatefromjpeg($source);
                break;
            case 'image/png':
                $source_image = imagecreatefrompng($source);
                break;
            case 'image/gif':
                $source_image = imagecreatefromgif($source);
                break;
            default:
                return false;
        }
        
        $resized_image = imagecreatetruecolor($width, $height);
        
        // 保持透明度 (PNG/GIF)
        if ($mime === 'image/png' || $mime === 'image/gif') {
            imagealphablending($resized_image, false);
            imagesavealpha($resized_image, true);
            $transparent = imagecolorallocatealpha($resized_image, 255, 255, 255, 127);
            imagefill($resized_image, 0, 0, $transparent);
        }
        
        imagecopyresampled(
            $resized_image, $source_image,
            0, 0, 0, 0,
            $width, $height,
            imagesx($source_image), imagesy($source_image)
        );
        
        $result = false;
        
        switch ($mime) {
            case 'image/jpeg':
                $result = imagejpeg($resized_image, $destination, 90);
                break;
            case 'image/png':
                $result = imagepng($resized_image, $destination);
                break;
            case 'image/gif':
                $result = imagegif($resized_image, $destination);
                break;
        }
        
        imagedestroy($source_image);
        imagedestroy($resized_image);
        
        return $result;
    }
    
    /**
     * 檢查是否為圖片
     */
    private function isImage($mime_type) {
        return strpos($mime_type, 'image/') === 0;
    }
    
    /**
     * 儲存檔案記錄
     */
    private function saveFileRecord($record) {
        $stmt = $this->mysql->prepare("
            INSERT INTO file_uploads (file_id, original_name, stored_name, file_type, file_size, upload_path, user_id, status, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        return $stmt->execute([
            $record['file_id'],
            $record['original_name'],
            $record['stored_name'],
            $record['file_type'],
            $record['file_size'],
            $record['upload_path'],
            $record['user_id'],
            $record['status'],
            $record['metadata']
        ]);
    }
    
    /**
     * 獲取檔案記錄
     */
    private function getFileRecord($file_id) {
        $stmt = $this->mysql->prepare("SELECT * FROM file_uploads WHERE file_id = ?");
        $stmt->execute([$file_id]);
        return $stmt->fetch();
    }
    
    /**
     * 刪除檔案記錄
     */
    private function deleteFileRecord($file_id) {
        $stmt = $this->mysql->prepare("DELETE FROM file_uploads WHERE file_id = ?");
        return $stmt->execute([$file_id]);
    }
}
?> 