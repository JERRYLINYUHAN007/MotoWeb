const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cors = require('cors');
const config = require('./config');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();
const PORT = config.server.port;
const JWT_SECRET = process.env.JWT_SECRET || 'motomod_secret_key';

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://Jerry:Jerrylin007@motoweb.xspj1kv.mongodb.net/motoweb?retryWrites=true&w=majority';
let db;

// Enable CORS
if (config.enableCors) {
  app.use(cors());
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set correct character encoding only for HTML files
app.use((req, res, next) => {
  // Only set HTML content type for actual HTML routes/files
  if (req.path.endsWith('.html') || req.path === '/' || (!req.path.includes('.') && !req.path.startsWith('/api'))) {
    res.set('Content-Type', 'text/html; charset=utf-8');
  }
  next();
});

app.use(express.static('public'));

// Additional static file routes to ensure absolute paths work correctly
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type || 'gallery';
    const dir = path.join(__dirname, 'public', 'uploads', type);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/image\/(jpeg|png|gif|jpg)$/)) {
      return cb(new Error('Only JPG, PNG, GIF image formats are allowed!'), false);
    }
    cb(null, true);
  }
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await db.collection('users').findOne({ _id: ObjectId(decoded.userId) });
    
    if (!user) {
      return res.status(401).json({ error: 'User does not exist' });
    }
    
    req.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// 產品資料庫 - 中文產品資料
const productsDatabase = [
    // SYM JET系列
    {
        id: 'jet-z2-pro-fork',
        name: '【怪獸工廠Z2 PRO前叉】',
        category: 'suspension',
        mainCategory: 'sym-jet',
        subCategory: 'JET避震懸吊升級',
        brand: '怪獸工廠',
        price: 18800,
        originalPrice: 21000,
        rating: 4.8,
        reviews: 65,
        bikeType: ['sym-jet'],
        image: '/images/parts/怪獸工廠ZR後避震2.webp',
        images: [
            '/images/parts/怪獸工廠ZR後避震2.webp'
        ],
        description: '專為JET系列設計的高性能Z2 PRO前懸吊，提供卓越的操控性和舒適性',
        fullDescription: '怪獸工廠最新的Z2 PRO避震器採用精密CNC加工和增強阻尼設定，能有效吸收路面衝擊，提升騎乘穩定性。無論是賽道競技或山路巡航，都能帶來極致的騎乘體驗。',
        specifications: {
            '適用車型': 'SYM JET系列',
            '材質': '航太級鋁合金',
            '保固': '一年原廠保固',
            '調整功能': '預載可調、阻尼可調'
        },
        stock: 15,
        isHot: true,
        isNew: false,
        dateAdded: new Date('2024-05-01'),
        tags: ['前叉', '避震', '怪獸工廠', 'JET', '高性能']
    },
    {
        id: 'baphomet-exhaust-bracket',
        name: '【巴風特排氣管吊架】',
        category: 'exhaust',
        mainCategory: 'sym-jet',
        subCategory: 'JET熱門外觀燈係改裝',
        brand: '巴風特',
        price: 2200,
        rating: 4.6,
        reviews: 87,
        bikeType: ['sym-jet'],
        image: '/images/parts/牛王SVR排氣管.webp',
        description: '巴風特排氣管吊架，提供更穩固的支撐和優質音效',
        fullDescription: '巴風特排氣管吊架採用高品質材料製造，不僅提供穩固的支撐，更能優化排氣音效。適合各種騎乘場合使用。',
        specifications: {
            '適用車型': 'SYM JET系列',
            '材質': '高品質不鏽鋼',
            '重量': '0.5kg'
        },
        stock: 25,
        isHot: false,
        isNew: true,
        dateAdded: new Date('2024-06-20'),
        tags: ['排氣管', '吊架', '巴風特', 'JET', '改裝']
    },
    {
        id: 'simota-carbon-mirror',
        name: '【SIMOTA碳纖維後照鏡】',
        category: 'appearance',
        mainCategory: 'sym-jet',
        subCategory: 'JET熱門外觀燈係改裝',
        brand: 'SIMOTA',
        price: 8000,
        rating: 4.7,
        reviews: 43,
        bikeType: ['sym-jet', 'sym-drg'],
        image: '/images/parts/mirrors.svg',
        description: 'SIMOTA碳纖維後照鏡，輕量化設計提升視覺質感',
        fullDescription: 'SIMOTA碳纖維後照鏡採用真碳纖維材質，不僅重量輕，更具備優異的視覺效果。符合法規標準，提供清晰的後方視野。',
        specifications: {
            '適用車型': 'SYM JET/DRG系列',
            '材質': '真碳纖維',
            '重量': '200g/對',
            '認證': 'DOT認證'
        },
        stock: 8,
        isHot: true,
        isNew: false,
        dateAdded: new Date('2024-04-15'),
        tags: ['後照鏡', '碳纖維', 'SIMOTA', 'JET', 'DRG']
    },
    {
        id: 'masa-floating-disc',
        name: '【MASA浮動碟盤】',
        category: 'brakes',
        mainCategory: 'sym-jet',
        subCategory: 'JET煞車制動升級',
        brand: 'MASA',
        price: 2888,
        originalPrice: 3200,
        rating: 4.5,
        reviews: 92,
        bikeType: ['sym-jet'],
        image: '/images/parts/FAR黑金碟盤.webp',
        description: 'MASA浮動碟盤，提升制動效能和散熱性能',
        fullDescription: 'MASA浮動碟盤採用浮動式設計，能有效減少熱變形，提升制動穩定性。高品質鋼材製造，耐用性佳。',
        specifications: {
            '適用車型': 'SYM JET系列',
            '材質': '高碳鋼',
            '直徑': '260mm',
            '厚度': '4mm'
        },
        stock: 20,
        isHot: false,
        isNew: false,
        dateAdded: new Date('2024-03-10'),
        tags: ['碟盤', '煞車', 'MASA', 'JET', '浮動']
    },
    {
        id: 'koso-chest-cover',
        name: '【KOSO導風胸蓋】',
        category: 'appearance',
        mainCategory: 'sym-jet',
        subCategory: 'JET熱門外觀燈係改裝',
        brand: 'KOSO',
        price: 1600,
        rating: 4.4,
        reviews: 156,
        bikeType: ['sym-jet'],
        image: '/images/parts/KOSO導風胸蓋.webp',
        description: 'KOSO導風胸蓋，優化氣流並提升外觀質感',
        fullDescription: 'KOSO導風胸蓋設計精良，不僅能優化引擎散熱氣流，更提升整體外觀質感。安裝簡易，品質可靠。',
        specifications: {
            '適用車型': 'SYM JET系列',
            '材質': '高品質ABS塑料',
            '功能': '導風散熱'
        },
        stock: 30,
        isHot: true,
        isNew: false,
        dateAdded: new Date('2024-02-28'),
        tags: ['胸蓋', '導風', 'KOSO', 'JET', '外觀']
    },
    {
        id: 'koso-dragon-turn-signal',
        name: '【KOSO龍紋序列式方向燈】',
        category: 'electronics',
        mainCategory: 'sym-jet',
        subCategory: 'JET熱門外觀燈係改裝',
        brand: 'KOSO',
        price: 6500,
        rating: 4.8,
        reviews: 78,
        bikeType: ['sym-jet', 'yamaha-force'],
        image: '/images/parts/KOSO龍紋序列式方向燈.webp',
        description: 'KOSO龍紋序列式方向燈，時尚LED設計提升安全性',
        fullDescription: 'KOSO龍紋序列式方向燈採用LED序列式設計，不僅外觀時尚，更能提升夜間騎乘安全性。通過車安認證。',
        specifications: {
            '適用車型': 'SYM JET系列、YAMAHA FORCE系列',
            '燈源': 'LED',
            '功率': '12V',
            '認證': '車安認證'
        },
        stock: 12,
        isHot: true,
        isNew: true,
        dateAdded: new Date('2024-06-18'),
        tags: ['方向燈', '龍紋', 'KOSO', 'LED', '序列式']
    },
    {
        id: 'skuny-headlight-armor',
        name: '【SKUNY大燈護甲】',
        category: 'appearance',
        mainCategory: 'sym-jet',
        subCategory: 'JET熱門外觀燈係改裝',
        brand: 'SKUNY',
        price: 990,
        rating: 4.2,
        reviews: 134,
        bikeType: ['sym-jet'],
        image: '/images/parts/skuny-headlight-armor.webp',
        description: 'SKUNY大燈護甲，保護大燈免受損傷',
        fullDescription: 'SKUNY大燈護甲採用高韌性材料製造，能有效保護大燈免受碎石撞擊。透明設計不影響照明效果。',
        specifications: {
            '適用車型': 'SYM JET系列',
            '材質': '高韌性聚碳酸酯',
            '透光率': '95%以上'
        },
        stock: 45,
        isHot: false,
        isNew: false,
        dateAdded: new Date('2024-06-17'),
        tags: ['大燈', '護甲', 'SKUNY', 'JET', '保護']
    },
    {
        id: 'apexx-gt-heat-shield',
        name: '【APEXX GT防燙蓋】',
        category: 'exhaust',
        mainCategory: 'sym-jet',
        subCategory: 'JET熱門外觀燈係改裝',
        brand: 'APEXX',
        price: 980,
        rating: 4.6,
        reviews: 87,
        bikeType: ['sym-jet'],
        image: '/images/parts/apexx-gt-heat-shield.webp',
        description: 'APEXX GT系列排氣防燙蓋，有效降低燙傷風險',
        fullDescription: 'APEXX GT系列防燙蓋採用耐高溫材料製造，有效降低排氣管燙傷風險。造型美觀，安裝簡易。',
        specifications: {
            '適用車型': 'SYM JET系列',
            '材質': '耐高溫塑料',
            '耐溫': '200°C'
        },
        stock: 22,
        isHot: false,
        isNew: false,
        dateAdded: new Date('2024-01-20'),
        tags: ['防燙蓋', 'APEXX', 'JET', '排氣', '安全']
    },
    // YAMAHA BWS系列
    {
        id: 'bws-power-kit',
        name: '【BWS動力系統升級套件】',
        category: 'engine',
        mainCategory: 'yamaha-bws',
        subCategory: 'BWS動力系統升級',
        brand: 'ARACER',
        price: 15800,
        originalPrice: 18000,
        rating: 4.7,
        reviews: 156,
        bikeType: ['yamaha-bws'],
        image: '/images/parts/aracer-sportd.webp',
        description: 'BWS專用動力升級套件，提升馬力和扭力輸出',
        fullDescription: 'ARACER為BWS系列開發的專用動力套件，包含ECU調校、進氣系統優化等，能有效提升15-20%動力輸出。',
        specifications: {
            '適用車型': 'YAMAHA BWS系列',
            '馬力提升': '15-20%',
            '扭力提升': '10-15%',
            '保固': '六個月'
        },
        stock: 10,
        isHot: true,
        isNew: true,
        dateAdded: new Date('2024-06-01'),
        tags: ['動力', 'BWS', 'ARACER', 'ECU', '升級']
    },
    // KYMCO系列
    {
        id: 'racing-thunder-power-kit',
        name: '【雷霆動力系統升級】',
        category: 'engine',
        mainCategory: 'kymco-racing',
        subCategory: '雷霆動力系統升級',
        brand: 'ARACER',
        price: 16500,
        rating: 4.6,
        reviews: 201,
        bikeType: ['kymco-racing'],
        image: '/images/parts/aracer-sportd.webp',
        description: '雷霆專用動力升級，釋放引擎潛能',
        fullDescription: 'ARACER專為雷霆系列開發的動力升級套件，透過ECU重新調校和進氣系統優化，大幅提升動力表現。',
        specifications: {
            '適用車型': 'KYMCO雷霆125/150',
            '馬力提升': '18-25%',
            '扭力提升': '12-18%',
            '油耗改善': '5-8%'
        },
        stock: 8,
        isHot: true,
        isNew: false,
        dateAdded: new Date('2024-04-20'),
        tags: ['動力', '雷霆', 'ARACER', 'KYMCO', '升級']
    },
    // KYMCO KRV系列
    {
        id: 'krv-power-upgrade',
        name: '【KRV動力升級套件】',
        category: 'engine',
        mainCategory: 'kymco-krv',
        subCategory: 'KRV動力系統升級',
        brand: 'ARACER',
        price: 17200,
        rating: 4.7,
        reviews: 89,
        bikeType: ['kymco-krv'],
        image: '/images/parts/aracer-sportd.webp',
        description: 'KRV專用動力升級套件，提升整體性能表現',
        fullDescription: 'ARACER為KRV系列開發的專用動力套件，透過ECU調校和進氣系統優化，顯著提升動力輸出。',
        specifications: {
            '適用車型': 'KYMCO KRV 180',
            '馬力提升': '20-25%',
            '扭力提升': '15-20%',
            '保固': '六個月'
        },
        stock: 12,
        isHot: true,
        isNew: true,
        dateAdded: new Date('2024-06-15'),
        tags: ['動力', 'KRV', 'ARACER', 'KYMCO', '升級']
    },
    // SYM 黑曼巴MMBCU系列
    {
        id: 'mmbcu-suspension-kit',
        name: '【黑曼巴避震升級套件】',
        category: 'suspension',
        mainCategory: 'sym-mmbcu',
        subCategory: 'MMBCU避震懸吊升級',
        brand: '怪獸工廠',
        price: 22800,
        originalPrice: 25000,
        rating: 4.9,
        reviews: 34,
        bikeType: ['sym-mmbcu'],
        image: '/images/parts/怪獸工廠ZR後避震2.webp',
        description: '黑曼巴專用避震套件，極致操控體驗',
        fullDescription: '怪獸工廠為黑曼巴MMBCU量身打造的高性能避震套件，提供賽道級的操控表現。',
        specifications: {
            '適用車型': 'SYM 黑曼巴MMBCU 125',
            '材質': '航太級鋁合金',
            '調整功能': '預載/阻尼可調'
        },
        stock: 5,
        isHot: true,
        isNew: true,
        dateAdded: new Date('2024-06-10'),
        tags: ['避震', '黑曼巴', '怪獸工廠', 'MMBCU', '高性能']
    },
    // YAMAHA 勁戰系列
    {
        id: 'cygnus-exhaust-system',
        name: '【勁戰競技排氣管】',
        category: 'exhaust',
        mainCategory: 'yamaha-cygnus',
        subCategory: '勁戰排氣系統',
        brand: 'SKUNY',
        price: 8800,
        rating: 4.6,
        reviews: 156,
        bikeType: ['yamaha-cygnus'],
        image: '/images/parts/牛王SVR排氣管.webp',
        description: '勁戰專用競技排氣管，提升動力與音效',
        fullDescription: 'SKUNY為勁戰系列設計的競技排氣管，不僅提升動力輸出，更帶來迷人的排氣音效。',
        specifications: {
            '適用車型': 'YAMAHA 勁戰125/150',
            '材質': '不鏽鋼',
            '重量': '2.8kg',
            '音量': '95dB'
        },
        stock: 18,
        isHot: false,
        isNew: false,
        dateAdded: new Date('2024-05-20'),
        tags: ['排氣管', '勁戰', 'SKUNY', '競技', '音效']
    },
    // AUGUR系列
    {
        id: 'augur-brake-upgrade',
        name: '【AUGUR煞車升級套件】',
        category: 'brakes',
        mainCategory: 'augur',
        subCategory: 'AUGUR煞車制動升級',
        brand: 'MASA',
        price: 12500,
        rating: 4.8,
        reviews: 67,
        bikeType: ['augur'],
        image: '/images/parts/FAR黑金碟盤.webp',
        description: 'AUGUR專用煞車升級套件，極致制動性能',
        fullDescription: 'MASA為AUGUR系列開發的專業煞車套件，提供卓越的制動力和散熱效果。',
        specifications: {
            '適用車型': 'AUGUR系列',
            '材質': '高碳鋼碟盤',
            '來令片': '高性能複合材料'
        },
        stock: 15,
        isHot: true,
        isNew: false,
        dateAdded: new Date('2024-04-25'),
        tags: ['煞車', 'AUGUR', 'MASA', '制動', '升級']
    }
];

