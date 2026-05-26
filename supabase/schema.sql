-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  nickname text not null unique,
  english_level text not null default 'beginner' check (english_level in ('beginner', 'intermediate', 'advanced')),
  age int check (age between 10 and 99),
  gender text check (gender in ('male', 'female', 'other', 'secret')),
  mbti text check (mbti in (
    'INTJ','INTP','ENTJ','ENTP',
    'INFJ','INFP','ENFJ','ENFP',
    'ISTJ','ISFJ','ESTJ','ESFJ',
    'ISTP','ISFP','ESTP','ESFP'
  )),
  favorite_games text[] default '{}',
  avatar_animal text default 'cat',
  created_at timestamptz not null default now()
);

-- Rooms
create table public.rooms (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  game text not null check (game in ('pubg', 'lol', 'overwatch', 'valorant', 'tft')),
  max_players int not null default 4 check (max_players between 2 and 6),
  english_level text not null check (english_level in ('beginner', 'intermediate', 'advanced')),
  host_id uuid references public.users(id) on delete set null,
  discord_invite text,
  status text not null default 'open' check (status in ('open', 'full', 'closed')),
  created_at timestamptz not null default now()
);

-- Room members
create table public.room_members (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  joined_at timestamptz not null default now(),
  unique(room_id, user_id)
);

-- Messages
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- RLS Policies
alter table public.users enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.messages enable row level security;

-- Users: readable by all, writable only by self
create policy "Users are viewable by everyone" on public.users for select using (true);
create policy "Users can insert their own profile" on public.users for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- Rooms: readable by all, writable by authenticated users
create policy "Rooms are viewable by everyone" on public.rooms for select using (true);
create policy "Authenticated users can create rooms" on public.rooms for insert with check (auth.uid() is not null);
create policy "Host can update their room" on public.rooms for update using (auth.uid() = host_id);
create policy "Host can delete their room" on public.rooms for delete using (auth.uid() = host_id);

-- Room members: readable by all, joinable by authenticated users
create policy "Room members are viewable by everyone" on public.room_members for select using (true);
create policy "Authenticated users can join rooms" on public.room_members for insert with check (auth.uid() = user_id);
create policy "Users can leave rooms" on public.room_members for delete using (auth.uid() = user_id);

-- Messages: readable by room members, writable by room members
create policy "Messages are viewable by everyone" on public.messages for select using (true);
create policy "Room members can send messages" on public.messages for insert
  with check (
    auth.uid() = user_id and
    exists (select 1 from public.room_members where room_id = messages.room_id and user_id = auth.uid())
  );

-- Realtime: enable for rooms, room_members, messages
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_members;
alter publication supabase_realtime add table public.messages;

-- Function: auto-update room status based on member count
create or replace function update_room_status()
returns trigger as $$
begin
  update public.rooms
  set status = case
    when (select count(*) from public.room_members where room_id = coalesce(new.room_id, old.room_id)) >= max_players then 'full'
    else 'open'
  end
  where id = coalesce(new.room_id, old.room_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_member_change
  after insert or delete on public.room_members
  for each row execute function update_room_status();

-- Function: auto-create user profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, nickname, english_level)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'english_level', 'beginner')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
