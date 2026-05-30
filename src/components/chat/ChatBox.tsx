"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Message, User } from "@/types";
import ChatMessage from "./ChatMessage";

interface ChatBoxProps {
  roomId: string;
  currentUser: User | null;
  initialMessages: Message[];
}

export default function ChatBox({ roomId, currentUser, initialMessages }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}:messages`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const { data: user } = await supabase
            .from("users")
            .select("id, nickname, english_level")
            .eq("id", payload.new.user_id)
            .single();

          setMessages((prev) => [...prev, { ...(payload.new as Message), user: user as Message["user"] }]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, supabase]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || !currentUser || sending) return;

    setSending(true);
    setInput("");

    await supabase.from("messages").insert({ room_id: roomId, user_id: currentUser.id, content });
    setSending(false);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-xs text-blue-700 font-semibold leading-relaxed">
        📢 이 방에서는 영어 소통을 지향합니다! 모르는 단어나 표현이 있다면 자연스럽게 <strong>한국어를 섞어서 사용해도 괜찮으니</strong> 부담 가지지 마시고 편하게 대화해 보세요! 🌱
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-10">
            첫 메시지를 보내보세요! Say hello in English 👋
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} isOwn={msg.user_id === currentUser?.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {currentUser ? (
        <form onSubmit={sendMessage} className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type in English..."
            maxLength={500}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      ) : (
        <div className="mt-3 pt-3 border-t border-gray-200 text-center text-sm text-gray-400">
          채팅하려면 <a href="/auth/login" className="text-accent font-bold hover:underline">로그인</a>이 필요합니다
        </div>
      )}
    </div>
  );
}
