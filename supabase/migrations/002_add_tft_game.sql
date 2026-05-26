-- TFT(롤토체스) 게임 타입 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE public.rooms
  DROP CONSTRAINT IF EXISTS rooms_game_check;

ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_game_check
  CHECK (game IN ('pubg', 'lol', 'overwatch', 'valorant', 'tft'));
