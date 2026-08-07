import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const FALLBACK_RATES = [
  { slug: "paper",       name: "Paper",       emoji: "📄", rate_pkr: 9,   hot: false },
  { slug: "cardboard",   name: "Cardboard",   emoji: "📦", rate_pkr: 12,  hot: false },
  { slug: "plastic",     name: "Plastic",     emoji: "🧴", rate_pkr: 22,  hot: false },
  { slug: "metal",       name: "Metal",       emoji: "🔩", rate_pkr: 47,  hot: true  },
  { slug: "aluminum",    name: "Aluminum",    emoji: "⚙️", rate_pkr: 110, hot: true  },
  { slug: "copper",      name: "Copper",      emoji: "🔌", rate_pkr: 450, hot: true  },
  { slug: "electronics", name: "Electronics", emoji: "💻", rate_pkr: 60,  hot: false },
  { slug: "glass",       name: "Glass",       emoji: "🫙", rate_pkr: 4,   hot: false },
];

export async function GET() {
  const supabase = createAdminClient();
  const [ratesResult, settingResult] = await Promise.all([
    supabase.from("scrap_rates").select("slug, name, emoji, rate_pkr, hot").order("slug"),
    supabase.from("settings").select("value").eq("key", "xp_per_rupee").single(),
  ]);

  const rates = ratesResult.error || !ratesResult.data?.length
    ? FALLBACK_RATES
    : ratesResult.data;

  const xp_per_rupee = settingResult.error
    ? 1
    : parseFloat(settingResult.data?.value ?? "1");

  return NextResponse.json({ rates, xp_per_rupee });
}
