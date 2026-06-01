import { Message } from "@/types";
import AnimalAvatar from "@/components/AnimalAvatar";

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const time = new Date(message.created_at).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex gap-2 py-1 ${isOwn ? "flex-row-reverse" : ""}`}>
      <AnimalAvatar animalId={message.user?.avatar_animal} size="xs" />
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
        {!isOwn && (
          <span className="text-xs text-gray-400 font-medium">{message.user?.nickname ?? "Unknown"}</span>
        )}
        <div className={`px-3 py-2 rounded-xl text-sm leading-snug break-words ${isOwn ? "bg-accent text-white rounded-tr-sm" : "bg-gray-100 text-gray-900 rounded-tl-sm"}`}>
          {message.content}
        </div>
        <span className="text-xs text-gray-300">{time}</span>
      </div>
    </div>
  );
}
