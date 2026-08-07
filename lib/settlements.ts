import { SupabaseClient } from "@supabase/supabase-js";

export interface SettlementEntry {
  partner_id: string;
  partner_name: string;
  partner_emoji: string;
  partner_city: string | null;
  total_owed: number;
  coupon_count: number;
  items: { item_name: string; count: number; amount: number }[];
  recent: { code: string; item_name: string; amount: number; used_at: string }[];
}

export async function getSettlements(
  supabase: SupabaseClient,
  partnerId?: string
): Promise<{ data: SettlementEntry[] | null; error: string | null }> {
  let query = supabase
    .from("coupons")
    .select(`
      id, code, used_at,
      partner:partners(id, name, emoji, city),
      item:partner_items(name, price_pkr)
    `)
    .eq("status", "used")
    .order("used_at", { ascending: false });

  if (partnerId) query = query.eq("partner_id", partnerId);

  const { data: usedCoupons, error } = await query;
  if (error) return { data: null, error: error.message };

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

  return { data: result, error: null };
}
