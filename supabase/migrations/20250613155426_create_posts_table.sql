-- 新しいテーブルを作成
CREATE TABLE public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  classification text,
  location text,
  event text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at);
CREATE INDEX idx_posts_classification ON public.posts(classification);
CREATE INDEX idx_posts_location ON public.posts(location);
CREATE INDEX idx_posts_event ON public.posts(event);

-- RLSポリシーを設定
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 投稿の閲覧（誰でも可能）
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  TO public
  USING (true);

-- ユーザーは自分の投稿のみ作成可能
CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の投稿のみ更新可能
CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ユーザーは自分の投稿のみ削除可能
CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- トリガーを設定
CREATE TRIGGER handle_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();