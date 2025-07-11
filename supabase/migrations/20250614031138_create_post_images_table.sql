-- 新しいテーブルを作成
CREATE TABLE IF NOT EXISTS public.post_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_post_image_order UNIQUE (post_id, order_index)
);

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX idx_post_images_post_id ON public.post_images(post_id);
CREATE INDEX idx_post_images_order_index ON public.post_images(order_index);

-- RLSポリシーを設定
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- 投稿画像の閲覧（誰でも可能）
CREATE POLICY "Post images are viewable by everyone"
  ON public.post_images FOR SELECT
  TO public
  USING (true);

-- ユーザーは自分の投稿の画像のみ作成可能
CREATE POLICY "Users can create images for their own posts"
  ON public.post_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id
      AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id
      AND user_id = auth.uid()
      AND created_at = updated_at
    )
  );

-- ユーザーは自分の投稿の画像のみ更新可能
CREATE POLICY "Users can update images for their own posts"
  ON public.post_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id
      AND user_id = auth.uid()
    )
  );

-- ユーザーは自分の投稿の画像のみ削除可能
CREATE POLICY "Users can delete images for their own posts"
  ON public.post_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id
      AND user_id = auth.uid()
    )
  );

-- 更新日時を自動更新するトリガー
CREATE TRIGGER handle_post_images_updated_at
  BEFORE UPDATE ON public.post_images
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();