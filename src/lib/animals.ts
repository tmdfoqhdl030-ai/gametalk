export interface AnimalDef {
  id: string;
  emoji: string;
  name: string;
  gradient: string;
  bg: string;
}

export const ANIMALS: AnimalDef[] = [
  { id: "cat",      emoji: "🐱", name: "고양이",  gradient: "from-pink-300 to-rose-400",      bg: "#f472b6" },
  { id: "dog",      emoji: "🐶", name: "강아지",  gradient: "from-amber-300 to-orange-400",   bg: "#fb923c" },
  { id: "panda",    emoji: "🐼", name: "판다",    gradient: "from-slate-300 to-gray-500",      bg: "#94a3b8" },
  { id: "fox",      emoji: "🦊", name: "여우",    gradient: "from-orange-400 to-red-400",      bg: "#f97316" },
  { id: "rabbit",   emoji: "🐰", name: "토끼",   gradient: "from-violet-300 to-purple-400",   bg: "#a78bfa" },
  { id: "bear",     emoji: "🐻", name: "곰",      gradient: "from-amber-500 to-yellow-600",   bg: "#f59e0b" },
  { id: "frog",     emoji: "🐸", name: "개구리", gradient: "from-green-300 to-emerald-500",   bg: "#34d399" },
  { id: "lion",     emoji: "🦁", name: "사자",   gradient: "from-yellow-300 to-amber-400",    bg: "#fbbf24" },
  { id: "penguin",  emoji: "🐧", name: "펭귄",   gradient: "from-blue-400 to-indigo-500",     bg: "#60a5fa" },
  { id: "koala",    emoji: "🐨", name: "코알라", gradient: "from-sky-300 to-blue-400",        bg: "#38bdf8" },
  { id: "tiger",    emoji: "🐯", name: "호랑이", gradient: "from-orange-300 to-amber-500",    bg: "#f97316" },
  { id: "unicorn",  emoji: "🦄", name: "유니콘", gradient: "from-pink-300 to-violet-400",     bg: "#c084fc" },
  { id: "chick",    emoji: "🐥", name: "병아리", gradient: "from-yellow-200 to-yellow-400",   bg: "#facc15" },
  { id: "hamster",  emoji: "🐹", name: "햄스터", gradient: "from-rose-200 to-pink-300",       bg: "#fb7185" },
  { id: "owl",      emoji: "🦉", name: "부엉이", gradient: "from-amber-700 to-yellow-800",    bg: "#92400e" },
  { id: "dragon",   emoji: "🐲", name: "드래곤", gradient: "from-emerald-400 to-teal-600",    bg: "#10b981" },
  { id: "wolf",     emoji: "🐺", name: "늑대",   gradient: "from-gray-400 to-slate-500",      bg: "#6b7280" },
  { id: "shark",    emoji: "🦈", name: "상어",   gradient: "from-cyan-400 to-blue-500",       bg: "#06b6d4" },
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
