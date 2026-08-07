"use client";
import { useEffect, useState } from "react";

interface SettlementItem { item_name: string; count: number; amount: number; }
interface SettlementEntry {
  partner_id: string; partner_name: string; partner_emoji: string;
  partner_city: string | null; total_owed: number; coupon_count: number;
  items: SettlementItem[];
  recent: { code: string; item_name: string; amount: number; used_at: string }[];
}

export default function SettlementPage() {
  const [data, setData] = useState<SettlementEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settlements")
      .then(r => r.ok ? r.json() : [])
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const grandTotal = data.reduce((s, p) => s + p.total_owed, 0);

  if (loading) return <div className="py-20 text-center"><div className="text-4xl animate-spin">♻️</div></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Partner Settlement</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Kitna owe karna hai har partner ko — redeemed coupons ke basis par</p>
        </div>
        <div className="rounded-xl bg-primary text-primary-foreground px-5 py-3 text-center">
          <div className="text-xs text-primary-foreground/60 mb-0.5">Total Outstanding</div>
          <div className="text-2xl font-black tabular-nums">Rs. {grandTotal.toLocaleString()}</div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-border bg-card shadow-card py-16 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-muted-foreground text-sm">Koi outstanding settlement nahi. Sab clear hai!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map(partner => {
            const isOpen = expanded === partner.partner_id;
            return (
              <div key={partner.partner_id} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : partner.partner_id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="size-11 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {partner.partner_emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{partner.partner_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {partner.partner_city} · {partner.coupon_count} coupon{partner.coupon_count !== 1 ? "s" : ""} redeemed
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-base text-amber-600 tabular-nums">Rs. {partner.total_owed.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">owed</div>
                  </div>
                  <span className="text-muted-foreground text-sm ml-2">{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div className="px-5 py-4" style={{ borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--muted) / 0.35)" }}>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Breakdown by item</p>
                    <div className="space-y-2 mb-5">
                      {partner.items.map(it => (
                        <div key={it.item_name} className="flex items-center gap-3 bg-card rounded-xl border border-border px-4 py-2.5">
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
                          {partner.recent.map(c => (
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
                      Contact <span className="font-semibold text-foreground">{partner.partner_name}</span> to settle payment.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
