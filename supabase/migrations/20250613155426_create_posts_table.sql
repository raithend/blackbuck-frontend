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

-- 投稿の閲覧（誰でも可能）
create policy "Posts are viewable by everyone"
  on public.posts for select
  to public
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

-- 更新日時を自動更新するトリガー関数を作成
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- トリガーを設定
create trigger handle_posts_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();