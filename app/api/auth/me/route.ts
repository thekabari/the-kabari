import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json(null, { status: 401 });

  const session = await verifyToken(token);
  if (!session) return NextResponse.json(null, { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name, email, phone, city, role, status")
    .eq("id", session.id)
    .single();

  if (!data) return NextResponse.json(null, { status: 401 });
  return NextResponse.json(data);
}
