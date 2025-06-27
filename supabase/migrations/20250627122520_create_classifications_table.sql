-- Classificationsテーブルの作成
create table public.classifications (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- 分類名（必須）
  english_name text, -- 英語の分類名
  scientific_name text, -- 学名
  description text, -- 説明文
  era_start text, -- 生息年代（はじめ）
  era_end text, -- 生息年代（おわり）
  phylogenetic_tree_file text, -- 系統樹ファイル（yml）
  phylogenetic_tree_creator uuid references auth.users on delete set null, -- 系統樹ファイル作成者
  geographic_data_file text, -- 地理データファイル（jsonまたはyml）
  geographic_data_creator uuid references auth.users on delete set null, -- 地理データファイル作成者
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシーを設定
alter table public.classifications enable row level security;

-- 分類の閲覧（誰でも可能）
create policy "Classifications are viewable by everyone"
  on public.classifications for select
  to public
  using (true);

-- ログイン済みユーザーは作成可能
create policy "Authenticated users can create classifications"
  on public.classifications for insert
  to authenticated
  with check (auth.uid() is not null);

-- 基本データの更新（phylogenetic_tree_file、geographic_data_file以外）
create policy "Users can update basic classification data"
  on public.classifications for update
  to authenticated
  using (auth.uid() is not null);

-- 系統樹ファイルの更新（作成者のみ）
create policy "Only creator can update phylogenetic tree file"
  on public.classifications for update
  to authenticated
  using (auth.uid() = phylogenetic_tree_creator)
  with check (phylogenetic_tree_file is not null);

-- 地理データファイルの更新（作成者のみ）
create policy "Only creator can update geographic data file"
  on public.classifications for update
  to authenticated
  using (auth.uid() = geographic_data_creator)
  with check (geographic_data_file is not null);

-- 管理者のみ削除可能
create policy "Only creator can delete classifications"
  on public.classifications for delete
  to authenticated
  using (auth.uid() is not null);

-- 更新日時を自動更新するトリガー
create trigger handle_classifications_updated_at
  before update on public.classifications
  for each row
  execute function public.handle_updated_at();

-- インデックスの作成
create index idx_classifications_name on public.classifications(name);
create index idx_classifications_english_name on public.classifications(english_name);
create index idx_classifications_scientific_name on public.classifications(scientific_name);
create index idx_classifications_era_start on public.classifications(era_start);
create index idx_classifications_era_end on public.classifications(era_end);
create index idx_classifications_phylogenetic_tree_creator on public.classifications(phylogenetic_tree_creator);
create index idx_classifications_geographic_data_creator on public.classifications(geographic_data_creator);
