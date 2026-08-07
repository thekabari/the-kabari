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
  if (me?.role !== "admin") return NextResponse.json(null, { status: 403 });
  return NextResponse.json({ ok: true });
}
