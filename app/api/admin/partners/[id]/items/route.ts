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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(req))) return NextResponse.json(null, { status: 403 });
  const { id: partner_id } = await params;
  const body = await req.json();
  const { name, description, price_pkr, expiry_days } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  if (!price_pkr || Number(price_pkr) <= 0) return NextResponse.json({ error: "Valid price required" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: item, error } = await supabase
    .from("partner_items")
    .insert({
      partner_id,
      name: name.trim(),
      description: description?.trim() || null,
      price_pkr: Number(price_pkr),
      expiry_days: Number(expiry_days) || 60,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(req))) return NextResponse.json(null, { status: 403 });
  const { id: partner_id } = await params;
  const body = await req.json();
  const { item_id, ...fields } = body;

  if (!item_id) return NextResponse.json({ error: "item_id required" }, { status: 400 });

  const allowed: Record<string, unknown> = {};
  for (const key of ["name", "description", "price_pkr", "expiry_days", "active"] as const) {
    if (key in fields) allowed[key] = fields[key];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("partner_items")
    .update(allowed)
    .eq("id", item_id)
    .eq("partner_id", partner_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
