'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle	 } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from '@/components/auth/login-form'
import { SignUpForm } from '@/components/auth/signup-form'
import { useUser } from '@/contexts/user-context'

interface AuthDialogProps {
	trigger?: React.ReactNode
	defaultTab?: 'login' | 'signup'
}

export function AuthDialog({ trigger, defaultTab = 'login' }: AuthDialogProps) {
	const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab)
	const { backendSession, userProfile, isLoading, error } = useUser()

	return (
		<DialogContent>
			{/* <div className="flex items-center justify-self-center">
				<SignInButton />
			</div> */}
			<DialogHeader>
				<DialogTitle className="text-center text-2xl font-bold">
					アカウント
				</DialogTitle>
			</DialogHeader>
			
			{isLoading ? (
				<div className="flex justify-center py-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
				</div>
			) : backendSession ? (
				<div className="py-4 text-center">
					<p className="mb-2">ログイン済みです</p>
					<p className="mb-4 text-sm text-gray-500">{userProfile?.name}</p>
					<Button 
						onClick={() => window.location.href = '/logout'}
						variant="outline"
						className="mr-2"
					>
						ログアウト
					</Button>
					<Button>
						マイページ
					</Button>
				</div>
			) : (
				<Tabs
					defaultValue={activeTab}
					value={activeTab}
					onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2 mb-6">
						<TabsTrigger value="login">ログイン</TabsTrigger>
						<TabsTrigger value="signup">サインアップ</TabsTrigger>
					</TabsList>
					<TabsContent value="login">
						<LoginForm />
					</TabsContent>
					<TabsContent value="signup">
						<SignUpForm />
					</TabsContent>
				</Tabs>
			)}
			
			{error && (
				<div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
					<p>エラーが発生しました: {error}</p>
				</div>
			)}
		</DialogContent>
	);
}
