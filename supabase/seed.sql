-- 더미 유저 (Supabase auth.users에 직접 insert 불가, users 테이블에만 삽입)
-- 실제 auth는 없지만 host 표시용으로 사용
insert into public.users (id, email, nickname, english_level) values
  ('00000000-0000-0000-0000-000000000001', 'gamer1@example.com', '총알배그왕', 'advanced'),
  ('00000000-0000-0000-0000-000000000002', 'gamer2@example.com', '롤초보탈출', 'beginner'),
  ('00000000-0000-0000-0000-000000000003', 'gamer3@example.com', 'OWDiamondKR', 'intermediate'),
  ('00000000-0000-0000-0000-000000000004', 'gamer4@example.com', '영어고수배그', 'advanced'),
  ('00000000-0000-0000-0000-000000000005', 'gamer5@example.com', '미드라이너KR', 'intermediate')
on conflict (id) do nothing;

-- 더미 방
insert into public.rooms (id, title, game, max_players, english_level, host_id, discord_invite, status) values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    '[배그] 스쿼드 영어로만! 초보 환영 🪖',
    'pubg', 4, 'beginner',
    '00000000-0000-0000-0000-000000000001',
    'https://discord.gg/example1',
    'open'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    '[롤] 영어 콜아웃 연습 스크림 ⚔️',
    'lol', 5, 'intermediate',
    '00000000-0000-0000-0000-000000000002',
    'https://discord.gg/example2',
    'open'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    '[오버워치] 경쟁전 영어 팀 🎯',
    'overwatch', 6, 'advanced',
    '00000000-0000-0000-0000-000000000003',
    'https://discord.gg/example3',
    'open'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000004',
    '[배그] 영어 연습 듀오 구해요 🪖',
    'pubg', 2, 'intermediate',
    '00000000-0000-0000-0000-000000000004',
    null,
    'open'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000005',
    '[롤] All English 일반 게임 😊',
    'lol', 5, 'beginner',
    '00000000-0000-0000-0000-000000000005',
    'https://discord.gg/example5',
    'open'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000006',
    '[오버워치] 영어 캐주얼 6인 모집 🎯',
    'overwatch', 6, 'intermediate',
    '00000000-0000-0000-0000-000000000003',
    'https://discord.gg/example6',
    'full'
  )
on conflict (id) do nothing;

-- 방장을 room_members에 추가
insert into public.room_members (room_id, user_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003'),
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004'),
  ('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005'),
  ('aaaaaaaa-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003')
on conflict do nothing;
