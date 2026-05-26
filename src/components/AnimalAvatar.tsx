import { getAnimal } from "@/lib/animals";

interface AnimalAvatarProps {
  animalId?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE = {
  xs: { wrap: "w-6 h-6",  emoji: "text-xs" },
  sm: { wrap: "w-8 h-8",  emoji: "text-xl" },
  md: { wrap: "w-10 h-10", emoji: "text-2xl" },
  lg: { wrap: "w-16 h-16", emoji: "text-4xl" },
  xl: { wrap: "w-24 h-24", emoji: "text-6xl" },
};

export default function AnimalAvatar({ animalId, size = "sm", className = "" }: AnimalAvatarProps) {
  const animal = getAnimal(animalId);
  const s = SIZE[size];

  return (
    <div
      className={`
        relative rounded-full bg-gradient-to-br ${animal.gradient}
        ring-2 ring-white ring-offset-1
        shadow-md
        flex items-center justify-center shrink-0 select-none overflow-hidden
        ${s.wrap} ${className}
      `}
    >
      {/* 광택 효과 — 상단 하이라이트 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/5 to-transparent rounded-full pointer-events-none" />
      {/* 하단 미묘한 그림자 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent rounded-full pointer-events-none" />

      <span
        role="img"
        aria-label={animal.name}
        className={`relative z-10 leading-none select-none ${s.emoji}`}
      >
        {animal.emoji}
      </span>
    </div>
  );
}
