import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Card,
    CardContent,
  } from "@/components/ui/card"
import { UserRoundIcon } from "lucide-react"
import { SearchBox } from "./search-box";

export function SmartphoneHeader() {
    return(
        <div className="flex items-center justify-between">
            <SearchBox/>
            <Link href="./profile">
                <Avatar className="h-8 w-8 m-2">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback><UserRoundIcon/></AvatarFallback>  
                </Avatar>                
            </Link>
        </div>
    )
}