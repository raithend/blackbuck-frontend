import { NextResponse } from "next/server";

// ダミーユーザーデータ
const dummyUser = {
	id: "dummy",
	username: "dummy_user",
	avatar_url: "https://github.com/shadcn.png",
	header_url: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538",
	bio: "これはテストユーザーのプロフィールです。",
};

export async function GET() {
	// 実際のアプリケーションでは、ここでセッションの検証を行います
	// 今回はダミーデータを返します
	return NextResponse.json(dummyUser);
}
