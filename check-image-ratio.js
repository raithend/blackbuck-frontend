const fs = require('fs');
const path = require('path');

// 画像ファイルのパス
const imagePath = path.join(__dirname, 'public/PALEOMAP_PaleoAtlas_Rasters_v3/Map1a_PALEOMAP_PaleoAtlas_000.jpg');

// 画像の情報を取得
const stats = fs.statSync(imagePath);
console.log('File size:', stats.size, 'bytes');

// 画像の縦横比を確認するには、画像処理ライブラリが必要
// 例：sharp や jimp を使用
console.log('To get exact dimensions, install sharp: npm install sharp');

// 簡易的な方法：ファイル名から推測
// PALEOMAPの地図は通常2:1の縦横比（世界地図の標準的な投影法）
console.log('Expected aspect ratio: 2:1 (width:height)');
console.log('This is typical for world maps using equirectangular projection'); 