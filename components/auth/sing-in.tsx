import { signIn } from "@/auth"
 
export function FacebookSignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("facebook")
      }}
    >
      <button type="submit">Signin with Facebook</button>
    </form>
  )
}

export function GoogleSignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google")
      }}
    >
      <button type="submit">Signin with Google</button>
    </form>
  )
}

export function TwitterSignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("twitter")
      }}
    >
      <button type="submit">Signin with X</button>
    </form>
  )
} 

export function GitHubSignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("github")
      }}
    >
      <button type="submit">Signin with GitHub</button>
    </form>
  )
} 