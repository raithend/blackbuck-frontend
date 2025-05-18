'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true)
      const newUrls: string[] = []

      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (!response.ok) {
          throw new Error('アップロードに失敗しました')
        }

        const data = await response.json()
        newUrls.push(data.url)
      }

      onChange([...value, ...newUrls])
    } catch (error) {
      console.error('アップロードエラー:', error)
    } finally {
      setIsUploading(false)
    }
  }, [value, onChange])

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    onDrop
  })

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange(newUrls)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {value.map((url, index) => (
          <div key={url} className="relative aspect-square">
            <Image
              src={url}
              alt={`アップロード画像 ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <div {...getRootProps()} className="border-2 border-dashed p-4 rounded-lg">
          <input {...getInputProps()} />
          <p>画像をドラッグ＆ドロップ、またはクリックして選択</p>
        </div>
      </div>
    </div>
  )
} 