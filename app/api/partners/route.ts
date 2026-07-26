import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { itemPointsCost } from "@/lib/utils";

export async function GET() {
  const supabase = createAdminClient();

  const { data: partners, error } = await supabase
    .from("partners")
    .select(`
      id, name, description, category, emoji, city, portal_slug, active, created_at,
      items:partner_items(id, partner_id, name, description, price_pkr, expiry_days, active, created_at)
    `)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = (partners ?? []).map(p => ({
    ...p,
    items: (p.items ?? [])
      .filter((it: { active: boolean }) => it.active)
      .map((it: { price_pkr: number } & Record<string, unknown>) => ({
        ...it,
        points_required: itemPointsCost(it.price_pkr),
      })),
  }));

  return NextResponse.json(enriched);
}
