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
import { HomeIcon, UserRoundCheckIcon, BellIcon, HeartIcon, SettingsIcon, UserRoundIcon} from "lucide-react"
import { Button } from "@/components/ui/button";

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

                <CardContent className="p-0">
                    <Link href="/">
                        <Button variant="ghost" className="flex items-center justify-center px-6 py-8">
                            <HomeIcon className="h-8 w-8" />
                            <div className="hidden lg:block text-xl m-4">
                                ホーム
                            </div>
                        </Button>
                    </Link>
                    <Link href="./follow">
                        <Button variant="ghost" className="flex items-center justify-center px-6 py-8">
                            <UserRoundCheckIcon className="h-8 w-8" />
                            <div className="hidden lg:block text-xl m-4">
                                フォロー
                            </div>
                        </Button>
                    </Link>
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
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback><UserRoundIcon/></AvatarFallback>  
                            </Avatar>                            
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