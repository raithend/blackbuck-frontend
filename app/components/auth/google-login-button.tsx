"use client";

import { Button } from "@/app/components/ui/button";
import { createClient } from "@/app/lib/supabase-browser";
import { useUser } from "@/app/contexts/user-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface GoogleLoginButtonProps {
	className?: string;
	children?: React.ReactNode;
}

export function GoogleLoginButton({ className, children }: GoogleLoginButtonProps) {
	const router = useRouter();
	const { refreshUser } = useUser();
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		
		try {
			const supabase = createClient();
			
			console.log('Starting Google OAuth with PKCE...');
			console.log('Redirect URL:', `${window.location.origin}/callback`);
			
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/callback`,
					queryParams: {
						access_type: 'offline',
						prompt: 'consent',
					},
				},
			});

			if (error) {
				console.error('Supabase OAuth error:', error);
				throw error;
			}

			// OAuthフローが開始されました
			console.log('Google OAuth started successfully:', data);
			console.log('OAuth URL:', data.url);
			
			// PKCEフローでは、ブラウザが自動的にリダイレクトされます
			
		} catch (error: any) {
			console.error('Google OAuth error:', error);
			
			let errorMessage = "Googleログインに失敗しました";
			
			if (error?.message) {
				if (error.message.includes("popup_closed")) {
					errorMessage = "ログインウィンドウが閉じられました";
				} else if (error.message.includes("cancelled")) {
					errorMessage = "ログインがキャンセルされました";
				} else if (error.message.includes("invalid_client")) {
					errorMessage = "Google OAuthの設定に問題があります";
				} else if (error.message.includes("redirect_uri_mismatch")) {
					errorMessage = "リダイレクトURIの設定に問題があります";
				} else {
					errorMessage = error.message;
				}
			}
			
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			type="button"
			variant="outline"
			className={className}
			onClick={handleGoogleLogin}
			disabled={isLoading}
		>
			{isLoading ? (
				<div className="flex items-center space-x-2">
					<div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
					<span>ログイン中...</span>
				</div>
			) : (
				<div className="flex items-center space-x-2">
					<svg className="w-5 h-5" viewBox="0 0 24 24">
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					<span>{children || "Googleでログイン"}</span>
				</div>
			)}
		</Button>
	);
} 