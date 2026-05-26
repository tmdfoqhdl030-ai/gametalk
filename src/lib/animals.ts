export interface AnimalDef {
  id: string;
  emoji: string;
  name: string;
  gradient: string;
  bg: string;
}

export const ANIMALS: AnimalDef[] = [
  { id: "cat",     emoji: "🐱", name: "고양이", gradient: "from-pink-400 to-purple-400",   bg: "#e879a0" },
  { id: "dog",     emoji: "🐶", name: "강아지", gradient: "from-yellow-400 to-orange-400", bg: "#f97316" },
  { id: "panda",   emoji: "🐼", name: "판다",   gradient: "from-gray-400 to-slate-600",    bg: "#64748b" },
  { id: "fox",     emoji: "🦊", name: "여우",   gradient: "from-orange-400 to-red-500",    bg: "#ef4444" },
  { id: "rabbit",  emoji: "🐰", name: "토끼",   gradient: "from-purple-400 to-pink-400",   bg: "#a855f7" },
  { id: "bear",    emoji: "🐻", name: "곰",     gradient: "from-amber-600 to-yellow-700",  bg: "#b45309" },
  { id: "frog",    emoji: "🐸", name: "개구리", gradient: "from-green-400 to-emerald-500", bg: "#10b981" },
  { id: "lion",    emoji: "🦁", name: "사자",   gradient: "from-yellow-400 to-amber-500",  bg: "#f59e0b" },
  { id: "penguin", emoji: "🐧", name: "펭귄",   gradient: "from-blue-500 to-indigo-600",   bg: "#6366f1" },
  { id: "koala",   emoji: "🐨", name: "코알라", gradient: "from-slate-400 to-blue-400",    bg: "#60a5fa" },
  { id: "tiger",   emoji: "🐯", name: "호랑이", gradient: "from-orange-500 to-amber-700",  bg: "#d97706" },
  { id: "unicorn", emoji: "🦄", name: "유니콘", gradient: "from-pink-400 to-violet-500",   bg: "#8b5cf6" },
];

export const ANIMAL_MAP = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));

export function getAnimal(id: string | null | undefined): AnimalDef {
  return ANIMAL_MAP[id ?? ""] ?? ANIMALS[0];
}

export const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

export type MbtiType = typeof MBTI_TYPES[number];
