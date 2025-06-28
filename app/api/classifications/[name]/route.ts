import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { name: string } }
) {
	try {
		const { name } = await params;
		const decodedName = decodeURIComponent(name);

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

		// その分類の投稿を取得
		const { data: posts, error: postsError } = await supabase
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
			.eq("classification", decodedName)
			.order("created_at", { ascending: false });

		if (postsError) {
			throw postsError;
		}

		// 投稿データを整形
		const formattedPosts = posts?.map((post) => ({
			...post,
			user: post.users, // usersをuserにリネーム
			likeCount: post.likes?.length || 0,
			isLiked: false, // フロントエンドで設定
			images: post.post_images?.sort((a, b) => a.order_index - b.order_index) || [],
		})) || [];

		return NextResponse.json({ 
			classification: classification || null,
			posts: formattedPosts
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
	{ params }: { params: { name: string } }
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

		let classification;
		let operationError;

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
					phylogenetic_tree_creator: body.phylogenetic_tree_creator || user.id,
					geographic_data_creator: body.geographic_data_creator || user.id,
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
			const { data: updatedClassification, error: updateError } = await supabase
				.from("classifications")
				.update({
					english_name: body.english_name,
					scientific_name: body.scientific_name,
					description: body.description,
					era_start: body.era_start,
					era_end: body.era_end,
					phylogenetic_tree_file: body.phylogenetic_tree_file,
					geographic_data_file: body.geographic_data_file,
					phylogenetic_tree_creator: body.phylogenetic_tree_creator,
					geographic_data_creator: body.geographic_data_creator,
					updated_at: new Date().toISOString(),
				})
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