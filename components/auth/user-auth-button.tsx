'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogoutButton } from '@/components/auth/logout-button'
import { useUser } from '@/contexts/user-context'
import Link from 'next/link'

export function UserAuthButton() {
  const [open, setOpen] = useState(false)
  const { backendSession, userProfile, isLoading } = useUser()

  if (isLoading) {
    return <Button variant="ghost" disabled>読み込み中...</Button>
  }

  if (!backendSession || !userProfile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">ログイン</Button>
        </DialogTrigger>
        <AuthDialog />
      </Dialog>
    )
  }

  // アバターのフォールバック用のイニシャルを生成
  const getInitials = () => {
    if (userProfile?.username) {
      return userProfile.username
    }
    if (backendSession?.user?.username) {
      return backendSession.user.username
    }
    return 'U'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={backendSession.user.avatar_url} 
              alt={userProfile.username || backendSession.user.username || 'ユーザー'} 
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{backendSession.user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              @{backendSession.user.account_id}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${userProfile.accountId}`}>
            プロフィール
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            設定
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogoutButton variant="ghost" size="sm" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 