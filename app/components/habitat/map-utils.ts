export interface HabitatData {
  lat: number;
  lng: number;
  color?: string;
  size?: number;
  maxR?: number;
  polygon?: [number, number][];
  text?: string;
  fontSize?: number;
}

// 生息地データ付きの地図画像を生成
export const generateMapWithHabitat = (mapName: string, habitatData: HabitatData[]) => {
  return new Promise<string>((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // --- ここからglobe-area.tsxのロジックを移植 ---
      const maxWidth = 2048;
      const maxHeight = 1024;
      let targetWidth = img.width;
      let targetHeight = img.height;
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const aspectRatio = targetWidth / targetHeight;
        if (aspectRatio > maxWidth / maxHeight) {
          targetWidth = maxWidth;
          targetHeight = maxWidth / aspectRatio;
        } else {
          targetHeight = maxHeight;
          targetWidth = maxHeight * aspectRatio;
        }
      }
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      habitatData.forEach((habitat, index) => {
        if (habitat.lat !== undefined && habitat.lng !== undefined) {
          const editorWidth = 800;
          const editorHeight = 600;
          const editorX = ((habitat.lng + 180) / 360) * editorWidth;
          const editorY = ((90 - habitat.lat) / 180) * editorHeight;
          const mapAspectRatio = 2;
          const editorAspectRatio = editorWidth / editorHeight;
          const mapX = editorX;
          const mapY = editorY * (mapAspectRatio / editorAspectRatio);
          const scaleX = canvas.width / editorWidth;
          const scaleY = canvas.height / (editorHeight * (mapAspectRatio / editorAspectRatio));
          const x = mapX * scaleX;
          const y = mapY * scaleY;
          const scaleFactor = Math.min(scaleX, scaleY);
          const pointSize = (habitat.size || 20) * scaleFactor;
          if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
            if (habitat.text) {
              ctx.font = `${(habitat.fontSize || 16) * scaleFactor}px sans-serif`;
              ctx.fillStyle = habitat.color || 'black';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 2;
              ctx.strokeText(habitat.text, x, y);
              ctx.fillText(habitat.text, x, y);
            } else if (habitat.maxR) {
              ctx.strokeStyle = habitat.color || 'red';
              ctx.lineWidth = Math.max(1, 2 * scaleFactor);
              ctx.globalAlpha = 0.5;
              const radius = Math.min((habitat.maxR / 20000) * canvas.width, 50 * scaleFactor);
              ctx.beginPath();
              ctx.arc(x, y, radius, 0, 2 * Math.PI);
              ctx.stroke();
              ctx.globalAlpha = 1;
            } else {
              ctx.fillStyle = habitat.color || 'red';
              ctx.beginPath();
              ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
              ctx.fill();
              ctx.strokeStyle = 'white';
              ctx.lineWidth = Math.max(1, scaleFactor);
              ctx.stroke();
            }
          }
        }
      });
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };
    img.onerror = (error) => {
      reject(new Error(`Failed to load map image: ${mapName}`));
    };
    img.src = `/PALEOMAP_PaleoAtlas_Rasters_v3/${mapName}`;
  });
}; 