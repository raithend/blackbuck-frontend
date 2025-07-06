-- フォロー関係を管理するテーブルを作成
CREATE TABLE public.follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- 同じフォロー関係が重複しないように制約
  UNIQUE(follower_id, following_id),
  
  -- 自分自身をフォローできないようにする制約
  CONSTRAINT check_not_self_follow CHECK (follower_id != following_id)
);

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_follows_created_at ON public.follows(created_at);

-- RLSを有効化
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- フォロー関係の作成（認証済みユーザーのみ）
CREATE POLICY "Users can create follow relationships"
  ON public.follows FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = follower_id
  );

-- フォロー関係の閲覧（誰でも可能）
CREATE POLICY "Follow relationships are viewable by everyone"
  ON public.follows FOR SELECT
  TO public
  USING (true);

-- フォロー関係の削除（フォローした本人のみ）
CREATE POLICY "Users can delete their own follow relationships"
  ON public.follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- フォロー関係の更新は許可しない（削除して再作成する）
CREATE POLICY "No updates allowed on follow relationships"
  ON public.follows FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

