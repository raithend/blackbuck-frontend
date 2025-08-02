import { createClient } from "@/app/lib/supabase-server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ event: string }> },
) {
	try {
		const { event } = await params;
		const decodedEvent = decodeURIComponent(event);

		if (!decodedEvent) {
			return NextResponse.json(
				{ error: "Event name is required" },
				{ status: 400 },
			);
		}

		const supabase = await createClient();

		// eventsテーブルから指定されたeventを取得
		const { data: eventData, error } = await supabase
			.from("events")
			.select("*")
			.eq("name", decodedEvent)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// イベントが見つからない場合はnullを返す
				return NextResponse.json({ event: null });
			}
			console.error("event取得エラー:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ event: eventData });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
