import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertAdmin(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;
  const supabase = createAdminClient();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", session.id).single();
  return me?.role === "admin" ? session : null;
}

export async function GET(req: NextRequest) {
  if (!(await assertAdmin(req))) return NextResponse.json(null, { status: 403 });

  const supabase = createAdminClient();
  const [ordersRes, usersRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending").eq("role", "user"),
  ]);

  return NextResponse.json({
    pendingOrders: ordersRes.count ?? 0,
    pendingUsers: usersRes.count ?? 0,
  });
}
