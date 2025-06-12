/* Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY */
const { MongoClient } = require('mongodb');

// 引入環境變數配置
require('dotenv').config({ path: '.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://Jerry:11890152@motoweb.xspj1kv.mongodb.net/motoweb?retryWrites=true&w=majority';

// 產品圖片映射 - 將真實圖片分配給相應產品（使用正確的productId）
const productImageMapping = {
    // JET系列產品
    'jet-power-upgrade-kit': 'images/parts/ARACER SPORTD.webp',
    'jet-transmission-set': 'images/parts/REVENO傳動.webp',
    'jet-exhaust-system': 'images/parts/牛王SVR排氣管.webp',
    'jet-air-filter': 'images/parts/KOSO燻黑透明空濾蓋.webp',
    'jet-brake-caliper-upgrade': 'images/parts/BREMBO對二大螃蟹.webp',
    'jet-brake-pads': 'images/parts/placeholder-product.png',
    'jet-suspension-kit': 'images/parts/怪獸工廠ZR後避震2.webp',
    'jet-led-headlight': 'images/parts/KOSO龍紋尾燈.webp',
    'jet-body-kit': 'images/parts/星爵M5尾燈.webp',
    
    // DRG系列產品
    'drg-power-upgrade-kit': 'images/parts/ARACER SPORTD.webp',
    'drg-transmission-upgrade': 'images/parts/REVENO傳動.webp',
    'drg-ecu-tuning': 'images/parts/ARACER SPORTD.webp',
    'drg-brembo-caliper': 'images/parts/BREMBO對二大螃蟹.webp',
    'drg-brake-lines': 'images/parts/placeholder-product.png',
    'drg-ohlins-shock': 'images/parts/怪獸工廠ZR後避震2.webp',
    'drg-led-headlight': 'images/parts/星爵M7尾燈.webp',
    'drg-body-kit': 'images/parts/REYS水箱護罩.webp',
    'drg-front-fork': 'images/parts/DY前叉.webp',
    
    // MMBCU系列產品
    'mmbcu-power-kit': 'images/parts/ARACER SPORTD.webp',
    'mmbcu-transmission': 'images/parts/REVENO傳動.webp',
    'mmbcu-brake-kit': 'images/parts/BREMBO對二大螃蟹.webp',
    'mmbcu-suspension-kit': 'images/parts/怪獸工廠ZR後避震2.webp',
    'mmbcu-led-kit': 'images/parts/KOSO焰石尾燈組.webp',
    'mmbcu-front-fork': 'images/parts/CCD C53前叉.webp',
    'mmbcu-exhaust': 'images/parts/毒蛇SP1合格砲管.webp',
    
    // BWS系列產品
    'bws-power-kit': 'images/parts/ARACER SPORTD.webp',
    'bws-exhaust': 'images/parts/黃蜂BT1砲管.webp',
    'bws-transmission': 'images/parts/REVENO傳動.webp',
    'bws-brake-kit': 'images/parts/ANC72大對四卡鉗.webp',
    'bws-brake-disc': 'images/parts/FAR黑金碟盤.webp',
    'bws-suspension': 'images/parts/怪獸工廠ZR後避震2.webp',
    'bws-front-fork': 'images/parts/CCD C13+前叉.webp',
    
    // 勁戰系列產品
    'cygnus-power-upgrade': 'images/parts/ARACER SPORTD.webp',
    'cygnus-led-headlight': 'images/parts/亮點LD2尾燈.webp',
    'cygnus-body-kit': 'images/parts/廣昇999R CNC 鋁合金排骨.webp',
    'cygnus-carbon-parts': 'images/parts/AJMB空力套件.webp',
    'cygnus-rear-shock-upgrade': 'images/parts/怪獸工廠ZR後避震2.webp',
    
    // FORCE系列產品
    'force-smax-power-kit': 'images/parts/ARACER SPORTD.webp',
    'force-smax-exhaust': 'images/parts/黃蜂BT1砲管.webp',
    'force-smax-transmission': 'images/parts/REVENO傳動.webp',
    'force-smax-brake-kit': 'images/parts/BREMBO對二大螃蟹.webp',
    'force-smax-brake-disc': 'images/parts/FAR黑金碟盤.webp',
    'force-smax-suspension': 'images/parts/怪獸工廠ZR後避震2.webp',
    'force-smax-front-fork': 'images/parts/野蠻公牛ARX經典版預載可調前叉.webp',
    'force-smax-led-kit': 'images/parts/KOSO龍紋序列式方向燈.webp',
    'force-smax-body-kit': 'images/parts/REYS水箱護罩.webp',
    
    // FORCE2.0系列產品
    'force2-power-kit': 'images/parts/ARACER SPORTD.webp',
    'force2-exhaust': 'images/parts/毒蛇SP1合格砲管.webp',
    'force2-transmission': 'images/parts/REVENO傳動.webp',
    'force2-brake-kit': 'images/parts/ANC72大對四卡鉗.webp',
    'force2-brake-disc': 'images/parts/FAR黑金碟盤.webp',
    'force2-suspension': 'images/parts/怪獸工廠ZR後避震2.webp',
    'force2-front-fork': 'images/parts/野蠻公牛ARX經典版預載可調前叉.webp',
    'force2-led-kit': 'images/parts/APEXX媚眼.webp',
    'force2-body-kit': 'images/parts/AJMB空力套件.webp',
    
    // RACING/KRV系列產品
    'racing-power-kit': 'images/parts/ARACER SPORTD.webp',
    'racing-exhaust': 'images/parts/牛王SVR排氣管.webp',
    'racing-transmission': 'images/parts/REVENO傳動.webp',
    'racing-brake-kit': 'images/parts/BREMBO對二大螃蟹.webp',
    'racing-brake-disc': 'images/parts/FAR黑金碟盤.webp',
    'racing-suspension': 'images/parts/怪獸工廠ZR後避震2.webp',
    'racing-front-fork': 'images/parts/CCD C13+前叉.webp',
    'racing-led-kit': 'images/parts/KOSO導風胸蓋.webp',
    'racing-body-kit': 'images/parts/KOSO導風胸蓋.webp',
    
    'krv-power-kit': 'images/parts/ARACER SPORTD.webp',
    'krv-exhaust': 'images/parts/黃蜂BT1砲管.webp',
    'krv-transmission': 'images/parts/REVENO傳動.webp',
    'krv-brake-kit': 'images/parts/ANC72大對四卡鉗.webp',
    'krv-brake-disc': 'images/parts/FAR黑金碟盤.webp',
    'krv-suspension': 'images/parts/怪獸工廠ZR後避震2.webp',
    'krv-front-fork': 'images/parts/DY前叉.webp',
    'krv-led-kit': 'images/parts/AJ尾燈.webp',
    'krv-body-kit': 'images/parts/REYS水箱護罩.webp',
    'krv-taillight': 'images/parts/星爵M5尾燈.webp',
    'krv-license-plate-holder': 'images/parts/GOWORK短牌架.webp',
    
    // 通用產品
    'popular-transmission-1': 'images/parts/REVENO傳動.webp',
    'popular-transmission-2': 'images/parts/REVENO傳動.webp',
    'popular-transmission-3': 'images/parts/REVENO傳動.webp',
    'exhaust-system-1': 'images/parts/牛王SVR排氣管.webp',
    'exhaust-system-2': 'images/parts/黃蜂BT1砲管.webp',
    'exhaust-system-3': 'images/parts/毒蛇SP1合格砲管.webp',
    'protiv-titanium-bolts': 'images/parts/placeholder-product.png',
    
    // 其他配件
    'relay-upgrade': 'images/parts/繼電器.webp'
};

async function updateProductImages() {
    let client;
    
    try {
        console.log('🖼️ 開始更新產品圖片...');
        
        // 連接到 MongoDB
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('✅ MongoDB 連接成功');
        
        const db = client.db();
        const collection = db.collection('products');
        
        let updateCount = 0;
        
        // 逐一更新產品圖片
        for (const [productId, imagePath] of Object.entries(productImageMapping)) {
            const result = await collection.updateOne(
                { productId: productId },
                { 
                    $set: { 
                        image: imagePath,
                        updatedAt: new Date()
                    }
                }
            );
            
            if (result.matchedCount > 0) {
                console.log(`✅ 更新產品 ${productId} 的圖片: ${imagePath}`);
                updateCount++;
            } else {
                console.log(`⚠️ 找不到產品 ${productId}`);
            }
        }
        
        // 為沒有映射的產品設置默認圖片
        const unmappedProducts = await collection.updateMany(
            { 
                productId: { $nin: Object.keys(productImageMapping) },
                image: 'images/parts/placeholder-product.png'
            },
            { 
                $set: { 
                    image: 'images/parts/placeholder-product.png',
                    updatedAt: new Date()
                }
            }
        );
        
        console.log(`\n📊 更新統計：`);
        console.log(`✅ 成功更新 ${updateCount} 個產品的圖片`);
        console.log(`🔄 ${unmappedProducts.modifiedCount} 個產品保持默認圖片`);
        
        // 顯示更新後的統計
        const totalProducts = await collection.countDocuments();
        const productsWithRealImages = await collection.countDocuments({
            image: { $ne: 'images/parts/placeholder-product.png' }
        });
        
        console.log(`\n📈 最終統計：`);
        console.log(`📦 總產品數: ${totalProducts}`);
        console.log(`🖼️ 有真實圖片: ${productsWithRealImages}`);
        console.log(`🖼️ 使用默認圖片: ${totalProducts - productsWithRealImages}`);
        console.log(`📊 真實圖片比例: ${Math.round((productsWithRealImages / totalProducts) * 100)}%`);
        
        console.log('\n🎉 產品圖片更新完成！');
        
    } catch (error) {
        console.error('❌ 更新失敗:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 資料庫連接已關閉');
        }
    }
}

// 執行更新
if (require.main === module) {
    updateProductImages();
}

module.exports = { updateProductImages }; 