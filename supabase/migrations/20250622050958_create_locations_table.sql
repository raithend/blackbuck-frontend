-- locationsテーブルを作成
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  header_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX idx_locations_name ON public.locations(name);
CREATE INDEX idx_locations_created_at ON public.locations(created_at);

-- RLSポリシーを設定
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- locationの閲覧（誰でも可能）
CREATE POLICY "Locations are viewable by everyone"
  ON public.locations FOR SELECT
  TO public
  USING (true);

-- ログイン済みユーザーはlocationの作成可能
CREATE POLICY "Authenticated users can create locations"
  ON public.locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ログイン済みユーザーはlocationの更新可能
CREATE POLICY "Authenticated users can update locations"
  ON public.locations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 削除は無効化（将来的にadminのみに制限予定）
CREATE POLICY "No one can delete locations"
  ON public.locations FOR DELETE
  TO public
  USING (false);

-- 更新日時を自動更新するトリガー
CREATE TRIGGER handle_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();