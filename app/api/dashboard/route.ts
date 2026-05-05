import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json(null, { status: 401 });

  const session = await verifyToken(token);
  if (!session) return NextResponse.json(null, { status: 401 });

  const supabase = createAdminClient();

  const [{ data: profile }, { data: pickups }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("id, name, phone, city, role, status, xp, total_kg, total_cash, created_at").eq("id", session.id).single(),
    supabase.from("pickups").select("*").eq("user_id", session.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("orders").select("*").eq("user_id", session.id).order("created_at", { ascending: false }),
  ]);

  if (!profile) return NextResponse.json(null, { status: 401 });

  return NextResponse.json({ profile, pickups: pickups || [], orders: orders || [] });
}
