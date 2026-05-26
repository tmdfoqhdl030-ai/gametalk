import Image from "next/image";
import { type Game } from "@/types";

interface GameIconProps {
  game: Game;
  className?: string;
}

const GAME_IMAGES: Record<Game, string> = {
  pubg:      "/games/pubg.png",
  lol:       "/games/lol.png",
  overwatch: "/games/overwatch.png",
  valorant:  "/games/valorant.png",
  tft:       "/games/tft.png",
};

export default function GameIcon({ game, className = "" }: GameIconProps) {
  return (
    <span className={`inline-block shrink-0 overflow-hidden rounded-md align-middle ${className}`}>
      <Image
        src={GAME_IMAGES[game]}
        alt={game}
        width={128}
        height={128}
        className="w-full h-full object-cover block"
        quality={90}
      />
    </span>
  );
}
