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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(req))) return NextResponse.json(null, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const allowed: Record<string, unknown> = {};
  for (const key of ["name", "description", "category", "emoji", "city", "active"] as const) {
    if (key in body) allowed[key] = body[key];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("partners")
    .update(allowed)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
