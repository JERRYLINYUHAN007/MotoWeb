/* Code Function: FINAL PROJECT MotoWeb      Date: 02/06/2025, created by: JERRY */
const fs = require('fs');

// 讀取文件
let content = fs.readFileSync('server.js', 'utf8');

// 移除舊的自執行函數（從 "// 啟動服務器" 到 "})();"）
const regex = /\/\/ 啟動服務器[\s\S]*?\}\)\(\);\s*\n\n/;
content = content.replace(regex, '');

// 寫回文件
fs.writeFileSync('server.js', content, 'utf8');

console.log('已移除重複的伺服器啟動代碼'); 