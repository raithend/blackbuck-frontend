import { Card } from "@/components/ui/card";
import { FacebookSignIn, GoogleSignIn, TwitterSignIn } from "./sign-in";


export function SignInCard() {
    return(
        <Card className="size-96 flex flex-col items-center justify-center flex-auto ">
            <GoogleSignIn/>
            <TwitterSignIn/>
            <FacebookSignIn/>
        </Card>
    )
}