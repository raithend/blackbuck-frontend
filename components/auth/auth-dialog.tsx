'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/user-context'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LoginForm } from './login-form'
import { SignUpForm } from './signup-form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export function AuthDialog() {
	const [isOpen, setIsOpen] = useState(false)
	const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
	const { userProfile, backendSession, isLoading, error } = useUser()
	const router = useRouter()
	const [supabase] = useState(() => createClient())

	console.log('AuthDialog - 現在の状態:', {
		userProfile,
		backendSession,
		isLoading,
		error
	})

	const handleLogout = async () => {
		try {
			console.log('ログアウト開始')
			const { error } = await supabase.auth.signOut()
			if (error) {
				console.error('ログアウトエラー:', error)
				throw error
			}
			console.log('ログアウト成功')
			router.refresh()
		} catch (err) {
			console.error('ログアウト処理エラー:', err)
		}
	}

	if (isLoading) {
		return (
			<Button variant="outline" disabled>
				読み込み中...
			</Button>
		)
	}

	if (error) {
		console.error('AuthDialog - エラー発生:', error)
		return (
			<Button variant="outline" onClick={() => router.refresh()}>
				再読み込み
			</Button>
		)
	}

	if (userProfile && backendSession) {
		console.log('AuthDialog - ユーザー情報表示:', {
			userProfile,
			backendSession
		})
		return (
			<div className="flex items-center gap-4">
				<Avatar>
					<AvatarImage src={backendSession.user.avatar_url} alt={userProfile.name} />
					<AvatarFallback>{userProfile.name.substring(0, 2)}</AvatarFallback>
				</Avatar>
				<div className="flex flex-col">
					<span className="text-sm font-medium">{userProfile.name}</span>
					<span className="text-xs text-muted-foreground">@{userProfile.accountId}</span>
				</div>
				<Button variant="outline" onClick={handleLogout}>
					ログアウト
				</Button>
			</div>
		)
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">ログイン</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{activeTab === 'login' ? 'ログイン' : '新規登録'}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="flex justify-center space-x-4">
						<Button
							variant={activeTab === 'login' ? 'default' : 'outline'}
							onClick={() => setActiveTab('login')}
						>
							ログイン
						</Button>
						<Button
							variant={activeTab === 'signup' ? 'default' : 'outline'}
							onClick={() => setActiveTab('signup')}
						>
							新規登録
						</Button>
					</div>
					{activeTab === 'login' ? <LoginForm /> : <SignUpForm />}
				</div>
			</DialogContent>
		</Dialog>
	)
}
