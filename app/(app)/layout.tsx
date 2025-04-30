import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<div className="h-full relative">
				<div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-background">
					<AppSidebar />
				</div>
				<main className="md:pl-72">
					<SidebarTrigger />
					{children}
				</main>
			</div>
		</SidebarProvider>
	);
}
