import { NextRequest, NextResponse } from "next/server";
import { PARTNER_COOKIE } from "@/lib/partner-auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARTNER_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: `/business/${slug}`,
  });
  return res;
}
