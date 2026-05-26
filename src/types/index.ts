export type Game = "pubg" | "lol" | "overwatch" | "valorant" | "tft";
export type EnglishLevel = "beginner" | "intermediate" | "advanced";
export type RoomStatus = "open" | "full" | "closed";

export type Gender = "male" | "female" | "other" | "secret";

export interface User {
  id: string;
  email: string;
  nickname: string;
  english_level: EnglishLevel;
  created_at: string;
  age?: number | null;
  gender?: Gender | null;
  mbti?: string | null;
  favorite_games?: Game[] | null;
  avatar_animal?: string | null;
}

export const GENDER_LABELS: Record<Gender, string> = {
  male: "남성",
  female: "여성",
  other: "기타",
  secret: "비공개",
};

export interface Room {
  id: string;
  title: string;
  game: Game;
  max_players: number;
  english_level: EnglishLevel;
  host_id: string | null;
  discord_invite: string | null;
  status: RoomStatus;
  created_at: string;
  host?: User;
  member_count?: number;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  user?: User;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export const GAME_LABELS: Record<Game, string> = {
  pubg:      "배틀그라운드",
  lol:       "리그오브레전드",
  overwatch: "오버워치",
  valorant:  "발로란트",
  tft:       "롤토체스",
};

export const GAME_EMOJI: Record<Game, string> = {
  pubg:      "🪖",
  lol:       "⚔️",
  overwatch: "🎯",
  valorant:  "🎯",
  tft:       "♟️",
};

export const LEVEL_LABELS: Record<EnglishLevel, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
};
