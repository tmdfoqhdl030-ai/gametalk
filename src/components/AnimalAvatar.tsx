import { getAnimal } from "@/lib/animals";
import React from "react";

interface AnimalAvatarProps {
  animalId?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE = {
  xs: { wrap: "w-6 h-6",   svg: 24  },
  sm: { wrap: "w-9 h-9",   svg: 36  },
  md: { wrap: "w-12 h-12", svg: 48  },
  lg: { wrap: "w-16 h-16", svg: 64  },
  xl: { wrap: "w-24 h-24", svg: 96  },
};

// ─── Individual SVG face renderers ────────────────────────────────────────────
// Each returns the "face content" SVG elements drawn inside a 100×100 viewBox

function CatFace() {
  return (
    <>
      {/* Ears */}
      <polygon points="18,28 10,8 30,22" fill="#ffb6c1" />
      <polygon points="82,28 90,8 70,22" fill="#ffb6c1" />
      <polygon points="20,26 14,12 30,22" fill="#ff9eb5" />
      <polygon points="80,26 86,12 70,22" fill="#ff9eb5" />
      {/* Face */}
      <ellipse cx="50" cy="56" rx="35" ry="33" fill="#fff5f7" />
      {/* Eyes */}
      <ellipse cx="37" cy="50" rx="6" ry="7" fill="#2d2d2d" />
      <ellipse cx="63" cy="50" rx="6" ry="7" fill="#2d2d2d" />
      <ellipse cx="39" cy="48" rx="2" ry="2.5" fill="white" />
      <ellipse cx="65" cy="48" rx="2" ry="2.5" fill="white" />
      {/* Blush */}
      <ellipse cx="28" cy="60" rx="7" ry="4" fill="#ffb3c6" opacity="0.7" />
      <ellipse cx="72" cy="60" rx="7" ry="4" fill="#ffb3c6" opacity="0.7" />
      {/* Nose & mouth */}
      <ellipse cx="50" cy="62" rx="3" ry="2" fill="#ff8fab" />
      <path d="M44 66 Q50 72 56 66" stroke="#e75480" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="18" y1="60" x2="40" y2="63" stroke="#ccc" strokeWidth="1.2" />
      <line x1="18" y1="65" x2="40" y2="65" stroke="#ccc" strokeWidth="1.2" />
      <line x1="60" y1="63" x2="82" y2="60" stroke="#ccc" strokeWidth="1.2" />
      <line x1="60" y1="65" x2="82" y2="65" stroke="#ccc" strokeWidth="1.2" />
    </>
  );
}

function DogFace() {
  return (
    <>
      {/* Floppy ears */}
      <ellipse cx="20" cy="42" rx="14" ry="22" fill="#d4870a" />
      <ellipse cx="80" cy="42" rx="14" ry="22" fill="#d4870a" />
      {/* Face */}
      <ellipse cx="50" cy="54" rx="34" ry="32" fill="#fde68a" />
      {/* Snout */}
      <ellipse cx="50" cy="64" rx="16" ry="11" fill="#fbbf24" />
      {/* Eyes */}
      <ellipse cx="37" cy="48" rx="6" ry="6.5" fill="#2d2d2d" />
      <ellipse cx="63" cy="48" rx="6" ry="6.5" fill="#2d2d2d" />
      <ellipse cx="39" cy="46" rx="2" ry="2.5" fill="white" />
      <ellipse cx="65" cy="46" rx="2" ry="2.5" fill="white" />
      {/* Blush */}
      <ellipse cx="27" cy="58" rx="7" ry="4" fill="#f9a8d4" opacity="0.7" />
      <ellipse cx="73" cy="58" rx="7" ry="4" fill="#f9a8d4" opacity="0.7" />
      {/* Nose */}
      <ellipse cx="50" cy="62" rx="6" ry="4.5" fill="#2d2d2d" />
      <ellipse cx="52" cy="61" rx="1.5" ry="1" fill="white" opacity="0.5" />
      {/* Mouth */}
      <path d="M44 68 Q50 75 56 68" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function PandaFace() {
  return (
    <>
      {/* Ears */}
      <ellipse cx="25" cy="22" rx="14" ry="14" fill="#2d2d2d" />
      <ellipse cx="75" cy="22" rx="14" ry="14" fill="#2d2d2d" />
      {/* Face */}
      <ellipse cx="50" cy="56" rx="35" ry="33" fill="#f8f8f8" />
      {/* Eye patches */}
      <ellipse cx="36" cy="49" rx="11" ry="10" fill="#2d2d2d" />
      <ellipse cx="64" cy="49" rx="11" ry="10" fill="#2d2d2d" />
      {/* Eyes */}
      <ellipse cx="36" cy="49" rx="6" ry="6.5" fill="white" />
      <ellipse cx="64" cy="49" rx="6" ry="6.5" fill="white" />
      <ellipse cx="36" cy="50" rx="3.5" ry="4" fill="#2d2d2d" />
      <ellipse cx="64" cy="50" rx="3.5" ry="4" fill="#2d2d2d" />
      <ellipse cx="37" cy="48" rx="1.2" ry="1.5" fill="white" />
      <ellipse cx="65" cy="48" rx="1.2" ry="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="63" rx="4" ry="2.5" fill="#555" />
      {/* Mouth */}
      <path d="M44 68 Q50 74 56 68" stroke="#888" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="28" cy="62" rx="7" ry="4" fill="#ffb3c6" opacity="0.5" />
      <ellipse cx="72" cy="62" rx="7" ry="4" fill="#ffb3c6" opacity="0.5" />
    </>
  );
}

function FoxFace() {
  return (
    <>
      {/* Pointy ears */}
      <polygon points="22,32 8,6 36,26" fill="#f97316" />
      <polygon points="78,32 92,6 64,26" fill="#f97316" />
      <polygon points="23,30 12,10 34,26" fill="#fed7aa" />
      <polygon points="77,30 88,10 66,26" fill="#fed7aa" />
      {/* Face */}
      <ellipse cx="50" cy="56" rx="35" ry="33" fill="#fdba74" />
      {/* White cheek patches */}
      <ellipse cx="32" cy="60" rx="13" ry="10" fill="#fff7ed" />
      <ellipse cx="68" cy="60" rx="13" ry="10" fill="#fff7ed" />
      {/* Eyes */}
      <ellipse cx="37" cy="49" rx="6" ry="7" fill="#2d2d2d" />
      <ellipse cx="63" cy="49" rx="6" ry="7" fill="#2d2d2d" />
      <ellipse cx="39" cy="47" rx="2" ry="2.5" fill="white" />
      <ellipse cx="65" cy="47" rx="2" ry="2.5" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#2d2d2d" />
      {/* Mouth */}
      <path d="M44 66 Q50 73 56 66" stroke="#c2410c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function RabbitFace() {
  return (
    <>
      {/* Long ears */}
      <ellipse cx="34" cy="18" rx="10" ry="22" fill="#e9d5ff" />
      <ellipse cx="66" cy="18" rx="10" ry="22" fill="#e9d5ff" />
      <ellipse cx="34" cy="18" rx="5" ry="17" fill="#f3e8ff" />
      <ellipse cx="66" cy="18" rx="5" ry="17" fill="#f3e8ff" />
      {/* Face */}
      <ellipse cx="50" cy="58" rx="34" ry="31" fill="#f5f0ff" />
      {/* Eyes */}
      <ellipse cx="37" cy="52" rx="6" ry="7" fill="#a855f7" />
      <ellipse cx="63" cy="52" rx="6" ry="7" fill="#a855f7" />
      <ellipse cx="39" cy="50" rx="2" ry="2.5" fill="white" />
      <ellipse cx="65" cy="50" rx="2" ry="2.5" fill="white" />
      {/* Blush */}
      <ellipse cx="28" cy="62" rx="7" ry="4" fill="#f9a8d4" opacity="0.7" />
      <ellipse cx="72" cy="62" rx="7" ry="4" fill="#f9a8d4" opacity="0.7" />
      {/* Nose */}
      <ellipse cx="50" cy="63" rx="3" ry="2" fill="#c084fc" />
      {/* Mouth */}
      <path d="M44 67 Q50 74 56 67" stroke="#a855f7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="50" y1="65" x2="50" y2="67" stroke="#a855f7" strokeWidth="1.2" />
    </>
  );
}

function BearFace() {
  return (
    <>
      {/* Ears */}
      <ellipse cx="24" cy="26" rx="15" ry="14" fill="#92400e" />
      <ellipse cx="76" cy="26" rx="15" ry="14" fill="#92400e" />
      <ellipse cx="24" cy="26" rx="9" ry="8" fill="#b45309" />
      <ellipse cx="76" cy="26" rx="9" ry="8" fill="#b45309" />
      {/* Face */}
      <ellipse cx="50" cy="57" rx="35" ry="32" fill="#d97706" />
      {/* Snout */}
      <ellipse cx="50" cy="66" rx="16" ry="11" fill="#b45309" />
      {/* Eyes */}
      <ellipse cx="37" cy="50" rx="6" ry="6.5" fill="#1a1a1a" />
      <ellipse cx="63" cy="50" rx="6" ry="6.5" fill="#1a1a1a" />
      <ellipse cx="39" cy="48" rx="2" ry="2.5" fill="white" />
      <ellipse cx="65" cy="48" rx="2" ry="2.5" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="63" rx="5" ry="3.5" fill="#1a1a1a" />
      {/* Mouth */}
      <path d="M44 69 Q50 76 56 69" stroke="#78350f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function FrogFace() {
  return (
    <>
      {/* Eyes on top of head */}
      <ellipse cx="32" cy="30" rx="14" ry="14" fill="#4ade80" />
      <ellipse cx="68" cy="30" rx="14" ry="14" fill="#4ade80" />
      <ellipse cx="32" cy="30" rx="9" ry="9" fill="#1a1a1a" />
      <ellipse cx="68" cy="30" rx="9" ry="9" fill="#1a1a1a" />
      <ellipse cx="34" cy="28" rx="3" ry="3.5" fill="white" />
      <ellipse cx="70" cy="28" rx="3" ry="3.5" fill="white" />
      {/* Face */}
      <ellipse cx="50" cy="60" rx="35" ry="30" fill="#86efac" />
      {/* Mouth */}
      <path d="M30 65 Q50 80 70 65" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="28" cy="66" rx="7" ry="4" fill="#bbf7d0" opacity="0.8" />
      <ellipse cx="72" cy="66" rx="7" ry="4" fill="#bbf7d0" opacity="0.8" />
      {/* Nostrils */}
      <ellipse cx="46" cy="60" rx="2.5" ry="1.5" fill="#4ade80" />
      <ellipse cx="54" cy="60" rx="2.5" ry="1.5" fill="#4ade80" />
    </>
  );
}

function LionFace() {
  return (
    <>
      {/* Mane */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => (
        <ellipse
          key={i}
          cx={50 + 32 * Math.cos((angle * Math.PI) / 180)}
          cy={54 + 32 * Math.sin((angle * Math.PI) / 180)}
          rx="9" ry="7"
          fill="#f59e0b"
          transform={`rotate(${angle}, ${50 + 32 * Math.cos((angle * Math.PI) / 180)}, ${54 + 32 * Math.sin((angle * Math.PI) / 180)})`}
        />
      ))}
      {/* Face */}
      <ellipse cx="50" cy="54" rx="27" ry="27" fill="#fde68a" />
      {/* Snout */}
      <ellipse cx="50" cy="63" rx="14" ry="9" fill="#fbbf24" />
      {/* Eyes */}
      <ellipse cx="38" cy="48" rx="5.5" ry="6" fill="#78350f" />
      <ellipse cx="62" cy="48" rx="5.5" ry="6" fill="#78350f" />
      <ellipse cx="40" cy="46" rx="1.8" ry="2" fill="white" />
      <ellipse cx="64" cy="46" rx="1.8" ry="2" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="61" rx="4" ry="2.5" fill="#d97706" />
      {/* Mouth */}
      <path d="M44 66 Q50 73 56 66" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function PenguinFace() {
  return (
    <>
      {/* Body hint */}
      <ellipse cx="50" cy="72" rx="28" ry="20" fill="#1e3a5f" />
      {/* White belly */}
      <ellipse cx="50" cy="74" rx="18" ry="16" fill="#f0f4ff" />
      {/* Head */}
      <ellipse cx="50" cy="44" rx="28" ry="28" fill="#1e3a5f" />
      {/* White face */}
      <ellipse cx="50" cy="48" rx="17" ry="18" fill="#f0f4ff" />
      {/* Eyes */}
      <ellipse cx="41" cy="43" rx="5.5" ry="6" fill="#1a1a1a" />
      <ellipse cx="59" cy="43" rx="5.5" ry="6" fill="#1a1a1a" />
      <ellipse cx="43" cy="41" rx="2" ry="2.5" fill="white" />
      <ellipse cx="61" cy="41" rx="2" ry="2.5" fill="white" />
      {/* Beak */}
      <polygon points="46,54 54,54 50,61" fill="#f59e0b" />
      {/* Blush */}
      <ellipse cx="33" cy="53" rx="6" ry="3.5" fill="#fda4af" opacity="0.6" />
      <ellipse cx="67" cy="53" rx="6" ry="3.5" fill="#fda4af" opacity="0.6" />
    </>
  );
}

function KoalaFace() {
  return (
    <>
      {/* Big round ears */}
      <ellipse cx="20" cy="28" rx="18" ry="18" fill="#94a3b8" />
      <ellipse cx="80" cy="28" rx="18" ry="18" fill="#94a3b8" />
      <ellipse cx="20" cy="28" rx="11" ry="11" fill="#cbd5e1" />
      <ellipse cx="80" cy="28" rx="11" ry="11" fill="#cbd5e1" />
      {/* Face */}
      <ellipse cx="50" cy="58" rx="33" ry="31" fill="#b0c4d8" />
      {/* Eyes */}
      <ellipse cx="37" cy="51" rx="6" ry="6.5" fill="#1a1a1a" />
      <ellipse cx="63" cy="51" rx="6" ry="6.5" fill="#1a1a1a" />
      <ellipse cx="39" cy="49" rx="2" ry="2.5" fill="white" />
      <ellipse cx="65" cy="49" rx="2" ry="2.5" fill="white" />
      {/* Big oval nose */}
      <ellipse cx="50" cy="63" rx="9" ry="6" fill="#475569" />
      <ellipse cx="52" cy="61" rx="2.5" ry="1.5" fill="#94a3b8" opacity="0.5" />
      {/* Mouth */}
      <path d="M44 70 Q50 76 56 70" stroke="#334155" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function TigerFace() {
  return (
    <>
      {/* Ears */}
      <polygon points="22,32 10,8 36,26" fill="#f97316" />
      <polygon points="78,32 90,8 64,26" fill="#f97316" />
      <polygon points="23,30 13,12 34,26" fill="#fed7aa" />
      <polygon points="77,30 87,12 66,26" fill="#fed7aa" />
      {/* Face */}
      <ellipse cx="50" cy="56" rx="35" ry="33" fill="#fdba74" />
      {/* Stripes */}
      <path d="M36 36 Q38 42 34 48" stroke="#c2410c" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M64 36 Q62 42 66 48" stroke="#c2410c" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M28 54 Q32 56 28 62" stroke="#c2410c" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M72 54 Q68 56 72 62" stroke="#c2410c" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* Eyes */}
      <ellipse cx="37" cy="49" rx="6" ry="7" fill="#1a1a1a" />
      <ellipse cx="63" cy="49" rx="6" ry="7" fill="#78350f" />
      <ellipse cx="39" cy="47" rx="2" ry="2.5" fill="white" />
      <ellipse cx="65" cy="47" rx="2" ry="2.5" fill="white" />
      {/* Snout */}
      <ellipse cx="50" cy="64" rx="14" ry="10" fill="#fed7aa" />
      {/* Nose */}
      <ellipse cx="50" cy="61" rx="4.5" ry="3" fill="#2d2d2d" />
      {/* Mouth */}
      <path d="M43 67 Q50 74 57 67" stroke="#c2410c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function UnicornFace() {
  return (
    <>
      {/* Horn */}
      <polygon points="50,2 44,30 56,30" fill="url(#hornGrad)" />
      <defs>
        <linearGradient id="hornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      {/* Sparkles on horn */}
      <text x="40" y="20" fontSize="8">✦</text>
      <text x="54" y="14" fontSize="6">✦</text>
      {/* Ears */}
      <polygon points="24,38 16,18 34,32" fill="#e9d5ff" />
      <polygon points="76,38 84,18 66,32" fill="#e9d5ff" />
      {/* Face */}
      <ellipse cx="50" cy="60" rx="35" ry="32" fill="#fdf4ff" />
      {/* Eyes */}
      <ellipse cx="37" cy="53" rx="7" ry="8" fill="#2d2d2d" />
      <ellipse cx="63" cy="53" rx="7" ry="8" fill="#2d2d2d" />
      <ellipse cx="39.5" cy="51" rx="2.5" ry="3" fill="white" />
      <ellipse cx="65.5" cy="51" rx="2.5" ry="3" fill="white" />
      {/* Lashes */}
      <path d="M31 46 Q34 43 38 46" stroke="#2d2d2d" strokeWidth="1.5" fill="none" />
      <path d="M57 46 Q60 43 64 46" stroke="#2d2d2d" strokeWidth="1.5" fill="none" />
      {/* Blush */}
      <ellipse cx="27" cy="63" rx="8" ry="5" fill="#f0abfc" opacity="0.6" />
      <ellipse cx="73" cy="63" rx="8" ry="5" fill="#f0abfc" opacity="0.6" />
      {/* Nose */}
      <ellipse cx="50" cy="66" rx="3.5" ry="2" fill="#e879f9" />
      {/* Mouth */}
      <path d="M44 70 Q50 77 56 70" stroke="#c026d3" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function ChickFace() {
  return (
    <>
      {/* Tuft on top */}
      <ellipse cx="42" cy="16" rx="6" ry="9" fill="#fef08a" transform="rotate(-15,42,16)" />
      <ellipse cx="50" cy="13" rx="6" ry="10" fill="#fef08a" />
      <ellipse cx="58" cy="16" rx="6" ry="9" fill="#fef08a" transform="rotate(15,58,16)" />
      {/* Face */}
      <ellipse cx="50" cy="57" rx="34" ry="32" fill="#fef08a" />
      {/* Eyes */}
      <ellipse cx="37" cy="50" rx="6.5" ry="7" fill="#1a1a1a" />
      <ellipse cx="63" cy="50" rx="6.5" ry="7" fill="#1a1a1a" />
      <ellipse cx="39" cy="48" rx="2.5" ry="3" fill="white" />
      <ellipse cx="65" cy="48" rx="2.5" ry="3" fill="white" />
      {/* Beak */}
      <polygon points="44,63 56,63 50,72" fill="#fb923c" />
      {/* Blush */}
      <ellipse cx="26" cy="62" rx="8" ry="5" fill="#fda4af" opacity="0.6" />
      <ellipse cx="74" cy="62" rx="8" ry="5" fill="#fda4af" opacity="0.6" />
    </>
  );
}

function HamsterFace() {
  return (
    <>
      {/* Chubby cheek pouches */}
      <ellipse cx="16" cy="62" rx="16" ry="14" fill="#fda4af" opacity="0.8" />
      <ellipse cx="84" cy="62" rx="16" ry="14" fill="#fda4af" opacity="0.8" />
      {/* Ears */}
      <ellipse cx="28" cy="22" rx="14" ry="13" fill="#fb7185" />
      <ellipse cx="72" cy="22" rx="14" ry="13" fill="#fb7185" />
      <ellipse cx="28" cy="22" rx="8" ry="7" fill="#fda4af" />
      <ellipse cx="72" cy="22" rx="8" ry="7" fill="#fda4af" />
      {/* Face */}
      <ellipse cx="50" cy="55" rx="32" ry="32" fill="#fde68a" />
      {/* Eyes */}
      <ellipse cx="38" cy="48" rx="6.5" ry="7" fill="#1a1a1a" />
      <ellipse cx="62" cy="48" rx="6.5" ry="7" fill="#1a1a1a" />
      <ellipse cx="40" cy="46" rx="2.5" ry="3" fill="white" />
      <ellipse cx="64" cy="46" rx="2.5" ry="3" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="61" rx="4" ry="2.5" fill="#fb7185" />
      {/* Mouth */}
      <path d="M44 65 Q50 72 56 65" stroke="#e11d48" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="50" y1="63" x2="50" y2="65" stroke="#e11d48" strokeWidth="1.2" />
    </>
  );
}

function OwlFace() {
  return (
    <>
      {/* Ear tufts */}
      <polygon points="34,22 28,6 42,18" fill="#92400e" />
      <polygon points="66,22 72,6 58,18" fill="#92400e" />
      {/* Face */}
      <ellipse cx="50" cy="58" rx="34" ry="31" fill="#d97706" />
      {/* Facial disk */}
      <ellipse cx="50" cy="58" rx="26" ry="25" fill="#fef3c7" />
      {/* Large eyes */}
      <ellipse cx="37" cy="50" rx="12" ry="12" fill="#92400e" />
      <ellipse cx="63" cy="50" rx="12" ry="12" fill="#92400e" />
      <ellipse cx="37" cy="50" rx="8" ry="8" fill="#1a1a1a" />
      <ellipse cx="63" cy="50" rx="8" ry="8" fill="#1a1a1a" />
      <ellipse cx="39" cy="48" rx="3" ry="3.5" fill="white" />
      <ellipse cx="65" cy="48" rx="3" ry="3.5" fill="white" />
      {/* Beak */}
      <polygon points="45,61 55,61 50,70" fill="#f59e0b" />
      {/* Blush */}
      <ellipse cx="26" cy="62" rx="6" ry="3.5" fill="#fbbf24" opacity="0.5" />
      <ellipse cx="74" cy="62" rx="6" ry="3.5" fill="#fbbf24" opacity="0.5" />
    </>
  );
}

function DragonFace() {
  return (
    <>
      {/* Horns */}
      <polygon points="34,24 28,4 42,22" fill="#059669" />
      <polygon points="66,24 72,4 58,22" fill="#059669" />
      {/* Ear frills */}
      <ellipse cx="18" cy="44" rx="10" ry="14" fill="#34d399" transform="rotate(-20,18,44)" />
      <ellipse cx="82" cy="44" rx="10" ry="14" fill="#34d399" transform="rotate(20,82,44)" />
      {/* Face */}
      <ellipse cx="50" cy="57" rx="34" ry="31" fill="#6ee7b7" />
      {/* Scales pattern */}
      <ellipse cx="35" cy="46" rx="5" ry="3" fill="#34d399" opacity="0.5" />
      <ellipse cx="50" cy="43" rx="5" ry="3" fill="#34d399" opacity="0.5" />
      <ellipse cx="65" cy="46" rx="5" ry="3" fill="#34d399" opacity="0.5" />
      {/* Eyes */}
      <ellipse cx="37" cy="51" rx="6.5" ry="7" fill="#1a1a1a" />
      <ellipse cx="63" cy="51" rx="6.5" ry="7" fill="#1a1a1a" />
      <ellipse cx="37" cy="51" rx="2" ry="5" fill="#10b981" />
      <ellipse cx="63" cy="51" rx="2" ry="5" fill="#10b981" />
      <ellipse cx="38" cy="49" rx="1" ry="2" fill="white" />
      <ellipse cx="64" cy="49" rx="1" ry="2" fill="white" />
      {/* Snout */}
      <ellipse cx="50" cy="65" rx="14" ry="9" fill="#a7f3d0" />
      {/* Nostrils */}
      <ellipse cx="46" cy="64" rx="2.5" ry="1.5" fill="#059669" />
      <ellipse cx="54" cy="64" rx="2.5" ry="1.5" fill="#059669" />
      {/* Mouth */}
      <path d="M40 70 Q50 78 60 70" stroke="#059669" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function WolfFace() {
  return (
    <>
      {/* Pointy ears */}
      <polygon points="22,34 10,6 38,28" fill="#6b7280" />
      <polygon points="78,34 90,6 62,28" fill="#6b7280" />
      <polygon points="24,32 14,10 36,28" fill="#d1d5db" />
      <polygon points="76,32 86,10 64,28" fill="#d1d5db" />
      {/* Face */}
      <ellipse cx="50" cy="57" rx="35" ry="32" fill="#9ca3af" />
      {/* Snout */}
      <ellipse cx="50" cy="66" rx="17" ry="11" fill="#d1d5db" />
      {/* Eyes */}
      <ellipse cx="37" cy="50" rx="6.5" ry="7.5" fill="#1a1a1a" />
      <ellipse cx="63" cy="50" rx="6.5" ry="7.5" fill="#fbbf24" />
      <ellipse cx="37" cy="50" rx="4" ry="5" fill="#fbbf24" />
      <ellipse cx="63" cy="50" rx="4" ry="5" fill="#1a1a1a" />
      <ellipse cx="38" cy="48" rx="1.5" ry="2" fill="white" />
      <ellipse cx="64" cy="48" rx="1.5" ry="2" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="63" rx="5.5" ry="3.5" fill="#374151" />
      {/* Mouth */}
      <path d="M42 69 Q50 77 58 69" stroke="#4b5563" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function SharkFace() {
  return (
    <>
      {/* Fin on top */}
      <polygon points="50,5 43,32 57,32" fill="#0891b2" />
      {/* Face */}
      <ellipse cx="50" cy="60" rx="36" ry="30" fill="#38bdf8" />
      {/* White underbelly */}
      <ellipse cx="50" cy="68" rx="24" ry="18" fill="#f0f9ff" />
      {/* Eyes */}
      <ellipse cx="36" cy="50" rx="7" ry="7" fill="#1a1a1a" />
      <ellipse cx="64" cy="50" rx="7" ry="7" fill="#1a1a1a" />
      <ellipse cx="38" cy="48" rx="2.5" ry="3" fill="white" />
      <ellipse cx="66" cy="48" rx="2.5" ry="3" fill="white" />
      {/* Smile with teeth */}
      <path d="M32 68 Q50 82 68 68" stroke="#0e7490" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Teeth */}
      <polygon points="40,68 44,68 42,74" fill="white" />
      <polygon points="46,70 50,70 48,76" fill="white" />
      <polygon points="52,70 56,70 54,76" fill="white" />
      <polygon points="58,68 62,68 60,74" fill="white" />
      {/* Blush */}
      <ellipse cx="24" cy="60" rx="7" ry="4" fill="#bae6fd" opacity="0.7" />
      <ellipse cx="76" cy="60" rx="7" ry="4" fill="#bae6fd" opacity="0.7" />
    </>
  );
}

// ─── Face renderer map ─────────────────────────────────────────────────────────
const FACE_MAP: Record<string, () => React.ReactElement> = {
  cat:     CatFace,
  dog:     DogFace,
  panda:   PandaFace,
  fox:     FoxFace,
  rabbit:  RabbitFace,
  bear:    BearFace,
  frog:    FrogFace,
  lion:    LionFace,
  penguin: PenguinFace,
  koala:   KoalaFace,
  tiger:   TigerFace,
  unicorn: UnicornFace,
  chick:   ChickFace,
  hamster: HamsterFace,
  owl:     OwlFace,
  dragon:  DragonFace,
  wolf:    WolfFace,
  shark:   SharkFace,
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AnimalAvatar({ animalId, size = "sm", className = "" }: AnimalAvatarProps) {
  const animal = getAnimal(animalId);
  const s = SIZE[size];
  const FaceComponent = FACE_MAP[animal.id] ?? CatFace;

  return (
    <div
      className={`
        relative rounded-full overflow-hidden shrink-0 select-none
        bg-gradient-to-br ${animal.gradient}
        ring-2 ring-white/80 ring-offset-1
        shadow-lg
        ${s.wrap} ${className}
      `}
    >
      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/10 rounded-full pointer-events-none z-10" />

      <svg
        viewBox="0 0 100 100"
        width={s.svg}
        height={s.svg}
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-0"
        aria-label={animal.name}
        role="img"
      >
        <FaceComponent />
      </svg>
    </div>
  );
}
