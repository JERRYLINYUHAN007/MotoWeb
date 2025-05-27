const mongoose = require('mongoose');
require('dotenv').config();

// 定義展示作品模型架構
const gallerySchema = new mongoose.Schema({
    title: String,
    author: {
        name: String,
        avatar: String
    },
    category: String,
    tags: [String],
    date: Date,
    image: String,
    description: String,
    stats: {
        likes: Number,
        comments: Number,
        views: Number
    }
});

const Gallery = mongoose.model('Gallery', gallerySchema);

// 預設展示作品資料 - 使用實際資料庫中的車輛
const defaultGalleryItems = [
    {
        title: 'SYM DRG 街頭運動化改裝',
        author: {
            name: '改裝達人',
            avatar: '/images/avatars/user1.svg'
        },
        category: '速克達',
        tags: ['SYM', 'DRG', '運動改裝', '街頭'],
        date: new Date('2024-04-20'),
        image: '/images/bikes/DRG.jpg',
        description: 'SYM DRG 全車運動化改裝：\n- 避震：OHLINS 後避震器\n- 排氣管：AKRAPOVIC 鈦合金排氣管\n- 煞車：Brembo 對向四活塞卡鉗\n- 外觀：碳纖維車身部件\n- 輪框：鍛造輕量化輪框',
        stats: {
            likes: 328,
            comments: 45,
            views: 1850
        }
    },
    {
        title: 'SYM JET 都市通勤改裝',
        author: {
            name: '通勤族',
            avatar: '/images/avatars/user2.svg'
        },
        category: '速克達',
        tags: ['SYM', 'JET', '通勤改裝', '實用'],
        date: new Date('2024-04-18'),
        image: '/images/bikes/JET.jpg',
        description: 'SYM JET 實用性改裝：\n- 避震：YSS 舒適型後避震\n- 煞車：GALFER 煞車套件升級\n- 燈具：LED 頭燈與尾燈組\n- 置物：加大後箱與前置物掛勾\n- 風鏡：加高風鏡提升風阻',
        stats: {
            likes: 245,
            comments: 32,
            views: 1420
        }
    },
    {
        title: 'SYM MMBCU 性能強化改裝',
        author: {
            name: '性能玩家',
            avatar: '/images/avatars/user3.svg'
        },
        category: '速克達',
        tags: ['SYM', 'MMBCU', '性能改裝', '強化'],
        date: new Date('2024-04-16'),
        image: '/images/bikes/MMBCU.jpg',
        description: 'SYM MMBCU 性能全面升級：\n- 引擎：高流量空濾 + ECU調校\n- 排氣：毒蛇 SP1 合格排氣管\n- 避震：怪獸工廠 ZR 後避震\n- 煞車：ANC 大對四卡鉗套件\n- 輪胎：Michelin Power 5 輪胎',
        stats: {
            likes: 412,
            comments: 58,
            views: 2180
        }
    },
    {
        title: 'YAMAHA FORCE 街道風格改裝',
        author: {
            name: '街頭藝術家',
            avatar: '/images/avatars/user4.svg'
        },
        category: '速克達',
        tags: ['YAMAHA', 'FORCE', '街道改裝', '個性'],
        date: new Date('2024-04-14'),
        image: '/images/bikes/FORCE.jpg',
        description: 'YAMAHA FORCE 街頭風格打造：\n- 外觀：客製化彩繪與貼紙\n- 排氣：YOSHIMURA 排氣管\n- 避震：OHLINS 後避震器\n- 燈具：LED 魚眼大燈組\n- 輪框：ENKEI 鋁合金輪框',
        stats: {
            likes: 298,
            comments: 41,
            views: 1650
        }
    },
    {
        title: 'SYM KRV 180 運動競技改裝',
        author: {
            name: '賽道玩家',
            avatar: '/images/avatars/user5.svg'
        },
        category: '速克達',
        tags: ['SYM', 'KRV 180', '競技改裝', '賽道'],
        date: new Date('2024-04-12'),
        image: '/images/bikes/KRV.jpg',
        description: 'SYM KRV 180 賽道級改裝：\n- 避震：OHLINS 前後避震系統\n- 排氣：ARROW 鈦合金排氣管\n- 煞車：Brembo 賽道版卡鉗\n- 輪框：MARCHESINI 鍛造輪框\n- 車身：碳纖維整流罩套件',
        stats: {
            likes: 456,
            comments: 67,
            views: 2420
        }
    },
    {
        title: 'SYM AUGUR 150 復古改裝',
        author: {
            name: '復古愛好者',
            avatar: '/images/avatars/user6.svg'
        },
        category: '速克達',
        tags: ['SYM', 'AUGUR 150', '復古改裝', '經典'],
        date: new Date('2024-04-10'),
        image: '/images/bikes/AUGUR.jpg',
        description: 'SYM AUGUR 150 復古風格改裝：\n- 外觀：復古色彩搭配\n- 燈具：圓形 LED 頭燈\n- 坐墊：棕色皮革座椅\n- 後箱：復古造型後行李箱\n- 把手：復古風格把手與後照鏡',
        stats: {
            likes: 189,
            comments: 28,
            views: 980
        }
    },
    {
        title: 'YAMAHA CYGNUS GRYPHUS 越野改裝',
        author: {
            name: '越野專家',
            avatar: '/images/avatars/user7.svg'
        },
        category: '速克達',
        tags: ['YAMAHA', 'CYGNUS GRYPHUS', '越野改裝', '探險'],
        date: new Date('2024-04-08'),
        image: '/images/bikes/CYGNUS GRYPHUS.jpg',
        description: 'YAMAHA CYGNUS GRYPHUS 越野探險改裝：\n- 懸吊：長行程避震系統\n- 輪胎：越野專用輪胎\n- 保護：底盤護板與手把護弓\n- 燈具：LED 探照燈組\n- 行李：防水行李箱系統',
        stats: {
            likes: 234,
            comments: 36,
            views: 1320
        }
    }
];

// 連接到 MongoDB
async function initializeDatabase() {
    try {
        // 明確指定連接字串，並與 server.js 中使用的 MONGODB_URI 保持一致
        const MONGODB_URI_INIT = process.env.MONGODB_URI || 'mongodb://localhost:27017/motomod';
        console.log(`[initDb] 嘗試連接到 MongoDB: ${MONGODB_URI_INIT}`);
        await mongoose.connect(MONGODB_URI_INIT);
        console.log('[initDb] MongoDB 連接成功！');

        // 清空現有資料
        const deleteResult = await Gallery.deleteMany({});
        console.log(`[initDb] 已清空現有展示作品資料，刪除數量: ${deleteResult.deletedCount}`);

        // 插入新的預設資料
        const insertResult = await Gallery.insertMany(defaultGalleryItems);
        console.log('[initDb] 成功插入預設展示作品資料');
        console.log(`[initDb] 共插入 ${insertResult.length} 筆作品資料`);
        if (insertResult.length > 0) {
            console.log('[initDb] 插入的作品 ID 預覽:');
            insertResult.slice(0, 3).forEach(item => console.log(`  - ${item._id}`));
        }

        // 顯示插入的作品列表
        defaultGalleryItems.forEach((item, index) => {
            console.log(`${index + 1}. ${item.title} - ${item.tags.join(', ')}`);
        });

        // 關閉資料庫連接
        await mongoose.connection.close();
        console.log('[initDb] 資料庫連接已關閉');

    } catch (error) {
        console.error('[initDb] 資料庫操作失敗:', error);
        process.exit(1);
    }
}

// 執行初始化
initializeDatabase(); 