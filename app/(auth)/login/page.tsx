import { LoginForm } from "@/app/components/auth/login-form";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="space-y-6">
				<LoginForm />
				
				{/* サインアップへの誘導 */}
				<div className="text-center">
					<p className="text-sm text-gray-600 mb-2">
						アカウントをお持ちでない方はこちら
					</p>
					<Button asChild variant="outline" size="sm">
						<Link href="/signup">
							新規アカウント作成
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
