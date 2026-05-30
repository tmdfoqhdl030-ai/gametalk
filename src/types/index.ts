export type Game = "pubg" | "lol" | "overwatch" | "valorant" | "tft";
export type EnglishLevel = 
  | "beginner" | "intermediate" | "advanced"
  | "iron" | "bronze" | "silver" | "gold" | "platinum" | "diamond" | "master" | "grandmaster" | "challenger";
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
  manner_score?: number | null;
  is_admin?: boolean | null;
  suspended_until?: string | null;
  lol_tier?: string | null;
  pubg_tier?: string | null;
  overwatch_tier?: string | null;
  valorant_tier?: string | null;
  tft_tier?: string | null;
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
  iron: "아이언 (Iron)",
  bronze: "브론즈 (Bronze)",
  silver: "실버 (Silver)",
  gold: "골드 (Gold)",
  platinum: "플래티넘 (Platinum)",
  diamond: "다이아몬드 (Diamond)",
  master: "마스터 (Master)",
  grandmaster: "그랜드마스터 (Grandmaster)",
  challenger: "챌린저 (Challenger)",
};

export type PostCategory = "free" | "tip" | "english" | "recruit" | "chat";

export interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string | null;
  category: PostCategory;
  view_count: number;
  like_count: number;
  created_at: string;
  author?: User;
}

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  free:    "자유",
  tip:     "팁공유",
  english: "영어공부",
  recruit: "팀원구함",
  chat:    "잡담",
};

export const POST_CATEGORY_COLORS: Record<PostCategory, string> = {
  free:    "bg-gray-100 text-gray-600",
  tip:     "bg-blue-100 text-blue-700",
  english: "bg-green-100 text-green-700",
  recruit: "bg-accent-light text-accent",
  chat:    "bg-purple-100 text-purple-700",
};

export const LEVEL_EMOJI: Record<EnglishLevel, string> = {
  beginner: "🌱",
  intermediate: "🌿",
  advanced: "🌳",
  iron: "⚙️",
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
  diamond: "🔮",
  master: "🔥",
  grandmaster: "👑",
  challenger: "⚡",
};
