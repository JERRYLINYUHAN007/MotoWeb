/**
 * 配置文件 - 環境變數與系統設定
 * 用於在不使用.env文件的情況下管理環境變數
 */

const path = require('path');
const fs = require('fs');

// 基本設定
const config = {
  // 伺服器設定
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost'
  },
  
  // MongoDB 連接設定
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/motoweb',
    uriBackup: process.env.MONGODB_URI_BACKUP || 'mongodb://localhost:27017/motoweb_backup',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // JWT 設定
  jwt: {
    secret: process.env.JWT_SECRET || 'motoweb_default_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // 上傳檔案設定
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || 10485760, // 10MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,webp').split(',')
  },
  
  // 管理員設定
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@motoweb.com',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  
  // 其他設定
  logLevel: process.env.LOG_LEVEL || 'info',
  enableCors: process.env.ENABLE_CORS === 'true' || true,
  
  // 圖片資料夾路徑
  paths: {
    uploads: path.join(__dirname, 'public', 'uploads'),
    bikeImages: path.join(__dirname, 'public', 'uploads', 'scraped-bikes')
  }
};

// 確保上傳目錄存在
Object.values(config.paths).forEach(dirPath => {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`創建目錄: ${dirPath}`);
    } catch (err) {
      console.warn(`無法創建目錄 ${dirPath}: ${err.message}`);
    }
  }
});

// 嘗試從本地.env文件載入（如果存在）
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log('找到.env文件，正在載入環境變數...');
    require('dotenv').config();
    
    // 重新載入配置
    config.server.port = process.env.PORT || config.server.port;
    config.server.nodeEnv = process.env.NODE_ENV || config.server.nodeEnv;
    config.mongodb.uri = process.env.MONGODB_URI || config.mongodb.uri;
    config.mongodb.uriBackup = process.env.MONGODB_URI_BACKUP || config.mongodb.uriBackup;
    config.jwt.secret = process.env.JWT_SECRET || config.jwt.secret;
    config.jwt.expiresIn = process.env.JWT_EXPIRES_IN || config.jwt.expiresIn;
    config.upload.maxFileSize = process.env.MAX_FILE_SIZE || config.upload.maxFileSize;
    config.upload.allowedFileTypes = process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : config.upload.allowedFileTypes;
    config.admin.email = process.env.ADMIN_EMAIL || config.admin.email;
    config.admin.password = process.env.ADMIN_PASSWORD || config.admin.password;
    config.logLevel = process.env.LOG_LEVEL || config.logLevel;
    config.enableCors = process.env.ENABLE_CORS === 'true' || config.enableCors;
  }
} catch (err) {
  console.warn('載入.env文件時出錯:', err.message);
  console.warn('使用默認配置繼續...');
}

module.exports = config; 