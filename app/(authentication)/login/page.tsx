import Image from "next/image";
import { GoogleSignIn, GitHubSignIn } from "@/components/sing-in";


export default function Page() {
    return(
        <div>
            <GoogleSignIn>Login</GoogleSignIn>
            <GitHubSignIn>Login</GitHubSignIn>
        </div>
    )
}