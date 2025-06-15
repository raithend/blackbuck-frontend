'use client'

import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Dialog, DialogTrigger } from "@/app/components/ui/dialog"
import { PostDialog } from "@/app/components/post/post-dialog"
import { useUser } from '@/app/contexts/user-context'
import { toast } from 'sonner'

export function PostButton() {
  const [open, setOpen] = useState(false)
  const { user, session } = useUser()

  const handlePost = async (data: {
    content?: string
    location?: string
    classification?: string
    imageUrls: string[]
  }) => {
    try {
      if (!data.imageUrls || data.imageUrls.length === 0) {
        toast.error('画像を1枚以上アップロードしてください')
        return
      }

      if (!session) {
        toast.error('認証が必要です')
        return
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          content: data.content || '',
          location: data.location || '',
          classification: data.classification || '',
          image_urls: data.imageUrls
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('投稿エラー:', error)
        throw new Error(error.error || '投稿に失敗しました')
      }

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
          <Button>投稿する</Button>
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