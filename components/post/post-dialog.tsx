'use client'

import { useState } from 'react'
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LocationCombobox } from './location-combobox'
import { ImageUpload } from '@/components/post/image-upload'

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
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onPost({
        content,
        location,
        classification,
        imageUrls
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>新規投稿</DialogTitle>
        <LocationCombobox />
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
          value={imageUrls}
          onChange={setImageUrls}
        />
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || imageUrls.length === 0}
          className="w-full"
        >
          {isSubmitting ? '投稿中...' : '投稿する'}
        </Button>
      </div>
    </DialogContent>
  )
} 