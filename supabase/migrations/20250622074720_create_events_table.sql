-- eventsテーブルを作成
CREATE TABLE IF NOT EXISTS public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  header_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX idx_events_name ON public.events(name);
CREATE INDEX idx_events_created_at ON public.events(created_at);

-- RLSポリシーを設定
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- eventの閲覧（誰でも可能）
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  TO public
  USING (true);

-- ログイン済みユーザーはeventの作成可能
CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ログイン済みユーザーはeventの更新可能
CREATE POLICY "Authenticated users can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 削除は無効化（将来的にadminのみに制限予定）
CREATE POLICY "No one can delete events"
  ON public.events FOR DELETE
  TO public
  USING (false);

-- 更新日時を自動更新するトリガー
CREATE TRIGGER handle_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
