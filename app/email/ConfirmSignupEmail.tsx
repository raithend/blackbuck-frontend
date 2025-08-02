import { Button } from "@react-email/button";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Link } from "@react-email/link";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import * as React from "react";

interface ConfirmSignupEmailProps {
	username?: string;
	confirmUrl: string;
}

export default function ConfirmSignupEmail({
	username,
	confirmUrl,
}: ConfirmSignupEmailProps) {
	return (
		<Html lang="ja">
			<Head />
			<Container
				style={{
					maxWidth: 480,
					margin: "0 auto",
					padding: 24,
					fontFamily: "sans-serif",
					background: "#fff",
					borderRadius: 8,
					boxShadow: "0 2px 8px #eee",
				}}
			>
				<Section>
					<Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
						会員登録のご確認
					</Text>
					<Text style={{ fontSize: 16, marginBottom: 16 }}>
						{username ? `${username}様、` : ""}
						Blackbuckをご利用いただきありがとうございます。
						<br />
						下のボタンをクリックして、メールアドレスの確認を完了してください。
					</Text>
					<Button
						href={confirmUrl}
						style={{
							background: "#2563eb",
							color: "#fff",
							padding: "12px 24px",
							borderRadius: 6,
							fontSize: 16,
							fontWeight: "bold",
							textDecoration: "none",
							display: "inline-block",
							margin: "24px 0",
						}}
					>
						メールアドレスを確認する
					</Button>
					<Text style={{ fontSize: 14, color: "#888", marginTop: 24 }}>
						このメールに心当たりがない場合は、破棄してください。
					</Text>
					<Text style={{ fontSize: 12, color: "#bbb", marginTop: 16 }}>
						&copy; {new Date().getFullYear()} Blackbuck
					</Text>
				</Section>
			</Container>
		</Html>
	);
}
