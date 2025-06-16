import { Database } from './database.types'
 
export type User = Database['public']['Tables']['users']['Row']

export type Post = Database['public']['Tables']['posts']['Row'] & {
  post_images: {
    id: string
    image_url: string
    order_index: number
  }[]
}

export type PostWithUser = Post & {
  user: User
}

export type Classification = {
  name: string
  count: number
} 