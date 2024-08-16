import { Card } from "@/components/ui/card";
import { FacebookSignIn, GoogleSignIn, TwitterSignIn } from "./sing-in";


export function SignInCard() {
    return(
        <div>
            <Card className="w-[480px]">
              <GoogleSignIn/>
              <TwitterSignIn/>
              <FacebookSignIn/>
            </Card>
        </div>
    )
}