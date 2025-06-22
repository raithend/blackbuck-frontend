-- 既存のテーブルを削除
drop table if exists public.photo_bubbles;

-- フォトバブルテーブルの作成
create table public.photo_bubbles (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- Tooltipに表示する名前
  user_id uuid references auth.users on delete cascade not null, -- 作成者のID（必須）
  page_url text not null, -- 表示するページのURL（必須）
  image_url text not null, -- 表示する画像のURL（必須）
  target_url text, -- リンク先のURL（オプション）
  x_position integer not null default 0, -- X座標
  y_position integer not null default 0, -- Y座標
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシーを設定
alter table public.photo_bubbles enable row level security;

-- フォトバブルの閲覧（誰でも可能）
create policy "Photo bubbles are viewable by everyone"
  on public.photo_bubbles for select
  to public
  using (true);

-- ログイン済みユーザーのみ作成可能
create policy "Authenticated users can create photo bubbles"
  on public.photo_bubbles for insert
  to authenticated
  with check (auth.uid() is not null);

-- 作成者のみ更新可能
create policy "Only creator can update photo bubbles"
  on public.photo_bubbles for update
  to authenticated
  using (auth.uid() = user_id);

-- 作成者のみ削除可能
create policy "Only creator can delete photo bubbles"
  on public.photo_bubbles for delete
  to authenticated
  using (auth.uid() = user_id);

-- プロフィールページ用のRLSポリシー（そのユーザーのみが作成可能）
create policy "Only profile owner can create photo bubbles on their profile"
  on public.photo_bubbles for insert
  to authenticated
  with check (
    case 
      when page_url like '/users/%' then
        auth.uid()::text = split_part(page_url, '/', 3)
      else true
    end
  );

-- 更新日時を自動更新するトリガー
create trigger handle_photo_bubbles_updated_at
  before update on public.photo_bubbles
  for each row
  execute function public.handle_updated_at();

-- プロフィールページ用のビュー（そのユーザーのみが作成可能）
create view public.profile_photo_bubbles as
select 
  pb.*,
  case 
    when pb.page_url like '/users/%' then 
      split_part(pb.page_url, '/', 3) -- /users/{accountId} から accountId を抽出
    else null
  end as profile_user_id
from public.photo_bubbles pb
where pb.page_url like '/users/%';

