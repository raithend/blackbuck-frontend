'use client'

import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogTrigger } from "@/app/components/ui/dialog"
import { PostDialog } from "@/app/components/post/post-dialog"
import { useUser } from '@/app/contexts/user-context'
import { getSession } from '@/app/lib/auth'
import { toast } from 'sonner'

export function PostButton() {
  const [open, setOpen] = useState(false)
  const { user } = useUser()

  const handlePost = async (data: {
    content?: string
    location?: string
    classification?: string
    imageUrls: string[]
  }) => {
    try {
      console.log('投稿開始:', data)

      // 画像が1つ以上あることを確認
      if (!data.imageUrls || data.imageUrls.length === 0) {
        toast.error('画像を1枚以上アップロードしてください')
        return
      }

      // 認証トークンを取得
      const session = await getSession()
      if (!session) {
        toast.error('認証が必要です')
        return
      }

      const requestBody = {
        content: data.content || '',
        location: data.location || '',
        classification: data.classification || '',
        image_urls: data.imageUrls
      }

      console.log('投稿リクエスト準備:', {
        method: 'POST',
        body: requestBody
      })

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('投稿エラー:', {
          status: response.status,
          statusText: response.statusText,
          error
        })
        throw new Error(error.message || '投稿に失敗しました')
      }

      const responseData = await response.json()
      console.log('投稿成功:', responseData)

      toast.success('投稿が完了しました')
      setOpen(false)
    } catch (error) {
      console.error('投稿エラー:', error)
      toast.error(error instanceof Error ? error.message : '投稿に失敗しました')
    }
  }

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">投稿する</Button>
        </DialogTrigger>
        <PostDialog onPost={handlePost} />
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>投稿する</Button>
      </DialogTrigger>
      <PostDialog onPost={handlePost} />
    </Dialog>
  )
} 