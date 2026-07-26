import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: partner } = await supabase
    .from("partners")
    .select("id, name")
    .eq("portal_slug", slug)
    .single();

  if (!partner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: usedCoupons, error } = await supabase
    .from("coupons")
    .select(`id, code, used_at, item:partner_items(name, price_pkr)`)
    .eq("partner_id", partner.id)
    .eq("status", "used")
    .order("used_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const coupons = (usedCoupons ?? []).map(c => {
    const itRaw = c.item;
    const it = (Array.isArray(itRaw) ? itRaw[0] : itRaw) as { name: string; price_pkr: number } | null;
    return { code: c.code, item_name: it?.name ?? "", amount: it?.price_pkr ?? 0, used_at: c.used_at ?? "" };
  });

  const total_owed = coupons.reduce((s, c) => s + c.amount, 0);

  return NextResponse.json({ total_owed, coupon_count: coupons.length, coupons });
}
