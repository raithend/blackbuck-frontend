-- Habitat_dataテーブルの作成
CREATE TABLE public.habitat_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classification_id uuid REFERENCES public.classifications(id) ON DELETE SET NULL,
  content text NOT NULL, -- 地理データファイル（json形式のテキスト）
  creator uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- 地理データファイル作成者
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスの作成
CREATE INDEX idx_habitat_data_classification_id ON public.habitat_data(classification_id);
CREATE INDEX idx_habitat_data_creator ON public.habitat_data(creator);

-- RLSポリシーを設定
ALTER TABLE public.habitat_data ENABLE ROW LEVEL SECURITY;

-- 生息地データの閲覧（誰でも可能）
CREATE POLICY "Habitat data are viewable by everyone"
  ON public.habitat_data FOR SELECT
  TO public
  USING (true);

-- ログイン済みユーザーは作成可能
CREATE POLICY "Authenticated users can create habitat data"
  ON public.habitat_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 作成者のみ更新可能
CREATE POLICY "Only creator can update habitat data"
  ON public.habitat_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator OR creator IS NULL)
  WITH CHECK (content IS NOT NULL);

-- 作成者のみ削除可能
CREATE POLICY "Only creator can delete habitat data"
  ON public.habitat_data FOR DELETE
  TO authenticated
  USING (auth.uid() = creator);

-- 更新日時を自動更新するトリガー
CREATE TRIGGER handle_habitat_data_updated_at
  BEFORE UPDATE ON public.habitat_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();