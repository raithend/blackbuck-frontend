import { createClient } from '@/app/lib/supabase-server'
import { PostWithUser } from '@/app/types/types'
import { PostCard } from '@/app/components/post/post-card'

interface PageProps {
  params: Promise<{
    name: string
  }>
}

export default async function ClassificationPage({ params }: PageProps) {
  const { name } = await params
  const supabase = await createClient()
  const decodedName = decodeURIComponent(name)

  // 分類名に基づく投稿を取得
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users (
        id,
        username,
        avatar_url,
        account_id,
        bio,
        created_at,
        header_url,
        updated_at
      ),
      post_images (
        id,
        image_url,
        order_index
      )
    `)
    .eq('classification', decodedName)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    return <div>エラーが発生しました</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{decodedName}の投稿</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post as PostWithUser}
          />
        ))}
      </div>
    </div>
  )
} 