import { LoginForm } from "@/app/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="space-y-6">
				<LoginForm />
				{/* サインアップへの誘導 */}
				<div className="text-center">
					<p className="text-sm text-gray-600 mb-2">
						アカウントをお持ちでない方は
						<Link href="/signup" className="text-primary underline ml-1">
							こちら
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
