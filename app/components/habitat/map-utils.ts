import type { HabitatElement } from "./types";

export type HabitatData = HabitatElement;

// 生息地データ付きの地図画像を生成
export const generateMapWithHabitat = (
	mapName: string,
	habitatData: HabitatData[],
) => {
	return new Promise<string>((resolve, reject) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			console.error("Canvas context not available");
			reject(new Error("Canvas context not available"));
			return;
		}

		const img = new Image();
		img.crossOrigin = "anonymous";
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
			ctx.imageSmoothingQuality = "high";
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
					const scaleY =
						canvas.height /
						(editorHeight * (mapAspectRatio / editorAspectRatio));
					const x = mapX * scaleX;
					const y = mapY * scaleY;
					const scaleFactor = Math.min(scaleX, scaleY);
					const pointSize = (habitat.size || 20) * scaleFactor;

					if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
						// transform情報を適用
						const finalScaleX = (habitat.scaleX || 1) * scaleFactor;
						const finalScaleY = (habitat.scaleY || 1) * scaleFactor;
						const angle = habitat.angle || 0;
						const flipX = habitat.flipX || false;
						const flipY = habitat.flipY || false;

						// コンテキストを保存
						ctx.save();

						// 変換行列を適用
						ctx.translate(x, y);
						ctx.rotate((angle * Math.PI) / 180);
						ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

						if (habitat.text) {
							ctx.font = `${(habitat.fontSize || 16) * finalScaleX}px sans-serif`;
							ctx.fillStyle = habitat.color || "black";
							ctx.textAlign = "center";
							ctx.textBaseline = "middle";
							ctx.strokeStyle = "white";
							ctx.lineWidth = 2;
							ctx.strokeText(habitat.text, 0, 0);
							ctx.fillText(habitat.text, 0, 0);
						} else if (habitat.maxR) {
							ctx.strokeStyle = habitat.color || "red";
							ctx.lineWidth = Math.max(1, 2 * finalScaleX);
							ctx.globalAlpha = 0.5;
							const radius = Math.min(
								(habitat.maxR / 20000) * canvas.width,
								50 * finalScaleX,
							);
							ctx.beginPath();
							ctx.arc(0, 0, radius, 0, 2 * Math.PI);
							ctx.stroke();
							ctx.globalAlpha = 1;
						} else {
							ctx.fillStyle = habitat.color || "red";
							ctx.beginPath();

							// 円を楕円として描画して、scaleXとscaleYの両方を適用
							const radiusX = pointSize * finalScaleX;
							const radiusY = pointSize * finalScaleY;

							// 楕円を描画
							ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, 2 * Math.PI);
							ctx.fill();
							ctx.strokeStyle = "white";
							ctx.lineWidth = Math.max(1, Math.min(finalScaleX, finalScaleY));
							ctx.stroke();
						}

						// コンテキストを復元
						ctx.restore();
					}
				}
			});

			const dataUrl = canvas.toDataURL("image/png");
			resolve(dataUrl);
		};
		img.onerror = (error) => {
			const errorMessage = typeof error === "string" ? error : error.toString();
			const truncatedMapName = mapName
				? `${mapName.substring(0, 20)}...`
				: mapName;
			const truncatedErrorMessage =
				errorMessage.length > 20
					? `${errorMessage.substring(0, 20)}...`
					: errorMessage;
			console.error(
				"地図画像の読み込みに失敗:",
				truncatedMapName,
				truncatedErrorMessage,
			);
			reject(new Error(`Failed to load map image: ${truncatedMapName}`));
		};

		// data:image/png;base64の場合は直接使用、そうでなければファイルパスとして処理
		if (mapName.startsWith("data:image/")) {
			img.src = mapName;
		} else {
			img.src = `/PALEOMAP_PaleoAtlas_Rasters_v3/${mapName}`;
		}
	});
};
