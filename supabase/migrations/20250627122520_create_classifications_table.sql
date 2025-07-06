-- Classificationsテーブルの作成
CREATE TABLE public.classifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL, -- 分類名（必須）
  english_name text, -- 英語の分類名
  scientific_name text, -- 学名
  description text, -- 説明文
  era_start text, -- 生息年代（はじめ）
  era_end text, -- 生息年代（おわり）
  header_url text, -- ヘッダー画像のURL
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスの作成
CREATE INDEX idx_classifications_name ON public.classifications(name);
CREATE INDEX idx_classifications_english_name ON public.classifications(english_name);
CREATE INDEX idx_classifications_scientific_name ON public.classifications(scientific_name);
CREATE INDEX idx_classifications_era_start ON public.classifications(era_start);
CREATE INDEX idx_classifications_era_end ON public.classifications(era_end);

-- RLSポリシーを設定
ALTER TABLE public.classifications ENABLE ROW LEVEL SECURITY;

-- 分類の閲覧（誰でも可能）
CREATE POLICY "Classifications are viewable by everyone"
  ON public.classifications FOR SELECT
  TO public
  USING (true);

-- ログイン済みユーザーは作成可能
CREATE POLICY "Authenticated users can create classifications"
  ON public.classifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- データの更新（ログイン済みユーザーのみ）
CREATE POLICY "Users can update basic classification data"
  ON public.classifications FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 更新日時を自動更新するトリガー
CREATE TRIGGER handle_classifications_updated_at
  BEFORE UPDATE ON public.classifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();