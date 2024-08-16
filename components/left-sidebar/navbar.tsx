import { auth } from "@/auth"
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { HomeIcon, UserRoundCheckIcon, BellIcon, HeartIcon, SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button";
import UserAvatar from "./use-avatar";
import { UseNavbarButton } from "./use-navbar-button";

export async function Navbar() {
    const session = await auth()

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

                <CardContent className="p-0">
                    <Link href="/">
                        <Button variant="ghost" className="flex items-center justify-center px-6 py-8">
                            <HomeIcon className="h-8 w-8" />
                            <div className="hidden lg:block text-xl m-4">
                                ホーム
                            </div>
                        </Button>
                    </Link>
                    <UseNavbarButton/>
                    <Link href="./notification">
                        <Button variant="ghost" className="flex items-center justify-center px-6 py-8">
                            <BellIcon className="h-8 w-8" />
                            <div className="hidden lg:block text-xl m-4">
                                通知
                            </div>
                        </Button>
                    </Link>
                    <Link href="./like">
                        <Button variant="ghost" className="flex items-center justify-center px-6 py-8">
                            <HeartIcon className="h-8 w-8" />
                            <div className="hidden lg:block text-xl m-4">
                                いいね
                            </div>
                        </Button>
                    </Link>
                    <Link href="./setting">
                        <Button variant="ghost" className="flex items-center justify-center px-6 py-8">
                            <SettingsIcon className="h-8 w-8" />
                            <div className="hidden lg:block text-xl m-4">
                                設定
                            </div>
                        </Button>
                    </Link>
                    <Link href="./profile">
                        <Button variant="ghost" className="flex items-center justify-center px-6 py-8">
                            <UserAvatar/>                       
                            <div className="hidden lg:block text-xl m-4">
                                プロフィール
                            </div>
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}