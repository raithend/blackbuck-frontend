import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

if (
	!process.env.AWS_ACCESS_KEY_ID ||
	!process.env.AWS_SECRET_ACCESS_KEY ||
	!process.env.AWS_S3_BUCKET
) {
	throw new Error("環境変数が設定されていません");
}

const s3Client = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

/**
 * S3からファイルを削除する
 * @param key S3のオブジェクトキー
 * @returns 削除成功時はtrue、失敗時はfalse
 */
export async function deleteFromS3(key: string): Promise<boolean> {
	try {
		const command = new DeleteObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET!,
			Key: key,
		});

		await s3Client.send(command);
		return true;
	} catch (error) {
		console.error("S3削除エラー:", error);
		return false;
	}
}

/**
 * S3のURLからオブジェクトキーを抽出する
 * @param url S3のURL
 * @returns オブジェクトキー
 */
export function extractKeyFromS3Url(url: string): string {
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		// 先頭のスラッシュを除去してキーを取得
		return pathname.substring(1);
	} catch (error) {
		console.error("URL解析エラー:", error);
		throw new Error("無効なS3 URLです");
	}
}

/**
 * 複数のS3ファイルを削除する
 * @param urls S3のURL配列
 * @returns 削除結果の配列（成功時はtrue、失敗時はfalse）
 */
export async function deleteMultipleFromS3(urls: string[]): Promise<boolean[]> {
	const deletePromises = urls.map(async (url) => {
		try {
			const key = extractKeyFromS3Url(url);
			return await deleteFromS3(key);
		} catch (error) {
			console.error("S3削除エラー:", error);
			return false;
		}
	});

	return Promise.all(deletePromises);
} 