-- 既存のテーブルを削除
drop table if exists public.posts;

-- 新しいテーブルを作成
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシーを設定
alter table public.posts enable row level security;

-- 認証済みユーザーは全投稿を閲覧可能
create policy "Posts are viewable by authenticated users"
  on public.posts for select
  to authenticated
  using (true);

-- ユーザーは自分の投稿のみ作成可能
create policy "Users can create their own posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ユーザーは自分の投稿のみ更新可能
create policy "Users can update their own posts"
  on public.posts for update
  to authenticated
  using (auth.uid() = user_id);

-- ユーザーは自分の投稿のみ削除可能
create policy "Users can delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);