-- フォロー関係を管理するテーブルを作成
create table public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.users(id) on delete cascade not null,
  following_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- 同じフォロー関係が重複しないように制約
  unique(follower_id, following_id),
  
  -- 自分自身をフォローできないようにする制約
  constraint check_not_self_follow check (follower_id != following_id)
);

-- インデックスを作成してパフォーマンスを向上
create index idx_follows_follower_id on public.follows(follower_id);
create index idx_follows_following_id on public.follows(following_id);
create index idx_follows_created_at on public.follows(created_at);

-- RLSを有効化
alter table public.follows enable row level security;

-- フォロー関係の作成（認証済みユーザーのみ）
create policy "Users can create follow relationships"
  on public.follows for insert
  to authenticated
  with check (
    auth.uid() = follower_id
  );

-- フォロー関係の閲覧（誰でも可能）
create policy "Follow relationships are viewable by everyone"
  on public.follows for select
  to public
  using (true);

-- フォロー関係の削除（フォローした本人のみ）
create policy "Users can delete their own follow relationships"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- フォロー関係の更新は許可しない（削除して再作成する）
create policy "No updates allowed on follow relationships"
  on public.follows for update
  to authenticated
  using (false)
  with check (false);

-- フォロー数とフォロワー数を効率的に取得するためのビューを作成
create or replace view public.user_follow_counts as
select 
  u.id,
  u.username,
  u.account_id,
  u.avatar_url,
  u.header_url,
  u.bio,
  u.created_at,
  u.updated_at,
  coalesce(following_count.count, 0) as following_count,
  coalesce(follower_count.count, 0) as follower_count
from public.users u
left join (
  select follower_id, count(*) as count
  from public.follows
  group by follower_id
) following_count on u.id = following_count.follower_id
left join (
  select following_id, count(*) as count
  from public.follows
  group by following_id
) follower_count on u.id = follower_count.following_id;