import { createClient } from "@/app/lib/supabase-server";
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { PhotoBubbleCreate, PhotoBubbleUpdate } from '@/app/types/types';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const pageType = searchParams.get('page_type');
		const pageIdentifier = searchParams.get('page_identifier');

		if (!pageType || !pageIdentifier) {
			return NextResponse.json(
				{ error: 'page_type and page_identifier are required' },
				{ status: 400 }
			);
		}

		const supabase = await createClient();

		const { data: photoBubbles, error } = await supabase
			.from('photo_bubbles')
			.select('*')
			.eq('page_type', pageType)
			.eq('page_identifier', pageIdentifier)
			.order('created_at', { ascending: true });

		if (error) {
			console.error('Error fetching photo bubbles:', error);
			return NextResponse.json(
				{ error: 'Failed to fetch photo bubbles' },
				{ status: 500 }
			);
		}

		return NextResponse.json(photoBubbles);
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
		const supabase = await createClient();

		// 認証チェック
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const body: PhotoBubbleCreate = await request.json();

		// 必須フィールドの検証
		if (!body.x_coordinate || !body.y_coordinate || !body.page_type || !body.page_identifier) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// プロフィールページの場合、本人のみ追加可能
		if (body.page_type === 'profile') {
			if (body.page_identifier !== user.id) {
				return NextResponse.json(
					{ error: 'You can only add photo bubbles to your own profile' },
					{ status: 403 }
				);
			}
		}

		const { data: photoBubble, error } = await supabase
			.from('photo_bubbles')
			.insert({
				...body,
				author_id: user.id,
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
		const supabase = await createClient();

		// 認証チェック
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
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

		const body: PhotoBubbleUpdate = await request.json();

		// 投稿者のみ更新可能
		const { data: existingBubble, error: fetchError } = await supabase
			.from('photo_bubbles')
			.select('author_id')
			.eq('id', id)
			.single();

		if (fetchError || !existingBubble) {
			return NextResponse.json(
				{ error: 'Photo bubble not found' },
				{ status: 404 }
			);
		}

		if (existingBubble.author_id !== user.id) {
			return NextResponse.json(
				{ error: 'You can only update your own photo bubbles' },
				{ status: 403 }
			);
		}

		const { data: photoBubble, error } = await supabase
			.from('photo_bubbles')
			.update(body)
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
		const supabase = await createClient();

		// 認証チェック
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
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

		// 投稿者のみ削除可能
		const { data: existingBubble, error: fetchError } = await supabase
			.from('photo_bubbles')
			.select('author_id')
			.eq('id', id)
			.single();

		if (fetchError || !existingBubble) {
			return NextResponse.json(
				{ error: 'Photo bubble not found' },
				{ status: 404 }
			);
		}

		if (existingBubble.author_id !== user.id) {
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