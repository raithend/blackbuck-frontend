-- 新しいテーブルを作成
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  username varchar(255) not null unique,
  account_id varchar(255) not null unique,
  avatar_url text,
  header_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシーを設定
alter table public.users enable row level security;

-- 認証済みユーザーは全ユーザーを閲覧可能
create policy "Users are viewable by authenticated users"
  on public.users for select
  to authenticated
  using (true);

-- ユーザーは自分のレコードのみ更新可能
create policy "Users can update their own record"
  on public.users for update
  to authenticated
  using (auth.uid() = id);