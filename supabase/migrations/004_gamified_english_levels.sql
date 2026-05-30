-- 1. users 테이블의 기존 english_level 체크 제약 조건 제거 및 확장
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_english_level_check;
ALTER TABLE public.users ADD CONSTRAINT users_english_level_check 
  CHECK (english_level IN (
    'beginner', 'intermediate', 'advanced',
    'iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'challenger'
  ));

-- 2. rooms 테이블의 기존 english_level 체크 제약 조건 제거 및 확장
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_english_level_check;
ALTER TABLE public.rooms ADD CONSTRAINT rooms_english_level_check
  CHECK (english_level IN (
    'beginner', 'intermediate', 'advanced',
    'iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'challenger'
  ));
