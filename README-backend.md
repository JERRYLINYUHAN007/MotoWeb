# MotoMod 後端系統說明文檔

## 後端技術架構

MotoMod 後端基於 Node.js 和 Express.js 框架構建，採用 MongoDB 作為資料庫。系統提供完整的 RESTful API 以支援前端功能。

### 核心技術

- **Node.js**: 執行環境
- **Express.js**: Web 應用框架
- **MongoDB**: NoSQL 資料庫
- **JWT**: 用戶認證
- **Multer**: 文件上傳處理
- **Bcrypt**: 密碼加密
- **Dotenv**: 環境變數管理

## 系統功能

### 1. 用戶管理

- 用戶註冊
- 用戶登入
- 個人資料管理
- 頭像上傳
- 權限控制

### 2. 改裝案例

- 案例列表與分頁
- 案例詳情
- 案例發布
- 案例點讚
- 案例評論

### 3. 產品管理

- 產品列表與分頁
- 產品篩選(類別、價格、品牌)
- 產品搜尋

### 4. 社群文章

- 文章列表與分頁
- 文章發布
- 文章分類與標籤

### 5. 活動管理

- 活動列表與分頁
- 活動篩選(日期、類型)
- 活動搜尋

### 6. 文件管理

- 圖片上傳
- 多種格式支援

## API 說明

### 用戶相關 API

- `POST /api/register`: 用戶註冊
- `POST /api/login`: 用戶登入
- `GET /api/profile`: 獲取個人資料
- `PUT /api/profile`: 更新個人資料
- `POST /api/profile/avatar`: 上傳頭像

### 改裝案例 API

- `GET /api/showcase`: 獲取改裝案例列表
- `GET /api/showcase/:id`: 獲取特定改裝案例
- `POST /api/showcase`: 創建改裝案例
- `POST /api/showcase/:id/like`: 點讚改裝案例
- `POST /api/showcase/:id/comment`: 評論改裝案例

### 產品相關 API

- `GET /api/products`: 獲取產品列表

### 社群文章 API

- `GET /api/posts`: 獲取文章列表
- `POST /api/posts`: 發布文章

### 活動相關 API

- `GET /api/events`: 獲取活動列表

### 文件上傳 API

- `POST /api/upload/:type`: 上傳圖片

## 數據模型

### 用戶 (User)

```js
{
  username: String,
  email: String,
  password: String, // 加密後的密碼
  role: String, // 'admin' 或 'user'
  createdAt: Date,
  profile: {
    avatar: String, // 頭像URL
    bio: String,
    location: String,
    favoriteModels: [String],
    social: {
      facebook: String,
      instagram: String,
      // 其他社交媒體
    }
  }
}
```

### 改裝案例 (Showcase)

```js
{
  title: String,
  description: String,
  author: String, // 用戶名
  authorId: ObjectId, // 用戶ID參考
  createdAt: Date,
  likes: Number,
  comments: [
    {
      _id: ObjectId,
      content: String,
      author: String,
      authorId: ObjectId,
      createdAt: Date
    }
  ],
  commentCount: Number,
  parts: [
    {
      name: String,
      price: String
    }
  ],
  specifications: Object, // 例如 { '馬力': '95.2 hp', '車重': '202 kg' }
  images: [String], // 圖片URL數組
  beforeImage: String, // 改裝前圖片URL
  afterImage: String // 改裝後圖片URL
}
```

### 產品 (Product)

```js
{
  name: String,
  description: String,
  category: String,
  price: Number,
  brand: String,
  stock: Number,
  images: [String], // 圖片URL數組
  compatibility: [String], // 適用車型
  specifications: Object, // 例如 { '材質': '鈦合金', '重量': '3.2 kg' }
  createdAt: Date
}
```

### 文章 (Post)

```js
{
  title: String,
  content: String,
  category: String,
  tags: [String],
  author: String,
  authorId: ObjectId,
  createdAt: Date,
  likes: Number,
  comments: [
    {
      _id: ObjectId,
      content: String,
      author: String,
      authorId: ObjectId,
      createdAt: Date
    }
  ],
  commentCount: Number,
  views: Number
}
```

### 活動 (Event)

```js
{
  title: String,
  description: String,
  category: String,
  location: String,
  eventDate: Date,
  endDate: Date,
  createdAt: Date,
  organizer: String,
  imageUrl: String,
  attendees: [ObjectId], // 參與者的用戶ID
  maxAttendees: Number
}
```

## 部署指南

### 預先準備

1. 安裝 Node.js (推薦 v14 或更高版本)
2. 安裝 MongoDB (本地或雲服務)
3. 準備部署環境 (VPS, AWS, Heroku 等)

### 部署步驟

1. 克隆專案代碼:

```bash
git clone <repository-url>
cd motomod
```

2. 安裝依賴:

```bash
npm install
```

3. 創建並設定 `.env` 文件:

```
PORT=3001
MONGO_URI=mongodb://<your-mongodb-uri>/motomod
JWT_SECRET=<your-secret-key>
```

4. 初始化資料庫 (選擇性):

```bash
node initDB.js
```

5. 啟動服務:

#### 開發環境
```bash
npm run dev
```

#### 生產環境
```bash
npm start
```

### 使用 PM2 進行生產部署

1. 安裝 PM2:

```bash
npm install -g pm2
```

2. 啟動應用:

```bash
pm2 start server.js --name motomod
```

3. 設定自動啟動:

```bash
pm2 startup
pm2 save
```

### 使用 Docker 部署 (選擇性)

1. 構建 Docker 映像:

```bash
docker build -t motomod .
```

2. 運行容器:

```bash
docker run -p 3001:3001 --env-file .env -d motomod
```

## 安全性考量

1. 所有密碼都使用 bcrypt 加密
2. 使用 JWT 進行用戶認證
3. 文件上傳有大小和類型限制
4. API 端點有適當的授權檢查

## 資料庫管理

1. MongoDB 備份:

```bash
mongodump --uri="mongodb://<your-mongodb-uri>/motomod" --out=./backup
```

2. MongoDB 恢復:

```bash
mongorestore --uri="mongodb://<your-mongodb-uri>/motomod" ./backup
```

## 後端擴展建議

1. 實現更多社交功能，如關注、推薦和通知系統
2. 增加搜尋和推薦功能，基於使用者活動和偏好
3. 實現即時聊天功能，使用 Socket.io
4. 實現簡單的電子商務功能，包括購物車和付款整合
5. 添加數據分析和報表功能 