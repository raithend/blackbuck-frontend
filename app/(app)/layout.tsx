import { Header } from '@/components/header';

export default function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<Header />
			<main className="pt-16">
				{children}
			</main>
		</div>
	);
}
