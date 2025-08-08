import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export interface UploadConfig {
	maxSize: number;
	allowedTypes: string[];
	directory: string;
	requireAuth?: boolean;
}

export async function uploadToS3(
	file: File,
	config: UploadConfig,
	userId?: string,
): Promise<{ url: string; key: string }> {
	// ファイルサイズチェック
	if (file.size > config.maxSize) {
		throw new Error(
			`ファイルサイズが大きすぎます。最大${config.maxSize / (1024 * 1024)}MBまで`,
		);
	}

	// ファイル形式チェック
	if (!config.allowedTypes.includes(file.type)) {
		throw new Error("対応していないファイル形式です");
	}

	// S3のキーを生成
	let key: string;
	if (userId) {
		key = `${config.directory}/${userId}/${Date.now()}-${file.name}`;
	} else {
		key = `${config.directory}/${Date.now()}-${file.name}`;
	}

	const command = new PutObjectCommand({
		Bucket: process.env.AWS_S3_BUCKET!,
		Key: key,
		ContentType: file.type,
	});

	const signedUrl = await getSignedUrl(s3Client, command, {
		expiresIn: 3600,
	});

	const uploadResponse = await fetch(signedUrl, {
		method: "PUT",
		body: file,
		headers: {
			"Content-Type": file.type,
		},
	});

	if (!uploadResponse.ok) {
		throw new Error("S3へのアップロードに失敗しました");
	}

	const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
	return { url, key };
}

// プリセット設定
export const UPLOAD_CONFIGS = {
	general: {
		maxSize: 10 * 1024 * 1024, // 10MB
		allowedTypes: ["image/jpeg", "image/png"] as string[],
		directory: "uploads",
		requireAuth: false,
	},
	avatar: {
		maxSize: 5 * 1024 * 1024, // 5MB
		allowedTypes: ["image/jpeg", "image/png"] as string[],
		directory: "avatars",
		requireAuth: false,
	},
	header: {
		maxSize: 10 * 1024 * 1024, // 10MB
		allowedTypes: ["image/jpeg", "image/png"] as string[],
		directory: "headers",
		requireAuth: false,
	},
	photoBubble: {
		maxSize: 5 * 1024 * 1024, // 5MB
		allowedTypes: [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
		] as string[],
		directory: "photo-bubbles",
		requireAuth: true,
	},
	posts: {
		maxSize: 10 * 1024 * 1024, // 10MB
		allowedTypes: [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
		] as string[],
		directory: "posts",
		requireAuth: true,
	},
} as const;
