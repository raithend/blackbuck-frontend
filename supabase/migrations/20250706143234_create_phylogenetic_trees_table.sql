-- Phylogenetic_treesテーブルの作成
CREATE TABLE public.phylogenetic_trees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  classification_id uuid REFERENCES public.classifications(id) ON DELETE SET NULL,
  content text NOT NULL, -- 系統樹ファイル（yml形式のテキスト）
  creator uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- 系統樹ファイル作成者
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスの作成
CREATE INDEX idx_phylogenetic_trees_classification_id ON public.phylogenetic_trees(classification_id);
CREATE INDEX idx_phylogenetic_trees_creator ON public.phylogenetic_trees(creator);

-- RLSポリシーを設定
ALTER TABLE public.phylogenetic_trees ENABLE ROW LEVEL SECURITY;

-- 系統樹の閲覧（誰でも可能）
CREATE POLICY "Phylogenetic trees are viewable by everyone"
  ON public.phylogenetic_trees FOR SELECT
  TO public
  USING (true);

-- ログイン済みユーザーは作成可能
CREATE POLICY "Authenticated users can create phylogenetic trees"
  ON public.phylogenetic_trees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 作成者のみ更新可能
CREATE POLICY "Only creator can update phylogenetic trees"
  ON public.phylogenetic_trees FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator OR creator IS NULL)
  WITH CHECK (content IS NOT NULL);

-- 作成者のみ削除可能
CREATE POLICY "Only creator can delete phylogenetic trees"
  ON public.phylogenetic_trees FOR DELETE
  TO authenticated
  USING (auth.uid() = creator);

-- 更新日時を自動更新するトリガー
CREATE TRIGGER handle_phylogenetic_trees_updated_at
  BEFORE UPDATE ON public.phylogenetic_trees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();