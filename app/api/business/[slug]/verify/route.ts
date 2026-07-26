import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { code } = await req.json();

  if (!code?.trim()) {
    return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: partner } = await supabase
    .from("partners")
    .select("id, name")
    .eq("portal_slug", slug)
    .single();

  if (!partner) return NextResponse.json({ error: "Portal not found" }, { status: 404 });

  const { data: coupon } = await supabase
    .from("coupons")
    .select(`
      id, code, status, expires_at, used_at, created_at,
      item:partner_items(name, description, price_pkr),
      user:profiles(name)
    `)
    .eq("code", code.trim().toUpperCase())
    .eq("partner_id", partner.id)
    .single();

  if (!coupon) {
    return NextResponse.json({ error: "Coupon not found for this location" }, { status: 404 });
  }

  // Auto-expire if past expiry
  if (coupon.status === "active" && new Date(coupon.expires_at) < new Date()) {
    await supabase.from("coupons").update({ status: "expired" }).eq("id", coupon.id);
    coupon.status = "expired";
  }

  const userRecord = coupon.user;
  const customerName = Array.isArray(userRecord)
    ? (userRecord[0] as { name?: string } | undefined)?.name
    : (userRecord as { name?: string } | null)?.name;

  return NextResponse.json({
    id: coupon.id,
    code: coupon.code,
    status: coupon.status,
    expires_at: coupon.expires_at,
    used_at: coupon.used_at,
    item: coupon.item,
    customer_name: customerName ?? "Member",
  });
}
