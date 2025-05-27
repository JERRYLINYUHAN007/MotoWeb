// 此腳本用於更新特殊情況的產品圖片路徑
const fs = require('fs');
const path = require('path');

// 讀取產品頁面
const productsHtmlPath = path.join(__dirname, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

// 處理特殊情況: 直接替換特定字串
const replacements = [
  {
    search: '"force-smax-relay": {id: "force-smax-relay", name: "【繼電器】FORCE1.0/SMAX車系", price: 450, image: "images/parts/placeholder-product.png",',
    replace: '"force-smax-relay": {id: "force-smax-relay", name: "【繼電器】FORCE1.0/SMAX車系", price: 450, image: "images/parts/繼電器.webp",'
  },
  {
    search: '"force2-relay": {id: "force2-relay", name: "【繼電器】FORCE2.0車系", price: 450, image: "images/parts/placeholder-product.png",',
    replace: '"force2-relay": {id: "force2-relay", name: "【繼電器】FORCE2.0車系", price: 450, image: "images/parts/繼電器.webp",'
  },
  {
    search: '"krv-relay": {id: "krv-relay", name: "【繼電器】KRV車系", price: 450, image: "images/parts/placeholder-product.png",',
    replace: '"krv-relay": {id: "krv-relay", name: "【繼電器】KRV車系", price: 450, image: "images/parts/繼電器.webp",'
  },
  {
    search: '"force2-wasp-bt1-exhaust": {id: "force2-wasp-bt1-exhaust", name: "【黃蜂BT1砲管】FORCE2.0車系", price: 12000, image: "images/parts/placeholder-product.png",',
    replace: '"force2-wasp-bt1-exhaust": {id: "force2-wasp-bt1-exhaust", name: "【黃蜂BT1砲管】FORCE2.0車系", price: 12000, image: "images/parts/黃蜂BT1砲管.webp",'
  },
  {
    search: '"krv-wasp-bt1-exhaust": {id: "krv-wasp-bt1-exhaust", name: "【黃蜂BT1砲管】KRV車系", price: 12000, image: "images/parts/placeholder-product.png",',
    replace: '"krv-wasp-bt1-exhaust": {id: "krv-wasp-bt1-exhaust", name: "【黃蜂BT1砲管】KRV車系", price: 12000, image: "images/parts/黃蜂BT1砲管.webp",'
  },
  {
    search: '"force-smax-aracer-sportd": {id: "force-smax-aracer-sportd", name: "【ARACER SPORTD】FORCE1.0/SMAX車系", price: 3100, image: "images/parts/placeholder-product.png",',
    replace: '"force-smax-aracer-sportd": {id: "force-smax-aracer-sportd", name: "【ARACER SPORTD】FORCE1.0/SMAX車系", price: 3100, image: "images/parts/ARACER SPORTD.webp",'
  },
  {
    search: '"krv-aracer-sportd": {id: "krv-aracer-sportd", name: "【ARACER SPORTD】KRV車系", price: 3100, image: "images/parts/placeholder-product.png",',
    replace: '"krv-aracer-sportd": {id: "krv-aracer-sportd", name: "【ARACER SPORTD】KRV車系", price: 3100, image: "images/parts/ARACER SPORTD.webp",'
  },
  {
    search: '"krv-gowork-license-plate-holder": {id: "krv-gowork-license-plate-holder", name: "【GOWORK短牌架】KRV車系", price: 3300, image: "images/parts/placeholder-product.png",',
    replace: '"krv-gowork-license-plate-holder": {id: "krv-gowork-license-plate-holder", name: "【GOWORK短牌架】KRV車系", price: 3300, image: "images/parts/GOWORK短牌架.webp",'
  },
  {
    search: '"krv-star-lord-m5-taillight": {id: "krv-star-lord-m5-taillight", name: "【星爵M5尾燈】KRV車系", price: 3500, image: "images/parts/placeholder-product.png",',
    replace: '"krv-star-lord-m5-taillight": {id: "krv-star-lord-m5-taillight", name: "【星爵M5尾燈】KRV車系", price: 3500, image: "images/parts/星爵M5尾燈.webp",'
  },
  {
    search: '"krv-dy-fork": {id: "krv-dy-fork", name: "【DY前叉】KRV車系", price: 6600, image: "images/parts/placeholder-product.png",',
    replace: '"krv-dy-fork": {id: "krv-dy-fork", name: "【DY前叉】KRV車系", price: 6600, image: "images/parts/DY前叉.webp",'
  },
  {
    search: '"force-smax-dy-fork": {id: "force-smax-dy-fork", name: "【DY前叉】FORCE1.0/SMAX車系", price: 6600, image: "images/parts/placeholder-product.png",',
    replace: '"force-smax-dy-fork": {id: "force-smax-dy-fork", name: "【DY前叉】FORCE1.0/SMAX車系", price: 6600, image: "images/parts/DY前叉.webp",'
  },
  {
    search: '"krv-brembo-double-crab": {id: "krv-brembo-double-crab", name: "【BREMBO對二大螃蟹】KRV車系", price: 7000, image: "images/parts/placeholder-product.png",',
    replace: '"krv-brembo-double-crab": {id: "krv-brembo-double-crab", name: "【BREMBO對二大螃蟹】KRV車系", price: 7000, image: "images/parts/BREMBO對二大螃蟹.webp",'
  },
  {
    search: '"force-smax-brembo-double-crab": {id: "force-smax-brembo-double-crab", name: "【BREMBO對二大螃蟹】FORCE1.0/SMAX車系", price: 7000, image: "images/parts/placeholder-product.png",',
    replace: '"force-smax-brembo-double-crab": {id: "force-smax-brembo-double-crab", name: "【BREMBO對二大螃蟹】FORCE1.0/SMAX車系", price: 7000, image: "images/parts/BREMBO對二大螃蟹.webp",'
  },
  {
    search: '"force2-reys-radiator-cover": {id: "force2-reys-radiator-cover", name: "【REYS水箱護罩】FORCE2.0車系", price: 1280, image: "images/parts/placeholder-product.png",',
    replace: '"force2-reys-radiator-cover": {id: "force2-reys-radiator-cover", name: "【REYS水箱護罩】FORCE2.0車系", price: 1280, image: "images/parts/REYS水箱護罩.webp",'
  },
  {
    search: '"krv-reveno-transmission": {id: "krv-reveno-transmission", name: "【REVENO傳動】KRV車系", price: 4200, image: "images/parts/placeholder-product.png",',
    replace: '"krv-reveno-transmission": {id: "krv-reveno-transmission", name: "【REVENO傳動】KRV車系", price: 4200, image: "images/parts/REVENO傳動.webp",'
  },
  {
    search: '"force-smax-reveno-transmission": {id: "force-smax-reveno-transmission", name: "【REVENO傳動】FORCE1.0/SMAX車系", price: 4200, image: "images/parts/placeholder-product.png",',
    replace: '"force-smax-reveno-transmission": {id: "force-smax-reveno-transmission", name: "【REVENO傳動】FORCE1.0/SMAX車系", price: 4200, image: "images/parts/REVENO傳動.webp",'
  },
  {
    search: '"force2-reveno-transmission": {id: "force2-reveno-transmission", name: "【REVENO傳動】FORCE2.0車系", price: 4200, image: "images/parts/placeholder-product.png",',
    replace: '"force2-reveno-transmission": {id: "force2-reveno-transmission", name: "【REVENO傳動】FORCE2.0車系", price: 4200, image: "images/parts/REVENO傳動.webp",'
  }
];

let updateCount = 0;

// 執行替換
replacements.forEach(({ search, replace }) => {
  if (productsHtml.includes(search)) {
    console.log(`更新: ${search.substring(0, 50)}...`);
    productsHtml = productsHtml.replace(search, replace);
    updateCount++;
  }
});

// 儲存更新後的檔案
fs.writeFileSync(productsHtmlPath, productsHtml);
console.log(`特殊情況圖片路徑更新完成，共更新 ${updateCount} 個項目。`); 