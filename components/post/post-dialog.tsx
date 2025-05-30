'use client'

import { useState } from 'react'
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LocationCombobox } from './location-combobox'
import { ImageUpload } from '@/components/post/image-upload'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

interface PostDialogProps {
  onPost: (data: {
    content?: string
    location?: string
    classification?: string
    imageUrls: string[]
  }) => Promise<void>
}

export function PostDialog({ onPost }: PostDialogProps) {
  const [content, setContent] = useState('')
  const [location, setLocation] = useState('')
  const [classification, setClassification] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const uploadToS3 = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('アップロードに失敗しました')
    }

    const data = await response.json()
    return data.url
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // S3に画像をアップロード
      const imageUrls = await Promise.all(
        imageFiles.map(file => uploadToS3(file))
      )

      // 投稿データを送信
      await onPost({
        content,
        location,
        classification,
        imageUrls
      })
    } catch (error) {
      // エラー処理
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>新規投稿</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Textarea
          placeholder="投稿内容を入力してください"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <LocationCombobox />
        <Input
          type="text"
          placeholder="分類"
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
        />
        <ImageUpload
          value={imageFiles}
          onChange={setImageFiles}
        />
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || imageFiles.length === 0}
          className="w-full"
        >
          {isSubmitting ? '投稿中...' : '投稿する'}
        </Button>
      </div>
    </DialogContent>
  )
} 