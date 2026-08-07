"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, ArrowPathIcon, CheckCircleIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";

interface SettlementItem { item_name: string; count: number; amount: number; }
interface SettlementEntry {
  partner_id: string; partner_name: string; partner_emoji: string;
  partner_city: string | null; total_owed: number; coupon_count: number;
  items: SettlementItem[];
  recent: { code: string; item_name: string; amount: number; used_at: string }[];
}
interface PartnerInfo { id: string; name: string; emoji: string; city: string | null; }

export default function SettlementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [data, setData] = useState<SettlementEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/partners/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/admin/settlements/${id}`).then(r => r.ok ? r.json() : null),
    ]).then(([p, s]) => { setPartner(p); setData(s); }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-20 text-center"><ArrowPathIcon className="size-8 mx-auto animate-spin text-muted-foreground" /></div>;

  if (!partner) return (
    <div className="space-y-5">
      <Link href="/admin/settlement" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeftIcon className="size-4" /> Back to Settlement
      </Link>
      <div className="rounded-xl border border-border bg-card shadow-card py-16 text-center">
        <p className="text-muted-foreground text-sm">Partner not found.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <Link href="/admin/settlement" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeftIcon className="size-4" /> Back to Settlement
      </Link>

      <div className="rounded-xl border border-border bg-card shadow-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="size-14 bg-amber-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
            {partner.emoji}
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">{partner.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{partner.city || "No city set"}</span>
              <Link href={`/admin/partners/${partner.id}`} className="flex items-center gap-1 text-primary/80 hover:text-primary underline decoration-dotted">
                <BuildingStorefrontIcon className="size-3.5" /> View partner
              </Link>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-primary text-primary-foreground px-5 py-3 text-center flex-shrink-0">
          <div className="text-xs text-primary-foreground/60 mb-0.5">Total Owed</div>
          <div className="text-2xl font-black tabular-nums">Rs. {(data?.total_owed ?? 0).toLocaleString()}</div>
        </div>
      </div>

      {!data || data.coupon_count === 0 ? (
        <div className="rounded-xl border border-border bg-card shadow-card py-16 text-center">
          <CheckCircleIcon className="size-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No redemptions yet for this partner.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-card p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Breakdown by item</p>
          <div className="space-y-2 mb-5">
            {data.items.map(it => (
              <div key={it.item_name} className="flex items-center gap-3 bg-muted/30 rounded-xl border border-border px-4 py-2.5">
                <div className="flex-1 text-sm font-semibold">{it.item_name}</div>
                <div className="text-xs text-muted-foreground">{it.count}× Rs. {it.amount / it.count}</div>
                <div className="font-bold text-amber-600 text-sm tabular-nums">Rs. {it.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Recent redemptions</p>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs min-w-[400px]">
              <thead>
                <tr>
                  {["Code","Item","Used On","Amount"].map((h, i) => (
                    <th key={h} className={`text-[10px] text-muted-foreground uppercase tracking-wide pb-2 font-semibold ${i === 3 ? "text-right" : "text-left"} pr-3`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recent.map(c => (
                  <tr key={c.code}>
                    <td className="py-2 font-mono text-muted-foreground pr-3">{c.code}</td>
                    <td className="py-2 pr-3">{c.item_name}</td>
                    <td className="py-2 text-muted-foreground pr-3">
                      {c.used_at ? new Date(c.used_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : "—"}
                    </td>
                    <td className="py-2 text-right font-bold text-amber-600 tabular-nums">Rs. {c.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Contact <span className="font-semibold text-foreground">{partner.name}</span> to settle payment.
          </p>
        </div>
      )}
    </div>
  );
}
