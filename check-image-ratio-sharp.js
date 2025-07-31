const sharp = require('sharp');
const path = require('path');

async function checkImageRatio() {
  try {
    const imagePath = path.join(__dirname, 'public/PALEOMAP_PaleoAtlas_Rasters_v3/Map1a_PALEOMAP_PaleoAtlas_000.jpg');
    
    const metadata = await sharp(imagePath).metadata();
    
    console.log('Image dimensions:');
    console.log('Width:', metadata.width);
    console.log('Height:', metadata.height);
    console.log('Aspect ratio:', metadata.width / metadata.height);
    console.log('Format:', metadata.format);
    
  } catch (error) {
    console.error('Error reading image:', error);
  }
}

checkImageRatio(); 