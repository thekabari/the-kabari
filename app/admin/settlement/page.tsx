"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowPathIcon, CheckCircleIcon, MapPinIcon, TicketIcon } from "@heroicons/react/24/outline";

interface SettlementEntry {
  partner_id: string; partner_name: string; partner_emoji: string;
  partner_city: string | null; total_owed: number; coupon_count: number;
}

export default function SettlementPage() {
  const [data, setData] = useState<SettlementEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settlements")
      .then(r => r.ok ? r.json() : [])
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const grandTotal = data.reduce((s, p) => s + p.total_owed, 0);

  if (loading) return <div className="py-20 text-center"><ArrowPathIcon className="size-8 mx-auto animate-spin text-muted-foreground" /></div>;

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
          <CheckCircleIcon className="size-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Koi outstanding settlement nahi. Sab clear hai!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.map(partner => (
            <Link key={partner.partner_id} href={`/admin/settlement/${partner.partner_id}`}
              className="rounded-xl border border-border bg-card shadow-card p-4 flex flex-col gap-3 hover:border-primary/40 hover:shadow-elevated transition-all">
              <div className="flex items-center gap-3">
                <div className="size-11 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {partner.partner_emoji}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{partner.partner_name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPinIcon className="size-3 flex-shrink-0" />
                    <span className="truncate">{partner.partner_city || "No city set"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TicketIcon className="size-3.5" /> {partner.coupon_count} redeemed
                </span>
                <div className="text-right">
                  <div className="font-black text-sm text-amber-600 tabular-nums">Rs. {partner.total_owed.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">owed</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
