'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function SignUpConfirmation() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">メールを確認してください</CardTitle>
          <CardDescription className="text-center">
            認証メールが送信されました。メールをご確認ください。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            メールに記載されているリンクをクリックして、アカウントの認証を完了してください。
          </p>
          <Button asChild variant="link">
            <Link href="/login">
              ログインページに戻る
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 