import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/components/theme-provider";
import { UserProvider } from "@/app/contexts/user-context";
import { Theme } from "@radix-ui/themes";

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
					<Theme>
						<UserProvider>{children}</UserProvider>
					</Theme>
				</ThemeProvider>
			</body>
		</html>
	);
}
