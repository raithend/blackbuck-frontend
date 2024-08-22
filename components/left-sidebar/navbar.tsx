import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Home, UserRoundCheck, Bell, Heart, Settings } from "lucide-react"
import { NavbarItem } from "./navbar-item";
import { UseNavbarItem } from "./use-navbar-item";
import { UseProfileItem } from "./use-profile-item";

export function Navbar() {
    return(
        <div className="hidden md:block">
            <Card>
                <CardHeader className="flex flex-row items-center px-5 py-6">
                    <Avatar>
                        <Link href="/">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>BB</AvatarFallback>                          
                        </Link>
                    </Avatar>
                    <CardTitle className="hidden lg:block text-3xl ml-4">
                        <Link href="/">
                            Blackbuck
                        </Link>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0 flex flex-col">
                    <Link href="/">
                        <NavbarItem label="ホーム" icon={Home}/>
                    </Link>
                    <UseNavbarItem label="フォロー" url="./follow" icon={UserRoundCheck}/>
                    <UseNavbarItem label="通知" url="./notification" icon={Bell}/>
                    <UseNavbarItem label="いいね" url="./like" icon={Heart}/>
                    <UseNavbarItem label="設定" url="./setting" icon={Settings}/>
                    <UseProfileItem/>
                </CardContent>
            </Card>
        </div>
    )
}