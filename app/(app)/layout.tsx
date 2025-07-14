import { Header } from "@/app/components/header";

export default function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<Header />
			<main>{children}</main>
		</div>
	);
}
