'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { PostDialog } from "@/components/post/post-dialog"
import { useUser } from '@/contexts/user-context'
import { toast } from 'sonner'

export function PostButton() {
  const [open, setOpen] = useState(false)
  const { backendSession, getAuthToken } = useUser()

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
      const token = await getAuthToken()
      console.log('認証トークン取得結果:', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 10)}...` : null,
        tokenLength: token?.length
      })
      
      if (!token) {
        console.error('認証トークンが取得できません')
        toast.error('認証が必要です')
        return
      }

      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error('APIのURLが設定されていません')
        toast.error('システムエラーが発生しました')
        return
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts`
      const requestBody = {
        content: data.content || '',
        location: data.location || '',
        classification: data.classification || '',
        image_urls: data.imageUrls
      }

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }

      console.log('投稿リクエスト準備:', {
        apiUrl,
        method: 'POST',
        headers: {
          ...headers,
          'Authorization': `Bearer ${token.substring(0, 10)}...`
        },
        body: requestBody
      })

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('投稿エラー詳細:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: Object.fromEntries(response.headers.entries()),
          requestUrl: apiUrl,
          requestHeaders: {
            ...headers,
            'Authorization': `Bearer ${token.substring(0, 10)}...`
          }
        })
        throw new Error(errorText)
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