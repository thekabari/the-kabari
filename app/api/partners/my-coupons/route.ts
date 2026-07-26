import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  // Auto-expire overdue coupons first
  await supabase
    .from("coupons")
    .update({ status: "expired" })
    .eq("user_id", session.id)
    .eq("status", "active")
    .lt("expires_at", new Date().toISOString());

  const { data: coupons, error } = await supabase
    .from("coupons")
    .select(`
      id, code, status, expires_at, used_at, created_at,
      partner:partners(id, name, emoji, city),
      item:partner_items(id, name, description, price_pkr)
    `)
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(coupons ?? []);
}
