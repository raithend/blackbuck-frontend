import type { Session } from "@supabase/supabase-js";
import { createClient } from "./supabase-browser";

export async function signOut() {
	const supabase = createClient();

	try {
		const { error } = await supabase.auth.signOut();
		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("ログアウトエラー:", error);
		throw error instanceof Error
			? error
			: new Error("ログアウトに失敗しました");
	}
}

export async function getSession(): Promise<Session | null> {
	try {
		const supabase = createClient();
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error) {
			console.error("セッション取得エラー:", error);
			return null;
		}

		return session;
	} catch (error) {
		console.error("セッション取得エラー:", error);
		return null;
	}
}

export async function completeProfile({
	accountId,
	name,
}: { accountId: string; name: string }) {
	const session = await getSession();

	if (!session) {
		throw new Error("セッションが無効です");
	}

	const response = await fetch("/api/users", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ accountId, name }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "プロフィールの登録に失敗しました");
	}
}
