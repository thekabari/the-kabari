import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyPassword,
  signPartnerToken,
  PARTNER_COOKIE,
  PARTNER_COOKIE_MAX_AGE,
} from "@/lib/partner-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: partner } = await supabase
    .from("partners")
    .select("id, portal_password_hash, active")
    .eq("portal_slug", slug)
    .single();

  if (!partner) {
    return NextResponse.json({ error: "Portal not found" }, { status: 404 });
  }

  if (!partner.portal_password_hash) {
    // No password set — portal is public, no login needed
    return NextResponse.json({ error: "This portal has no password set" }, { status: 400 });
  }

  const valid = await verifyPassword(password, partner.portal_password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await signPartnerToken(partner.id, slug);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARTNER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PARTNER_COOKIE_MAX_AGE,
    path: `/business/${slug}`,
  });
  return res;
}
