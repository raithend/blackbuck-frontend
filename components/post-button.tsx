import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
Popover,
PopoverContent,
PopoverTrigger,
} from "@/components/ui/popover"
  
import { CameraIcon, ImageUp } from "lucide-react"

export function PostButton() {
    return(         
        <div className="flex items-center justify-center">
            <Popover>
                <PopoverTrigger asChild>
                    <Button  variant="outline" className="flex gap-2 px-4 py-6">
                        <ImageUp className="h-8 w-8" />
                        <div className="hidden md:block">
                            投稿を作成
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[480px]">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="picture">画像</Label>
                                <Input
                                    id="picture"
                                    type="file"
                                    className="col-span-2 h-8"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="width">コメント</Label>
                                <Input
                                    id="comment"
                                    defaultValue=""
                                    className="col-span-2 h-8"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="width">分類</Label>
                                <Input
                                    id="taxonomy"
                                    defaultValue=""
                                    className="col-span-2 h-8"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="width">撮影地</Label>
                                <Input
                                    id="location"
                                    defaultValue=""
                                    className="col-span-2 h-8"
                                />
                            </div>
                        </div>
                        <Button  variant="outline">
                            <div>
                                投稿！
                            </div>
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>     
        </div>
    )
}