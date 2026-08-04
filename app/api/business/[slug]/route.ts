import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: partner, error } = await supabase
    .from("partners")
    .select("id, name, description, category, emoji, city, active, portal_password_hash")
    .eq("portal_slug", slug)
    .single();

  if (error || !partner) {
    return NextResponse.json({ error: "Portal not found" }, { status: 404 });
  }

  // Expose whether a password is required without leaking the hash
  const { portal_password_hash, ...safe } = partner;
  return NextResponse.json({ ...safe, has_password: !!portal_password_hash });
}
