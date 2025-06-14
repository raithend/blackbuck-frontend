-- 既存のテーブルを削除
drop table if exists public.post_images;

-- 新しいテーブルを作成
create table if not exists public.post_images (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  image_url text not null,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_post_image_order unique (post_id, order_index)
);

-- RLSポリシーを設定
alter table public.post_images enable row level security;

-- 認証済みユーザーは全投稿画像を閲覧可能
create policy "Post images are viewable by authenticated users"
  on public.post_images for select
  to authenticated
  using (true);

-- ユーザーは自分の投稿の画像のみ作成可能
create policy "Users can create images for their own posts"
  on public.post_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.posts
      where id = post_id
      and user_id = auth.uid()
    )
  );

-- ユーザーは自分の投稿の画像のみ更新可能
create policy "Users can update images for their own posts"
  on public.post_images for update
  to authenticated
  using (
    exists (
      select 1 from public.posts
      where id = post_id
      and user_id = auth.uid()
    )
  );

-- ユーザーは自分の投稿の画像のみ削除可能
create policy "Users can delete images for their own posts"
  on public.post_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.posts
      where id = post_id
      and user_id = auth.uid()
    )
  );

-- 更新日時を自動更新するトリガー
create trigger handle_post_images_updated_at
  before update on public.post_images
  for each row
  execute function public.handle_updated_at();