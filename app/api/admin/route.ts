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
  if (!me || me.role !== "admin") return NextResponse.json(null, { status: 403 });

  const [{ data: profiles }, { data: pickups }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("id, name, phone, city, role, status, xp, total_kg, total_cash, created_at").order("created_at", { ascending: false }),
    supabase.from("pickups").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({ profiles: profiles || [], pickups: pickups || [], orders: orders || [] });
}
