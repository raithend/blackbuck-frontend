-- フォトバブルテーブルの作成
CREATE TABLE public.photo_bubbles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL, -- Tooltipに表示する名前
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL, -- 作成者のID（必須）
  page_url text NOT NULL, -- 表示するページのURL（必須）
  image_url text NOT NULL, -- 表示する画像のURL（必須）
  target_url text, -- リンク先のURL（オプション）
  x_position integer NOT NULL DEFAULT 0, -- X座標
  y_position integer NOT NULL DEFAULT 0, -- Y座標
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX idx_photo_bubbles_user_id ON public.photo_bubbles(user_id);
CREATE INDEX idx_photo_bubbles_page_url ON public.photo_bubbles(page_url);
CREATE INDEX idx_photo_bubbles_created_at ON public.photo_bubbles(created_at);

-- RLSポリシーを設定
ALTER TABLE public.photo_bubbles ENABLE ROW LEVEL SECURITY;

-- フォトバブルの閲覧（誰でも可能）
CREATE POLICY "Photo bubbles are viewable by everyone"
  ON public.photo_bubbles FOR SELECT
  TO public
  USING (true);

-- ログイン済みユーザーのみ作成可能
CREATE POLICY "Authenticated users can create photo bubbles"
  ON public.photo_bubbles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 作成者のみ更新可能
CREATE POLICY "Only creator can update photo bubbles"
  ON public.photo_bubbles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 作成者のみ削除可能
CREATE POLICY "Only creator can delete photo bubbles"
  ON public.photo_bubbles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- プロフィールページ用のRLSポリシー（そのユーザーのみが作成可能）
CREATE POLICY "Only profile owner can create photo bubbles on their profile"
  ON public.photo_bubbles FOR INSERT
  TO authenticated
  WITH CHECK (
    CASE 
      WHEN page_url LIKE '/users/%' THEN
        auth.uid()::text = split_part(page_url, '/', 3)
      ELSE true
    END
  );

-- 更新日時を自動更新するトリガー
CREATE TRIGGER handle_photo_bubbles_updated_at
  BEFORE UPDATE ON public.photo_bubbles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- プロフィールページ用のビュー（そのユーザーのみが作成可能）
CREATE VIEW public.profile_photo_bubbles 
WITH (security_invoker = on) AS
SELECT 
  pb.*,
  CASE 
    WHEN pb.page_url LIKE '/users/%' THEN 
      split_part(pb.page_url, '/', 3) -- /users/{accountId} から accountId を抽出
    ELSE NULL
  END AS profile_user_id
FROM public.photo_bubbles pb
WHERE pb.page_url LIKE '/users/%';

