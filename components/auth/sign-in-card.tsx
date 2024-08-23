import { Card } from "@/components/ui/card";
import { FacebookSignIn, GoogleSignIn, TwitterSignIn } from "./sign-in";


export function SignInCard() {
    return(
        <div className="items-center justify-self-center">
            <GoogleSignIn/>
            <TwitterSignIn/>
            <FacebookSignIn/>
        </div>
    )
}