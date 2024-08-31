import { Button } from "@/components/ui/button"
import { signIn } from "@/auth"
 
export function SignIn() {
  return (
    <form
      action={async (formData) => {
        "use server"
        await signIn("resend", formData)
      }}
    >
      <input type="text" name="email" placeholder="Email" />
      <Button type="submit">Signin with Resend</Button>
    </form>
  )
}