// 產品API路由
app.get('/api/products', (req, res) => {
    try {
        const {
            category,
            mainCategory,
            brand,
            bikeType,
            minPrice,
            maxPrice,
            search,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        let filteredProducts = [...productsDatabase];

        // 分類過濾
        if (category) {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        // 主分類過濾
        if (mainCategory) {
            filteredProducts = filteredProducts.filter(p => p.mainCategory === mainCategory);
        }

        // 品牌過濾
        if (brand) {
            const brands = brand.split(',');
            filteredProducts = filteredProducts.filter(p => brands.includes(p.brand));
        }

        // 車系過濾 - 新增
        if (bikeType) {
            const bikeTypes = bikeType.split(',');
            filteredProducts = filteredProducts.filter(p => 
                p.bikeType && p.bikeType.some(type => bikeTypes.includes(type))
            );
        }

        // 價格過濾
        if (minPrice) {
            filteredProducts = filteredProducts.filter(p => p.price >= parseInt(minPrice));
        }
        if (maxPrice) {
            filteredProducts = filteredProducts.filter(p => p.price <= parseInt(maxPrice));
        }

        // 搜尋過濾
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.brand.toLowerCase().includes(searchTerm) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // 排序
        switch (sort) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                filteredProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            case 'popular':
                filteredProducts.sort((a, b) => b.reviews - a.reviews);
                break;
            default:
                // 預設排序：熱門商品在前
                filteredProducts.sort((a, b) => {
                    if (a.isHot && !b.isHot) return -1;
                    if (!a.isHot && b.isHot) return 1;
                    return b.reviews - a.reviews;
                });
        }

        // 分頁
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        // 回傳結果
        res.json({
            success: true,
            data: {
                products: paginatedProducts,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(filteredProducts.length / limit),
                    count: filteredProducts.length,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Products API error:', error);
        res.status(500).json({
            success: false,
            error: '取得產品資料失敗'
        });
    }
});

// 取得單一產品詳細資料
app.get('/api/products/:id', (req, res) => {
    try {
        const { id } = req.params;
        const product = productsDatabase.find(p => p.id === id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: '找不到該產品'
            });
        }

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Product detail API error:', error);
        res.status(500).json({
            success: false,
            error: '取得產品詳細資料失敗'
        });
    }
});

// 取得產品分類
app.get('/api/categories', (req, res) => {
    try {
        const categories = {
            mainCategories: [
                { id: 'sym-jet', name: 'SYM JET系列', icon: 'fas fa-motorcycle' },
                { id: 'sym-drg', name: 'SYM DRG系列', icon: 'fas fa-motorcycle' },
                { id: 'sym-mmbcu', name: 'SYM 黑曼巴MMBCU', icon: 'fas fa-motorcycle' },
                { id: 'yamaha-cygnus', name: 'YAMAHA 勁戰系列', icon: 'fas fa-motorcycle' },
                { id: 'yamaha-force', name: 'YAMAHA FORCE系列', icon: 'fas fa-motorcycle' },
                { id: 'kymco-krv', name: 'KYMCO KRV系列', icon: 'fas fa-motorcycle' },
                { id: 'augur', name: 'AUGUR系列', icon: 'fas fa-motorcycle' }
            ],
            bikeTypes: [
                { id: 'sym-jet', name: 'SYM JET系列' },
                { id: 'sym-drg', name: 'SYM DRG系列' },
                { id: 'sym-mmbcu', name: 'SYM 黑曼巴MMBCU' },
                { id: 'yamaha-cygnus', name: 'YAMAHA 勁戰系列' },
                { id: 'yamaha-force', name: 'YAMAHA FORCE系列' },
                { id: 'kymco-krv', name: 'KYMCO KRV系列' },
                { id: 'augur', name: 'AUGUR系列' }
            ],
            subCategories: [
                { id: 'engine', name: '動力系統升級', icon: 'fas fa-cog' },
                { id: 'suspension', name: '避震懸吊升級', icon: 'fas fa-tools' },
                { id: 'brakes', name: '煞車制動升級', icon: 'fas fa-circle' },
                { id: 'exhaust', name: '排氣系統', icon: 'fas fa-wind' },
                { id: 'appearance', name: '外觀改裝', icon: 'fas fa-palette' },
                { id: 'electronics', name: '電子系統', icon: 'fas fa-microchip' }
            ],
            brands: [
                { id: 'ARACER', name: 'ARACER' },
                { id: 'KOSO', name: 'KOSO' },
                { id: '怪獸工廠', name: '怪獸工廠' },
                { id: 'MASA', name: 'MASA' },
                { id: 'SIMOTA', name: 'SIMOTA' },
                { id: '巴風特', name: '巴風特' },
                { id: 'SKUNY', name: 'SKUNY' },
                { id: 'APEXX', name: 'APEXX' }
            ]
        };

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Categories API error:', error);
        res.status(500).json({
            success: false,
            error: '取得分類資料失敗'
        });
    }
});

// 搜尋建議API
app.get('/api/search/suggestions', (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.json({
                success: true,
                data: []
            });
        }

        const searchTerm = q.toLowerCase();
        const suggestions = productsDatabase
            .filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.brand.toLowerCase().includes(searchTerm) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            )
            .slice(0, 8)
            .map(p => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                price: p.price,
                image: p.image
            }));

        res.json({
            success: true,
            data: suggestions
        });

    } catch (error) {
        console.error('Search suggestions API error:', error);
        res.status(500).json({
            success: false,
            error: '取得搜尋建議失敗'
        });
    }
});

