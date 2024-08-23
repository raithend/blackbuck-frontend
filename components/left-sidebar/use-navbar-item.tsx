import { auth } from "@/auth"
import Link from "next/link";
import { NavbarItem } from "./navbar-item";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import type { LucideIcon } from "lucide-react"
 
export async function UseNavbarItem({ label, url,  icon: Icon }: { label: string, url: string, icon: LucideIcon }) {
  const session = await auth()
 
  if (!session?.user) return (
    <Dialog>
        <DialogTrigger>
            <NavbarItem label={label} icon={Icon} />
        </DialogTrigger>
        <SignInDialog/>
    </Dialog>
  )
 
  return (
    <Link href={url}>
        <NavbarItem label={label} icon={Icon} />
    </Link>
  
  )
}