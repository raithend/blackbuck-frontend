import { DialogContent } from "@radix-ui/react-dialog";
import { FacebookSignIn, GoogleSignIn, TwitterSignIn } from "./sing-in";


export function SignInDialog() {
    return(
        <div>
            <DialogContent className="w-[480px]">
              <GoogleSignIn/>
              <TwitterSignIn/>
              <FacebookSignIn/>
            </DialogContent>
        </div>
    )
}