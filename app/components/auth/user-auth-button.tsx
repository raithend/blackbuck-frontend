'use client'

import { useUser } from '@/app/contexts/user-context'
import { Button } from '@/app/components/ui/button'
import { UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AuthDialog } from '@/app/components/auth/auth-dialog'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { createClient } from '@/app/lib/supabase-browser'

export function UserAuthButton() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)

  const handleClick = () => {
    if (user) {
      router.push('/profile')
    } else {
      setIsAuthDialogOpen(true)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" disabled>
        読み込み中...
      </Button>
    )
  }

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setIsAuthDialogOpen(true)}
        >
          ログイン
        </Button>
        <AuthDialog
          isOpen={isAuthDialogOpen}
          onClose={() => setIsAuthDialogOpen(false)}
          mode="login"
        />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.avatar_url || undefined}
              alt={user.username}
            />
            <AvatarFallback>
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              @{user.account_id}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          プロフィール
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          設定
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/')
          }}
        >
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 