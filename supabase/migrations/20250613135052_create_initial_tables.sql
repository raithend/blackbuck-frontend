-- 新しいテーブルを作成
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  username varchar(255) not null unique,
  account_id varchar(255) not null unique,
  avatar_url text,
  header_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシーを設定
alter table public.users enable row level security;

-- ユーザー作成のためのRLSポリシー
create policy "Anyone can create a user record"
  on public.users for insert
  to public
  with check (true);

-- ユーザー情報の閲覧（誰でも可能）
create policy "Users are viewable by everyone"
  on public.users for select
  to public
  using (true);

-- ユーザー情報の更新（本人のみ）
create policy "Users can update their own record"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);