// Enhanced error handling connection function
async function connectToDatabase() {
  let client;
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log(`Connection URI: ${MONGO_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://****:****@')}`);
    
    // Set connection options with increased timeout
    const options = { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };
    
    client = new MongoClient(MONGO_URI, options);
    await client.connect();
    console.log('MongoDB connection successful!');
    db = client.db('motoweb');
    
    // Ensure indexes - use try-catch to avoid duplicate index creation errors
    try {
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('User index creation warning:', error.message);
      }
    }
    
    // Text search indexes - use consistent names and configuration with repair script
    try {
      await db.collection('showcases').createIndex(
        { title: 'text', description: 'text' },
        { name: 'showcases_text_search', default_language: 'none' }
      );
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('Showcases index creation warning:', error.message);
      }
    }
    
    try {
      await db.collection('products').createIndex(
        { name: 'text', description: 'text', brand: 'text', tags: 'text' },
        { 
          name: 'products_text_search',
          default_language: 'none',
          weights: { name: 10, brand: 5, description: 1, tags: 3 }
        }
      );
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('Products index creation warning:', error.message);
      }
    }
    
    try {
      await db.collection('posts').createIndex(
        { title: 'text', content: 'text' },
        { name: 'posts_text_search', default_language: 'none' }
      );
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('Posts index creation warning:', error.message);
      }
    }
    
    try {
      await db.collection('events').createIndex(
        { title: 'text', description: 'text' },
        { name: 'events_text_search', default_language: 'none' }
      );
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('Events index creation warning:', error.message);
      }
    }
    
    // Gallery collection indexes
    try {
      await db.collection('galleries').createIndex({ 
        title: 'text', 
        description: 'text',
        model: 'text',
        tags: 'text'
      }, { name: 'galleries_text_search', default_language: 'none' });
      
      await db.collection('galleries').createIndex({ createdAt: -1 });
      await db.collection('galleries').createIndex({ 'stats.likes': -1 });
      await db.collection('galleries').createIndex({ category: 1 });
      await db.collection('galleries').createIndex({ style: 1 });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('Galleries index creation warning:', error.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('MongoDB connection failed!');
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('Cannot connect to MongoDB server. Please ensure MongoDB service is running.');
    } else if (error.message.includes('authentication failed')) {
      console.error('MongoDB authentication failed. Please check username and password.');
    } else if (error.message.includes('TLSV1_ALERT_INTERNAL_ERROR') || error.message.includes('SSL')) {
      console.error('SSL/TLS connection issue. If using MongoDB Atlas, please ensure your IP is added to Network Access whitelist.');
      console.error('1. Login to MongoDB Atlas');
      console.error('2. Click Network Access');
      console.error('3. Click Add IP Address');
      console.error('4. Add your current IP address, or temporarily select Allow Access from Anywhere (0.0.0.0/0)');
    }
    
    // Try local MongoDB as fallback
    if (MONGO_URI.includes('mongodb+srv')) {
      console.log('Attempting to connect to local MongoDB as fallback...');
      try {
        const localUri = 'mongodb://localhost:27017/motoweb';
        client = new MongoClient(localUri);
        await client.connect();
        console.log('Successfully connected to local MongoDB!');
        db = client.db('motoweb');
        return true;
      } catch (localError) {
        console.error('Local MongoDB connection also failed:', localError.message);
        return false;
      }
    }
    
    return false;
  }
}

