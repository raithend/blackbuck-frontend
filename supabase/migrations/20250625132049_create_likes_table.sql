-- いいね機能を管理するテーブルを作成
CREATE TABLE public.likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- 同じユーザーが同じ投稿に複数回いいねできないように制約
  UNIQUE(user_id, post_id)
);

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_post_id ON public.likes(post_id);
CREATE INDEX idx_likes_created_at ON public.likes(created_at);

-- RLSを有効化
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- いいねの作成（認証済みユーザーのみ）
CREATE POLICY "Users can create likes"
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- いいねの閲覧（誰でも可能）
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  TO public
  USING (true);

-- いいねの削除（いいねした本人のみ）
CREATE POLICY "Users can delete their own likes"
  ON public.likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- いいねの更新は許可しない（削除して再作成する）
CREATE POLICY "No updates allowed on likes"
  ON public.likes FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);


