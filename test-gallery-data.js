const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/motomod';

// 測試畫廊數據
const testGalleryData = [
    {
        title: "SYM DRG 運動化改裝",
        description: "對 SYM DRG 進行了全面的運動化改裝，包括排氣系統、懸吊調校、外觀套件等。整體改裝提升了車輛的性能表現和視覺效果。",
        category: "sport",
        style: "racing",
        model: "SYM DRG",
        tags: ["排氣管", "懸吊", "外觀", "性能"],
        images: ["/images/bikes/DRG.jpg"],
        image: "/images/bikes/DRG.jpg",
        author: {
            _id: new ObjectId(),
            name: "改裝達人",
            avatar: "/images/default-avatar.svg"
        },
        stats: {
            likes: 45,
            comments: 12,
            views: 230
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-11-15')
    },
    {
        title: "SYM MMBCU 日常通勤改裝",
        description: "針對日常通勤需求對 MMBCU 進行實用性改裝，增加了儲物空間、舒適度配件和安全裝備，讓通勤更加便利。",
        category: "naked",
        style: "street",
        model: "SYM MMBCU",
        tags: ["通勤", "實用", "舒適", "安全"],
        images: ["/images/bikes/MMBCU.jpg"],
        image: "/images/bikes/MMBCU.jpg",
        author: {
            _id: new ObjectId(),
            name: "通勤族",
            avatar: "/images/default-avatar.svg"
        },
        stats: {
            likes: 28,
            comments: 8,
            views: 156
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date('2024-11-20')
    },
    {
        title: "SYM Jet 街頭風格改裝",
        description: "為 SYM Jet 打造的街頭風格改裝，融合了復古與現代元素，創造出獨特的個人風格。改裝重點在於外觀設計和騎乘體驗。",
        category: "custom",
        style: "street",
        model: "SYM Jet",
        tags: ["街頭", "復古", "個性", "外觀"],
        images: ["/images/bikes/JET.jpg"],
        image: "/images/bikes/JET.jpg",
        author: {
            _id: new ObjectId(),
            name: "街頭藝術家",
            avatar: "/images/default-avatar.svg"
        },
        stats: {
            likes: 67,
            comments: 15,
            views: 342
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-11-25'),
        updatedAt: new Date('2024-11-25')
    },
    {
        title: "經典速克達改裝案例",
        description: "經典速克達的現代化改裝，保留原有的復古韻味同時加入現代科技元素，完美融合了傳統與創新。",
        category: "cruiser",
        style: "cafe",
        model: "經典速克達",
        tags: ["復古", "經典", "現代化", "融合"],
        images: ["/images/bikes/classic-scooter.jpg"],
        image: "/images/bikes/classic-scooter.jpg",
        author: {
            _id: new ObjectId(),
            name: "復古愛好者",
            avatar: "/images/default-avatar.svg"
        },
        stats: {
            likes: 89,
            comments: 23,
            views: 445
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01')
    },
    {
        title: "越野改裝專案",
        description: "專為越野騎行設計的改裝方案，強化了懸吊系統、保護裝置和動力輸出，讓車輛能夠應對各種惡劣路況。",
        category: "adventure",
        style: "scrambler",
        model: "越野專用車",
        tags: ["越野", "強化", "保護", "性能"],
        images: ["/images/bikes/adventure.jpg"],
        image: "/images/bikes/adventure.jpg",
        author: {
            _id: new ObjectId(),
            name: "越野專家",
            avatar: "/images/default-avatar.svg"
        },
        stats: {
            likes: 52,
            comments: 18,
            views: 287
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-05')
    },
    {
        title: "競賽級性能改裝",
        description: "針對賽道使用的極致性能改裝，包括引擎調校、輕量化改裝、空氣動力學套件等，追求極限性能表現。",
        category: "sport",
        style: "racing",
        model: "競賽車款",
        tags: ["競賽", "性能", "輕量化", "極限"],
        images: ["/images/bikes/racing.jpg"],
        image: "/images/bikes/racing.jpg",
        author: {
            _id: new ObjectId(),
            name: "賽車手",
            avatar: "/images/default-avatar.svg"
        },
        stats: {
            likes: 134,
            comments: 45,
            views: 678
        },
        likes: [],
        comments: [],
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-10')
    }
];

async function insertTestData() {
    let client;
    try {
        console.log('連接到 MongoDB...');
        client = new MongoClient(MONGO_URI);
        await client.connect();
        
        const db = client.db();
        const collection = db.collection('gallery');
        
        // 清空現有數據（可選）
        await collection.deleteMany({});
        console.log('已清空現有畫廊數據');
        
        // 插入測試數據
        const result = await collection.insertMany(testGalleryData);
        console.log(`成功插入 ${result.insertedCount} 筆測試數據`);
        
        // 顯示插入的數據
        console.log('插入的數據 ID:');
        Object.values(result.insertedIds).forEach((id, index) => {
            console.log(`${index + 1}. ${testGalleryData[index].title} - ID: ${id}`);
        });
        
    } catch (error) {
        console.error('插入測試數據失敗:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('數據庫連接已關閉');
        }
    }
}

// 執行插入操作
insertTestData(); 