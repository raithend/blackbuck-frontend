import { NextResponse } from "next/server";

const dummyFollowees = [
	{
		id: "yamada_taro",
		username: "山田太郎",
		avatar_url: "https://github.com/shadcn.png",
		bio: "プログラミングが好きです",
	},
	{
		id: "sato_hanako",
		username: "佐藤花子",
		avatar_url: "https://github.com/shadcn.png",
		bio: "デザインを勉強中",
	},
	{
		id: "suzuki_ichiro",
		username: "鈴木一郎",
		avatar_url: "https://github.com/shadcn.png",
		bio: "写真撮影が趣味です",
	},
];

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	return NextResponse.json(dummyFollowees);
}
