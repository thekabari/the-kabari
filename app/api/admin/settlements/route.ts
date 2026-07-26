import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json(null, { status: 401 });
  const session = await verifyToken(token);
  if (!session) return NextResponse.json(null, { status: 401 });

  const supabase = createAdminClient();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", session.id).single();
  if (!me || me.role !== "admin") return NextResponse.json(null, { status: 403 });

  const { data: usedCoupons, error } = await supabase
    .from("coupons")
    .select(`
      id, code, used_at,
      partner:partners(id, name, emoji, city),
      item:partner_items(name, price_pkr)
    `)
    .eq("status", "used")
    .order("used_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by partner
  const byPartner = new Map<string, {
    partner_id: string;
    partner_name: string;
    partner_emoji: string;
    partner_city: string | null;
    total_owed: number;
    coupon_count: number;
    items: Map<string, { count: number; amount: number }>;
    recent: { code: string; item_name: string; amount: number; used_at: string }[];
  }>();

  for (const c of usedCoupons ?? []) {
    const pRaw = c.partner;
    const p = (Array.isArray(pRaw) ? pRaw[0] : pRaw) as { id: string; name: string; emoji: string; city: string | null } | null;
    const itRaw = c.item;
    const it = (Array.isArray(itRaw) ? itRaw[0] : itRaw) as { name: string; price_pkr: number } | null;
    if (!p || !it) continue;

    if (!byPartner.has(p.id)) {
      byPartner.set(p.id, {
        partner_id: p.id, partner_name: p.name, partner_emoji: p.emoji,
        partner_city: p.city, total_owed: 0, coupon_count: 0,
        items: new Map(), recent: [],
      });
    }
    const entry = byPartner.get(p.id)!;
    entry.total_owed += it.price_pkr;
    entry.coupon_count += 1;

    const existing = entry.items.get(it.name);
    if (existing) {
      existing.count += 1;
      existing.amount += it.price_pkr;
    } else {
      entry.items.set(it.name, { count: 1, amount: it.price_pkr });
    }

    if (entry.recent.length < 10) {
      entry.recent.push({ code: c.code, item_name: it.name, amount: it.price_pkr, used_at: c.used_at ?? "" });
    }
  }

  const result = Array.from(byPartner.values()).map(e => ({
    ...e,
    items: Array.from(e.items.entries()).map(([name, v]) => ({ item_name: name, ...v })),
  }));

  return NextResponse.json(result);
}
