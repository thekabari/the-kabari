import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json([], { status: 401 });

  const session = await verifyToken(token);
  if (!session) return NextResponse.json([], { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const { name, phone, city, address, trash_types, notes, scheduled_date } = await req.json();

  if (!name || !phone || !city || !address || !trash_types?.length) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: session?.id || null,
      user_name: name,
      user_city: city,
      phone,
      trash_types,
      address,
      notes: notes || null,
      scheduled_date: scheduled_date || null,
      status: "pending",
      pickup_type: session ? "regular" : "onetime",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, id: data.id });
}
