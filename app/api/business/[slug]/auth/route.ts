import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerToken, PARTNER_COOKIE } from "@/lib/partner-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = req.cookies.get(PARTNER_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = await verifyPartnerToken(token);
  if (!session || session.slug !== slug) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  return NextResponse.json({ partnerId: session.partnerId, slug: session.slug });
}
