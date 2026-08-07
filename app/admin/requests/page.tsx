"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types";
import { ScrapIcon } from "@/lib/scrapIcons";
import {
  ArrowPathIcon, ClockIcon, TruckIcon, CheckCircleIcon, XCircleIcon,
  CheckIcon, XMarkIcon, InboxIcon, MapPinIcon, CalendarDaysIcon,
  UserIcon, TicketIcon,
} from "@heroicons/react/24/outline";

interface ScrapRate { slug: string; name: string; emoji: string; rate_pkr: number; hot: boolean; }

const STATUS_CHIP: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-600",
  dispatched: "bg-sky-50 text-sky-600",
  completed:  "bg-accent text-accent-foreground",
  cancelled:  "bg-red-50 text-red-500",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "PENDING", dispatched: "DISPATCHED",
  completed: "COMPLETED", cancelled: "CANCELLED",
};
const STATUS_FILTERS = ["all", "pending", "dispatched", "completed", "cancelled"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];
const STATUS_ICON: Record<Exclude<StatusFilter, "all">, typeof ClockIcon> = {
  pending: ClockIcon, dispatched: TruckIcon, completed: CheckCircleIcon, cancelled: XCircleIcon,
};

function rateForType(type: string, rates: ScrapRate[]): number {
  return rates.find(r => r.name.toLowerCase() === type.toLowerCase())?.rate_pkr ?? 0;
}

const INPUT_CLS = "w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors";

