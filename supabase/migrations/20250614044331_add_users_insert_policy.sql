-- ユーザー作成のためのRLSポリシーを追加
create policy "Users can create their own record"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);