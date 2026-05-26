-- Add profile fields to users table
alter table public.users
  add column if not exists age int check (age between 10 and 99),
  add column if not exists gender text check (gender in ('male', 'female', 'other', 'secret')),
  add column if not exists mbti text check (mbti in (
    'INTJ','INTP','ENTJ','ENTP',
    'INFJ','INFP','ENFJ','ENFP',
    'ISTJ','ISFJ','ESTJ','ESFJ',
    'ISTP','ISFP','ESTP','ESFP'
  )),
  add column if not exists favorite_games text[] default '{}',
  add column if not exists avatar_animal text default 'cat';
