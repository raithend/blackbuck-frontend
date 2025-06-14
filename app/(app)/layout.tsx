import { Header } from '@/app/components/header';

export default function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen pb-16">
			<Header />
			<main className="pt-16">
				{children}
			</main>
		</div>
	);
}
