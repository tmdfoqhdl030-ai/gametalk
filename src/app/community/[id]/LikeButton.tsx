"use client";

import { useState } from "react";

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
}

export default function LikeButton({ postId, initialCount, initialLiked, isLoggedIn }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    if (!isLoggedIn) {
      alert("로그인 후 좋아요를 누를 수 있습니다.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}`, { method: "PATCH" });
    if (res.ok) {
      const json = await res.json();
      setLiked(json.liked);
      setCount(json.like_count);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
        liked
          ? "bg-red-50 border-red-200 text-red-500"
          : "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400"
      }`}
    >
      {liked ? "❤️" : "🤍"} 좋아요 {count > 0 && <span>{count}</span>}
    </button>
  );
}
