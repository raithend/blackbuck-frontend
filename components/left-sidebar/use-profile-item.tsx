import { auth } from "@/auth"
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { UserRound } from "lucide-react"
 
export async function UseProfileItem() {
  const session = await auth()
 
  if (!session?.user) return (
    <Dialog>
        <DialogTrigger>
            <div className="flex items-center p-2 md:p-6 hover:bg-accent hover:text-accent-foreground">
                <UserRound className="h-8 w-8" />
                <div className="hidden lg:block text-xl ml-4">
                    プロフィール
                </div>            
            </div>
        </DialogTrigger>
        <SignInDialog/>
    </Dialog>
  )
 
  return (
    <Link href="./profile">
        <div className="flex items-center m-2 p-0 rounded-full md:m-0 md:p-6 md:rounded-none hover:bg-accent hover:text-accent-foreground">
            <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image ?? undefined} />
                <AvatarFallback><UserRound/></AvatarFallback>  
            </Avatar>
            <div className="hidden lg:block text-xl ml-4">
                プロフィール
            </div>            
        </div>
    </Link>
  )
}
