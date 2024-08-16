import { Button } from "@/components/ui/button";
import { UserRoundCheckIcon } from "lucide-react"

export function NavbarButton() {
    return(
        <div className="flex items-center p-6 hover:bg-accent hover:text-accent-foreground">
            <UserRoundCheckIcon className="h-8 w-8" />
            <div className="hidden lg:block text-xl ml-4">
                フォロー
            </div>            
        </div>
    )
}