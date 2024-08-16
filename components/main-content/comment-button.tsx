import { Button } from "@/components/ui/button"
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
import { Textarea } from "@/components/ui/textarea"

import { MessageCircle } from "lucide-react"

export function CommentButton() {
    return(         
        <div>
            <Dialog>
                <DialogTrigger>
                    <MessageCircle/>
                </DialogTrigger>
                <DialogContent className="w-[480px]">
                    <Textarea />
                </DialogContent>
            </Dialog>
        </div>
    )
}