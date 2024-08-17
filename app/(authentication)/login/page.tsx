import Image from "next/image";
import { FacebookSignIn, GoogleSignIn, GitHubSignIn } from "@/components/auth/sing-in";


export default function Page() {
    return(
        <div>
            <FacebookSignIn/>
            <GoogleSignIn/>
            <GitHubSignIn/>
        </div>
    )
}