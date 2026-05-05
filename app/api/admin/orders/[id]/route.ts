import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json(null, { status: 401 });

  const session = await verifyToken(token);
  if (!session) return NextResponse.json(null, { status: 401 });

  const supabase = createAdminClient();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", session.id).single();
  if (!me || me.role !== "admin") return NextResponse.json(null, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { action, weight_kg, cash_paid, xp_awarded, trash_type } = body;

  if (action === "dispatch") {
    await supabase.from("orders").update({ status: "dispatched" }).eq("id", id);
    return NextResponse.json({ success: true });
  }

  if (action === "cancel") {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    return NextResponse.json({ success: true });
  }

  if (action === "complete") {
    const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    await supabase.from("orders").update({
      status: "completed",
      weight_kg: parseFloat(weight_kg) || null,
      cash_paid: parseInt(cash_paid) || null,
      xp_awarded: parseInt(xp_awarded) || null,
    }).eq("id", id);

    // Award XP and create pickup record for regular users
    if (order.user_id) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", order.user_id).single();
      if (profile) {
        const xp = parseInt(xp_awarded) || 0;
        const kg = parseFloat(weight_kg) || 0;
        const cash = parseInt(cash_paid) || 0;

        await Promise.all([
          supabase.from("profiles").update({
            xp: profile.xp + xp,
            total_kg: Number(profile.total_kg) + kg,
            total_cash: profile.total_cash + cash,
          }).eq("id", order.user_id),

          supabase.from("pickups").insert({
            user_id: order.user_id,
            user_name: order.user_name,
            user_city: order.user_city,
            type: trash_type || (order.trash_types?.[0] ?? "Other"),
            kg,
            cash,
            xp,
            note: `Pickup request #${id}`,
          }),
        ]);
      }
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
