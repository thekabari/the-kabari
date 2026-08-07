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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(req))) return NextResponse.json(null, { status: 403 });
  const { id } = await params;
  const supabase = createAdminClient();

  let { data: partner, error } = await supabase
    .from("partners")
    .select(`
      id, name, description, category, emoji, city, portal_slug, active, created_at, portal_password_hash,
      items:partner_items(id, name, description, price_pkr, expiry_days, active, created_at)
    `)
    .eq("id", id)
    .single();

  if (error) {
    const fallback = await supabase
      .from("partners")
      .select(`
        id, name, description, category, emoji, city, portal_slug, active, created_at,
        items:partner_items(id, name, description, price_pkr, expiry_days, active, created_at)
      `)
      .eq("id", id)
      .single();
    if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 404 });
    return NextResponse.json({ ...fallback.data, has_password: false });
  }

  const { portal_password_hash, ...safe } = partner as typeof partner & { portal_password_hash: string | null };
  return NextResponse.json({ ...safe, has_password: !!portal_password_hash });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(req))) return NextResponse.json(null, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const allowed: Record<string, unknown> = {};
  for (const key of ["name", "description", "category", "emoji", "city", "active"] as const) {
    if (key in body) allowed[key] = body[key];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("partners")
    .update(allowed)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(req))) return NextResponse.json(null, { status: 403 });
  const { id } = await params;
  const supabase = createAdminClient();

  await supabase.from("coupons").delete().eq("partner_id", id);
  await supabase.from("partner_items").delete().eq("partner_id", id);

  const { error } = await supabase.from("partners").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
