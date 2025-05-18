'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { PostDialog } from "@/components/post/post-dialog"
import { useUser } from '@/contexts/user-context'
import { toast } from 'sonner'

export function PostButton() {
  const [open, setOpen] = useState(false)
  const { backendSession } = useUser()

  const handlePost = async (data: {
    content?: string
    location?: string
    classification?: string
    imageUrls: string[]
  }) => {
    try {
      // 画像が1つ以上あることを確認
      if (!data.imageUrls || data.imageUrls.length === 0) {
        toast.error('画像を1枚以上アップロードしてください')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: data.content || '',
          location: data.location || '',
          classification: data.classification || '',
          image_urls: data.imageUrls
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      toast.success('投稿が完了しました')
      setOpen(false)
    } catch (error) {
      console.error('投稿エラー:', error)
      toast.error('投稿に失敗しました')
    }
  }

  if (!backendSession) {
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