import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { DialogContent } from "@/components/ui/dialog";

function SignInButton() {
	return (
		<form
			action={async () => {
				"use server";
				await signIn();
			}}
		>
			<Button type="submit">Sign In</Button>
		</form>
	);
}

export function SignInDialog() {
	return (
		<DialogContent>
			<div className="flex items-center justify-self-center">
				<SignInButton />
			</div>
		</DialogContent>
	);
}
