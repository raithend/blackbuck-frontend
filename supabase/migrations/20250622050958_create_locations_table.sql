-- locationsテーブルを作成
create table if not exists public.locations (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  avatar_url text,
  header_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシーを設定
alter table public.locations enable row level security;

-- locationの閲覧（誰でも可能）
create policy "Locations are viewable by everyone"
  on public.locations for select
  to public
  using (true);

-- ログイン済みユーザーはlocationの作成可能
create policy "Authenticated users can create locations"
  on public.locations for insert
  to authenticated
  with check (true);

-- ログイン済みユーザーはlocationの更新可能
create policy "Authenticated users can update locations"
  on public.locations for update
  to authenticated
  using (true)
  with check (true);

-- 削除は無効化（将来的にadminのみに制限予定）
create policy "No one can delete locations"
  on public.locations for delete
  to public
  using (false);

-- 更新日時を自動更新するトリガー
create trigger handle_locations_updated_at
  before update on public.locations
  for each row
  execute function public.handle_updated_at();