const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB 連接設定
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://Jerry:Jerrylin007@motoweb.xspj1kv.mongodb.net/';

// 預設作品展示資料 - 使用真實車款
const defaultGalleryItems = [
    {
        title: "SYM JET 125 街頭風格改裝",
        description: "這台JET 125經過全面街頭風格改裝，搭載怪獸工廠Z2 PRO前叉、MASA浮動碟盤、KOSO衝刺尾燈等頂級配件。外觀採用消光黑配色，搭配SIMOTA碳纖維後照鏡，展現出強烈的都市街頭風格。動力方面加裝NCY傳動組，提升加速反應。",
        category: "scooter",
        style: "street",
        model: "SYM JET 125",
        tags: ["怪獸工廠", "MASA", "KOSO", "SIMOTA", "NCY", "街頭風格"],
        images: [
            "/images/bikes/JET.jpg",
            "/images/bikes/JET.jpg",
            "/images/bikes/JET.jpg"
        ],
        image: "/images/bikes/JET.jpg",
        author: {
            _id: new ObjectId(),
            name: "JET改裝專家",
            avatar: "/images/avatars/user1.svg"
        },
        stats: {
            likes: 186,
            comments: 34,
            views: 1580
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01')
    },
    {
        title: "SYM JET 125 競技化升級",
        description: "專為賽道日設計的JET 125競技化改裝案例。升級GJMS TCD2000前叉、怪獸工廠ZR後避震、MASA劃線版碟盤等高性能配件。車身加裝APEXX GT防燙蓋，確保安全性。整車重量減輕3公斤，操控性能大幅提升。",
        category: "scooter",
        style: "racing",
        model: "SYM JET 125",
        tags: ["GJMS", "怪獸工廠", "MASA", "APEXX", "競技化", "輕量化"],
        images: [
            "/images/bikes/JET.jpg",
            "/images/bikes/JET.jpg",
            "/images/bikes/JET.jpg"
        ],
        image: "/images/bikes/JET.jpg",
        author: {
            _id: new ObjectId(),
            name: "賽道小將",
            avatar: "/images/avatars/user2.svg"
        },
        stats: {
            likes: 267,
            comments: 45,
            views: 2150
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-11-28'),
        updatedAt: new Date('2024-11-28')
    },
    {
        title: "SYM DRG 158 龍紋限定版",
        description: "採用KOSO龍紋系列配件打造的DRG 158特別版。搭載KOSO龍紋序列式方向燈、KOSO龍紋尾燈、KOSO導風胸蓋等專屬配件。JSTC赤焰內土除搭配車牌上移套件，營造出濃厚的東方神龍風格。每個細節都彰顯王者氣息。",
        category: "scooter",
        style: "custom",
        model: "SYM DRG 158",
        tags: ["KOSO", "龍紋", "JSTC", "限定版", "東方風格"],
        images: [
            "/images/bikes/DRG.jpg",
            "/images/bikes/DRG.jpg",
            "/images/bikes/DRG.jpg"
        ],
        image: "/images/bikes/DRG.jpg",
        author: {
            _id: new ObjectId(),
            name: "龍王改裝",
            avatar: "/images/avatars/user3.svg"
        },
        stats: {
            likes: 324,
            comments: 56,
            views: 2890
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-11-25'),
        updatedAt: new Date('2024-11-25')
    },
    {
        title: "SYM DRG 158 精緻日系改裝",
        description: "以日系精緻風格為主題的DRG 158改裝案例。搭配LIMIT日規油箱蓋、亮點LD2尾燈、SKUNY硬式螢幕保護殼等精品配件。全車使用正PROTI鈦螺絲，展現極致工藝。每個零件都經過精心挑選，追求完美的協調性。",
        category: "scooter",
        style: "japanese",
        model: "SYM DRG 158",
        tags: ["LIMIT", "亮點", "SKUNY", "PROTI", "日系", "精緻"],
        images: [
            "/images/bikes/DRG.jpg",
            "/images/bikes/DRG.jpg",
            "/images/bikes/DRG.jpg"
        ],
        image: "/images/bikes/DRG.jpg",
        author: {
            _id: new ObjectId(),
            name: "日系職人",
            avatar: "/images/avatars/user4.svg"
        },
        stats: {
            likes: 198,
            comments: 31,
            views: 1720
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-11-22'),
        updatedAt: new Date('2024-11-22')
    },
    {
        title: "KYMCO KRV 180 全地形改裝",
        description: "針對多元路況設計的KRV 180全地形改裝案例。加裝GOWORK短牌架、星爵M5尾燈等實用配件。強化懸吊系統，提升通過性。同時保持街道騎乘的舒適性，是城市與郊外兼顧的完美選擇。",
        category: "scooter",
        style: "adventure",
        model: "KYMCO KRV 180",
        tags: ["GOWORK", "星爵", "全地形", "多功能", "實用"],
        images: [
            "/images/bikes/KRV.jpg",
            "/images/bikes/KRV.jpg",
            "/images/bikes/KRV.jpg"
        ],
        image: "/images/bikes/KRV.jpg",
        author: {
            _id: new ObjectId(),
            name: "全地形玩家",
            avatar: "/images/avatars/user5.svg"
        },
        stats: {
            likes: 156,
            comments: 23,
            views: 1340
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date('2024-11-20')
    },
    {
        title: "SYM JET 125 復古經典改裝",
        description: "將現代JET 125打造成復古經典風格。採用巴風特油箱蓋、Ghost Factory水箱罩等復古風格配件。SKUNY大燈護甲保護頭燈，同時增添復古韻味。整體配色採用經典的奶油白，展現溫文爾雅的氣質。",
        category: "scooter",
        style: "retro",
        model: "SYM JET 125",
        tags: ["巴風特", "Ghost Factory", "SKUNY", "復古", "經典"],
        images: [
            "/images/bikes/JET.jpg",
            "/images/bikes/JET.jpg",
            "/images/bikes/JET.jpg"
        ],
        image: "/images/bikes/JET.jpg",
        author: {
            _id: new ObjectId(),
            name: "復古收藏家",
            avatar: "/images/avatars/user6.svg"
        },
        stats: {
            likes: 143,
            comments: 27,
            views: 1180
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-11-18'),
        updatedAt: new Date('2024-11-18')
    },
    {
        title: "SYM MMBCU 125 個性化改裝",
        description: "少見的MMBCU 125個性化改裝案例。搭配AJMB空力套件，營造出獨特的運動化外觀。REYS水箱注入蓋提升散熱效率，同時增加視覺亮點。每個改裝都經過深思熟慮，展現車主的個人品味。",
        category: "scooter",
        style: "custom",
        model: "SYM MMBCU 125",
        tags: ["AJMB", "REYS", "空力套件", "個性化", "獨特"],
        images: [
            "/images/bikes/MMBCU.jpg",
            "/images/bikes/MMBCU.jpg",
            "/images/bikes/MMBCU.jpg"
        ],
        image: "/images/bikes/MMBCU.jpg",
        author: {
            _id: new ObjectId(),
            name: "個性改裝師",
            avatar: "/images/avatars/user7.svg"
        },
        stats: {
            likes: 176,
            comments: 19,
            views: 1450
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-11-15')
    },
    {
        title: "SYM JET 125 保養升級專案",
        description: "展示專業保養與性能升級的JET 125案例。採用擎翔精緻小保養套餐，更換高品質機油與濾清器。同時升級AP手機架背貼等實用配件。這不僅是改裝，更是對愛車的細心呵護，延長車輛使用壽命。",
        category: "scooter",
        style: "maintenance",
        model: "SYM JET 125",
        tags: ["擎翔", "保養", "AP", "升級", "實用"],
        images: [
            "/images/bikes/JET.jpg",
            "/images/bikes/JET.jpg",
            "/images/bikes/JET.jpg"
        ],
        image: "/images/bikes/JET.jpg",
        author: {
            _id: new ObjectId(),
            name: "保養達人",
            avatar: "/images/avatars/user8.svg"
        },
        stats: {
            likes: 98,
            comments: 15,
            views: 890
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-11-12'),
        updatedAt: new Date('2024-11-12')
    }
];

async function migrateGallery() {
    let client;
    
    try {
        console.log('正在連接到 MongoDB...');
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('MongoDB 連接成功！');
        
        const db = client.db();
        const galleriesCollection = db.collection('galleries');
        
        // 檢查是否已有作品資料
        const existingItems = await galleriesCollection.countDocuments();
        console.log(`現有作品數量: ${existingItems}`);
        
        if (existingItems > 0) {
            console.log('清空現有作品資料...');
            await galleriesCollection.deleteMany({});
            console.log('現有作品資料已清空');
        }
        
        // 跳過索引創建，直接導入數據
        console.log('開始導入作品資料...');
        
        // 導入預設作品資料
        const result = await galleriesCollection.insertMany(defaultGalleryItems);
        console.log(`✅ 成功導入 ${result.insertedCount} 個作品`);
        
        // 顯示統計資訊
        const stats = await galleriesCollection.aggregate([
            {
                $group: {
                    _id: '$model',
                    count: { $sum: 1 },
                    totalLikes: { $sum: '$stats.likes' }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();
        
        console.log('\n📊 車款作品統計：');
        stats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} 個作品，${stat.totalLikes} 讚`);
        });
        
        console.log('\n🎉 畫廊資料遷移完成！');
        
    } catch (error) {
        console.error('❌ 遷移失敗:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB 連接已關閉');
        }
    }
}

// 執行遷移
if (require.main === module) {
    migrateGallery();
}

module.exports = { migrateGallery }; 