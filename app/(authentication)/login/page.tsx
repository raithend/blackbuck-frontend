import Image from "next/image";
import { FacebookSignIn, GoogleSignIn, GitHubSignIn } from "@/components/sing-in";


export default function Page() {
    return(
        <div>
            <FacebookSignIn>Login</FacebookSignIn>
            <GoogleSignIn>Login</GoogleSignIn>
            <GitHubSignIn>Login</GitHubSignIn>
        </div>
    )
}