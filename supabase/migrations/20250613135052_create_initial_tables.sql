-- 新しいテーブルを作成
CREATE TABLE public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username varchar(255) NOT NULL UNIQUE,
  account_id varchar(255) NOT NULL UNIQUE,
  avatar_url text,
  header_url text,
  bio text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX idx_users_account_id ON public.users(account_id);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- RLSポリシーを設定
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ユーザー作成のためのRLSポリシー
CREATE POLICY "Anyone can create a user record"
  ON public.users FOR INSERT
  TO public
  WITH CHECK (true);

-- ユーザー情報の閲覧（誰でも可能）
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  TO public
  USING (true);

-- ユーザー情報の更新（本人のみ）
CREATE POLICY "Users can update their own record"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- updated_at自動更新トリガー用関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$;

-- ユーザーテーブルにupdated_atトリガーを設定
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();