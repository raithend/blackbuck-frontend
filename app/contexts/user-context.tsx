"use client";

import { createClient } from "@/app/lib/supabase-browser";
import type { User } from "@/app/types/types";
import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import useSWR from "swr";

interface UserContextType {
	user: User | null;
	loading: boolean;
	error: Error | null;
	refreshUser: () => Promise<void>;
	session: Session | null;
	hasNetworkError: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const fetcher = async (url: string) => {
	const supabase = createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.user) {
		return { user: null };
	}

	try {
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}

		return response.json();
	} catch (error) {
		// ネットワークエラーの場合は既存データを保持するため、エラーを投げない
		if (error instanceof TypeError && error.message.includes('fetch')) {
			console.warn('ネットワークエラーが発生しましたが、既存のユーザーデータを保持します:', error);
			return null; // nullを返すことで、既存のデータを保持
		}
		throw error;
	}
};

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [isSessionLoading, setIsSessionLoading] = useState(true);
	const [hasNetworkError, setHasNetworkError] = useState(false);

	useEffect(() => {
		const supabase = createClient();

		// 初期セッションの取得
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setIsSessionLoading(false);
		});

		// セッション変更の監視
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setIsSessionLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	// セッションの読み込みが完了していない場合は、データフェッチを行わない
	const shouldFetch = !isSessionLoading && session?.user;
	const { data, error, mutate } = useSWR(
		shouldFetch ? "/api/users/me" : null,
		fetcher,
		{
			revalidateOnFocus: false, // フォーカス時の再検証を無効化
			revalidateOnReconnect: true, // 再接続時は再検証
			shouldRetryOnError: false, // エラー時の再試行を無効化（既存データを保持するため）
			dedupingInterval: 30000, // 30秒間の重複リクエストを防ぐ
			keepPreviousData: true, // 前のデータを保持
		},
	);

	const user = data?.user ?? null;
	const loading = isSessionLoading;

	// セッション変更時にユーザーデータを強制的に更新
	useEffect(() => {
		if (session?.user && !isSessionLoading) {
			mutate();
		} else if (!session && !isSessionLoading) {
			mutate({ user: null }, false);
		}
	}, [session, isSessionLoading, mutate]);

	// ネットワークエラーの監視
	useEffect(() => {
		if (error) {
			// ネットワークエラーの場合は既存データを保持
			if (error.message.includes('fetch') || error.message.includes('network')) {
				setHasNetworkError(true);
			} else {
				setHasNetworkError(false);
			}
		} else {
			setHasNetworkError(false);
		}
	}, [error]);

	const value = {
		user,
		loading,
		error,
		refreshUser: mutate,
		session,
		hasNetworkError,
	};

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}
