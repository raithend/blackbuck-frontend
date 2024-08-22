import Link from "next/link";
import {
    Card,
    CardContent,
  } from "@/components/ui/card"
import { Home, UserRoundCheck, Bell, Heart, Settings } from "lucide-react"
import { NavbarItem } from "./left-sidebar/navbar-item";
import { UseNavbarItem } from "./left-sidebar/use-navbar-item";

export function SmartphoneNavbar() {
    return(
        <div>
            <Card className="rounded-none">
                <CardContent className="flex justify-between p-2">
                    <Link href="/">
                        <NavbarItem label="ホーム" icon={Home}/>
                    </Link>
                    <UseNavbarItem label="フォロー" url="./follow" icon={UserRoundCheck}/>
                    <UseNavbarItem label="通知" url="./notification" icon={Bell}/>
                    <UseNavbarItem label="いいね" url="./like" icon={Heart}/>
                    <UseNavbarItem label="設定" url="./setting" icon={Settings}/>
                </CardContent>
            </Card>
        </div>
    )
}