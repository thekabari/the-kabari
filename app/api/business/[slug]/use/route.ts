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
    .select("id")
    .eq("portal_slug", slug)
    .single();

  if (!partner) return NextResponse.json({ error: "Portal not found" }, { status: 404 });

  const { data: coupon } = await supabase
    .from("coupons")
    .select("id, status, expires_at")
    .eq("code", code.trim().toUpperCase())
    .eq("partner_id", partner.id)
    .single();

  if (!coupon) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }
  if (coupon.status === "used") {
    return NextResponse.json({ error: "Coupon already used" }, { status: 400 });
  }
  if (coupon.status === "expired" || new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
  }

  await supabase
    .from("coupons")
    .update({ status: "used", used_at: new Date().toISOString() })
    .eq("id", coupon.id);

  return NextResponse.json({ success: true });
}
