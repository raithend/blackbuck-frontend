-- いいね機能を管理するテーブルを作成
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- 同じユーザーが同じ投稿に複数回いいねできないように制約
  unique(user_id, post_id)
);

-- インデックスを作成してパフォーマンスを向上
create index idx_likes_user_id on public.likes(user_id);
create index idx_likes_post_id on public.likes(post_id);
create index idx_likes_created_at on public.likes(created_at);

-- RLSを有効化
alter table public.likes enable row level security;

-- いいねの作成（認証済みユーザーのみ）
create policy "Users can create likes"
  on public.likes for insert
  to authenticated
  with check (
    auth.uid() = user_id
  );

-- いいねの閲覧（誰でも可能）
create policy "Likes are viewable by everyone"
  on public.likes for select
  to public
  using (true);

-- いいねの削除（いいねした本人のみ）
create policy "Users can delete their own likes"
  on public.likes for delete
  to authenticated
  using (auth.uid() = user_id);

-- いいねの更新は許可しない（削除して再作成する）
create policy "No updates allowed on likes"
  on public.likes for update
  to authenticated
  using (false)
  with check (false);

-- 投稿のいいね数を効率的に取得するためのビューを作成
create or replace view public.post_like_counts as
select 
  p.id as post_id,
  p.content,
  p.location,
  p.created_at,
  p.user_id,
  u.username,
  u.account_id,
  u.avatar_url,
  coalesce(like_count.count, 0) as like_count
from public.posts p
left join public.users u on p.user_id = u.id
left join (
  select post_id, count(*) as count
  from public.likes
  group by post_id
) like_count on p.id = like_count.post_id;

-- ユーザーがいいねした投稿を効率的に取得するためのビューを作成
create or replace view public.user_liked_posts as
select 
  l.user_id,
  l.post_id,
  l.created_at as liked_at,
  p.content,
  p.location,
  p.created_at as post_created_at,
  p.user_id as post_user_id,
  u.username as post_username,
  u.account_id as post_account_id,
  u.avatar_url as post_avatar_url
from public.likes l
join public.posts p on l.post_id = p.id
join public.users u on p.user_id = u.id
order by l.created_at desc;
