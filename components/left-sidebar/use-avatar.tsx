import { auth } from "@/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserRoundIcon } from "lucide-react"
 
export default async function UserAvatar() {
  const session = await auth()
 
  if (!session) return <UserRoundIcon className="h-8 w-8" />
 
  return (
    <Avatar className="h-8 w-8">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback><UserRoundIcon/></AvatarFallback>  
    </Avatar>     
  )
}