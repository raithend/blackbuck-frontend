import type { LucideIcon } from "lucide-react"

export function NavbarItem({ label, icon: Icon }: { label: string, icon: LucideIcon }) {
    return(
        <div className="flex items-center p-2 md:p-6 hover:bg-accent hover:text-accent-foreground">
            <Icon className="h-8 w-8" />
            <div className="hidden lg:block text-xl ml-4">
                {label}
            </div>            
        </div>
    )
}