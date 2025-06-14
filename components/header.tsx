'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/user-context';
import { UserAuthButton } from '@/components/auth/user-auth-button';
import { PostButton } from '@/components/post/post-button';

export function Header() {
  const { userProfile, isLoading } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">BlackBuck</span>
          </Link>
        </div>
        <PostButton />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {isLoading ? (
              <Button variant="ghost" disabled>読み込み中...</Button>
            ) : (
              <UserAuthButton />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 