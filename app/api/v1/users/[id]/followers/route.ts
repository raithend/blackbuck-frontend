import { NextResponse } from "next/server";

const dummyFollowers = [
	{
		id: "tanaka_jiro",
		username: "田中次郎",
		avatar_url: "https://github.com/shadcn.png",
		bio: "旅行が好きです",
	},
	{
		id: "nakamura_misaki",
		username: "中村美咲",
		avatar_url: "https://github.com/shadcn.png",
		bio: "料理を勉強中",
	},
	{
		id: "kobayashi_kenta",
		username: "小林健太",
		avatar_url: "https://github.com/shadcn.png",
		bio: "スポーツが趣味です",
	},
];

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	return NextResponse.json(dummyFollowers);
}
