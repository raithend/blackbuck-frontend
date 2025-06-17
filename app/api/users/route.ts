import { createClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

async function generateAccountId(email: string): Promise<string> {
	const supabase = await createClient();
	const baseId = email.split("@")[0].toLowerCase();
	let accountId = baseId;
	let counter = 1;

	while (true) {
		const { data, error } = await supabase
			.from("users")
			.select("account_id")
			.eq("account_id", accountId)
			.single();

		if (error?.code === "PGRST116") {
			// レコードが見つからない場合（一意のID）
			return accountId;
		}

		if (error) {
			throw error;
		}

		// 既存のIDが見つかった場合、カウンターを増やして再試行
		accountId = `${baseId}${counter}`;
		counter++;
	}
}

export async function POST(request: Request) {
	try {
		const { id, name, email } = await request.json();
		const supabase = await createClient();
		const accountId = await generateAccountId(email);

		const { data, error } = await supabase
			.from("users")
			.insert({
				id,
				account_id: accountId,
				username: name,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (error) {
			console.error("ユーザー作成エラー:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("ユーザー作成エラー:", error);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
