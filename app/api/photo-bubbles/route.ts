import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase-server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const pageUrl = searchParams.get('page_url');

		if (!pageUrl) {
			return NextResponse.json(
				{ error: 'page_url parameter is required' },
				{ status: 400 }
			);
		}

		const supabase = await createClient();

		const { data: photoBubbles, error } = await supabase
			.from('photo_bubbles')
			.select('*')
			.eq('page_url', pageUrl)
			.order('created_at', { ascending: true });

		if (error) {
			console.error('Error fetching photo bubbles:', error);
			return NextResponse.json(
				{ error: 'Failed to fetch photo bubbles' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ photoBubbles: photoBubbles || [] });
	} catch (error) {
		console.error('Error in GET /api/photo-bubbles:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabase = await createClient(accessToken);

		// ユーザー情報を取得
		const { data: { user }, error: userError } = await supabase.auth.getUser();

		if (userError || !user) {
			console.error("ユーザー取得エラー:", userError);
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// ユーザーのaccount_idを取得
		const { data: userProfile, error: profileError } = await supabase
			.from('users')
			.select('account_id')
			.eq('id', user.id)
			.single();

		if (profileError || !userProfile) {
			console.error("ユーザープロフィール取得エラー:", profileError);
			return NextResponse.json(
				{ error: 'User profile not found' },
				{ status: 404 }
			);
		}

		const body = await request.json();

		// 必須フィールドの検証
		if (!body.name || !body.page_url || !body.image_url) {
			return NextResponse.json(
				{ error: 'name, page_url, and image_url are required' },
				{ status: 400 }
			);
		}

		// プロフィールページの場合、本人のみ追加可能
		if (body.page_url.startsWith('/users/')) {
			const profileAccountId = body.page_url.split('/')[2];
			if (profileAccountId !== userProfile.account_id) {
				return NextResponse.json(
					{ error: 'You can only add photo bubbles to your own profile' },
					{ status: 403 }
				);
			}
		}

		const { data: photoBubble, error } = await supabase
			.from('photo_bubbles')
			.insert({
				name: body.name,
				user_id: user.id,
				page_url: body.page_url,
				image_url: body.image_url,
				target_url: body.target_url || null,
				x_position: body.x_position || 0,
				y_position: body.y_position || 0,
			})
			.select()
			.single();

		if (error) {
			console.error('Error creating photo bubble:', error);
			return NextResponse.json(
				{ error: 'Failed to create photo bubble' },
				{ status: 500 }
			);
		}

		return NextResponse.json(photoBubble, { status: 201 });
	} catch (error) {
		console.error('Error in POST /api/photo-bubbles:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabase = await createClient(accessToken);

		// ユーザー情報を取得
		const { data: { user }, error: userError } = await supabase.auth.getUser();

		if (userError || !user) {
			console.error("ユーザー取得エラー:", userError);
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json(
				{ error: 'Photo bubble ID is required' },
				{ status: 400 }
			);
		}

		const body = await request.json();

		// 作成者のみ更新可能
		const { data: existingBubble, error: fetchError } = await supabase
			.from('photo_bubbles')
			.select('user_id')
			.eq('id', id)
			.single();

		if (fetchError || !existingBubble) {
			return NextResponse.json(
				{ error: 'Photo bubble not found' },
				{ status: 404 }
			);
		}

		if (existingBubble.user_id !== user.id) {
			return NextResponse.json(
				{ error: 'You can only update your own photo bubbles' },
				{ status: 403 }
			);
		}

		const updateData: any = {};
		if (body.name !== undefined) updateData.name = body.name;
		if (body.image_url !== undefined) updateData.image_url = body.image_url;
		if (body.target_url !== undefined) updateData.target_url = body.target_url;
		if (body.x_position !== undefined) updateData.x_position = body.x_position;
		if (body.y_position !== undefined) updateData.y_position = body.y_position;

		const { data: photoBubble, error } = await supabase
			.from('photo_bubbles')
			.update(updateData)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating photo bubble:', error);
			return NextResponse.json(
				{ error: 'Failed to update photo bubble' },
				{ status: 500 }
			);
		}

		return NextResponse.json(photoBubble);
	} catch (error) {
		console.error('Error in PUT /api/photo-bubbles:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		// Authorizationヘッダーからアクセストークンを取得
		const authHeader = request.headers.get("authorization");
		const accessToken = authHeader?.replace("Bearer ", "");

		if (!accessToken) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// アクセストークンを使ってSupabaseクライアントを作成
		const supabase = await createClient(accessToken);

		// ユーザー情報を取得
		const { data: { user }, error: userError } = await supabase.auth.getUser();

		if (userError || !user) {
			console.error("ユーザー取得エラー:", userError);
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json(
				{ error: 'Photo bubble ID is required' },
				{ status: 400 }
			);
		}

		// 作成者のみ削除可能
		const { data: existingBubble, error: fetchError } = await supabase
			.from('photo_bubbles')
			.select('user_id')
			.eq('id', id)
			.single();

		if (fetchError || !existingBubble) {
			return NextResponse.json(
				{ error: 'Photo bubble not found' },
				{ status: 404 }
			);
		}

		if (existingBubble.user_id !== user.id) {
			return NextResponse.json(
				{ error: 'You can only delete your own photo bubbles' },
				{ status: 403 }
			);
		}

		const { error } = await supabase
			.from('photo_bubbles')
			.delete()
			.eq('id', id);

		if (error) {
			console.error('Error deleting photo bubble:', error);
			return NextResponse.json(
				{ error: 'Failed to delete photo bubble' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error in DELETE /api/photo-bubbles:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
} 