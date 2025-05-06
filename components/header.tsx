'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/user-context';
import { useSupabaseSession } from '@/hooks/use-supabase-session';
import { LogoutButton } from '@/components/auth/logout-button';

export function Header() {
  const { user } = useUser();


  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-50">
      <div className="flex h-full items-center px-4 md:px-6 md:pl-72">
        {/* 左側：ホームアイコン */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold">🏠</span>
        </Link>

        {/* 右側：ユーザー関連ボタン */}
        <div className="flex items-center gap-4 ml-4">
          <Button variant="ghost" size="icon">
            <span className="text-xl">⚙️</span>
          </Button>

          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || ''} alt={user.username} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button >
              ログイン
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 