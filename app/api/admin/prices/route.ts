import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertAdmin(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;
  const supabase = createAdminClient();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", session.id).single();
  return me?.role === "admin" ? session : null;
}

export async function GET(req: NextRequest) {
  if (!(await assertAdmin(req))) return NextResponse.json(null, { status: 403 });

  const supabase = createAdminClient();
  const [ratesRes, settingRes] = await Promise.all([
    supabase.from("scrap_rates").select("*").order("slug"),
    supabase.from("settings").select("value").eq("key", "xp_per_rupee").single(),
  ]);

  return NextResponse.json({
    rates: ratesRes.data ?? [],
    xp_per_rupee: parseFloat(settingRes.data?.value ?? "1"),
    tablesMissing: !!ratesRes.error,
  });
}

export async function PUT(req: NextRequest) {
  if (!(await assertAdmin(req))) return NextResponse.json(null, { status: 403 });

  const { rates, xp_per_rupee } = await req.json();
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const slugs: string[] = rates.map((r: { slug: string }) => r.slug);

  // Remove rows that are no longer in the list
  if (slugs.length > 0) {
    await supabase.from("scrap_rates").delete().not("slug", "in", `(${slugs.join(",")})`);
  } else {
    await supabase.from("scrap_rates").delete().neq("slug", "");
  }

  // Upsert current set + XP setting
  const upsertResults = await Promise.all([
    ...rates.map((r: { slug: string; name: string; emoji: string; rate_pkr: number; hot: boolean }) =>
      supabase.from("scrap_rates").upsert({ ...r, updated_at: now })
    ),
    supabase.from("settings").upsert({ key: "xp_per_rupee", value: String(xp_per_rupee), updated_at: now }),
  ]);

  const firstErr = upsertResults.find(r => r.error);
  if (firstErr?.error) return NextResponse.json({ error: firstErr.error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
