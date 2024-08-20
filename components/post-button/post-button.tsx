import { Button } from "@/components/ui/button"
import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TaxonomyCombobox } from "./taxonomy-combobox"
import { LocationCombobox } from "./location-combobox";

import { ImageUp } from "lucide-react"

export function PostButton() {
    return(         
        <div className="flex items-center justify-center">
            <Dialog>
                <DialogTrigger asChild>
                    <Button  variant="outline" className="flex gap-2 px-4 py-6">
                        <ImageUp className="h-8 w-8" />
                        <div className="hidden md:block">
                            投稿を作成
                        </div>
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-[480px]">
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
                                <TaxonomyCombobox/>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="width">撮影地</Label>
                                <LocationCombobox/>
                            </div>
                        </div>
                        <Button  variant="outline">
                            <div>
                                投稿！
                            </div>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}