import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context";
import { ProfileProvider } from "@/contexts/profile-context";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Blackbuck",
	description: "Blackbuckは動物の画像を投稿するSNSアプリケーションです。",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<body className={inter.className} suppressHydrationWarning>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<SupabaseAuthProvider>
						<ProfileProvider>
							{children}
						</ProfileProvider>
					</SupabaseAuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
