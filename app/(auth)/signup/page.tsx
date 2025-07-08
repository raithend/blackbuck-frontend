import { SignUpForm } from "@/app/components/auth/signup-form";
import Link from "next/link";

export default function SignupPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="space-y-6">
				<SignUpForm />
				<div className="text-center">
					<p className="text-sm text-gray-600 mb-2">
						すでにアカウントをお持ちの方は
						<Link href="/login" className="text-primary underline ml-1">
							こちら
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
