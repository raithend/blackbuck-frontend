import { createClient } from "@/app/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
});

interface PostImage {
	id: string;
	image_url: string;
	order_index: number;
}

interface PostUser {
	id: string;
	username: string;
	avatar_url: string | null;
	account_id: string | null;
	bio: string | null;
	created_at: string;
	header_url: string | null;
	updated_at: string;
}

interface Post {
	id: string;
	classification: string | null;
	content: string;
	created_at: string;
	location: string | null;
	updated_at: string;
	user_id: string;
	users: PostUser;
	post_images: PostImage[];
	likes: { id: string }[];
}

interface FormattedPost {
	id: string;
	classification: string | null;
	content: string;
	created_at: string;
	location: string | null;
	updated_at: string;
	user_id: string;
	user: PostUser;
	likeCount: number;
	isLiked: boolean;
	images: PostImage[];
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ name: string }> }
) {
	try {
		const { name } = await params;
		const decodedName = decodeURIComponent(name);
		const { searchParams } = new URL(request.url);
		const includePosts = searchParams.get("includePosts") === "true";

		if (!decodedName) {
			return NextResponse.json(
				{ error: "Classification name is required" },
				{ status: 400 }
			);
		}

		const supabase = await createClient();

		// 分類情報を取得（存在しない場合はnull）
		const { data: classification, error: classificationError } = await supabase
			.from("classifications")
			.select("*")
			.eq("name", decodedName)
			.single();

		// 分類が見つからない場合はエラーにせず、nullとして扱う
		if (classificationError && classificationError.code !== "PGRST116") {
			throw classificationError;
		}

		// 投稿データの取得が必要な場合のみ実行
		let posts: FormattedPost[] = [];
		if (includePosts) {
			// 1. すべての投稿からclassificationを取得
			const { data: allPosts, error: allPostsError } = await supabase
				.from("posts")
				.select("classification")
				.not("classification", "is", null);

			if (allPostsError) {
				throw allPostsError;
			}

			// 重複を除去した分類名の配列を作成
			const classifications = Array.from(
				new Set(allPosts.map((post) => post.classification)),
			).filter(Boolean) as string[];

			console.log('=== Claude API デバッグ情報 ===');
			console.log('検索対象の分類名:', decodedName);
			console.log('データベース内の全分類名:', classifications);
			console.log('分類名の数:', classifications.length);

			// 2. Claude APIに分類名と配列を送信して階層関係を考慮した分類を取得
			const message = await anthropic.messages.create({
				model: "claude-opus-4-20250514",
				max_tokens: 1000,
				messages: [
					{
						role: "user",
						content: `あなたは生物分類の専門家です。以下の分類名のリストから、「${decodedName}」に属する生物名のみを抽出してください。

必ず以下の形式のJSONで返答してください：
{"matchedClassifications": ["分類名1", "分類名2", ...]}

分類名が見つからない場合は空配列を返してください：
{"matchedClassifications": []}

分類名リスト：
${JSON.stringify(classifications)}`,
					},
				],
			});

			// Claude APIの応答をパース
			const response =
				message.content[0].type === "text" ? message.content[0].text : "";

			console.log('Claude APIの生の応答:', response);

			// JSONの部分を抽出（余分なテキストがある場合に対応）
			const jsonMatch = response.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				console.error("No JSON found in response:", response);
			} else {
				const parsedResponse: { matchedClassifications?: string[] } = JSON.parse(jsonMatch[0]);
				const matchedClassifications: string[] = parsedResponse.matchedClassifications || [];

				console.log('Claude APIから返されたマッチした分類名:', matchedClassifications);
				console.log('マッチした分類名の数:', matchedClassifications.length);
				console.log('=== デバッグ情報終了 ===');

				if (Array.isArray(matchedClassifications)) {
					// 3. マッチした分類名を持つ投稿を取得
					const { data: postsData, error: postsError } = await supabase
						.from("posts")
						.select(`
							*,
							users!posts_user_id_fkey (
								id,
								username,
								avatar_url,
								account_id,
								bio,
								created_at,
								header_url,
								updated_at
							),
							post_images (
								id,
								image_url,
								order_index
							),
							likes (
								id
							)
						`)
						.in("classification", matchedClassifications)
						.order("created_at", { ascending: false });

					if (postsError) {
						throw postsError;
					}

					console.log('取得された投稿の数:', postsData?.length || 0);
					console.log('取得された投稿の分類名:', postsData?.map(post => post.classification).filter(Boolean));

					// 投稿データを整形
					posts = postsData?.map((post: Post) => ({
						...post,
						user: post.users, // usersをuserにリネーム
						likeCount: post.likes?.length || 0,
						isLiked: false, // フロントエンドで設定
						images: post.post_images?.sort((a: PostImage, b: PostImage) => a.order_index - b.order_index) || [],
					})) || [];
				}
			}
		}

		return NextResponse.json({ 
			classification: classification || null,
			posts: posts
		}, {
			headers: {
				'Cache-Control': 'public, max-age=300, s-maxage=300', // 5分間キャッシュ
			}
		});
	} catch (error) {
		console.error("Classification API error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ name: string }> }
) {
	try {
		const { name } = await params;
		const decodedName = decodeURIComponent(name);
		const body = await request.json();

		if (!decodedName) {
			return NextResponse.json(
				{ error: "Classification name is required" },
				{ status: 400 }
			);
		}

		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabase = await createClient(accessToken);

		// ユーザー情報を取得
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json(
				{ error: "認証が必要です" },
				{ status: 401 }
			);
		}

		// 分類が存在するかチェック
		const { data: existingClassification, error: checkError } = await supabase
			.from("classifications")
			.select("id")
			.eq("name", decodedName)
			.single();

		let classification: unknown;
		let operationError: unknown;

		if (checkError && checkError.code === "PGRST116") {
			// 分類が存在しない場合は作成
			const { data: newClassification, error: createError } = await supabase
				.from("classifications")
				.insert({
					name: decodedName,
					english_name: body.english_name || decodedName,
					scientific_name: body.scientific_name || "",
					description: body.description || "",
					era_start: body.era_start || null,
					era_end: body.era_end || null,
					phylogenetic_tree_file: body.phylogenetic_tree_file || null,
					geographic_data_file: body.geographic_data_file || null,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.select()
				.single();

			classification = newClassification;
			operationError = createError;
		} else if (checkError) {
			// その他のエラーの場合
			console.error("Classification check error:", checkError);
			return NextResponse.json(
				{ error: "Failed to check classification" },
				{ status: 500 }
			);
		} else {
			// 分類が存在する場合は更新
			// 既存データを取得
			const { data: currentClassification } = await supabase
				.from("classifications")
				.select("phylogenetic_tree_file, geographic_data_file, phylogenetic_tree_creator, geographic_data_creator")
				.eq("name", decodedName)
				.single();

			// 変更判定
			const isTreeChanged = body.phylogenetic_tree_file !== undefined && body.phylogenetic_tree_file !== currentClassification?.phylogenetic_tree_file;
			const isGeoChanged = body.geographic_data_file !== undefined && body.geographic_data_file !== currentClassification?.geographic_data_file;

			const updatePayload: Record<string, unknown> = {
				english_name: body.english_name,
				scientific_name: body.scientific_name,
				description: body.description,
				era_start: body.era_start,
				era_end: body.era_end,
				phylogenetic_tree_file: body.phylogenetic_tree_file,
				geographic_data_file: body.geographic_data_file,
				updated_at: new Date().toISOString(),
			};
			if (isTreeChanged) {
				updatePayload.phylogenetic_tree_creator = user.id;
			}
			if (isGeoChanged) {
				updatePayload.geographic_data_creator = user.id;
			}

			const { data: updatedClassification, error: updateError } = await supabase
				.from("classifications")
				.update(updatePayload)
				.eq("name", decodedName)
				.select()
				.single();

			classification = updatedClassification;
			operationError = updateError;
		}

		if (operationError) {
			console.error("Classification update error:", operationError);
			return NextResponse.json(
				{ error: "Failed to update classification" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ classification });
	} catch (error) {
		console.error("Classification API error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
} 