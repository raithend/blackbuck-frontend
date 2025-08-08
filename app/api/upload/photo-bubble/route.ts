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
		if (!file) {
			return NextResponse.json(
				{ error: "ファイルが見つかりません" },
				{ status: 400 },
			);
		}

		// ファイルサイズチェック（5MB以下）
		if (file.size > 5 * 1024 * 1024) {
			return NextResponse.json(
				{ error: "ファイルサイズは5MB以下にしてください" },
				{ status: 400 },
			);
		}

		// ファイル形式チェック
		const allowedTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
		];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: "対応していないファイル形式です" },
				{ status: 400 },
			);
		}

		// フォトバブル専用のディレクトリに保存（user.idは使わない）
		const key = `photo-bubbles/${Date.now()}-${file.name}`;
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
		return NextResponse.json({ url });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to upload photo bubble image" },
			{ status: 500 },
		);
	}
}