export default function RequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rates, setRates] = useState<ScrapRate[]>([]);
  const [xpPerRupee, setXpPerRupee] = useState(1);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [completing, setCompleting] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<Record<string, { kg: string; cash: string }>>({});
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function load() {
    const [adminRes, ratesRes] = await Promise.all([
      fetch("/api/admin"),
      fetch("/api/rates"),
    ]);
    if (adminRes.status === 401) { router.push("/auth"); return; }
    if (adminRes.status === 403) { router.push("/dashboard"); return; }
    const [adminData, ratesData] = await Promise.all([adminRes.json(), ratesRes.json()]);
    setOrders(adminData.orders ?? []);
    setRates(ratesData.rates ?? []);
    setXpPerRupee(ratesData.xp_per_rupee ?? 1);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCompleteForm(order: Order) {
    const init: Record<string, { kg: string; cash: string }> = {};
    (order.trash_types || []).forEach(t => { init[t] = { kg: "", cash: "" }; });
    setBreakdown(init);
    setCompleting(order.id);
  }

  function updateWeight(type: string, weight: string) {
    const rate = rateForType(type, rates);
    const cash = weight && rate ? (parseFloat(weight) * rate).toFixed(0) : "";
    setBreakdown(b => ({ ...b, [type]: { ...b[type], kg: weight, cash } }));
  }

  function updateCash(type: string, cash: string) {
    setBreakdown(b => ({ ...b, [type]: { ...b[type], cash } }));
  }

  async function patchOrder(id: number, action: string, extra: Record<string, string> = {}) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    if (res.ok) {
      showToast(action === "dispatch" ? "Dispatched!" : action === "complete" ? "Completed!" : "Cancelled.");
      setCompleting(null);
      load();
    }
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const totalKg   = Object.values(breakdown).reduce((s, v) => s + (parseFloat(v.kg)   || 0), 0);
  const totalCash = Object.values(breakdown).reduce((s, v) => s + (parseFloat(v.cash) || 0), 0);
  const totalXP   = Math.floor(totalCash * xpPerRupee);

  const counts = {
    pending:    orders.filter(o => o.status === "pending").length,
    dispatched: orders.filter(o => o.status === "dispatched").length,
    completed:  orders.filter(o => o.status === "completed").length,
    cancelled:  orders.filter(o => o.status === "cancelled").length,
  };

  if (loading) return <div className="py-20 text-center"><ArrowPathIcon className="size-8 mx-auto animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold z-50 shadow-elevated">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black tracking-tight">Pickup Requests</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Saare pickup requests manage karo</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(s => {
          const Icon = s !== "all" ? STATUS_ICON[s] : null;
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                filter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/40"
              }`}>
              {Icon && <Icon className="size-3.5" />}
              {s === "all" ? `All (${orders.length})` : `${s[0].toUpperCase() + s.slice(1)} (${counts[s as keyof typeof counts] ?? 0})`}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card shadow-card py-16 text-center">
          <InboxIcon className="size-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Koi request nahi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o.id} className="rounded-xl border border-border bg-card shadow-card p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CHIP[o.status] ?? STATUS_CHIP.pending}`}>
                      {STATUS_LABEL[o.status] ?? o.status.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {(o as Order & { pickup_type?: string }).pickup_type === "regular"
                        ? <><UserIcon className="size-3" /> Member</>
                        : <><TicketIcon className="size-3" /> One-Time</>}
                    </span>
                    <span className="text-xs text-muted-foreground">#{o.id}</span>
                  </div>
                  <p className="font-bold text-sm">{o.user_name}</p>
                  <p className="text-xs text-muted-foreground">{(o as Order & { phone?: string }).phone} · {o.user_city}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1 truncate"><MapPinIcon className="size-3.5 flex-shrink-0" /> {o.address}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {o.trash_types.map(t => (
                      <span key={t} className="flex items-center gap-1 text-[10px] bg-muted border border-border rounded-full px-2 py-0.5 font-medium">
                        <ScrapIcon type={t} className="size-3" /> {t}
                        {rates.length > 0 && ` · Rs.${rateForType(t, rates)}/kg`}
                      </span>
                    ))}
                  </div>
                  {o.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{o.notes}"</p>}
                  {o.scheduled_date && (
                    <p className="flex items-center gap-1 text-xs text-primary font-semibold mt-1">
                      <CalendarDaysIcon className="size-3.5" /> {new Date(o.scheduled_date).toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {o.status === "pending" && (
                    <>
                      <button onClick={() => patchOrder(o.id, "dispatch")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white rounded-full text-xs font-bold transition-colors">
                        <TruckIcon className="size-3.5" /> Dispatch
                      </button>
                      <button onClick={() => patchOrder(o.id, "cancel")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-full text-xs font-bold transition-colors">
                        <XMarkIcon className="size-3.5" /> Cancel
                      </button>
                    </>
                  )}
                  {o.status === "dispatched" && (
                    <>
                      <button onClick={() => openCompleteForm(o)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground rounded-full text-xs font-bold transition-colors">
                        <CheckIcon className="size-3.5" /> Complete
                      </button>
                      <button onClick={() => patchOrder(o.id, "cancel")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-full text-xs font-bold transition-colors">
                        <XMarkIcon className="size-3.5" /> Cancel
                      </button>
                    </>
                  )}
                  {o.status === "completed" && (
                    <div className="text-right text-xs text-muted-foreground space-y-0.5">
                      {o.weight_kg != null && <div>{o.weight_kg} kg</div>}
                      {o.cash_paid  != null && <div>Rs. {o.cash_paid}</div>}
                      {o.xp_awarded != null && <div className="text-primary font-bold tabular-nums">+{o.xp_awarded} XP</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Completion form */}
              {completing === o.id && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                  <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wide">
                    Weight per material → cash auto-calculated from current rates
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-2 px-1">
                    {["Material", "Weight (kg)", "Cash (Rs.)"].map(h => (
                      <span key={h} className="text-[10px] text-muted-foreground font-semibold uppercase">{h}</span>
                    ))}
                  </div>
                  <div className="space-y-2 mb-3">
                    {Object.entries(breakdown).map(([type, vals]) => (
                      <div key={type} className="grid grid-cols-3 gap-2 items-center">
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                          <ScrapIcon type={type} className="size-4 flex-shrink-0" />
                          <span className="truncate">{type}</span>
                        </div>
                        <input type="number" min="0" step="0.1" placeholder="0" value={vals.kg}
                          onChange={e => updateWeight(type, e.target.value)}
                          className={INPUT_CLS} />
                        <input type="number" min="0" step="1" placeholder="auto" value={vals.cash}
                          onChange={e => updateCash(type, e.target.value)}
                          className={INPUT_CLS} />
                      </div>
                    ))}
                  </div>
                  <div className="bg-accent/60 border border-primary/20 rounded-xl px-4 py-3 mb-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-bold tabular-nums">{totalKg.toFixed(1)} kg</span>
                      <span className="text-muted-foreground mx-2">·</span>
                      <span className="font-bold tabular-nums">Rs. {Math.round(totalCash)}</span>
                    </div>
                    <div className="font-black text-primary tabular-nums">+{totalXP} XP</div>
                  </div>
                  {xpPerRupee !== 1 && (
                    <p className="text-xs text-muted-foreground mb-3">XP rate: {xpPerRupee} XP per Re. 1 earned</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => patchOrder(o.id, "complete", {
                        weight_kg: totalKg.toFixed(2),
                        cash_paid: Math.round(totalCash).toString(),
                        xp_awarded: totalXP.toString(),
                        trash_type: Object.keys(breakdown)[0] || "",
                      })}
                      disabled={totalKg === 0 && totalCash === 0}
                      className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-bold transition-all disabled:opacity-40">
                      <CheckIcon className="size-3.5" /> Confirm Complete
                    </button>
                    <button onClick={() => setCompleting(null)}
                      className="px-5 py-2 border border-border text-muted-foreground rounded-full text-xs font-semibold hover:border-destructive/40 hover:text-destructive transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
