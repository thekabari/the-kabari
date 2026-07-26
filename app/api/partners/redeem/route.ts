import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { itemPointsCost } from "@/lib/utils";
import { randomBytes } from "crypto";

function generateCouponCode(): string {
  const hex = randomBytes(6).toString("hex").toUpperCase();
  return `KBRI-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { item_id } = await req.json();
  if (!item_id) return NextResponse.json({ error: "item_id required" }, { status: 400 });

  const supabase = createAdminClient();

  const [{ data: item }, { data: profile }] = await Promise.all([
    supabase
      .from("partner_items")
      .select("*, partner:partners(id, name, emoji, active)")
      .eq("id", item_id)
      .single(),
    supabase
      .from("profiles")
      .select("id, xp")
      .eq("id", session.id)
      .single(),
  ]);

  if (!item || !item.active) {
    return NextResponse.json({ error: "Item not found or unavailable" }, { status: 404 });
  }
  if (!(item.partner as { active: boolean } | null)?.active) {
    return NextResponse.json({ error: "Partner not available" }, { status: 400 });
  }
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const pointsRequired = itemPointsCost(item.price_pkr);
  if (profile.xp < pointsRequired) {
    return NextResponse.json(
      { error: `Not enough XP. Need ${pointsRequired.toLocaleString()} XP, you have ${profile.xp.toLocaleString()} XP.` },
      { status: 400 }
    );
  }

  // Check for already active coupon for same item
  const { data: existingCoupon } = await supabase
    .from("coupons")
    .select("id")
    .eq("user_id", session.id)
    .eq("item_id", item_id)
    .eq("status", "active")
    .single();

  if (existingCoupon) {
    return NextResponse.json(
      { error: "You already have an active coupon for this item." },
      { status: 400 }
    );
  }

  const code = generateCouponCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (item.expiry_days ?? 60));

  const [{ error: deductErr }, { data: coupon, error: couponErr }] = await Promise.all([
    supabase
      .from("profiles")
      .update({ xp: profile.xp - pointsRequired })
      .eq("id", session.id),
    supabase
      .from("coupons")
      .insert({
        user_id: session.id,
        partner_id: (item.partner as { id: string }).id,
        item_id,
        code,
        status: "active",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single(),
  ]);

  if (deductErr || couponErr) {
    // Best-effort rollback: restore XP if coupon failed
    if (!deductErr && couponErr) {
      await supabase
        .from("profiles")
        .update({ xp: profile.xp })
        .eq("id", session.id);
    }
    return NextResponse.json({ error: "Redemption failed. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ coupon, points_spent: pointsRequired });
}
