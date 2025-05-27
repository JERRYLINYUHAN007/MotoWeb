// 此腳本用於更新產品圖片路徑
const fs = require('fs');
const path = require('path');

// 讀取產品頁面
const productsHtmlPath = path.join(__dirname, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

// 取得所有可用的圖片檔案
const imagesDir = path.join(__dirname, 'images', 'parts');
const imageFiles = fs.readdirSync(imagesDir).filter(file => 
  file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png')
);

console.log(`找到 ${imageFiles.length} 個圖片檔案`);

// 為了避免取代部分檔名，先按照檔名長度排序 (較長的檔名優先)
imageFiles.sort((a, b) => b.length - a.length);

// 對於每個圖片檔案，檢查產品是否有對應的名稱，並更新圖片路徑
let updateCount = 0;

imageFiles.forEach(imageFile => {
  // 去除副檔名和數字後綴
  const baseName = imageFile.replace(/\.\w+$/, '').replace(/[0-9]+$/, '');
  
  // 尋找含有 placeholder-product.png 且產品名稱中含有此圖片基本名稱的項目
  const regex = new RegExp(`name: "【${baseName}[^"]*"[^}]*image: "images/parts/placeholder-product.png"`, 'g');
  const matches = productsHtml.match(regex);
  
  if (matches && matches.length > 0) {
    console.log(`更新 ${baseName} 的圖片路徑為 ${imageFile}`);
    productsHtml = productsHtml.replace(
      new RegExp(`(name: "【${baseName}[^"]*"[^}]*image: ")images/parts/placeholder-product.png(")`, 'g'),
      `$1images/parts/${imageFile}$2`
    );
    updateCount += matches.length;
  }
});

// 處理特殊情況: 匹配產品名字與圖片名
const specialCases = [
  { productName: "【繼電器】", imageName: "繼電器.webp" },
  { productName: "【黃蜂BT1砲管】", imageName: "黃蜂BT1砲管.webp" },
  { productName: "【ARACER SPORTD】", imageName: "ARACER SPORTD.webp" },
  { productName: "【星爵M5尾燈】", imageName: "星爵M5尾燈.webp" },
  { productName: "【GOWORK短牌架】", imageName: "GOWORK短牌架.webp" },
  { productName: "【DY前叉】", imageName: "DY前叉.webp" },
  { productName: "【REYS水箱護罩】", imageName: "REYS水箱護罩.webp" },
  { productName: "【BREMBO對二大螃蟹】", imageName: "BREMBO對二大螃蟹.webp" },
  { productName: "【CCD C13+前叉】", imageName: "CCD C13+前叉.webp" },
  { productName: "【REVENO傳動】", imageName: "REVENO傳動.webp" },
  { productName: "【APEXX GT防燙蓋】", imageName: "APEXX GT防燙蓋.webp" }
];

specialCases.forEach(({ productName, imageName }) => {
  const regex = new RegExp(`name: "${productName}[^"]*"[^}]*image: "images/parts/placeholder-product.png"`, 'g');
  const matches = productsHtml.match(regex);
  
  if (matches && matches.length > 0) {
    console.log(`特殊處理: 更新 ${productName} 的圖片路徑為 ${imageName}`);
    productsHtml = productsHtml.replace(
      new RegExp(`(name: "${productName}[^"]*"[^}]*image: ")images/parts/placeholder-product.png(")`, 'g'),
      `$1images/parts/${imageName}$2`
    );
    updateCount += matches.length;
  }
});

// 儲存更新後的檔案
fs.writeFileSync(productsHtmlPath, productsHtml);
console.log(`圖片路徑更新完成，共更新 ${updateCount} 個產品圖片路徑。`); 