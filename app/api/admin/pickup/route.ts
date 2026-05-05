import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { XP_RATES } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json(null, { status: 401 });

  const session = await verifyToken(token);
  if (!session) return NextResponse.json(null, { status: 401 });

  const supabase = createAdminClient();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", session.id).single();
  if (!me || me.role !== "admin") return NextResponse.json(null, { status: 403 });

  const { userId, type, kg, cash, note } = await req.json();
  if (!userId || !kg || parseFloat(kg) <= 0) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { data: user } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const xpEarned = Math.round(parseFloat(kg) * (XP_RATES[type] || 0));

  const { error: pickupError } = await supabase.from("pickups").insert({
    user_id: userId,
    user_name: user.name,
    user_city: user.city,
    type,
    kg: parseFloat(kg),
    cash: parseInt(cash) || 0,
    xp: xpEarned,
    note: note || null,
  });

  if (pickupError) return NextResponse.json({ error: pickupError.message }, { status: 500 });

  await supabase.from("profiles").update({
    xp: user.xp + xpEarned,
    total_kg: Number(user.total_kg) + parseFloat(kg),
    total_cash: user.total_cash + (parseInt(cash) || 0),
  }).eq("id", userId);

  return NextResponse.json({ success: true, xpEarned });
}
