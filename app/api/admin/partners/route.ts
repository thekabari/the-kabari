import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";

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

  // Try with portal_password_hash first; fall back if column doesn't exist yet
  let { data: partners, error } = await supabase
    .from("partners")
    .select(`
      id, name, description, category, emoji, city, portal_slug, active, created_at, portal_password_hash,
      items:partner_items(id, name, description, price_pkr, expiry_days, active, created_at)
    `)
    .order("created_at", { ascending: true });

  if (error) {
    // Column doesn't exist yet — retry without it
    const fallback = await supabase
      .from("partners")
      .select(`
        id, name, description, category, emoji, city, portal_slug, active, created_at,
        items:partner_items(id, name, description, price_pkr, expiry_days, active, created_at)
      `)
      .order("created_at", { ascending: true });
    if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });
    return NextResponse.json((fallback.data ?? []).map(p => ({ ...p, has_password: false })));
  }

  const safe = (partners ?? []).map(({ portal_password_hash, ...p }: { portal_password_hash: string | null; [key: string]: unknown }) => ({
    ...p,
    has_password: !!portal_password_hash,
  }));
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  if (!(await assertAdmin(req))) return NextResponse.json(null, { status: 403 });

  const body = await req.json();
  const { name, description, category, emoji, city } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const portal_slug = randomBytes(6).toString("hex");
  const supabase = createAdminClient();

  const { data: partner, error } = await supabase
    .from("partners")
    .insert({ name: name.trim(), description, category: category || "retail", emoji: emoji || "🏪", city, portal_slug })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(partner);
}
