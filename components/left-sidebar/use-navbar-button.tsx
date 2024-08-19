import { auth } from "@/auth"
import Link from "next/link";
import { NavbarButton } from "./navbar-button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SignInCard } from "../auth/sign-in-card";
 
export async function UseNavbarButton() {
  const session = await auth()
 
  if (!session?.user) return (
    <Dialog>
        <DialogTrigger className="w-full">
            <NavbarButton/>
        </DialogTrigger>
        <DialogContent>
            <SignInCard/>
        </DialogContent>
    </Dialog>
  )
 
  return (
    <Link href="./follow">
        <NavbarButton/>
    </Link>
  
  )
}