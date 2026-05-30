import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gametalk.vercel.app";

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                priority: 1.0,  changeFrequency: "always"  },
    { url: `${BASE_URL}/community`, priority: 0.9,  changeFrequency: "hourly"  },
    { url: `${BASE_URL}/notices`,   priority: 0.7,  changeFrequency: "weekly"  },
    { url: `${BASE_URL}/events`,    priority: 0.8,  changeFrequency: "daily"   },
    { url: `${BASE_URL}/auth/signup`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE_URL}/privacy`,   priority: 0.3,  changeFrequency: "yearly"  },
    { url: `${BASE_URL}/terms`,     priority: 0.3,  changeFrequency: "yearly"  },
  ];

  // 동적 페이지: 열린 방들
  try {
    const supabase = await createClient();
    const { data: rooms } = await supabase
      .from("rooms")
      .select("id, created_at")
      .neq("status", "closed")
      .order("created_at", { ascending: false })
      .limit(100);

    const roomPages: MetadataRoute.Sitemap = (rooms ?? []).map((room) => ({
      url: `${BASE_URL}/rooms/${room.id}`,
      lastModified: new Date(room.created_at),
      changeFrequency: "hourly" as const,
      priority: 0.7,
    }));

    // 동적 페이지: 커뮤니티 게시글
    const { data: posts } = await supabase
      .from("posts")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    const postPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
      url: `${BASE_URL}/community/${post.id}`,
      lastModified: new Date(post.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

    return [...staticPages, ...roomPages, ...postPages];
  } catch {
    return staticPages;
  }
}
