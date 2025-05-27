const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// 加載環境變數
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/motoweb';

// 擎翔車業完整產品資料庫 - 基於官網 https://www.cxmotor.com.tw/products
const cxMotorProducts = {
    // ==================== SYM車系 ====================
    
    // JET 全車系 - 動力系統升級
    "jet-power-upgrade-kit": { id: "jet-power-upgrade-kit", name: "【JET動力升級套件】", price: 15800, image: "images/parts/placeholder-product.png", category: "sym-jet-power", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21" },
    "jet-transmission-set": { id: "jet-transmission-set", name: "【JET傳動組】", price: 4200, image: "images/parts/placeholder-product.png", category: "sym-jet-power", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21" },
    "jet-exhaust-system": { id: "jet-exhaust-system", name: "【JET排氣管系統】", price: 12800, image: "images/parts/placeholder-product.png", category: "sym-jet-power", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21" },
    "jet-air-filter": { id: "jet-air-filter", name: "【JET高流量空濾】", price: 1800, image: "images/parts/placeholder-product.png", category: "sym-jet-power", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // JET 全車系 - 煞車制動升級
    "jet-brake-caliper-upgrade": { id: "jet-brake-caliper-upgrade", name: "【JET對四卡鉗升級】", price: 6800, image: "images/parts/placeholder-product.png", category: "sym-jet-brake", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21" },
    "jet-brake-disc-upgrade": { id: "jet-brake-disc-upgrade", name: "【JET浮動碟盤】", price: 3200, image: "images/parts/MASA浮動碟盤.webp", category: "sym-jet-brake", mainCategory: "sym-jet", brand: "MASA", dateAdded: "2024-12-21" },
    "jet-brake-pads": { id: "jet-brake-pads", name: "【JET高性能來令片】", price: 1200, image: "images/parts/placeholder-product.png", category: "sym-jet-brake", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // JET 全車系 - 避震懸吊升級
    "jet-front-fork-upgrade": { id: "jet-front-fork-upgrade", name: "【JET前叉升級】", price: 18800, image: "images/parts/怪獸工廠Z2 PRO前叉.webp", category: "sym-jet-suspension", mainCategory: "sym-jet", brand: "怪獸工廠", dateAdded: "2024-12-21" },
    "jet-rear-shock-upgrade": { id: "jet-rear-shock-upgrade", name: "【JET後避震升級】", price: 14000, image: "images/parts/怪獸工廠ZR後避震.webp", category: "sym-jet-suspension", mainCategory: "sym-jet", brand: "怪獸工廠", dateAdded: "2024-12-21" },
    "jet-suspension-kit": { id: "jet-suspension-kit", name: "【JET懸吊套件】", price: 25000, image: "images/parts/placeholder-product.png", category: "sym-jet-suspension", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // JET 全車系 - 熱門外觀燈系改裝
    "jet-led-headlight": { id: "jet-led-headlight", name: "【JET LED大燈】", price: 4200, image: "images/parts/placeholder-product.png", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "KOSO", dateAdded: "2024-12-21" },
    "jet-led-taillight": { id: "jet-led-taillight", name: "【JET LED尾燈】", price: 3600, image: "images/parts/KOSO衝刺尾燈.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "KOSO", dateAdded: "2024-12-21" },
    "jet-carbon-mirror": { id: "jet-carbon-mirror", name: "【JET碳纖維後照鏡】", price: 8000, image: "images/parts/SIMOTA碳纖維後照鏡.webp", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "SIMOTA", dateAdded: "2024-12-21" },
    "jet-body-kit": { id: "jet-body-kit", name: "【JET外觀套件】", price: 5800, image: "images/parts/placeholder-product.png", category: "sym-jet-appearance", mainCategory: "sym-jet", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // DRG - 動力系統升級
    "drg-power-upgrade-kit": { id: "drg-power-upgrade-kit", name: "【DRG動力升級套件】", price: 18800, image: "images/parts/placeholder-product.png", category: "sym-drg-power", mainCategory: "sym-drg", brand: "擎翔", dateAdded: "2024-12-21" },
    "drg-exhaust-system": { id: "drg-exhaust-system", name: "【DRG排氣管系統】", price: 15800, image: "images/parts/牛王SVR排氣管.webp", category: "sym-drg-power", mainCategory: "sym-drg", brand: "牛王", dateAdded: "2024-12-21" },
    "drg-transmission-upgrade": { id: "drg-transmission-upgrade", name: "【DRG傳動升級】", price: 6800, image: "images/parts/placeholder-product.png", category: "sym-drg-power", mainCategory: "sym-drg", brand: "擎翔", dateAdded: "2024-12-21" },
    "drg-ecu-tuning": { id: "drg-ecu-tuning", name: "【DRG ECU調校】", price: 12000, image: "images/parts/placeholder-product.png", category: "sym-drg-power", mainCategory: "sym-drg", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // DRG - 煞車制動升級
    "drg-brembo-caliper": { id: "drg-brembo-caliper", name: "【DRG Brembo卡鉗】", price: 15000, image: "images/parts/placeholder-product.png", category: "sym-drg-brake", mainCategory: "sym-drg", brand: "Brembo", dateAdded: "2024-12-21" },
    "drg-floating-disc": { id: "drg-floating-disc", name: "【DRG浮動碟盤】", price: 3800, image: "images/parts/MASA浮動碟盤.webp", category: "sym-drg-brake", mainCategory: "sym-drg", brand: "MASA", dateAdded: "2024-12-21" },
    "drg-brake-lines": { id: "drg-brake-lines", name: "【DRG金屬油管】", price: 2200, image: "images/parts/placeholder-product.png", category: "sym-drg-brake", mainCategory: "sym-drg", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // DRG - 避震懸吊升級
    "drg-ohlins-shock": { id: "drg-ohlins-shock", name: "【DRG Öhlins避震】", price: 32000, image: "images/parts/placeholder-product.png", category: "sym-drg-suspension", mainCategory: "sym-drg", brand: "Öhlins", dateAdded: "2024-12-21" },
    "drg-front-fork": { id: "drg-front-fork", name: "【DRG前叉升級】", price: 18800, image: "images/parts/怪獸工廠Z2 PRO前叉.webp", category: "sym-drg-suspension", mainCategory: "sym-drg", brand: "怪獸工廠", dateAdded: "2024-12-21" },
    "drg-rear-shock": { id: "drg-rear-shock", name: "【DRG後避震】", price: 15000, image: "images/parts/怪獸工廠ZR後避震.webp", category: "sym-drg-suspension", mainCategory: "sym-drg", brand: "怪獸工廠", dateAdded: "2024-12-21" },
    
    // DRG - 熱門燈系外觀改裝
    "drg-led-headlight": { id: "drg-led-headlight", name: "【DRG LED大燈】", price: 6800, image: "images/parts/placeholder-product.png", category: "sym-drg-appearance", mainCategory: "sym-drg", brand: "KOSO", dateAdded: "2024-12-21" },
    "drg-sequential-signals": { id: "drg-sequential-signals", name: "【DRG序列式方向燈】", price: 6500, image: "images/parts/KOSO龍紋序列式方向燈.webp", category: "sym-drg-appearance", mainCategory: "sym-drg", brand: "KOSO", dateAdded: "2024-12-21" },
    "drg-taillight": { id: "drg-taillight", name: "【DRG尾燈】", price: 3800, image: "images/parts/亮點LD2尾燈.webp", category: "sym-drg-appearance", mainCategory: "sym-drg", brand: "亮點", dateAdded: "2024-12-21" },
    "drg-body-kit": { id: "drg-body-kit", name: "【DRG外觀套件】", price: 8800, image: "images/parts/placeholder-product.png", category: "sym-drg-appearance", mainCategory: "sym-drg", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // 黑曼巴MMBCU - 動力系統升級
    "mmbcu-power-kit": { id: "mmbcu-power-kit", name: "【MMBCU動力套件】", price: 22000, image: "images/parts/placeholder-product.png", category: "sym-mmbcu-power", mainCategory: "sym-mmbcu", brand: "擎翔", dateAdded: "2024-12-21" },
    "mmbcu-exhaust": { id: "mmbcu-exhaust", name: "【MMBCU排氣管】", price: 18800, image: "images/parts/牛王SVR排氣管.webp", category: "sym-mmbcu-power", mainCategory: "sym-mmbcu", brand: "牛王", dateAdded: "2024-12-21" },
    "mmbcu-transmission": { id: "mmbcu-transmission", name: "【MMBCU傳動組】", price: 8800, image: "images/parts/placeholder-product.png", category: "sym-mmbcu-power", mainCategory: "sym-mmbcu", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // 黑曼巴MMBCU - 煞車制動升級
    "mmbcu-brake-kit": { id: "mmbcu-brake-kit", name: "【MMBCU煞車套件】", price: 18000, image: "images/parts/placeholder-product.png", category: "sym-mmbcu-brake", mainCategory: "sym-mmbcu", brand: "Brembo", dateAdded: "2024-12-21" },
    "mmbcu-floating-disc": { id: "mmbcu-floating-disc", name: "【MMBCU浮動碟盤】", price: 4200, image: "images/parts/MASA浮動碟盤.webp", category: "sym-mmbcu-brake", mainCategory: "sym-mmbcu", brand: "MASA", dateAdded: "2024-12-21" },
    
    // 黑曼巴MMBCU - 懸吊避震升級
    "mmbcu-suspension-kit": { id: "mmbcu-suspension-kit", name: "【MMBCU懸吊套件】", price: 35000, image: "images/parts/placeholder-product.png", category: "sym-mmbcu-suspension", mainCategory: "sym-mmbcu", brand: "Öhlins", dateAdded: "2024-12-21" },
    "mmbcu-front-fork": { id: "mmbcu-front-fork", name: "【MMBCU前叉】", price: 22000, image: "images/parts/怪獸工廠Z2 PRO前叉.webp", category: "sym-mmbcu-suspension", mainCategory: "sym-mmbcu", brand: "怪獸工廠", dateAdded: "2024-12-21" },
    
    // 黑曼巴MMBCU - 熱門外觀燈系改裝
    "mmbcu-led-kit": { id: "mmbcu-led-kit", name: "【MMBCU LED套件】", price: 12800, image: "images/parts/placeholder-product.png", category: "sym-mmbcu-appearance", mainCategory: "sym-mmbcu", brand: "KOSO", dateAdded: "2024-12-21" },
    "mmbcu-body-kit": { id: "mmbcu-body-kit", name: "【MMBCU外觀套件】", price: 15800, image: "images/parts/AJMB空力套件.webp", category: "sym-mmbcu-appearance", mainCategory: "sym-mmbcu", brand: "AJMB", dateAdded: "2024-12-21" },
    
    // ==================== YAMAHA車系 ====================
    
    // BWS車系 - 動力系統升級
    "bws-power-kit": { id: "bws-power-kit", name: "【BWS動力套件】", price: 16800, image: "images/parts/placeholder-product.png", category: "yamaha-bws-power", mainCategory: "yamaha-bws", brand: "擎翔", dateAdded: "2024-12-21" },
    "bws-exhaust": { id: "bws-exhaust", name: "【BWS排氣管】", price: 12800, image: "images/parts/placeholder-product.png", category: "yamaha-bws-power", mainCategory: "yamaha-bws", brand: "擎翔", dateAdded: "2024-12-21" },
    "bws-transmission": { id: "bws-transmission", name: "【BWS傳動組】", price: 5800, image: "images/parts/placeholder-product.png", category: "yamaha-bws-power", mainCategory: "yamaha-bws", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // BWS車系 - 煞車制動升級
    "bws-brake-kit": { id: "bws-brake-kit", name: "【BWS煞車套件】", price: 8800, image: "images/parts/placeholder-product.png", category: "yamaha-bws-brake", mainCategory: "yamaha-bws", brand: "擎翔", dateAdded: "2024-12-21" },
    "bws-brake-disc": { id: "bws-brake-disc", name: "【BWS碟盤】", price: 3200, image: "images/parts/placeholder-product.png", category: "yamaha-bws-brake", mainCategory: "yamaha-bws", brand: "MASA", dateAdded: "2024-12-21" },
    
    // BWS車系 - 避震懸吊升級
    "bws-suspension": { id: "bws-suspension", name: "【BWS避震套件】", price: 18800, image: "images/parts/placeholder-product.png", category: "yamaha-bws-suspension", mainCategory: "yamaha-bws", brand: "YSS", dateAdded: "2024-12-21" },
    "bws-front-fork": { id: "bws-front-fork", name: "【BWS前叉】", price: 15800, image: "images/parts/placeholder-product.png", category: "yamaha-bws-suspension", mainCategory: "yamaha-bws", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // BWS車系 - 熱門外觀燈系升級
    "bws-led-kit": { id: "bws-led-kit", name: "【BWS LED套件】", price: 6800, image: "images/parts/placeholder-product.png", category: "yamaha-bws-appearance", mainCategory: "yamaha-bws", brand: "KOSO", dateAdded: "2024-12-21" },
    "bws-body-kit": { id: "bws-body-kit", name: "【BWS外觀套件】", price: 8800, image: "images/parts/placeholder-product.png", category: "yamaha-bws-appearance", mainCategory: "yamaha-bws", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // 勁戰車系 - 動力系統升級
    "cygnus-power-upgrade": { id: "cygnus-power-upgrade", name: "【勁戰動力升級】", price: 18800, image: "images/parts/placeholder-product.png", category: "yamaha-cygnus-power", mainCategory: "yamaha-cygnus", brand: "擎翔", dateAdded: "2024-12-21" },
    "cygnus-exhaust-system": { id: "cygnus-exhaust-system", name: "【勁戰排氣管系統】", price: 15800, image: "images/parts/黃蜂BT1砲管.webp", category: "yamaha-cygnus-power", mainCategory: "yamaha-cygnus", brand: "黃蜂", dateAdded: "2024-12-21" },
    "cygnus-transmission-kit": { id: "cygnus-transmission-kit", name: "【勁戰傳動套件】", price: 6800, image: "images/parts/REVENO傳動2.webp", category: "yamaha-cygnus-power", mainCategory: "yamaha-cygnus", brand: "REVENO", dateAdded: "2024-12-21" },
    "cygnus-ecu-flash": { id: "cygnus-ecu-flash", name: "【勁戰ECU調校】", price: 8000, image: "images/parts/ARACER SPORTD.webp", category: "yamaha-cygnus-power", mainCategory: "yamaha-cygnus", brand: "ARACER", dateAdded: "2024-12-21" },
    
    // 勁戰車系 - 煞車制動升級
    "cygnus-brake-upgrade": { id: "cygnus-brake-upgrade", name: "【勁戰煞車升級】", price: 12800, image: "images/parts/BREMBO對二大螃蟹2.webp", category: "yamaha-cygnus-brake", mainCategory: "yamaha-cygnus", brand: "BREMBO", dateAdded: "2024-12-21" },
    "cygnus-floating-disc": { id: "cygnus-floating-disc", name: "【勁戰浮動碟盤】", price: 3800, image: "images/parts/FAR黑金碟盤.webp", category: "yamaha-cygnus-brake", mainCategory: "yamaha-cygnus", brand: "FAR", dateAdded: "2024-12-21" },
    "cygnus-brake-pads": { id: "cygnus-brake-pads", name: "【勁戰來令片】", price: 1500, image: "images/parts/placeholder-product.png", category: "yamaha-cygnus-brake", mainCategory: "yamaha-cygnus", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // 勁戰車系 - 避震懸吊升級
    "cygnus-suspension-upgrade": { id: "cygnus-suspension-upgrade", name: "【勁戰懸吊升級】", price: 25000, image: "images/parts/野蠻公牛ARX經典版預載可調前叉.webp", category: "yamaha-cygnus-suspension", mainCategory: "yamaha-cygnus", brand: "野蠻公牛", dateAdded: "2024-12-21" },
    "cygnus-front-fork-upgrade": { id: "cygnus-front-fork-upgrade", name: "【勁戰前叉升級】", price: 18800, image: "images/parts/CCD C53前叉.webp", category: "yamaha-cygnus-suspension", mainCategory: "yamaha-cygnus", brand: "CCD", dateAdded: "2024-12-21" },
    "cygnus-rear-shock-upgrade": { id: "cygnus-rear-shock-upgrade", name: "【勁戰後避震升級】", price: 12800, image: "images/parts/placeholder-product.png", category: "yamaha-cygnus-suspension", mainCategory: "yamaha-cygnus", brand: "YSS", dateAdded: "2024-12-21" },
    
    // 勁戰車系 - 熱門外觀燈系升級
    "cygnus-led-headlight": { id: "cygnus-led-headlight", name: "【勁戰LED大燈】", price: 4200, image: "images/parts/placeholder-product.png", category: "yamaha-cygnus-appearance", mainCategory: "yamaha-cygnus", brand: "KOSO", dateAdded: "2024-12-21" },
    "cygnus-body-kit": { id: "cygnus-body-kit", name: "【勁戰外觀套件】", price: 8800, image: "images/parts/廣昇999R CNC 鋁合金排骨.webp", category: "yamaha-cygnus-appearance", mainCategory: "yamaha-cygnus", brand: "廣昇", dateAdded: "2024-12-21" },
    "cygnus-carbon-parts": { id: "cygnus-carbon-parts", name: "【勁戰碳纖維套件】", price: 12800, image: "images/parts/placeholder-product.png", category: "yamaha-cygnus-appearance", mainCategory: "yamaha-cygnus", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // FORCE1.0/SMAX - 動力系統升級
    "force-smax-power-kit": { id: "force-smax-power-kit", name: "【FORCE/SMAX動力套件】", price: 22000, image: "images/parts/placeholder-product.png", category: "yamaha-force-smax-power", mainCategory: "yamaha-force-smax", brand: "擎翔", dateAdded: "2024-12-21" },
    "force-smax-exhaust": { id: "force-smax-exhaust", name: "【FORCE/SMAX排氣管】", price: 18800, image: "images/parts/placeholder-product.png", category: "yamaha-force-smax-power", mainCategory: "yamaha-force-smax", brand: "擎翔", dateAdded: "2024-12-21" },
    "force-smax-transmission": { id: "force-smax-transmission", name: "【FORCE/SMAX傳動】", price: 8800, image: "images/parts/placeholder-product.png", category: "yamaha-force-smax-power", mainCategory: "yamaha-force-smax", brand: "Malossi", dateAdded: "2024-12-21" },
    
    // FORCE1.0/SMAX - 煞車制動升級
    "force-smax-brake-kit": { id: "force-smax-brake-kit", name: "【FORCE/SMAX煞車套件】", price: 15800, image: "images/parts/placeholder-product.png", category: "yamaha-force-smax-brake", mainCategory: "yamaha-force-smax", brand: "Brembo", dateAdded: "2024-12-21" },
    "force-smax-brake-disc": { id: "force-smax-brake-disc", name: "【FORCE/SMAX碟盤】", price: 4200, image: "images/parts/placeholder-product.png", category: "yamaha-force-smax-brake", mainCategory: "yamaha-force-smax", brand: "MASA", dateAdded: "2024-12-21" },
    
    // FORCE1.0/SMAX - 避震懸吊升級
    "force-smax-suspension": { id: "force-smax-suspension", name: "【FORCE/SMAX懸吊套件】", price: 28000, image: "images/parts/placeholder-product.png", category: "yamaha-force-smax-suspension", mainCategory: "yamaha-force-smax", brand: "Öhlins", dateAdded: "2024-12-21" },
    "force-smax-front-fork": { id: "force-smax-front-fork", name: "【FORCE/SMAX前叉】", price: 22000, image: "images/parts/placeholder-product.png", category: "yamaha-force-smax-suspension", mainCategory: "yamaha-force-smax", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // FORCE1.0/SMAX - 熱門外觀燈系升級
    "force-smax-led-kit": { id: "force-smax-led-kit", name: "【FORCE/SMAX LED套件】", price: 8800, image: "images/parts/placeholder-product.png", category: "yamaha-force-smax-appearance", mainCategory: "yamaha-force-smax", brand: "KOSO", dateAdded: "2024-12-21" },
    "force-smax-body-kit": { id: "force-smax-body-kit", name: "【FORCE/SMAX外觀套件】", price: 12800, image: "images/parts/placeholder-product.png", category: "yamaha-force-smax-appearance", mainCategory: "yamaha-force-smax", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // FORCE2.0 - 動力系統升級
    "force2-power-kit": { id: "force2-power-kit", name: "【FORCE2.0動力套件】", price: 25000, image: "images/parts/placeholder-product.png", category: "yamaha-force2-power", mainCategory: "yamaha-force2", brand: "擎翔", dateAdded: "2024-12-21" },
    "force2-exhaust": { id: "force2-exhaust", name: "【FORCE2.0排氣管】", price: 22000, image: "images/parts/placeholder-product.png", category: "yamaha-force2-power", mainCategory: "yamaha-force2", brand: "擎翔", dateAdded: "2024-12-21" },
    "force2-transmission": { id: "force2-transmission", name: "【FORCE2.0傳動】", price: 12800, image: "images/parts/placeholder-product.png", category: "yamaha-force2-power", mainCategory: "yamaha-force2", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // FORCE2.0 - 煞車制動升級
    "force2-brake-kit": { id: "force2-brake-kit", name: "【FORCE2.0煞車套件】", price: 18800, image: "images/parts/placeholder-product.png", category: "yamaha-force2-brake", mainCategory: "yamaha-force2", brand: "Brembo", dateAdded: "2024-12-21" },
    "force2-brake-disc": { id: "force2-brake-disc", name: "【FORCE2.0碟盤】", price: 5800, image: "images/parts/placeholder-product.png", category: "yamaha-force2-brake", mainCategory: "yamaha-force2", brand: "MASA", dateAdded: "2024-12-21" },
    
    // FORCE2.0 - 避震懸吊升級
    "force2-suspension": { id: "force2-suspension", name: "【FORCE2.0懸吊套件】", price: 35000, image: "images/parts/placeholder-product.png", category: "yamaha-force2-suspension", mainCategory: "yamaha-force2", brand: "Öhlins", dateAdded: "2024-12-21" },
    "force2-front-fork": { id: "force2-front-fork", name: "【FORCE2.0前叉】", price: 25000, image: "images/parts/placeholder-product.png", category: "yamaha-force2-suspension", mainCategory: "yamaha-force2", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // FORCE2.0 - 熱門外觀燈系升級
    "force2-led-kit": { id: "force2-led-kit", name: "【FORCE2.0 LED套件】", price: 12800, image: "images/parts/placeholder-product.png", category: "yamaha-force2-appearance", mainCategory: "yamaha-force2", brand: "KOSO", dateAdded: "2024-12-21" },
    "force2-body-kit": { id: "force2-body-kit", name: "【FORCE2.0外觀套件】", price: 18800, image: "images/parts/placeholder-product.png", category: "yamaha-force2-appearance", mainCategory: "yamaha-force2", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // ==================== KYMCO車系 ====================
    
    // 雷霆s125/150 - 動力系統升級
    "racing-power-kit": { id: "racing-power-kit", name: "【雷霆動力套件】", price: 18800, image: "images/parts/placeholder-product.png", category: "kymco-racings-power", mainCategory: "kymco-racings", brand: "擎翔", dateAdded: "2024-12-21" },
    "racing-exhaust": { id: "racing-exhaust", name: "【雷霆排氣管】", price: 15800, image: "images/parts/placeholder-product.png", category: "kymco-racings-power", mainCategory: "kymco-racings", brand: "擎翔", dateAdded: "2024-12-21" },
    "racing-transmission": { id: "racing-transmission", name: "【雷霆傳動組】", price: 6800, image: "images/parts/placeholder-product.png", category: "kymco-racings-power", mainCategory: "kymco-racings", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // 雷霆s125/150 - 煞車制動升級
    "racing-brake-kit": { id: "racing-brake-kit", name: "【雷霆煞車套件】", price: 12800, image: "images/parts/placeholder-product.png", category: "kymco-racings-brake", mainCategory: "kymco-racings", brand: "擎翔", dateAdded: "2024-12-21" },
    "racing-brake-disc": { id: "racing-brake-disc", name: "【雷霆碟盤】", price: 3800, image: "images/parts/placeholder-product.png", category: "kymco-racings-brake", mainCategory: "kymco-racings", brand: "MASA", dateAdded: "2024-12-21" },
    
    // 雷霆s125/150 - 避震懸吊升級
    "racing-suspension": { id: "racing-suspension", name: "【雷霆懸吊套件】", price: 22000, image: "images/parts/placeholder-product.png", category: "kymco-racings-suspension", mainCategory: "kymco-racings", brand: "YSS", dateAdded: "2024-12-21" },
    "racing-front-fork": { id: "racing-front-fork", name: "【雷霆前叉】", price: 18800, image: "images/parts/placeholder-product.png", category: "kymco-racings-suspension", mainCategory: "kymco-racings", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // 雷霆s125/150 - 熱門外觀燈系升級
    "racing-led-kit": { id: "racing-led-kit", name: "【雷霆LED套件】", price: 6800, image: "images/parts/placeholder-product.png", category: "kymco-racings-appearance", mainCategory: "kymco-racings", brand: "KOSO", dateAdded: "2024-12-21" },
    "racing-body-kit": { id: "racing-body-kit", name: "【雷霆外觀套件】", price: 8800, image: "images/parts/placeholder-product.png", category: "kymco-racings-appearance", mainCategory: "kymco-racings", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // KRV - 動力系統升級
    "krv-power-kit": { id: "krv-power-kit", name: "【KRV動力套件】", price: 22000, image: "images/parts/placeholder-product.png", category: "kymco-krv-power", mainCategory: "kymco-krv", brand: "擎翔", dateAdded: "2024-12-21" },
    "krv-exhaust": { id: "krv-exhaust", name: "【KRV排氣管】", price: 18800, image: "images/parts/placeholder-product.png", category: "kymco-krv-power", mainCategory: "kymco-krv", brand: "擎翔", dateAdded: "2024-12-21" },
    "krv-transmission": { id: "krv-transmission", name: "【KRV傳動組】", price: 8800, image: "images/parts/placeholder-product.png", category: "kymco-krv-power", mainCategory: "kymco-krv", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // KRV - 煞車制動升級
    "krv-brake-kit": { id: "krv-brake-kit", name: "【KRV煞車套件】", price: 15800, image: "images/parts/placeholder-product.png", category: "kymco-krv-brake", mainCategory: "kymco-krv", brand: "Brembo", dateAdded: "2024-12-21" },
    "krv-brake-disc": { id: "krv-brake-disc", name: "【KRV碟盤】", price: 4200, image: "images/parts/placeholder-product.png", category: "kymco-krv-brake", mainCategory: "kymco-krv", brand: "MASA", dateAdded: "2024-12-21" },
    
    // KRV - 避震懸吊升級
    "krv-suspension": { id: "krv-suspension", name: "【KRV懸吊套件】", price: 28000, image: "images/parts/placeholder-product.png", category: "kymco-krv-suspension", mainCategory: "kymco-krv", brand: "Öhlins", dateAdded: "2024-12-21" },
    "krv-front-fork": { id: "krv-front-fork", name: "【KRV前叉】", price: 22000, image: "images/parts/placeholder-product.png", category: "kymco-krv-suspension", mainCategory: "kymco-krv", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // KRV - 熱門外觀燈系升級
    "krv-led-kit": { id: "krv-led-kit", name: "【KRV LED套件】", price: 8800, image: "images/parts/placeholder-product.png", category: "kymco-krv-appearance", mainCategory: "kymco-krv", brand: "KOSO", dateAdded: "2024-12-21" },
    "krv-body-kit": { id: "krv-body-kit", name: "【KRV外觀套件】", price: 12800, image: "images/parts/placeholder-product.png", category: "kymco-krv-appearance", mainCategory: "kymco-krv", brand: "擎翔", dateAdded: "2024-12-21" },
    "krv-taillight": { id: "krv-taillight", name: "【KRV尾燈】", price: 4800, image: "images/parts/星爵M5尾燈.webp", category: "kymco-krv-appearance", mainCategory: "kymco-krv", brand: "星爵", dateAdded: "2024-12-21" },
    "krv-license-plate-holder": { id: "krv-license-plate-holder", name: "【KRV短牌架】", price: 3300, image: "images/parts/GOWORK短牌架.webp", category: "kymco-krv-appearance", mainCategory: "kymco-krv", brand: "GOWORK", dateAdded: "2024-12-21" },
    
    // ==================== 熱門傳動 ====================
    "popular-transmission-1": { id: "popular-transmission-1", name: "【熱門傳動套件A】", price: 5800, image: "images/parts/placeholder-product.png", category: "transmission", mainCategory: "transmission", brand: "擎翔", dateAdded: "2024-12-21" },
    "popular-transmission-2": { id: "popular-transmission-2", name: "【熱門傳動套件B】", price: 6800, image: "images/parts/placeholder-product.png", category: "transmission", mainCategory: "transmission", brand: "擎翔", dateAdded: "2024-12-21" },
    "popular-transmission-3": { id: "popular-transmission-3", name: "【熱門傳動套件C】", price: 7800, image: "images/parts/placeholder-product.png", category: "transmission", mainCategory: "transmission", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // ==================== 排氣管 ====================
    "exhaust-system-1": { id: "exhaust-system-1", name: "【排氣管系統A】", price: 12800, image: "images/parts/placeholder-product.png", category: "exhaust", mainCategory: "exhaust", brand: "擎翔", dateAdded: "2024-12-21" },
    "exhaust-system-2": { id: "exhaust-system-2", name: "【排氣管系統B】", price: 15800, image: "images/parts/placeholder-product.png", category: "exhaust", mainCategory: "exhaust", brand: "擎翔", dateAdded: "2024-12-21" },
    "exhaust-system-3": { id: "exhaust-system-3", name: "【排氣管系統C】", price: 18800, image: "images/parts/placeholder-product.png", category: "exhaust", mainCategory: "exhaust", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // ==================== 擎翔超值套餐 ====================
    "cx-front-assembly-package": { id: "cx-front-assembly-package", name: "【擎翔前總成套餐】", price: 15800, image: "images/parts/placeholder-product.png", category: "package", mainCategory: "package", brand: "擎翔", dateAdded: "2024-12-21" },
    "cx-power-peripheral-package": { id: "cx-power-peripheral-package", name: "【擎翔動力周邊套餐】", price: 8500, image: "images/parts/placeholder-product.png", category: "package", mainCategory: "package", brand: "擎翔", dateAdded: "2024-12-21" },
    "cx-engine-package": { id: "cx-engine-package", name: "【擎翔引擎套餐】", price: 25000, image: "images/parts/placeholder-product.png", category: "package", mainCategory: "package", brand: "擎翔", dateAdded: "2024-12-21" },
    
    // ==================== 全系列正PROTI鈦螺絲 ====================
    "proti-titanium-bolts": { id: "proti-titanium-bolts", name: "【全系列正PROTI鈦螺絲】", price: 4500, image: "images/parts/placeholder-product.png", category: "accessories", mainCategory: "accessories", brand: "PROTI", dateAdded: "2024-12-21" }
};

async function importCXMotorProducts() {
    let client;
    
    try {
        console.log('🚀 開始導入擎翔車業完整產品資料...');
        
        // 連接到 MongoDB
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('✅ MongoDB 連接成功');
        
        const db = client.db();
        const collection = db.collection('products');
        
        // 清空現有產品資料
        console.log('🗑️ 清空現有產品資料...');
        await collection.deleteMany({});
        
        // 轉換產品資料格式
        const products = Object.values(cxMotorProducts).map(product => ({
            productId: product.id,
            name: product.name,
            price: product.price,
            priceRange: product.priceRange || null,
            image: product.image,
            category: product.category,
            mainCategory: product.mainCategory,
            brand: product.brand,
            description: `${product.name} - 擎翔車業專業改裝`,
            stock: Math.floor(Math.random() * 50) + 10, // 隨機庫存 10-60
            isActive: true,
            tags: [
                product.brand,
                product.mainCategory.split('-')[0]?.toUpperCase() || '', // SYM, YAMAHA, KYMCO
                product.mainCategory.split('-')[1]?.toUpperCase() || '', // JET, DRG, etc.
                product.category.split('-').pop() || product.category // power, brake, suspension, appearance
            ].filter(Boolean),
            createdAt: new Date(product.dateAdded),
            updatedAt: new Date()
        }));
        
        // 批量插入產品
        console.log(`📦 插入 ${products.length} 個產品到資料庫...`);
        const result = await collection.insertMany(products);
        
        console.log(`✅ 成功插入 ${result.insertedCount} 個產品`);
        
        // 重新建立索引
        console.log('🔍 重新建立搜尋索引...');
        await collection.dropIndexes();
        
        await collection.createIndex({ 
            name: 'text', 
            description: 'text',
            brand: 'text',
            tags: 'text'
        }, { default_language: 'none' }); // 設定為無語言以支援中文搜尋
        
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
        
        console.log('\n🎉 擎翔車業產品資料導入完成！');
        console.log(`📈 總計導入 ${result.insertedCount} 個產品`);
        
    } catch (error) {
        console.error('❌ 導入失敗:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 資料庫連接已關閉');
        }
    }
}

// 執行導入
if (require.main === module) {
    importCXMotorProducts();
}

module.exports = { importCXMotorProducts, cxMotorProducts }; 