export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex justify-center">
			{children}
		</div>
	);
}
