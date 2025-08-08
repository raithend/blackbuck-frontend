import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const type = formData.get("type") as string; // "avatar" or "header"

		if (!file) {
			return NextResponse.json(
				{ error: "ファイルが見つかりません" },
				{ status: 400 },
			);
		}

		if (!type || !["avatar", "header"].includes(type)) {
			return NextResponse.json(
				{ error: "無効な画像タイプです" },
				{ status: 400 },
			);
		}

		// ファイルサイズチェック
		const maxSize = type === "avatar" ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // アバター5MB、ヘッダー10MB
		if (file.size > maxSize) {
			return NextResponse.json(
				{
					error: `ファイルサイズが大きすぎます。最大${type === "avatar" ? "5MB" : "10MB"}まで`,
				},
				{ status: 400 },
			);
		}

		// ファイル形式チェック
		const allowedTypes = ["image/jpeg", "image/png"];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: "対応していないファイル形式です。JPEG、PNGのみ対応" },
				{ status: 400 },
			);
		}

		// S3のキーを生成（ディレクトリ分離）
		const directory = type === "avatar" ? "avatars" : "headers";
		const key = `${directory}/${Date.now()}-${file.name}`;

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
		return NextResponse.json({ url, type });
	} catch (error) {
		return NextResponse.json(
			{ error: "プロフィール画像のアップロードに失敗しました" },
			{ status: 500 },
		);
	}
}
