-- Posts (자유게시판)
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  user_id uuid references public.users(id) on delete set null,
  category text not null default 'free'
    check (category in ('free', 'tip', 'english', 'recruit', 'chat')),
  view_count int not null default 0,
  like_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Post likes (중복 좋아요 방지)
create table public.post_likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

-- RLS
alter table public.posts enable row level security;
create policy "Posts viewable by everyone" on public.posts for select using (true);
create policy "Authenticated users can create posts" on public.posts for insert with check (auth.uid() is not null);
create policy "Authors can update their posts" on public.posts for update using (auth.uid() = user_id);
create policy "Authors can delete their posts" on public.posts for delete using (auth.uid() = user_id);

alter table public.post_likes enable row level security;
create policy "Post likes viewable by everyone" on public.post_likes for select using (true);
create policy "Authenticated users can like" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike" on public.post_likes for delete using (auth.uid() = user_id);

-- 조회수 증가 함수 (atomic)
create or replace function increment_post_view(p_post_id uuid)
returns void as $$
  update public.posts set view_count = view_count + 1 where id = p_post_id;
$$ language sql security definer;