// 用戶相關 API
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const existingUser = await db.collection('users').findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      profile: {
        avatar: '/images/default-avatar.png',
        bio: '',
        location: '',
        favoriteModels: [],
        social: {}
      }
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    const token = jwt.sign(
      { userId: result.insertedId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.insertedId,
        username,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = await db.collection('users').findOne({
      $or: [
        { username },
        { email: username } // Allow login with email
      ]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: req.user._id },
      { projection: { password: 0 } }
    );
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile', authenticate, async (req, res) => {
  try {
    const { username, email, profile } = req.body;
    const updateData = {};
    
    if (username) {
      const existingUser = await db.collection('users').findOne({
        username,
        _id: { $ne: req.user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username already in use' });
      }
      
      updateData.username = username;
    }
    
    if (email) {
      const existingUser = await db.collection('users').findOne({
        email,
        _id: { $ne: req.user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      
      updateData.email = email;
    }
    
    if (profile) {
      updateData.profile = profile;
    }
    
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: updateData }
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/profile/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const avatarPath = '/uploads/avatars/' + req.file.filename;
    
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: { 'profile.avatar': avatarPath } }
    );
    
    res.json({
      message: 'Avatar updated successfully',
      avatarPath
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 上傳個人資料封面圖片
app.post('/api/profile/cover', authenticate, upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const coverPath = '/uploads/covers/' + req.file.filename;
    
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: { 'profile.coverImage': coverPath } }
    );
    
    res.json({
      message: 'Cover image updated successfully',
      coverPath
    });
  } catch (error) {
    console.error('Error updating cover image:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 改裝案例 API
app.get('/api/showcase', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.limit) || 6;
    const search = req.query.search || '';
    
    const query = search
      ? { $text: { $search: search } }
      : {};
    
    const total = await db.collection('showcases').countDocuments(query);
    const showcases = await db.collection('showcases')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();
    
    res.json({
      showcases,
      isLastPage: (page * perPage) >= total,
      total,
      page,
      totalPages: Math.ceil(total / perPage)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/showcase/:id', async (req, res) => {
  try {
    const showcase = await db.collection('showcases').findOne({
      _id: ObjectId(req.params.id)
    });
    
    if (!showcase) {
      return res.status(404).json({ error: 'Showcase not found' });
    }
    
    res.json(showcase);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/showcase', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, parts, specifications } = req.body;
    
    const images = req.files.map(file => '/uploads/showcase/' + file.filename);
    
    const newShowcase = {
      title,
      description,
      author: req.user.username,
      authorId: req.user._id,
      createdAt: new Date(),
      likes: 0,
      comments: [],
      parts: JSON.parse(parts || '[]'),
      specifications: JSON.parse(specifications || '{}'),
      images,
      beforeImage: images[0] || '',
      afterImage: images[1] || ''
    };
    
    const result = await db.collection('showcases').insertOne(newShowcase);
    
    res.status(201).json({
      message: 'Showcase created successfully',
      showcaseId: result.insertedId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/showcase/:id/like', authenticate, async (req, res) => {
  try {
    const showcaseId = req.params.id;
    
    // 檢查用戶是否已經點讚
    const liked = await db.collection('likes').findOne({
      userId: req.user._id,
      showcaseId: ObjectId(showcaseId),
      type: 'showcase'
    });
    
    if (liked) {
      return res.status(400).json({ error: 'You have already liked this' });
    }
    
    // 添加點讚記錄
    await db.collection('likes').insertOne({
      userId: req.user._id,
      showcaseId: ObjectId(showcaseId),
      type: 'showcase',
      createdAt: new Date()
    });
    
    // 更新點讚計數
    await db.collection('showcases').updateOne(
      { _id: ObjectId(showcaseId) },
      { $inc: { likes: 1 } }
    );
    
    res.json({ message: 'Liked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/showcase/:id/comment', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }
    
    const comment = {
      _id: new ObjectId(),
      content,
      author: req.user.username,
      authorId: req.user._id,
      createdAt: new Date()
    };
    
    await db.collection('showcases').updateOne(
      { _id: ObjectId(req.params.id) },
      { 
        $push: { comments: comment },
        $inc: { commentCount: 1 }
      }
    );
    
    res.status(201).json({
      message: 'Comment posted successfully',
      comment
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 社群文章相關 API
app.get('/api/posts', async (req, res) => {
  try {
    console.log('API /api/posts called');
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const tag = req.query.tag;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    console.log('Query conditions:', query);
    
    const total = await db.collection('posts').countDocuments(query);
    console.log('Total posts:', total);
    
    const posts = await db.collection('posts')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();
    
    console.log('Posts found:', posts.length);
    
    res.json({
      posts,
      isLastPage: (page * perPage) >= total,
      total,
      page,
      totalPages: Math.ceil(total / perPage)
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/posts', authenticate, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content and category are required' });
    }
    
    const newPost = {
      title,
      content,
      category,
      tags: tags || [],
      author: req.user.username,
      authorId: req.user._id,
      createdAt: new Date(),
      likes: 0,
      comments: [],
      commentCount: 0,
      views: 0
    };
    
    const result = await db.collection('posts').insertOne(newPost);
    
    res.status(201).json({
      message: 'Post published successfully',
      postId: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 獲取單篇社群文章詳情
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: '無效的文章ID' });
    }
    
    const post = await db.collection('posts').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!post) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 增加瀏覽次數
    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { views: 1 } }
    );
    
    // 生成摘要（如果沒有的話）
    if (!post.excerpt) {
      const textContent = post.content.replace(/<[^>]*>/g, ''); // 移除HTML標籤
      post.excerpt = textContent.length > 150 
        ? textContent.substring(0, 150) + '...' 
        : textContent;
    }
    
    // 設置默認頭像
    if (!post.avatar) {
      post.avatar = 'images/avatars/default-user.svg';
    }
    
    res.json(post);
  } catch (error) {
    console.error('獲取文章詳情時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 活動相關 API
app.post('/api/events', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      location, 
      address, 
      eventDate, 
      eventTime, 
      eventEndDate, 
      eventEndTime, 
      capacity, 
      fee, 
      deadline, 
      type 
    } = req.body;
    
    // 驗證必要字段
    if (!title || !location || !eventDate) {
      return res.status(400).json({ error: '標題、地點與活動日期為必填項' });
    }
    
    // 處理圖片路徑
    let imageUrl = '/images/events/default-event.jpg'; // 默認圖片
    if (req.file) {
      imageUrl = `/uploads/events/${req.file.filename}`;
    }
    
    // 處理時間
    const startDateTime = eventTime 
      ? new Date(`${eventDate}T${eventTime}`) 
      : new Date(`${eventDate}T00:00:00`);
      
    const endDateTime = eventEndDate 
      ? (eventEndTime 
        ? new Date(`${eventEndDate}T${eventEndTime}`) 
        : new Date(`${eventEndDate}T23:59:59`))
      : (eventTime 
        ? new Date(`${eventDate}T${eventTime}`) 
        : new Date(`${eventDate}T23:59:59`));
    
    // 創建活動資料
    const event = {
      title,
      description,
      category: type,
      location,
      address: address || location,
      eventDate: startDateTime,
      endDate: endDateTime,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizer: req.user.username,
      organizerId: req.user._id,
      imageUrl,
      attendees: [],
      maxAttendees: capacity ? parseInt(capacity) : 0,
      registeredCount: 0,
      fee: fee ? parseFloat(fee) : 0,
      deadline: deadline ? new Date(deadline) : new Date(startDateTime),
      status: new Date() < new Date(deadline || startDateTime) ? 'open' : 'closed'
    };
    
    // 保存到數據庫
    const result = await db.collection('events').insertOne(event);
    
    res.status(201).json({
      message: '活動創建成功',
      eventId: result.insertedId,
      event: {
        ...event,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('創建活動時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 獲取活動列表
app.get('/api/events', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || '';
    const search = req.query.search || '';
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    
    // 構建查詢條件
    let query = {};
    
    if (type) {
      query.category = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate && endDate) {
      query.eventDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.eventDate = { $gte: startDate };
    } else if (endDate) {
      query.eventDate = { $lte: endDate };
    }
    
    // 計算總數
    const total = await db.collection('events').countDocuments(query);
    
    // 獲取數據
    const events = await db.collection('events')
      .find(query)
      .sort({ eventDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    res.json({
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('獲取活動列表時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 獲取單個活動詳情
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await db.collection('events').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!event) {
      return res.status(404).json({ error: '找不到該活動' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('獲取活動詳情時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 報名參加活動
app.post('/api/events/:id/register', authenticate, async (req, res) => {
  try {
    const event = await db.collection('events').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!event) {
      return res.status(404).json({ error: '找不到該活動' });
    }
    
    // 檢查活動是否已結束
    if (new Date() > new Date(event.deadline)) {
      return res.status(400).json({ error: '活動報名已截止' });
    }
    
    // 檢查名額是否已滿
    if (event.registeredCount >= event.maxAttendees && event.maxAttendees > 0) {
      return res.status(400).json({ error: '活動名額已滿' });
    }
    
    // 檢查用戶是否已報名
    const isRegistered = event.attendees.some(
      attendee => attendee.userId.toString() === req.user._id.toString()
    );
    
    if (isRegistered) {
      return res.status(400).json({ error: '您已報名此活動' });
    }
    
    // 添加到參與者名單
    const attendee = {
      userId: req.user._id,
      username: req.user.username,
      registerDate: new Date()
    };
    
    await db.collection('events').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $push: { attendees: attendee },
        $inc: { registeredCount: 1 }
      }
    );
    
    res.json({ 
      message: '活動報名成功',
      attendee
    });
  } catch (error) {
    console.error('報名活動時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 更新活動資訊
app.put('/api/events/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const event = await db.collection('events').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!event) {
      return res.status(404).json({ error: '找不到該活動' });
    }
    
    // 檢查權限，只有活動創建者或管理員可以編輯
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '您沒有權限編輯此活動' });
    }
    
    const { 
      title, 
      description, 
      location, 
      address, 
      eventDate, 
      eventTime, 
      eventEndDate, 
      eventEndTime, 
      capacity, 
      fee, 
      deadline, 
      type 
    } = req.body;
    
    // 處理圖片路徑
    let imageUrl = event.imageUrl; // 保持原圖片
    if (req.file) {
      imageUrl = `/uploads/events/${req.file.filename}`;
    }
    
    // 處理時間
    const startDateTime = eventDate 
      ? (eventTime 
        ? new Date(`${eventDate}T${eventTime}`) 
        : new Date(`${eventDate}T00:00:00`))
      : event.eventDate;
      
    const endDateTime = eventEndDate 
      ? (eventEndTime 
        ? new Date(`${eventEndDate}T${eventEndTime}`) 
        : new Date(`${eventEndDate}T23:59:59`))
      : (eventEndDate === '' ? startDateTime : event.endDate);
    
    // 更新活動資料
    const updateData = {
      title: title || event.title,
      description: description || event.description,
      category: type || event.category,
      location: location || event.location,
      address: address || event.address,
      eventDate: startDateTime,
      endDate: endDateTime,
      updatedAt: new Date(),
      imageUrl,
      maxAttendees: capacity ? parseInt(capacity) : event.maxAttendees,
      fee: fee ? parseFloat(fee) : event.fee,
      deadline: deadline ? new Date(deadline) : event.deadline,
      status: new Date() < (deadline ? new Date(deadline) : event.deadline) ? 'open' : 'closed'
    };
    
    // 更新數據庫
    await db.collection('events').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    res.json({
      message: '活動更新成功',
      event: {
        ...event,
        ...updateData
      }
    });
  } catch (error) {
    console.error('更新活動時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 圖片上傳 API
app.post('/api/upload/:type', authenticate, upload.single('image'), (req, res) => {
  try {
    const imagePath = `/uploads/${req.params.type}/${req.file.filename}`;
    
    res.json({
      message: '上傳成功',
      imagePath
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =============== 畫廊相關 API ===============

// 獲取畫廊作品列表 API
app.get('/api/gallery', async (req, res) => {
  try {
    const { category, brand, style, sort = 'latest', page = 1, limit = 12 } = req.query;
    
    // 檢查資料庫連接
    if (!db) {
      console.error('資料庫未連接');
      return res.status(500).json({ error: '資料庫連接失敗' });
    }
    
    // 建立篩選條件
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (brand && brand !== 'all') {
      // 根據品牌篩選，檢查model欄位中是否包含該品牌
      filter.model = new RegExp(brand, 'i');
    }
    
    if (style && style !== 'all') {
      filter.style = style;
    }
    
    console.log('Gallery篩選條件:', filter);
    
    // 設定排序
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { 'stats.views': -1, 'stats.likes': -1 };
        break;
      case 'likes':
        sortOptions = { 'stats.likes': -1 };
        break;
      case 'comments':
        sortOptions = { 'stats.comments': -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'newest':
      case 'latest':
      default:
        sortOptions = { createdAt: -1 };
    }
    
    console.log('排序選項:', sortOptions);
    
    // 分頁設定
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;
    
    // 查詢資料庫
    const galleryCollection = db.collection('galleries');
    
    // 獲取總數
    const total = await galleryCollection.countDocuments(filter);
    
    // 獲取作品列表
    const items = await galleryCollection
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .toArray();
    
    console.log(`找到 ${items.length} 個作品，總共 ${total} 個`);
    
    // 返回結果
    res.json({
      items,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    });
    
  } catch (error) {
    console.error('獲取作品列表失敗:', error);
    res.status(500).json({ error: '獲取作品列表失敗' });
  }
});

// 創建新的畫廊作品 API
app.post('/api/gallery', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, style, model, tags } = req.body;
    
    // 驗證必填欄位
    if (!title || !description || !category || !style || !model) {
      return res.status(400).json({ error: '請填寫所有必填欄位' });
    }
    
    // 檢查是否有上傳圖片
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '請至少上傳一張圖片' });
    }
    
    // 處理圖片路徑
    const images = req.files.map(file => `/uploads/gallery/${file.filename}`);
    
    // 處理標籤
    let tagsArray = [];
    if (tags) {
      try {
        tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        tagsArray = [];
      }
    }
    
    // 建立作品資料
    const newGalleryItem = {
      title,
      description,
      category,
      style,
      model,
      tags: tagsArray,
      images,
      image: images[0], // 主要圖片
      author: {
        _id: req.user._id,
        name: req.user.username,
        avatar: req.user.profile?.avatar || '/images/default-avatar.svg'
      },
      stats: {
        likes: 0,
        comments: 0,
        views: 0
      },
      likes: [], // 點讚用戶ID列表
      comments: [], // 評論列表
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 儲存到資料庫
    const result = await db.collection('galleries').insertOne(newGalleryItem);
    
    res.status(201).json({
      message: '作品上傳成功',
      itemId: result.insertedId,
      item: {
        ...newGalleryItem,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('創建畫廊作品時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 獲取單個畫廊作品詳情 API
app.get('/api/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '無效的作品 ID' });
    }
    
    // 增加瀏覽次數
    await db.collection('galleries').updateOne(
      { _id: ObjectId(id) },
      { $inc: { 'stats.views': 1 } }
    );
    
    // 獲取作品詳情
    const item = await db.collection('galleries').findOne({ _id: ObjectId(id) });
    
    if (!item) {
      return res.status(404).json({ error: '作品不存在' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('獲取作品詳情時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 點讚/取消點讚作品 API
app.post('/api/gallery/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '無效的作品 ID' });
    }
    
    const item = await db.collection('galleries').findOne({ _id: ObjectId(id) });
    
    if (!item) {
      return res.status(404).json({ error: '作品不存在' });
    }
    
    // 檢查用戶是否已經點讚
    const hasLiked = item.likes && item.likes.includes(userId.toString());
    
    let updateOperation;
    let message;
    
    if (hasLiked) {
      // 取消點讚
      updateOperation = {
        $pull: { likes: userId.toString() },
        $inc: { 'stats.likes': -1 }
      };
      message = '已取消點讚';
    } else {
      // 點讚
      updateOperation = {
        $addToSet: { likes: userId.toString() },
        $inc: { 'stats.likes': 1 }
      };
      message = '點讚成功';
    }
    
    await db.collection('galleries').updateOne(
      { _id: ObjectId(id) },
      updateOperation
    );
    
    // 獲取更新後的點讚數
    const updatedItem = await db.collection('galleries').findOne({ _id: ObjectId(id) });
    
    res.json({
      message,
      liked: !hasLiked,
      likesCount: updatedItem.stats.likes
    });
  } catch (error) {
    console.error('點讚操作時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 添加評論 API
app.post('/api/gallery/:id/comment', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: '無效的作品 ID' });
    }
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: '評論內容不能為空' });
    }
    
    const item = await db.collection('galleries').findOne({ _id: ObjectId(id) });
    
    if (!item) {
      return res.status(404).json({ error: '作品不存在' });
    }
    
    // 建立新評論
    const newComment = {
      _id: new ObjectId(),
      content: content.trim(),
      author: {
        _id: req.user._id,
        name: req.user.username,
        avatar: req.user.profile?.avatar || '/images/default-avatar.svg'
      },
      createdAt: new Date()
    };
    
    // 添加評論並增加評論數
    await db.collection('galleries').updateOne(
      { _id: ObjectId(id) },
      {
        $push: { comments: newComment },
        $inc: { 'stats.comments': 1 }
      }
    );
    
    res.status(201).json({
      message: '評論添加成功',
      comment: newComment
    });
  } catch (error) {
    console.error('添加評論時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 獲取精選作品 API
app.get('/api/gallery/featured', async (req, res) => {
  try {
    // 檢查資料庫連接
    if (!db) {
      throw new Error('資料庫未連接');
    }

    // 獲取點讚數最多的6個作品作為精選
    const featuredItems = await db.collection('galleries')
      .find({
        // 確保必要欄位存在
        title: { $exists: true },
        description: { $exists: true },
        category: { $exists: true }
      })
      .sort({ 
        'stats.likes': -1,  // 首選按讚數排序
        'stats.views': -1,  // 其次按觀看數
        createdAt: -1       // 最後按創建時間
      })
      .limit(6)
      .toArray();

    // 如果沒有找到任何作品，返回空數組而不是錯誤
    if (!featuredItems || featuredItems.length === 0) {
      return res.json([]);
    }

    // 處理每個作品的資料，確保必要欄位存在
    const processedItems = featuredItems.map(item => ({
      _id: item._id,
      title: item.title,
      description: item.description || '',
      category: item.category,
      image: item.image || null,
      createdAt: item.createdAt || new Date(),
      author: {
        name: item.author?.name || '匿名用戶',
        avatar: item.author?.avatar || '/images/default-avatar.jpg'
      },
      stats: {
        likes: item.stats?.likes || 0,
        comments: item.stats?.comments || 0,
        views: item.stats?.views || 0
      }
    }));

    res.json(processedItems);
  } catch (error) {
    console.error('獲取精選作品時出錯:', error);
    res.status(500).json({ 
      error: '獲取精選作品失敗',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// =============== 畫廊相關 API 結束 ===============

// 忘記密碼 API
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: '電子郵件為必填項' });
    }
    
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      // 為了安全，即使用戶不存在也返回相同的成功訊息
      return res.status(200).json({ message: '如果該電子郵件已註冊，您將收到重置密碼的信件' });
    }
    
    // 生成重置令牌和過期時間
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1小時後過期
    
    // 更新用戶資料
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpires
        } 
      }
    );
    
    // 在實際應用中，這裡應發送電子郵件
    // 現在只是模擬成功
    console.log(`重置密碼連結: http://localhost:3001/reset-password.html?token=${resetToken}`);
    
    res.json({ message: '重置密碼的郵件已發送，請檢查您的收件箱' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 重置密碼 API
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: '令牌和密碼為必填項' });
    }
    
    // 查找有效的重置令牌
    const user = await db.collection('users').findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ error: '無效或過期的密碼重置令牌' });
    }
    
    // 加密新密碼
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 更新用戶密碼並移除重置令牌
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" }
      }
    );
    
    res.json({ message: '密碼已成功重置，請使用新密碼登入' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 健康檢查 API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: db ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// 資料庫初始化API（僅限開發環境或首次部署）
app.post('/api/init-db', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: '資料庫未連接' });
    }

    // 檢查是否已經初始化過
    const userCount = await db.collection('users').countDocuments();
    if (userCount > 0) {
      return res.json({ 
        message: '資料庫已經初始化過，無需重複操作',
        userCount: userCount
      });
    }

    // 執行初始化腳本
    const { exec } = require('child_process');
    exec('node initDB.js', (error, stdout, stderr) => {
      if (error) {
        console.error('初始化資料庫失敗:', error);
        return res.status(500).json({ error: '初始化資料庫失敗', details: error.message });
      }
      
      console.log('資料庫初始化成功:', stdout);
      res.json({ 
        message: '資料庫初始化成功',
        details: stdout
      });
    });
  } catch (error) {
    console.error('資料庫初始化API錯誤:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 重新初始化活動資料API（僅限開發環境）
app.post('/api/reset-events', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: '資料庫未連接' });
    }

    // 清除現有活動資料
    await db.collection('events').deleteMany({});
    console.log('已清除現有活動資料');

    // 重新初始化活動資料
    await initializeSampleEvents();

    res.json({ 
      message: '活動資料重新初始化成功',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('重新初始化活動資料失敗:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 前端路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'community.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

app.get('/showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'showcase.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

app.get('/bikes-gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bikes-gallery.html'));
});

// API 獲取爬取的車輛圖片
app.get('/api/bike-images', async (req, res) => {
  const model = req.query.model || 'all';
  const category = req.query.category || 'all';
  
  try {
    const baseDir = path.join(__dirname, 'public', 'uploads', 'scraped-bikes');
    const images = [];
    
    // 確保目錄存在
    if (!fs.existsSync(baseDir)) {
      return res.json({ images: [], model, category });
    }
    
    // 讀取車款目錄
    const modelDirs = fs.readdirSync(baseDir);
    
    for (const modelDir of modelDirs) {
      // 檢查是否符合模型過濾
      if (model !== 'all' && modelDir !== model.replace(/\s+/g, '-')) {
        continue;
      }
      
      const modelPath = path.join(baseDir, modelDir);
      const categoryDirs = fs.readdirSync(modelPath);
      
      for (const categoryDir of categoryDirs) {
        // 檢查是否符合類別過濾
        let matchCategory = false;
        
        if (category === 'all') {
          matchCategory = true;
        } else if (category === '原廠' && categoryDir === '原廠') {
          matchCategory = true;
        } else if (category === '改裝整車' && categoryDir === '改裝整車') {
          matchCategory = true;
        } else if (category === '改裝零件' && categoryDir.startsWith('改裝零件-')) {
          matchCategory = true;
        }
        
        if (matchCategory) {
          const categoryPath = path.join(modelPath, categoryDir);
          const files = fs.readdirSync(categoryPath);
          
          for (const file of files) {
            if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
              const imagePath = `/uploads/scraped-bikes/${modelDir}/${categoryDir}/${file}`;
              const modelName = modelDir.replace(/-/g, ' ');
              
              // 生成圖片描述
              let title = '';
              let description = '';
              
              if (categoryDir === '原廠') {
                title = `${modelName} 原廠`;
                description = '原廠標準配置';
              } else if (categoryDir === '改裝整車') {
                title = `${modelName} 改裝整車`;
                description = '客製化改裝';
              } else {
                const partName = categoryDir.replace('改裝零件-', '');
                title = `${modelName} ${partName}`;
                description = `改裝${partName}`;
              }
              
              images.push({
                path: imagePath,
                model: modelName,
                category: categoryDir,
                title,
                description
              });
            }
          }
        }
      }
    }
    
    res.json({
      images,
      model,
      category,
      total: images.length
    });
  } catch (error) {
    console.error('獲取圖庫圖片時出錯:', error);
    res.status(500).json({ error: '獲取圖片失敗' });
  }
});

// API 手動開始爬蟲 (僅限管理員)
app.post('/api/admin/start-scraper', authenticate, async (req, res) => {
  try {
    // 檢查用戶是否為管理員
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '只有管理員可以執行此操作' });
    }
    
    // 爬蟲功能已被刪除，返回相應錯誤訊息
    return res.status(404).json({ 
      error: '爬蟲功能已被移除', 
      message: '系統已改為使用固定的高質量圖片來源，不再依賴爬蟲獲取圖片'
    });
    
  } catch (error) {
    console.error('API調用出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 摩托車圖片API
app.get('/api/bikes/images', (req, res) => {
  try {
    const model = req.query.model || 'all';
    const category = req.query.category || 'all';
    
    // 基礎目錄
    const baseDir = path.join(__dirname, 'public', 'uploads', 'scraped-bikes');
    
    // 如果目錄不存在，返回空數組
    if (!fs.existsSync(baseDir)) {
      return res.json({ images: [] });
    }
    
    // 獲取所有車型目錄
    const modelDirs = model === 'all' 
      ? fs.readdirSync(baseDir).filter(dir => dir !== '.DS_Store' && fs.statSync(path.join(baseDir, dir)).isDirectory())
      : [model].filter(dir => fs.existsSync(path.join(baseDir, dir)));
    
    const allImages = [];
    
    // 遍歷每個車型目錄
    modelDirs.forEach(modelDir => {
      const modelPath = path.join(baseDir, modelDir);
      // 獲取該車型下的所有類別目錄
      const categoryDirs = fs.readdirSync(modelPath)
        .filter(dir => dir !== '.DS_Store' && fs.statSync(path.join(modelPath, dir)).isDirectory());
      
      // 過濾類別
      const filteredCategoryDirs = category === 'all' 
        ? categoryDirs 
        : categoryDirs.filter(dir => {
            if (category === '原廠') return dir === '原廠';
            if (category === '改裝整車') return dir === '改裝整車';
            if (category === '改裝零件') return dir.startsWith('改裝零件');
            return false;
          });
      
      // 遍歷每個類別目錄
      filteredCategoryDirs.forEach(categoryDir => {
        const categoryPath = path.join(modelPath, categoryDir);
        // 獲取目錄中的所有圖片
        const imageFiles = fs.readdirSync(categoryPath)
          .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
          });
        
        // 將圖片信息添加到結果中
        imageFiles.forEach(imageFile => {
          const imagePath = `/uploads/scraped-bikes/${modelDir}/${categoryDir}/${imageFile}`;
          
          // 從目錄名稱生成易讀的標題
          let title = modelDir.replace(/-/g, ' ');
          if (categoryDir === '原廠') {
            title += ' 原廠';
          } else if (categoryDir === '改裝整車') {
            title += ' 改裝整車';
          } else if (categoryDir.startsWith('改裝零件')) {
            const partName = categoryDir.replace('改裝零件-', '');
            title += ` ${partName}`;
          }
          
          allImages.push({
            url: imagePath,
            title,
            model: modelDir,
            category: categoryDir
          });
        });
      });
    });
    
    res.json({ images: allImages });
  } catch (error) {
    console.error('獲取摩托車圖片時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 重新爬蟲API（僅管理員可用）
app.post('/api/bikes/scrape', authenticate, async (req, res) => {
  try {
    // 檢查用戶權限
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '沒有權限執行此操作' });
    }
    
    // 爬蟲功能已被刪除，返回相應錯誤訊息
    return res.status(404).json({ 
      error: '爬蟲功能已被移除', 
      message: '系統已改為使用固定的高質量圖片來源，不再依賴爬蟲獲取圖片'
    });
    
  } catch (error) {
    console.error('API調用出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 車庫管理 API
app.post('/api/garage', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { brand, model, year, cc, category, description, isMainBike } = req.body;
    
    // 驗證必要字段
    if (!brand || !model || !year) {
      return res.status(400).json({ error: '品牌、型號與年份為必填項' });
    }
    
    // 處理圖片路徑
    let imagePath = '/images/bikes/placeholder.jpg'; // 默認圖片
    if (req.file) {
      imagePath = `/uploads/garage/${req.file.filename}`;
    }
    
    // 創建車輛資料
    const bike = {
      userId: req.user._id,
      brand,
      model,
      year: parseInt(year),
      cc: cc ? parseInt(cc) : null,
      category,
      description,
      imagePath,
      isMainBike: isMainBike === 'on' || isMainBike === 'true',
      modifications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      mileage: 0
    };
    
    // 如果設置為主要車輛，先將所有其他車輛設為非主要
    if (bike.isMainBike) {
      await db.collection('bikes').updateMany(
        { userId: req.user._id },
        { $set: { isMainBike: false } }
      );
    }
    
    // 保存到數據庫
    const result = await db.collection('bikes').insertOne(bike);
    
    res.status(201).json({
      message: '車輛新增成功',
      bikeId: result.insertedId,
      bike: {
        ...bike,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('新增車輛時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 獲取用戶車庫列表
app.get('/api/garage', authenticate, async (req, res) => {
  try {
    const bikes = await db.collection('bikes')
      .find({ userId: req.user._id })
      .sort({ isMainBike: -1, createdAt: -1 })
      .toArray();
    
    res.json({ bikes });
  } catch (error) {
    console.error('獲取車庫列表時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 刪除車輛
app.delete('/api/garage/:id', authenticate, async (req, res) => {
  try {
    const result = await db.collection('bikes').deleteOne({
      _id: ObjectId(req.params.id),
      userId: req.user._id
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: '找不到該車輛或無權刪除' });
    }
    
    res.json({ message: '車輛刪除成功' });
  } catch (error) {
    console.error('刪除車輛時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 更新車輛資料
app.put('/api/garage/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { brand, model, year, cc, category, description, isMainBike } = req.body;
    
    // 驗證必要字段
    if (!brand || !model || !year) {
      return res.status(400).json({ error: '品牌、型號與年份為必填項' });
    }
    
    // 取得當前車輛資料
    const currentBike = await db.collection('bikes').findOne({
      _id: ObjectId(req.params.id),
      userId: req.user._id
    });
    
    if (!currentBike) {
      return res.status(404).json({ error: '找不到該車輛或無權編輯' });
    }
    
    // 處理圖片路徑
    let imagePath = currentBike.imagePath; // 保持原圖片
    if (req.file) {
      imagePath = `/uploads/garage/${req.file.filename}`;
    }
    
    // 更新資料
    const updateData = {
      brand,
      model,
      year: parseInt(year),
      cc: cc ? parseInt(cc) : null,
      category,
      description,
      imagePath,
      isMainBike: isMainBike === 'on' || isMainBike === 'true',
      updatedAt: new Date()
    };
    
    // 如果設置為主要車輛，先將所有其他車輛設為非主要
    if (updateData.isMainBike) {
      await db.collection('bikes').updateMany(
        { userId: req.user._id, _id: { $ne: ObjectId(req.params.id) } },
        { $set: { isMainBike: false } }
      );
    }
    
    // 更新數據庫
    await db.collection('bikes').updateOne(
      { _id: ObjectId(req.params.id), userId: req.user._id },
      { $set: updateData }
    );
    
    res.json({
      message: '車輛資料更新成功',
      bike: {
        ...currentBike,
        ...updateData
      }
    });
  } catch (error) {
    console.error('更新車輛資料時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 添加車輛改裝零件
app.post('/api/garage/:id/modifications', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { name, brand, price, installDate, description } = req.body;
    
    // 驗證必要字段
    if (!name) {
      return res.status(400).json({ error: '零件名稱為必填項' });
    }
    
    // 取得當前車輛資料
    const bike = await db.collection('bikes').findOne({
      _id: ObjectId(req.params.id),
      userId: req.user._id
    });
    
    if (!bike) {
      return res.status(404).json({ error: '找不到該車輛或無權編輯' });
    }
    
    // 處理圖片路徑
    let imagePath = '/images/parts/placeholder.jpg'; // 默認圖片
    if (req.file) {
      imagePath = `/uploads/parts/${req.file.filename}`;
    }
    
    // 創建改裝零件資料
    const modification = {
      _id: new ObjectId(),
      name,
      brand,
      price,
      installDate: installDate ? new Date(installDate) : new Date(),
      description,
      imagePath,
      createdAt: new Date()
    };
    
    // 更新數據庫
    await db.collection('bikes').updateOne(
      { _id: ObjectId(req.params.id), userId: req.user._id },
      { 
        $push: { modifications: modification },
        $set: { updatedAt: new Date() }
      }
    );
    
    res.status(201).json({
      message: '改裝零件添加成功',
      modification
    });
  } catch (error) {
    console.error('添加改裝零件時出錯:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 確保所有其他路由都返回 index.html（SPA 路由支持）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// 404處理
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: '找不到該API端點' });
  }
  
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// 啟動服務器
(async () => {
  const connected = await connectToDatabase();
  
  if (!connected) {
    console.error('無法連接到任何 MongoDB 資料庫，服務器將以有限功能模式啟動');
    console.error('請檢查 MongoDB 連接設置或確保 MongoDB 服務已運行');
  } else {
    // 如果資料庫連接成功，初始化示例資料
    await initializeSampleEvents();
    await initializeSamplePosts();
    // 移除 await initializeSampleGallery(); - 使用現有數據
  }
  
  app.listen(PORT, () => {
    console.log(`服務器運行在 http://localhost:${PORT}`);
    console.log(`API 文檔: http://localhost:${PORT}/api-docs`);
    console.log(`MongoDB 連接狀態: ${connected ? '已連接' : '未連接 (有限功能模式)'}`);
  });
})();

// 初始化示例活動資料
async function initializeSampleEvents() {
  try {
    // 檢查是否已經有活動資料
    const existingEvents = await db.collection('events').countDocuments();
    
    // 強制重新初始化活動資料（清除舊資料）
    if (existingEvents > 0) {
      console.log('清除現有活動資料...');
      await db.collection('events').deleteMany({});
    }
    
    console.log('初始化示例活動資料...');
    
    const sampleEvents = [
      {
        title: '台灣摩托車文化節',
        description: '一年一度的台灣摩托車文化盛會，匯聚全台車友共同慶祝摩托車文化，展示各式改裝車輛、零件及週邊商品。活動包含靜態展示、動態表演、技術講座、競賽活動等豐富內容。',
        category: 'exhibition',
        location: '華山1914文化創意產業園區',
        address: '台北市中正區八德路一段1號',
        eventDate: new Date('2025-07-15T10:00:00'),
        endDate: new Date('2025-07-17T18:00:00'),
        imageUrl: '/images/events/event1.jpg',
        organizerId: null, // 將在後面設置
        organizer: '台灣摩托車協會',
        maxAttendees: 1000,
        registeredCount: 247,
        attendees: [],
        fee: 0,
        deadline: new Date('2025-07-10T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '春季改裝工作坊',
        description: '專業技師帶領的改裝實作課程，教授基礎改裝技術與安全知識。適合初學者參加，提供完整的工具與材料。',
        category: 'workshop',
        location: 'MotoTech改裝中心',
        address: '新北市板橋區中山路二段100號',
        eventDate: new Date('2025-06-20T14:00:00'),
        endDate: new Date('2025-06-20T17:00:00'),
        imageUrl: '/images/events/event2.jpg',
        organizerId: null,
        organizer: 'MotoTech改裝中心',
        maxAttendees: 20,
        registeredCount: 12,
        attendees: [],
        fee: 1500,
        deadline: new Date('2025-06-15T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '北台灣車友大會師',
        description: '北台灣地區車友聚會活動，分享改裝心得、交流技術經驗。現場有美食攤位、音樂表演和抽獎活動。',
        category: 'meetup',
        location: '大佳河濱公園',
        address: '台北市中山區濱江街5號',
        eventDate: new Date('2025-06-05T09:00:00'),
        endDate: new Date('2025-06-05T16:00:00'),
        imageUrl: '/images/events/event3.jpg',
        organizerId: null,
        organizer: '北台灣車友會',
        maxAttendees: 500,
        registeredCount: 156,
        attendees: [],
        fee: 0,
        deadline: new Date('2025-06-01T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '改裝安全技術講座',
        description: '由資深技師分享改裝安全知識，包含煞車系統、懸吊系統、引擎調校等專業技術。提供認證證書。',
        category: 'seminar',
        location: '台北科技大學',
        address: '台北市大安區忠孝東路三段1號',
        eventDate: new Date('2025-06-12T19:00:00'),
        endDate: new Date('2025-06-12T21:00:00'),
        imageUrl: '/images/events/event4.jpg',
        organizerId: null,
        organizer: '改裝技術研習會',
        maxAttendees: 100,
        registeredCount: 67,
        attendees: [],
        fee: 500,
        deadline: new Date('2025-06-10T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '夏日改裝競賽',
        description: '年度最大規模的改裝車競賽，分為多個組別評選最佳改裝車。獲勝者將獲得豐厚獎品與榮譽。',
        category: 'competition',
        location: '麗寶國際賽車場',
        address: '台中市后里區月眉東路一段185號',
        eventDate: new Date('2025-08-10T08:00:00'),
        endDate: new Date('2025-08-10T18:00:00'),
        imageUrl: '/images/events/event5.jpg',
        organizerId: null,
        organizer: '台灣改裝車競賽協會',
        maxAttendees: 300,
        registeredCount: 89,
        attendees: [],
        fee: 2000,
        deadline: new Date('2025-08-05T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '電動車改裝展示會',
        description: '專注於電動摩托車改裝的展示活動，展現電動車改裝的最新趨勢與技術發展。',
        category: 'exhibition',
        location: '南港展覽館',
        address: '台北市南港區經貿二路1號',
        eventDate: new Date('2025-09-01T10:00:00'),
        endDate: new Date('2025-09-01T17:00:00'),
        imageUrl: '/images/events/event6.jpg',
        organizerId: null,
        organizer: '電動車改裝聯盟',
        maxAttendees: 800,
        registeredCount: 203,
        attendees: [],
        fee: 200,
        deadline: new Date('2025-08-28T23:59:59'),
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // 插入示例活動資料
    const result = await db.collection('events').insertMany(sampleEvents);
    console.log(`成功插入 ${result.insertedCount} 個示例活動`);
  } catch (error) {
    console.error('初始化示例活動資料時出錯:', error);
  }
}

// 初始化示例貼文資料
async function initializeSamplePosts() {
  try {
    // 檢查是否已經有貼文資料
    const existingPosts = await db.collection('posts').countDocuments();
    
    // 強制重新初始化貼文資料（清除舊資料）
    if (existingPosts > 0) {
      console.log('清除現有貼文資料...');
      await db.collection('posts').deleteMany({});
    }
    
    console.log('初始化示例貼文資料...');
    
    const samplePosts = [
      {
        title: '我的第一次性能改裝經驗分享',
        content: '剛入手新車，想分享一下我的性能改裝心得。從排氣管到ECU調校，每一步都是學習的過程。先從最基礎的排氣管開始，選擇了知名品牌的產品，安裝後明顯感受到聲浪的改變和些許的動力提升。接著進行ECU調校，這部分比較複雜，建議找專業的店家處理...',
        excerpt: '剛入手新車，想分享一下我的性能改裝心得。從排氣管到ECU調校，每一步都是學習的過程。',
        category: 'performance',
        tags: ['性能', '改裝', '新手', 'ECU', '排氣管'],
        author: 'SpeedRider',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 24*60*60*1000),
        likes: 15,
        views: 234,
        comments: [],
        commentCount: 8,
        avatar: '/images/avatars/user1.jpg'
      },
      {
        title: '懸吊系統升級指南 - 從入門到精通',
        content: '懸吊系統對騎乘品質的影響是巨大的。今天來跟大家分享懸吊升級的心得和選購要點。首先要了解自己的需求：是要舒適性還是操控性？預算範圍如何？然後才能選擇適合的產品...',
        excerpt: '懸吊系統對騎乘品質的影響是巨大的。今天來跟大家分享懸吊升級的心得和選購要點。',
        category: 'suspension',
        tags: ['懸吊', '升級', '操控', '舒適性'],
        author: 'SuspensionMaster',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 2*24*60*60*1000),
        likes: 28,
        views: 456,
        comments: [],
        commentCount: 12,
        avatar: '/images/avatars/user2.jpg'
      },
      {
        title: '排氣系統選擇攻略 - 音效與性能的平衡',
        content: '排氣管不只是為了音效，更重要的是性能提升。分享我測試過的幾款排氣管心得。市面上的排氣管選擇很多，從入門級到競技級都有，價格差異也很大...',
        excerpt: '排氣管不只是為了音效，更重要的是性能提升。分享我測試過的幾款排氣管心得。',
        category: 'exhaust',
        tags: ['排氣管', '音效', '性能', '測試'],
        author: 'ExhaustExpert',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3*24*60*60*1000),
        likes: 42,
        views: 567,
        comments: [],
        commentCount: 18,
        avatar: '/images/avatars/user3.jpg'
      },
      {
        title: 'LED大燈升級實作 - 亮度與安全的提升',
        content: '原廠大燈太暗了！決定升級LED大燈，分享安裝過程和使用心得。LED大燈不只是亮度提升，色溫和照射角度也都有很大的改善...',
        excerpt: '原廠大燈太暗了！決定升級LED大燈，分享安裝過程和使用心得。',
        category: 'electronics',
        tags: ['LED', '大燈', '安全', '改裝'],
        author: 'LEDMaster',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 4*24*60*60*1000),
        likes: 31,
        views: 389,
        comments: [],
        commentCount: 15,
        avatar: '/images/avatars/user4.jpg'
      },
      {
        title: '外觀改裝案例分享 - 打造獨特風格',
        content: '改裝不只是性能，外觀也很重要！分享我的外觀改裝歷程和搭配心得。從貼紙設計到輪框選擇，每個細節都影響整體的視覺效果...',
        excerpt: '改裝不只是性能，外觀也很重要！分享我的外觀改裝歷程和搭配心得。',
        category: 'appearance',
        tags: ['外觀', '貼紙', '輪框', '客製化'],
        author: 'StyleMaker',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 5*24*60*60*1000),
        likes: 25,
        views: 298,
        comments: [],
        commentCount: 10,
        avatar: '/images/avatars/user5.jpg'
      },
      {
        title: '定期保養的重要性 - 延長愛車壽命',
        content: '很多人忽略了定期保養的重要性。分享我的保養心得和注意事項。定期更換機油、檢查煞車系統、清潔空濾等基礎保養工作...',
        excerpt: '很多人忽略了定期保養的重要性。分享我的保養心得和注意事項。',
        category: 'maintenance',
        tags: ['保養', '維修', '機油', '檢查'],
        author: 'MaintenanceGuru',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 6*24*60*60*1000),
        likes: 38,
        views: 445,
        comments: [],
        commentCount: 22,
        avatar: '/images/avatars/user6.jpg'
      },
      {
        title: '我的第一次賽道體驗 - 緊張刺激的挑戰',
        content: '終於去賽道跑了！分享賽道日的體驗和學到的騎乘技巧。賽道和一般道路的騎乘方式完全不同，需要學習正確的入彎和出彎技巧...',
        excerpt: '終於去賽道跑了！分享賽道日的體驗和學到的騎乘技巧。',
        category: 'track',
        tags: ['賽道', '技巧', '安全', '體驗'],
        author: 'TrackRider',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 7*24*60*60*1000),
        likes: 55,
        views: 623,
        comments: [],
        commentCount: 25,
        avatar: '/images/avatars/user7.jpg'
      },
      {
        title: '最新產品評測 - KOSO儀錶板開箱',
        content: '入手了最新的KOSO數位儀錶板，來做個詳細的開箱評測和使用心得。這款儀錶板功能豐富，顯示清晰，安裝也相對簡單...',
        excerpt: '入手了最新的KOSO數位儀錶板，來做個詳細的開箱評測和使用心得。',
        category: 'review',
        tags: ['KOSO', '儀錶板', '開箱', '評測'],
        author: 'ProductReviewer',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 8*24*60*60*1000),
        likes: 47,
        views: 512,
        comments: [],
        commentCount: 19,
        avatar: '/images/avatars/user8.jpg'
      },
      {
        title: '冬季騎乘保暖裝備推薦',
        content: '冬天騎車真的很冷！分享我使用過的保暖裝備和心得。從保暖衣物到防風配件，完整的保暖裝備能讓冬季騎乘更舒適...',
        excerpt: '冬天騎車真的很冷！分享我使用過的保暖裝備和心得。',
        category: 'maintenance',
        tags: ['冬季', '保暖', '裝備', '推薦'],
        author: 'WinterRider',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 9*24*60*60*1000),
        likes: 33,
        views: 367,
        comments: [],
        commentCount: 14,
        avatar: '/images/avatars/user9.jpg'
      },
      {
        title: '新手改裝常見錯誤和避雷指南',
        content: '剛開始改裝時踩了很多雷，整理一些常見錯誤給新手參考。選擇改裝件時要注意品質和相容性，不要只看價格...',
        excerpt: '剛開始改裝時踩了很多雷，整理一些常見錯誤給新手參考。',
        category: 'performance',
        tags: ['新手', '錯誤', '避雷', '指南'],
        author: 'ModMentor',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 10*24*60*60*1000),
        likes: 61,
        views: 789,
        comments: [],
        commentCount: 31,
        avatar: '/images/avatars/user10.jpg'
      },
      {
        title: '電子設備防水處理心得',
        content: '雨天騎車最怕電子設備進水，分享一些防水處理的方法和經驗。電子設備的防水不只是外部保護，內部的防潮也很重要...',
        excerpt: '雨天騎車最怕電子設備進水，分享一些防水處理的方法和經驗。',
        category: 'electronics',
        tags: ['防水', '電子', '雨天', '保護'],
        author: 'ElectroGuard',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 11*24*60*60*1000),
        likes: 29,
        views: 278,
        comments: [],
        commentCount: 11,
        avatar: '/images/avatars/user11.jpg'
      },
      {
        title: '排氣管清潔保養完整教學',
        content: '排氣管用久了會變黑變髒，教大家如何正確清潔保養排氣管。不同材質的排氣管需要不同的清潔方式...',
        excerpt: '排氣管用久了會變黑變髒，教大家如何正確清潔保養排氣管。',
        category: 'exhaust',
        tags: ['清潔', '保養', '排氣管', '教學'],
        author: 'CleanMaster',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 12*24*60*60*1000),
        likes: 22,
        views: 445,
        comments: [],
        commentCount: 8,
        avatar: '/images/avatars/user12.jpg'
      },
      {
        title: '懸吊調校基礎知識分享',
        content: '很多人有好的懸吊但不會調，分享懸吊調校的基礎知識和技巧。預載、阻尼、高度調整都有各自的作用...',
        excerpt: '很多人有好的懸吊但不會調，分享懸吊調校的基礎知識和技巧。',
        category: 'suspension',
        tags: ['調校', '懸吊', '基礎', '技巧'],
        author: 'TuningPro',
        authorId: new Date().toISOString(),
        createdAt: new Date(Date.now() - 13*24*60*60*1000),
        likes: 44,
        views: 556,
        comments: [],
        commentCount: 16,
        avatar: '/images/avatars/user13.jpg'
      }
    ];
    
    // 插入示例貼文資料
    const result = await db.collection('posts').insertMany(samplePosts);
    console.log(`成功插入 ${result.insertedCount} 個示例貼文`);
  } catch (error) {
    console.error('初始化示例貼文資料時出錯:', error);
  }
}

// 修改服務器啟動部分，數據已清理完成
async function startServer() {
  try {
    await connectToDatabase();
    
    await initializeSampleEvents();
    await initializeSamplePosts();
    // galleries集合已清空，準備使用用戶的真實數據
    
    app.listen(PORT, () => {
      console.log(`🚀 服務器運行在 http://localhost:${PORT}`);
      console.log(`📚 API 文檔: http://localhost:${PORT}/api-docs`);
      console.log(`💾 MongoDB 連接狀態: ${db ? '已連接' : '未連接'}`);
      console.log(`🎯 Gallery已準備好接收您的真實數據`);
    });
  } catch (error) {
    console.error('啟動服務器時出錯:', error);
    process.exit(1);
  }
}