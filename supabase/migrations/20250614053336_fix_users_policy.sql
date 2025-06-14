-- 既存のポリシーを削除
drop policy if exists "Users can create their own record" on public.users;

-- 新しいポリシーを作成
create policy "Users can create their own record"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

-- 既存のポリシーを削除
drop policy if exists "Users can view their own record" on public.users;

-- 新しいポリシーを作成
create policy "Users can view their own record"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

-- 既存のポリシーを削除
drop policy if exists "Users can update their own record" on public.users;

-- 新しいポリシーを作成
create policy "Users can update their own record"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id); 