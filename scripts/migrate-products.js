const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// 加載環境變數
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://Jerry:Jerrylin007@motoweb.xspj1kv.mongodb.net/';

// 產品資料 - 從 products.html 中提取的完整產品資料庫
const productsData = {
    // JET Series - Updated images and added new products
    "jet-z2-fork": { id: "jet-z2-fork", name: "【怪獸工廠Z2 PRO前叉】", price: 18800, image: "images/parts/怪獸工廠Z2 PRO前叉.webp", category: "sym-jet-suspension", mainCategory: "sym-jet", brand: "怪獸工廠", dateAdded: "2024-05-01" },
    "jet-simota-mirror": { id: "jet-simota-mirror", name: "【SIMOTA碳纖維後照鏡】", price: 8000, image: "images/parts/SIMOTA碳纖維後照鏡.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "SIMOTA", dateAdded: "2024-04-20" },
    "jet-masa-disk-fixed": { id: "jet-masa-disk-fixed", name: "【MASA固定碟盤-劃線版】", price: 2188, image: "images/parts/MASA固定碟盤-劃線版.webp", category: "sym-jet-brake", mainCategory: "sym-jet", brand: "MASA", dateAdded: "2024-04-25" },
    "jet-koso-taillight": { id: "jet-koso-taillight", name: "【KOSO衝刺尾燈】", price: 3600, image: "images/parts/KOSO衝刺尾燈.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "KOSO", dateAdded: "2023-12-25" },
    "jet-baphomet-fuel-cap": { id: "jet-baphomet-fuel-cap", name: "【巴風特油箱蓋】", price: 1300, image: "images/parts/巴風特油箱蓋.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "巴風特", dateAdded: "2024-04-11" },
    "jet-gjms-tcd2000": { id: "jet-gjms-tcd2000", name: "【GJMS TCD2000前叉】", price: 9000, image: "images/parts/GJMS TCD2000前叉.webp", category: "sym-jet-suspension", mainCategory: "sym-jet", brand: "GJMS", dateAdded: "2024-03-15"},
    "jet-apexx-gt-exhaust-cover": { id: "jet-apexx-gt-exhaust-cover", name: "【APEXX GT防燙蓋】JET車系通用款", price: 980, image: "images/parts/APEXX GT防燙蓋.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "APEXX", dateAdded: "2024-01-20" },
    "jet-ncy-drive-pulley-set": { id: "jet-ncy-drive-pulley-set", name: "NCY部品 JET 冠軍傳動組 前組", price: 2800, image: "images/parts/placeholder-product.png", category: "sym-jet-power", mainCategory: "sym-jet", brand: "NCY", dateAdded: "2024-03-20" },
    "jet-badpanda-rear-shock": { id: "jet-badpanda-rear-shock", name: "【BadPanda壞熊貓】中置後避震 JET", price: 8500, image: "images/parts/placeholder-product.png", category: "sym-jet-suspension", mainCategory: "sym-jet", brand: "BadPanda", dateAdded: "2024-02-10"},
    "jet-monster-zr-rear-shock": { id: "jet-monster-zr-rear-shock", name: "【怪獸工廠ZR後避震】", price: 14000, image: "images/parts/怪獸工廠ZR後避震.webp", category: "sym-jet-suspension", mainCategory: "sym-jet", brand: "怪獸工廠", dateAdded: "2024-06-01"},
    "jet-limit-fuel-cap": {id: "jet-limit-fuel-cap", name: "【LIMIT日規油箱蓋】", price: 900, image: "images/parts/LIMIT日規油箱蓋.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "LIMIT", dateAdded: "2024-06-02"},
    "jet-skuny-screen-protector": { id: "jet-skuny-screen-protector", name: "【SKUNY硬式螢幕保護殼】", price: 1200, image: "images/parts/SKUNY硬式螢幕保護殼.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "SKUNY", dateAdded: "2024-06-03"},
    "jet-ghost-factory-radiator-cover": { id: "jet-ghost-factory-radiator-cover", name: "【Ghost Factory 水箱罩】", price: 1380, image: "images/parts/Ghost Factory 水箱罩.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "Ghost Factory", dateAdded: "2024-06-04"},
    "jet-masa-floating-disk": { id: "jet-masa-floating-disk", name: "【MASA浮動碟盤】", price: 3000, image: "images/parts/MASA浮動碟盤.webp", category: "sym-jet-brake", mainCategory: "sym-jet", brand: "MASA", dateAdded: "2024-06-05"},
    "jet-skuny-headlight-armor": { id: "jet-skuny-headlight-armor", name: "【SKUNY大燈護甲】", price: 990, image: "images/parts/SKUNY大燈護甲.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "SKUNY", dateAdded: "2024-06-06"},

    // 擎翔車業網站產品資料整合
    // 巴風特排氣管吊架 - 擎翔車業熱門產品
    "cx-baphomet-exhaust-hanger": {id: "cx-baphomet-exhaust-hanger", name: "【巴風特排氣管吊架】", price: 2200, image: "images/parts/placeholder-product.png", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "巴風特", dateAdded: "2024-12-21"},
    
    // KOSO導風胸蓋 - 擎翔車業熱銷
    "cx-koso-air-guide-chest-cover": {id: "cx-koso-air-guide-chest-cover", name: "【KOSO導風胸蓋】", price: 1600, image: "images/parts/KOSO導風胸蓋.webp", category: "sym-drg-appearance", mainCategory: "sym-drg", brand: "KOSO", dateAdded: "2024-12-21"},
    
    // KOSO龍紋序列式方向燈 - 擎翔車業特色產品
    "cx-koso-dragon-sequential-signals": {id: "cx-koso-dragon-sequential-signals", name: "【KOSO龍紋序列式方向燈】", price: 6500, image: "images/parts/KOSO龍紋序列式方向燈.webp", category: "sym-drg-appearance", mainCategory: "sym-drg", brand: "KOSO", dateAdded: "2024-12-21"},
    
    // SKUNY大燈護甲 - 擎翔車業實用配件
    "cx-skuny-headlight-armor": {id: "cx-skuny-headlight-armor", name: "【SKUNY大燈護甲】", price: 990, image: "images/parts/SKUNY大燈護甲.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "SKUNY", dateAdded: "2024-12-21"},
    
    // MASA浮動碟盤 - 擎翔車業煞車升級
    "cx-masa-floating-disk-universal": {id: "cx-masa-floating-disk-universal", name: "【MASA浮動碟盤】通用款", price: 2888, priceRange: "NT$2,888 ~ NT$3,188", image: "images/parts/MASA浮動碟盤.webp", category: "sym-jet-brake", mainCategory: "sym-jet", brand: "MASA", dateAdded: "2024-12-21"},
    
    // Ghost Factory 水箱罩 - 擎翔車業外觀改裝
    "cx-ghost-factory-radiator-cover": {id: "cx-ghost-factory-radiator-cover", name: "【Ghost Factory 水箱罩】", price: 1380, image: "images/parts/Ghost Factory 水箱罩.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "Ghost Factory", dateAdded: "2024-12-21"},
    
    // 亮點LD2尾燈 - 擎翔車業燈系改裝
    "cx-ld2-taillight": {id: "cx-ld2-taillight", name: "【亮點LD2尾燈】", price: 3800, image: "images/parts/亮點LD2尾燈.webp", category: "sym-drg-appearance", mainCategory: "sym-drg", brand: "亮點", dateAdded: "2024-12-21"},
    
    // APEXX GT防燙蓋 - 擎翔車業安全配件
    "cx-apexx-gt-exhaust-cover": {id: "cx-apexx-gt-exhaust-cover", name: "【APEXX GT防燙蓋】", price: 980, image: "images/parts/APEXX GT防燙蓋.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "APEXX", dateAdded: "2024-12-21"},
    
    // SKUNY硬式螢幕保護殼 - 擎翔車業保護配件
    "cx-skuny-screen-protector": {id: "cx-skuny-screen-protector", name: "【SKUNY硬式螢幕保護殼】", price: 1200, image: "images/parts/SKUNY硬式螢幕保護殼.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "SKUNY", dateAdded: "2024-12-21"},
    
    // KOSO衝刺尾燈 - 擎翔車業燈系產品
    "cx-koso-sprint-taillight": {id: "cx-koso-sprint-taillight", name: "【KOSO衝刺尾燈】", price: 3600, image: "images/parts/KOSO衝刺尾燈.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "KOSO", dateAdded: "2024-12-21"},
    
    // KOSO龍紋尾燈 - 擎翔車業高端產品
    "cx-koso-dragon-taillight": {id: "cx-koso-dragon-taillight", name: "【KOSO龍紋尾燈】", price: 6500, image: "images/parts/KOSO龍紋尾燈.webp", category: "sym-drg-appearance", mainCategory: "sym-drg", brand: "KOSO", dateAdded: "2024-12-21"},
    
    // GOWORK短牌架 - 擎翔車業外觀配件
    "cx-gowork-short-license-plate-holder": {id: "cx-gowork-short-license-plate-holder", name: "【GOWORK短牌架】", price: 3300, image: "images/parts/GOWORK短牌架.webp", category: "kymco-krv-appearance", mainCategory: "kymco-krv", brand: "GOWORK", dateAdded: "2024-12-21"},
    
    // AP手機架背貼 - 擎翔車業實用配件
    "cx-ap-phone-mount-sticker": {id: "cx-ap-phone-mount-sticker", name: "【AP手機架背貼】", price: 300, priceRange: "NT$300 ~ NT$350", image: "images/parts/placeholder-product.png", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "AP", dateAdded: "2024-12-21"},
    
    // JSTC車牌上移 - 擎翔車業改裝配件
    "cx-jstc-license-plate-relocator": {id: "cx-jstc-license-plate-relocator", name: "【JSTC車牌上移】", price: 2480, image: "images/parts/JSTC車牌上移.webp", category: "sym-drg-appearance", mainCategory: "sym-drg", brand: "JSTC", dateAdded: "2024-12-21"},
    
    // JSTC赤焰內土除 - 擎翔車業外觀升級
    "cx-jstc-red-flame-inner-fender": {id: "cx-jstc-red-flame-inner-fender", name: "【JSTC赤焰內土除】", price: 4200, image: "images/parts/JSTC赤焰內土除.webp", category: "sym-drg-appearance", mainCategory: "sym-drg", brand: "JSTC", dateAdded: "2024-12-21"},
    
    // LIMIT日規油箱蓋 - 擎翔車業日系配件
    "cx-limit-jdm-fuel-cap": {id: "cx-limit-jdm-fuel-cap", name: "【LIMIT日規油箱蓋】", price: 700, priceRange: "NT$700 ~ NT$1,150", image: "images/parts/LIMIT日規油箱蓋.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "LIMIT", dateAdded: "2024-12-21"},
    
    // 怪獸工廠ZR後避震 - 擎翔車業懸吊系統
    "cx-monster-factory-zr-rear-shock": {id: "cx-monster-factory-zr-rear-shock", name: "【怪獸工廠ZR後避震】", price: 12800, priceRange: "NT$12,800 ~ NT$16,000", image: "images/parts/怪獸工廠ZR後避震.webp", category: "sym-jet-suspension", mainCategory: "sym-jet", brand: "怪獸工廠", dateAdded: "2024-12-21"},
    
    // AJMB空力套件 - 擎翔車業空力改裝
    "cx-ajmb-aero-kit": {id: "cx-ajmb-aero-kit", name: "【AJMB空力套件】", price: 4200, image: "images/parts/AJMB空力套件.webp", category: "sym-mmbcu-appearance", mainCategory: "sym-mmbcu", brand: "AJMB", dateAdded: "2024-12-21"},
    
    // REYS水箱注入蓋 - 擎翔車業冷卻系統
    "cx-reys-radiator-cap": {id: "cx-reys-radiator-cap", name: "【REYS水箱注入蓋】", price: 580, image: "images/parts/REYS水箱注入蓋.webp", category: "sym-jet-power", mainCategory: "sym-jet", brand: "REYS", dateAdded: "2024-12-21"},
    
    // 星爵M5尾燈 - 擎翔車業燈系選擇
    "cx-star-lord-m5-taillight": {id: "cx-star-lord-m5-taillight", name: "【星爵M5尾燈】", price: 3500, priceRange: "NT$3,500 ~ NT$4,800", image: "images/parts/星爵M5尾燈.webp", category: "kymco-krv-appearance", mainCategory: "kymco-krv", brand: "星爵", dateAdded: "2024-12-21"},
    
    // 擎翔超值套餐系列
    "cx-front-assembly-package": {id: "cx-front-assembly-package", name: "【擎翔前總成套餐】", price: 15800, image: "images/parts/placeholder-product.png", category: "sym-jet-suspension", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21"},
    "cx-power-peripheral-package": {id: "cx-power-peripheral-package", name: "【擎翔動力周邊套餐】", price: 8500, image: "images/parts/placeholder-product.png", category: "sym-jet-power", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21"},
    "cx-engine-package": {id: "cx-engine-package", name: "【擎翔引擎套餐】", price: 25000, image: "images/parts/placeholder-product.png", category: "sym-jet-power", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21"},
    
    // 保養專案系列
    "cx-premium-maintenance": {id: "cx-premium-maintenance", name: "【擎翔尊榮大保養】", price: 3500, image: "images/parts/placeholder-product.png", category: "sym-jet-power", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21"},
    "cx-delicate-maintenance": {id: "cx-delicate-maintenance", name: "【擎翔精緻小保養】", price: 1800, image: "images/parts/placeholder-product.png", category: "sym-jet-power", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21"},
    "cx-basic-maintenance": {id: "cx-basic-maintenance", name: "【擎翔基本保養】", price: 1200, image: "images/parts/placeholder-product.png", category: "sym-jet-power", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21"},
    "cx-coolant-maintenance": {id: "cx-coolant-maintenance", name: "【擎翔水箱水保養】", price: 800, image: "images/parts/placeholder-product.png", category: "sym-jet-power", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21"},
    "cx-fork-maintenance": {id: "cx-fork-maintenance", name: "【擎翔前叉保養】", price: 2200, image: "images/parts/placeholder-product.png", category: "sym-jet-suspension", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21"},
    
    // 全系列正PROTI鈦螺絲
    "cx-proti-titanium-bolts-complete-set": {id: "cx-proti-titanium-bolts-complete-set", name: "【全系列正PROTI鈦螺絲】", price: 4500, image: "images/parts/placeholder-product.png", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "PROTI", dateAdded: "2024-12-21"}
};

async function migrateProducts() {
    let client;
    
    try {
        console.log('🚀 開始產品資料遷移...');
        
        // 連接到 MongoDB
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('✅ MongoDB 連接成功');
        
        const db = client.db();
        const collection = db.collection('products');
        
        // 清空現有產品資料（可選）
        console.log('🗑️ 清空現有產品資料...');
        await collection.deleteMany({});
        
        // 轉換產品資料格式
        const products = Object.values(productsData).map(product => ({
            productId: product.id,
            name: product.name,
            price: product.price,
            priceRange: product.priceRange || null,
            image: product.image,
            category: product.category,
            mainCategory: product.mainCategory,
            brand: product.brand,
            description: `${product.name} - 適用於 ${product.mainCategory.replace(/-/g, ' ').toUpperCase()} 車系`,
            stock: Math.floor(Math.random() * 50) + 10, // 隨機庫存 10-60
            isActive: true,
            tags: [
                product.brand,
                product.mainCategory.split('-')[0].toUpperCase(), // SYM, YAMAHA, KYMCO
                product.mainCategory.split('-')[1]?.toUpperCase() || '', // JET, DRG, etc.
                product.category.split('-').pop() // power, brake, suspension, appearance
            ].filter(Boolean),
            createdAt: new Date(product.dateAdded),
            updatedAt: new Date()
        }));
        
        // 批量插入產品
        console.log(`📦 插入 ${products.length} 個產品到資料庫...`);
        const result = await collection.insertMany(products);
        
        console.log(`✅ 成功插入 ${result.insertedCount} 個產品`);
        
        // 建立索引
        console.log('🔍 建立搜尋索引...');
        await collection.createIndex({ 
            name: 'text', 
            description: 'text',
            brand: 'text',
            tags: 'text'
        });
        
        await collection.createIndex({ category: 1 });
        await collection.createIndex({ mainCategory: 1 });
        await collection.createIndex({ brand: 1 });
        await collection.createIndex({ price: 1 });
        await collection.createIndex({ createdAt: -1 });
        
        console.log('✅ 索引建立完成');
        
        // 顯示統計資訊
        const stats = await collection.aggregate([
            {
                $group: {
                    _id: '$mainCategory',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();
        
        console.log('\n📊 產品統計：');
        stats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} 個產品，平均價格: NT$${Math.round(stat.avgPrice)}`);
        });
        
        console.log('\n🎉 產品資料遷移完成！');
        
    } catch (error) {
        console.error('❌ 遷移失敗:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 資料庫連接已關閉');
        }
    }
}

// 執行遷移
if (require.main === module) {
    migrateProducts();
}

module.exports = { migrateProducts, productsData }; 