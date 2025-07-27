import { DeleteObjectCommand, S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

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

// S3クライアント設定のデバッグ情報
console.log("S3クライアント設定:", {
	region: process.env.AWS_REGION,
	accessKeyId: process.env.AWS_ACCESS_KEY_ID ? "設定済み" : "未設定",
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? "設定済み" : "未設定",
	bucket: process.env.AWS_S3_BUCKET,
});

// S3クライアントの詳細設定を確認
console.log("S3クライアント詳細:", {
	config: s3Client.config,
	region: s3Client.config.region,
});

/**
 * S3にファイルが存在するかを確認する
 * @param key S3のオブジェクトキー
 * @returns 存在する場合はtrue、存在しない場合はfalse
 */
export async function checkS3ObjectExists(key: string): Promise<boolean> {
	try {
		console.log(`S3オブジェクト存在確認開始: bucket=${process.env.AWS_S3_BUCKET}, key=${key}`);
		const command = new HeadObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET || "",
			Key: key,
		});
		await s3Client.send(command);
		console.log(`S3オブジェクト存在確認: ${key} -> 存在する`);
		return true;
	} catch (error) {
		console.log(`S3オブジェクト存在確認: ${key} -> 存在しない`);
		// エラーの詳細を出力
		if (error instanceof Error) {
			console.error(`S3存在確認エラー詳細: ${error.name} - ${error.message}`);
		}
		return false;
	}
}

/**
 * S3からファイルを削除する
 * @param key S3のオブジェクトキー
 * @returns 削除成功時はtrue、失敗時はfalse
 */
export async function deleteFromS3(key: string): Promise<boolean> {
	try {
		console.log(`S3削除開始: bucket=${process.env.AWS_S3_BUCKET}, region=${process.env.AWS_REGION}, key=${key}`);
		
		// 削除前にファイルの存在確認
		const exists = await checkS3ObjectExists(key);
		if (!exists) {
			console.log(`S3削除スキップ: ${key} は存在しないため`);
			return true; // 存在しない場合は削除成功として扱う
		}
		
		const command = new DeleteObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET || "",
			Key: key,
		});

		const response = await s3Client.send(command);
		console.log(`S3削除成功: ${key}, response=`, response);
		return true;
	} catch (error) {
		console.error(`S3削除エラー: key=${key}, error=`, error);
		// エラーの詳細情報を出力
		if (error instanceof Error) {
			console.error(`エラー名: ${error.name}, メッセージ: ${error.message}`);
		}
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
		console.log(`URL解析開始: ${url}`);
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		// 先頭のスラッシュを除去してキーを取得
		const key = pathname.substring(1);
		// URLデコードして日本語ファイル名を正しく処理
		const decodedKey = decodeURIComponent(key);
		console.log(`URL解析成功: ${url} -> key=${decodedKey}`);
		return decodedKey;
	} catch (error) {
		console.error(`URL解析エラー: ${url}`, error);
		throw new Error("無効なS3 URLです");
	}
}

/**
 * 複数のS3ファイルを削除する
 * @param urls S3のURL配列
 * @returns 削除結果の配列（成功時はtrue、失敗時はfalse）
 */
export async function deleteMultipleFromS3(urls: string[]): Promise<boolean[]> {
	console.log(`複数S3削除開始: ${urls.length}個のファイル`);
	
	const deletePromises = urls.map(async (url) => {
		try {
			const key = extractKeyFromS3Url(url);
			return await deleteFromS3(key);
		} catch (error) {
			console.error(`S3削除エラー: url=${url}`, error);
			return false;
		}
	});

	const results = await Promise.all(deletePromises);
	console.log(`複数S3削除完了: 成功=${results.filter(r => r).length}/${urls.length}`);
	return results;
}

/**
 * デバッグ用：指定されたキーでS3オブジェクトの存在確認をテストする
 * @param key S3のオブジェクトキー
 */
export async function testS3ObjectExists(key: string): Promise<void> {
	console.log("=== S3オブジェクト存在確認テスト ===");
	console.log(`テスト対象キー: ${key}`);
	console.log(`バケット: ${process.env.AWS_S3_BUCKET}`);
	console.log(`リージョン: ${process.env.AWS_REGION}`);
	
	const exists = await checkS3ObjectExists(key);
	console.log(`存在確認結果: ${exists}`);
	console.log("=== テスト完了 ===");
} 