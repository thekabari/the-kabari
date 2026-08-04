"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile, Pickup, Order, Partner, PartnerItem } from "@/types";
import { getLevel, formatDate, SCRAP_EMOJI, XP_RATES, itemPointsCost } from "@/lib/utils";
import { LogoMark } from "@/app/components/LogoMark";

type Tab = "overview" | "pending" | "requests" | "users" | "addxp" | "partners" | "settlement";

const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",   label: "Overview",   icon: "📊" },
  { id: "requests",   label: "Requests",   icon: "📦" },
  { id: "pending",    label: "Approvals",  icon: "⏳" },
  { id: "users",      label: "All Users",  icon: "👥" },
  { id: "addxp",      label: "Add XP",     icon: "➕" },
  { id: "partners",   label: "Partners",   icon: "🎁" },
  { id: "settlement", label: "Settle",     icon: "💰" },
];

const STATUS_CHIP: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-600",
  dispatched: "bg-sky-50 text-sky-600",
  completed:  "bg-accent text-accent-foreground",
  cancelled:  "bg-red-50 text-red-500",
};
const STATUS_LABEL: Record<string, string> = {
  pending:    "PENDING",
  dispatched: "DISPATCHED",
  completed:  "COMPLETED",
  cancelled:  "CANCELLED",
};

const INPUT_CLS = "w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors";
const LABEL_CLS = "block text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const res = await fetch("/api/admin");
    if (res.status === 401) { router.push("/auth"); return; }
    if (res.status === 403) { router.push("/dashboard"); return; }
    if (!res.ok) return;
    const { profiles: allProfiles, pickups: allPickups, orders: allOrders } = await res.json();
    setProfiles(allProfiles);
    setPickups(allPickups);
    setOrders(allOrders || []);
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function approveUser(id: string) {
    await fetch("/api/admin/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id }) });
    showToast("User approve ho gaya! ✓");
    loadAll();
  }

  async function rejectUser(id: string) {
    await fetch("/api/admin/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id }) });
    showToast("User reject ho gaya.");
    loadAll();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
  }

  const pending       = profiles.filter(p => p.status === "pending"  && p.role === "user");
  const approved      = profiles.filter(p => p.status === "approved" && p.role === "user");
  const pendingOrders = orders.filter(o => o.status === "pending");

  const navItems = NAV_ITEMS.map(item => ({
    ...item,
    badge: item.id === "requests" ? pendingOrders.length : item.id === "pending" ? pending.length : 0,
  }));

  const activeNav = navItems.find(n => n.id === tab)!;

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-spin">♻️</div>
        <p className="text-muted-foreground text-sm">Loading admin panel...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold z-50 shadow-elevated">
          {toast}
        </div>
      )}

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="fixed inset-y-0 left-0 w-60 hidden md:flex flex-col z-40" style={{ background: "#003c1e" }}>
        <div className="h-16 flex flex-col justify-center px-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
          <LogoMark variant="inverted" size={26} />
          <div className="text-[10px] font-medium mt-1.5" style={{ color: "rgba(255,255,255,0.38)" }}>Admin Panel</div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="w-full relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === item.id ? "rgba(255,255,255,0.10)" : undefined,
                color: tab === item.id ? "white" : "rgba(255,255,255,0.52)",
              }}
              onMouseEnter={e => { if (tab !== item.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (tab !== item.id) (e.currentTarget as HTMLButtonElement).style.background = ""; }}
            >
              {tab === item.id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r" />
              )}
              <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center tabular-nums flex-shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            <span className="text-base w-5 text-center flex-shrink-0">↩</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 h-14 flex items-center justify-between px-4 flex-shrink-0" style={{ background: "#003c1e" }}>
          <div>
            <LogoMark variant="inverted" size={22} />
            <span className="ml-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>Admin</span>
          </div>
          {(pendingOrders.length + pending.length) > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingOrders.length + pending.length} pending
            </span>
          )}
        </header>

        {/* Desktop page header */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between px-7 flex-shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--background) / 0.85)", backdropFilter: "blur(12px)" }}>
          <h1 className="font-semibold text-sm tracking-tight">
            {activeNav.icon} {activeNav.label}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-7 py-6 pb-24 md:pb-8">
          <div className="max-w-[960px] mx-auto space-y-5">

            {tab === "overview" && (
              <OverviewTab profiles={approved} pickups={pickups} pendingCount={pending.length} />
            )}
            {tab === "pending" && (
              <PendingTab pending={pending} onApprove={approveUser} onReject={rejectUser} />
            )}
            {tab === "users" && (
              <UsersTab approved={approved} />
            )}
            {tab === "requests" && (
              <RequestsTab orders={orders} onUpdate={loadAll} showToast={showToast} />
            )}
            {tab === "addxp" && (
              <AddXPTab approved={approved} onSuccess={() => { showToast("Pickup record ho gaya! ✓"); loadAll(); }} />
            )}
            {tab === "partners" && (
              <PartnersTab showToast={showToast} />
            )}
            {tab === "settlement" && (
              <SettlementTab />
            )}

          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden z-40 flex overflow-x-auto"
        style={{ background: "#003c1e", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="flex-1 min-w-0 flex flex-col items-center py-2 gap-0.5 text-[9px] font-medium relative transition-colors flex-shrink-0"
            style={{ color: tab === item.id ? "#f0a500" : "rgba(255,255,255,0.42)" }}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="truncate w-full text-center px-1">{item.label.split(" ")[0]}</span>
            {item.badge > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ profiles, pickups, pendingCount }: {
  profiles: Profile[]; pickups: Pickup[]; pendingCount: number;
}) {
  const totalKg  = profiles.reduce((a, u) => a + Number(u.total_kg), 0);
  const totalCash = profiles.reduce((a, u) => a + Number(u.total_cash), 0);

  const kpis = [
    { label: "Approved Users",   value: String(profiles.length),        icon: "👥", chip: "bg-accent" },
    { label: "Pending Approvals",value: String(pendingCount),           icon: "⏳", chip: "bg-amber-50" },
    { label: "Total kg Collected",value: `${totalKg.toFixed(0)} kg`,    icon: "♻️", chip: "bg-sky-50" },
    { label: "Total Pickups",    value: String(pickups.length),         icon: "📦", chip: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Aaj ka summary</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl border border-border bg-card shadow-card px-4 py-4 hover:shadow-elevated transition-all">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <div className={`size-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${k.chip}`}>{k.icon}</div>
            </div>
            <div className="text-2xl font-bold tabular-nums leading-none">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <h2 className="text-sm font-semibold tracking-tight">Recent Activity</h2>
        </div>
        {pickups.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">Koi activity nahi abhi</div>
        ) : (
          <div className="divide-y divide-border">
            {pickups.slice(0, 10).map(p => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                <span className="text-lg flex-shrink-0">{SCRAP_EMOJI[p.type] || "♻️"}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">{p.user_name}</span>
                  <span className="text-muted-foreground text-sm"> · {p.type} · {p.kg} kg</span>
                </div>
                <span className="text-primary font-bold text-sm tabular-nums flex-shrink-0">+{p.xp} XP</span>
                <span className="text-muted-foreground text-xs hidden md:block flex-shrink-0">{formatDate(p.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top users */}
      {profiles.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <h2 className="text-sm font-semibold tracking-tight">Top Users</h2>
          </div>
          <div className="divide-y divide-border">
            {[...profiles].sort((a, b) => b.xp - a.xp).slice(0, 5).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                <div className={`size-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-gray-300 text-gray-700" : i === 2 ? "bg-amber-700/40 text-amber-900" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.city}</div>
                </div>
                <div className="text-sm font-bold text-primary tabular-nums">{u.xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pending Approvals Tab ────────────────────────────────────────────────────

function PendingTab({ pending, onApprove, onReject }: {
  pending: Profile[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Pending Approvals</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Naaye users ko approve ya reject karo</p>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        {pending.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-muted-foreground text-sm">Koi pending request nahi</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pending.map(u => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-4 flex-wrap hover:bg-muted/40 transition-colors">
                <div className="size-10 rounded-xl bg-accent flex items-center justify-center font-black text-accent-foreground text-sm flex-shrink-0">
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.phone} · {u.city} · {formatDate(u.created_at)}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => onApprove(u.id)}
                    className="px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground rounded-full text-xs font-bold transition-colors">
                    ✓ Approve
                  </button>
                  <button onClick={() => onReject(u.id)}
                    className="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full text-xs font-bold transition-colors">
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── All Users Tab ────────────────────────────────────────────────────────────

function UsersTab({ approved }: { approved: Profile[] }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight">All Users</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Saare approved users aur unki stats</p>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        {approved.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Koi approved user nahi abhi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "hsl(var(--muted))" }}>
                <tr>
                  {["User","City","Level","XP","Kg","Cash"].map(h => (
                    <th key={h} className={`px-5 py-3 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold ${h === "XP" || h === "Kg" || h === "Cash" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...approved].sort((a, b) => b.xp - a.xp).map(u => (
                  <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.phone}</div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{u.city}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                        Lvl {getLevel(u.xp)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-primary tabular-nums">{u.xp.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground tabular-nums">{Number(u.total_kg).toFixed(1)}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground tabular-nums">Rs.{u.total_cash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Requests Tab ─────────────────────────────────────────────────────────────

const STATUS_FILTERS = ["all", "pending", "dispatched", "completed", "cancelled"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function RequestsTab({ orders, onUpdate, showToast }: {
  orders: Order[];
  onUpdate: () => void;
  showToast: (msg: string) => void;
}) {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [completing, setCompleting] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<Record<string, { kg: string; cash: string }>>({});

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const totalKg   = Object.values(breakdown).reduce((s, v) => s + (parseFloat(v.kg)   || 0), 0);
  const totalCash = Object.values(breakdown).reduce((s, v) => s + (parseFloat(v.cash) || 0), 0);
  const totalXP   = Math.floor(totalCash);

  function openCompleteForm(order: Order) {
    const init: Record<string, { kg: string; cash: string }> = {};
    (order.trash_types || []).forEach(t => { init[t] = { kg: "", cash: "" }; });
    setBreakdown(init);
    setCompleting(order.id);
  }

  async function patchOrder(id: number, action: string, extra = {}) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    if (res.ok) {
      showToast(action === "dispatch" ? "Dispatched! 🚚" : action === "complete" ? "Completed! ✅" : "Cancelled.");
      setCompleting(null);
      onUpdate();
    }
  }

  const counts = {
    pending:    orders.filter(o => o.status === "pending").length,
    dispatched: orders.filter(o => o.status === "dispatched").length,
    completed:  orders.filter(o => o.status === "completed").length,
    cancelled:  orders.filter(o => o.status === "cancelled").length,
  };

  const filterLabels: Record<string, string> = {
    all: `All (${orders.length})`,
    pending:    `⏳ Pending (${counts.pending})`,
    dispatched: `🚚 Dispatched (${counts.dispatched})`,
    completed:  `✅ Completed (${counts.completed})`,
    cancelled:  `❌ Cancelled (${counts.cancelled})`,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Pickup Requests</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Saare pickup requests manage karo</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:border-primary/40"
            }`}>
            {filterLabels[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card shadow-card py-16 text-center">
          <div className="text-4xl mb-3">📭</div>
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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {(o as Order & { pickup_type?: string }).pickup_type === "regular" ? "👤 Member" : "🎟️ One-Time"}
                    </span>
                    <span className="text-xs text-muted-foreground">#{o.id}</span>
                  </div>
                  <p className="font-bold text-sm">{o.user_name}</p>
                  <p className="text-xs text-muted-foreground">{(o as Order & { phone?: string }).phone} · {o.user_city}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">📍 {o.address}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {o.trash_types.map(t => (
                      <span key={t} className="text-[10px] bg-muted border border-border rounded-full px-2 py-0.5 font-medium">
                        {SCRAP_EMOJI[t] || "♻️"} {t}
                      </span>
                    ))}
                  </div>
                  {o.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{o.notes}"</p>}
                  {o.scheduled_date && (
                    <p className="text-xs text-primary font-semibold mt-1">
                      📅 {new Date(o.scheduled_date).toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {o.status === "pending" && (
                    <>
                      <button onClick={() => patchOrder(o.id, "dispatch")}
                        className="px-4 py-2 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white rounded-full text-xs font-bold transition-colors">
                        🚚 Dispatch
                      </button>
                      <button onClick={() => patchOrder(o.id, "cancel")}
                        className="px-4 py-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-full text-xs font-bold transition-colors">
                        ✗ Cancel
                      </button>
                    </>
                  )}
                  {o.status === "dispatched" && (
                    <>
                      <button onClick={() => openCompleteForm(o)}
                        className="px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground rounded-full text-xs font-bold transition-colors">
                        ✓ Complete
                      </button>
                      <button onClick={() => patchOrder(o.id, "cancel")}
                        className="px-4 py-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-full text-xs font-bold transition-colors">
                        ✗ Cancel
                      </button>
                    </>
                  )}
                  {o.status === "completed" && (
                    <div className="text-right text-xs text-muted-foreground space-y-0.5">
                      {o.weight_kg != null && <div>{o.weight_kg} kg total</div>}
                      {o.cash_paid  != null && <div>Rs. {o.cash_paid} paid</div>}
                      {o.xp_awarded != null && <div className="text-primary font-bold tabular-nums">+{o.xp_awarded} XP</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Per-type completion form */}
              {completing === o.id && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                  <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wide">
                    Enter weight + cash per material
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-2 px-1">
                    {["Material","Weight (kg)","Cash (Rs.)"].map(h => (
                      <span key={h} className="text-[10px] text-muted-foreground font-semibold uppercase">{h}</span>
                    ))}
                  </div>
                  <div className="space-y-2 mb-3">
                    {Object.entries(breakdown).map(([type, vals]) => (
                      <div key={type} className="grid grid-cols-3 gap-2 items-center">
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                          <span>{SCRAP_EMOJI[type] || "♻️"}</span>
                          <span>{type}</span>
                        </div>
                        <input type="number" min="0" step="0.1" placeholder="0" value={vals.kg}
                          onChange={e => setBreakdown(b => ({ ...b, [type]: { ...b[type], kg: e.target.value } }))}
                          className={INPUT_CLS} />
                        <input type="number" min="0" step="1" placeholder="0" value={vals.cash}
                          onChange={e => setBreakdown(b => ({ ...b, [type]: { ...b[type], cash: e.target.value } }))}
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => patchOrder(o.id, "complete", {
                        weight_kg: totalKg.toFixed(2),
                        cash_paid: Math.round(totalCash).toString(),
                        xp_awarded: totalXP.toString(),
                        trash_type: Object.keys(breakdown)[0] || "",
                      })}
                      disabled={totalKg === 0 && totalCash === 0}
                      className="px-5 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-bold transition-all disabled:opacity-40">
                      Confirm Complete ✓
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

// ─── Add XP Tab ───────────────────────────────────────────────────────────────

function AddXPTab({ approved, onSuccess }: {
  approved: Profile[];
  onSuccess: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [type, setType] = useState("Paper");
  const [kg, setKg] = useState("");
  const [cash, setCash] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const xpPreview = kg && type ? Math.round(parseFloat(kg) * (XP_RATES[type] || 0)) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { setError("User chunein"); return; }
    if (!kg || parseFloat(kg) <= 0) { setError("Weight dalen"); return; }
    setSubmitting(true); setError("");
    const res = await fetch("/api/admin/pickup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, type, kg, cash, note }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed"); setSubmitting(false); return; }
    setUserId(""); setKg(""); setCash(""); setNote("");
    setSubmitting(false);
    onSuccess();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Add XP / Pickup</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Kisi user ka pickup record karo aur XP do</p>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-card p-6 max-w-lg">
        {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={LABEL_CLS}>User chunein</label>
            <select value={userId} onChange={e => setUserId(e.target.value)} className={INPUT_CLS}>
              <option value="">-- User chunein --</option>
              {approved.map(u => <option key={u.id} value={u.id}>{u.name} — {u.city}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Scrap type</label>
            <select value={type} onChange={e => setType(e.target.value)} className={INPUT_CLS}>
              {Object.entries(XP_RATES).map(([t, r]) => (
                <option key={t} value={t}>{t} (+{r} XP/kg)</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Weight (kg)</label>
              <input type="number" value={kg} onChange={e => setKg(e.target.value)} min="0.5" step="0.5" placeholder="e.g. 5" className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Cash paid (Rs.)</label>
              <input type="number" value={cash} onChange={e => setCash(e.target.value)} min="0" placeholder="e.g. 90" className={INPUT_CLS} />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Note (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Ghar se pickup, Gulshan" className={INPUT_CLS} />
          </div>
          {xpPreview > 0 && (
            <div className="bg-accent/60 border border-primary/20 rounded-xl px-4 py-3 text-sm text-accent-foreground font-semibold">
              {kg} kg {type} = +{xpPreview} XP milega 🎉
            </div>
          )}
          <button type="submit" disabled={submitting}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground py-3 rounded-full font-bold text-sm transition-all disabled:opacity-60">
            {submitting ? "Recording..." : "Pickup Record Karo ✓"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Partners Tab ─────────────────────────────────────────────────────────────

type PartnerItemWithPts = PartnerItem & { points_required: number };
type PartnerWithItems  = Partner & { items?: PartnerItemWithPts[]; has_password?: boolean };

function PartnersTab({ showToast }: { showToast: (msg: string) => void }) {
  const [partners, setPartners] = useState<PartnerWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [addingPartner, setAddingPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", description: "", category: "cafe", emoji: "☕", city: "" });
  const [newItem, setNewItem] = useState({ name: "", description: "", price_pkr: "", expiry_days: "60" });
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null);
  const [passwordFor, setPasswordFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);

  async function loadPartners() {
    setLoading(true);
    const res = await fetch("/api/admin/partners");
    if (res.ok) {
      const data = await res.json();
      setPartners(data.map((p: Partner & { items?: PartnerItem[]; has_password?: boolean }): PartnerWithItems => ({
        ...p,
        has_password: p.has_password ?? false,
        items: (p.items ?? []).map(it => ({ ...it, points_required: itemPointsCost(it.price_pkr) })),
      })));
    }
    setLoading(false);
  }

  async function handleSetPassword(e: React.FormEvent, partnerId: string) {
    e.preventDefault();
    setSettingPassword(true);
    const res = await fetch(`/api/admin/partners/${partnerId}/set-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await res.json().catch(() => null);
    setSettingPassword(false);
    if (!res.ok) { showToast(data?.error || "Failed to set password"); return; }
    showToast(newPassword ? "Portal password set ✓" : "Password cleared — portal is now public");
    setPasswordFor(null);
    setNewPassword("");
    setPartners(ps => ps.map(p => p.id === partnerId ? { ...p, has_password: !!newPassword } : p));
  }

  useEffect(() => { loadPartners(); }, []);

  async function handleAddPartner(e: React.FormEvent) {
    e.preventDefault();
    setAddingPartner(true);
    const res = await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPartner),
    });
    setAddingPartner(false);
    if (res.ok) {
      showToast("Partner added! ✓");
      setShowAddPartner(false);
      setNewPartner({ name: "", description: "", category: "cafe", emoji: "☕", city: "" });
      loadPartners();
    } else {
      const d = await res.json().catch(() => null);
      showToast(d?.error || "Failed to add partner");
    }
  }

  async function handleAddItem(e: React.FormEvent, partnerId: string) {
    e.preventDefault();
    const res = await fetch(`/api/admin/partners/${partnerId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem.name,
        description: newItem.description || null,
        price_pkr: Number(newItem.price_pkr),
        expiry_days: Number(newItem.expiry_days),
      }),
    });
    if (res.ok) {
      showToast("Item added! ✓");
      setAddingItemFor(null);
      setNewItem({ name: "", description: "", price_pkr: "", expiry_days: "60" });
      loadPartners();
    } else {
      const d = await res.json();
      showToast(d.error || "Failed to add item");
    }
  }

  async function togglePartnerActive(partner: Partner) {
    await fetch(`/api/admin/partners/${partner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !partner.active }),
    });
    showToast(partner.active ? "Partner deactivated" : "Partner activated ✓");
    loadPartners();
  }

  async function toggleItemActive(partnerId: string, item: PartnerItem) {
    await fetch(`/api/admin/partners/${partnerId}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: item.id, active: !item.active }),
    });
    showToast(item.active ? "Item deactivated" : "Item activated ✓");
    loadPartners();
  }

  if (loading) return (
    <div className="py-20 text-center"><div className="text-3xl animate-spin mb-3">♻️</div></div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Partner Rewards</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage partner businesses and redeemable items</p>
        </div>
        <button onClick={() => setShowAddPartner(v => !v)}
          className="px-5 py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-sm font-bold transition-all">
          + Add Partner
        </button>
      </div>

      {showAddPartner && (
        <div className="rounded-xl border border-border bg-card shadow-card p-5">
          <h3 className="font-bold text-sm mb-4">New Partner</h3>
          <form onSubmit={handleAddPartner} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Name *</label>
                <input value={newPartner.name} onChange={e => setNewPartner(p => ({ ...p, name: e.target.value }))}
                  placeholder="Cosy Cafe" className={INPUT_CLS} required />
              </div>
              <div>
                <label className={LABEL_CLS}>City</label>
                <input value={newPartner.city} onChange={e => setNewPartner(p => ({ ...p, city: e.target.value }))}
                  placeholder="Karachi" className={INPUT_CLS} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={LABEL_CLS}>Emoji</label>
                <input value={newPartner.emoji} onChange={e => setNewPartner(p => ({ ...p, emoji: e.target.value }))}
                  placeholder="☕" className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Category</label>
                <select value={newPartner.category} onChange={e => setNewPartner(p => ({ ...p, category: e.target.value }))} className={INPUT_CLS}>
                  {["cafe","restaurant","retail","health","fitness","education","entertainment"].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Description</label>
                <input value={newPartner.description} onChange={e => setNewPartner(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short blurb" className={INPUT_CLS} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={addingPartner}
                className="px-5 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-bold transition-all disabled:opacity-60">
                {addingPartner ? "Adding..." : "Add Partner ✓"}
              </button>
              <button type="button" onClick={() => setShowAddPartner(false)}
                className="px-5 py-2 border border-border text-muted-foreground rounded-full text-xs font-semibold hover:border-destructive/40 hover:text-destructive transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {partners.length === 0 ? (
        <div className="rounded-xl border border-border bg-card shadow-card py-16 text-center">
          <div className="text-4xl mb-3">🏪</div>
          <p className="text-muted-foreground text-sm">No partners yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {partners.map(partner => {
            const isOpen = expandedId === partner.id;
            return (
              <div key={partner.id} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="size-11 bg-accent rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {partner.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{partner.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${partner.active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                        {partner.active ? "Active" : "Inactive"}
                      </span>
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{partner.category}</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="text-xs text-muted-foreground">{partner.city} · {partner.items?.length ?? 0} items</span>
                      <a
                        href={`/business/${partner.portal_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary/70 hover:text-primary underline decoration-dotted transition-colors"
                      >
                        Portal ↗
                      </a>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${partner.has_password ? "bg-amber-50 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                        {partner.has_password ? "🔐 Protected" : "🔓 Public"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => togglePartnerActive(partner)}
                      className="text-xs px-3 py-1.5 border border-border rounded-full text-muted-foreground hover:border-primary/40 transition-colors">
                      {partner.active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => setExpandedId(isOpen ? null : partner.id)}
                      className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors">
                      {isOpen ? "▲ Close" : "▼ Items"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-5 py-4" style={{ borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--muted) / 0.35)" }}>

                    {/* Portal Access */}
                    <div className="mb-5 bg-card rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-0.5">Portal Access</p>
                          <p className="text-xs text-muted-foreground">
                            {partner.has_password
                              ? "Password-protected — only partners with credentials can login"
                              : "Public — anyone with the link can access"}
                          </p>
                        </div>
                        <button
                          onClick={() => { setPasswordFor(passwordFor === partner.id ? null : partner.id); setNewPassword(""); }}
                          className="text-xs px-3 py-1.5 border border-border rounded-full text-muted-foreground hover:border-primary/40 transition-colors flex-shrink-0"
                        >
                          {partner.has_password ? "Change / Remove Password" : "Set Password"}
                        </button>
                      </div>

                      {passwordFor === partner.id && (
                        <form onSubmit={e => handleSetPassword(e, partner.id)} className="mt-3 flex gap-2 flex-wrap">
                          <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder={partner.has_password ? "New password (blank to remove)" : "Min. 6 characters"}
                            autoFocus
                            className={`${INPUT_CLS} flex-1 min-w-[180px]`}
                          />
                          <button
                            type="submit"
                            disabled={settingPassword || (!partner.has_password && newPassword.length > 0 && newPassword.length < 6)}
                            className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-bold transition-all disabled:opacity-50 flex-shrink-0"
                          >
                            {settingPassword ? "Saving..." : newPassword ? "Save Password" : "Remove Password"}
                          </button>
                          <button type="button" onClick={() => setPasswordFor(null)}
                            className="px-4 py-2 border border-border text-muted-foreground rounded-full text-xs transition-colors">
                            Cancel
                          </button>
                        </form>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Redeemable Items</p>
                      <button onClick={() => setAddingItemFor(addingItemFor === partner.id ? null : partner.id)}
                        className="text-xs px-3 py-1.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full font-bold transition-all">
                        + Add Item
                      </button>
                    </div>

                    {addingItemFor === partner.id && (
                      <form onSubmit={e => handleAddItem(e, partner.id)}
                        className="bg-card rounded-xl border border-border p-4 mb-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={LABEL_CLS}>Item Name *</label>
                            <input value={newItem.name} onChange={e => setNewItem(i => ({ ...i, name: e.target.value }))}
                              placeholder="Cluck Norris" className={INPUT_CLS} required />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Price (Rs.) *</label>
                            <input type="number" min="1" value={newItem.price_pkr}
                              onChange={e => setNewItem(i => ({ ...i, price_pkr: e.target.value }))}
                              placeholder="800" className={INPUT_CLS} required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={LABEL_CLS}>Description</label>
                            <input value={newItem.description} onChange={e => setNewItem(i => ({ ...i, description: e.target.value }))}
                              placeholder="Short description" className={INPUT_CLS} />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Valid (days)</label>
                            <input type="number" min="1" value={newItem.expiry_days}
                              onChange={e => setNewItem(i => ({ ...i, expiry_days: e.target.value }))}
                              className={INPUT_CLS} />
                          </div>
                        </div>
                        {newItem.price_pkr && (
                          <p className="text-xs text-primary font-semibold">
                            Redeem cost: {itemPointsCost(Number(newItem.price_pkr)).toLocaleString()} XP
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button type="submit"
                            className="px-4 py-1.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-bold transition-all">
                            Add Item ✓
                          </button>
                          <button type="button" onClick={() => setAddingItemFor(null)}
                            className="px-4 py-1.5 border border-border text-muted-foreground rounded-full text-xs transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {(partner.items ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No items yet</p>
                    ) : (
                      <div className="space-y-2">
                        {(partner.items ?? [] as PartnerItemWithPts[]).map((item: PartnerItemWithPts) => (
                          <div key={item.id} className={`bg-card rounded-xl border border-border p-3 flex items-center gap-3 ${!item.active ? "opacity-50" : ""}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm">{item.name}</span>
                                {!item.active && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>}
                              </div>
                              {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                              <div className="flex gap-3 mt-1 text-xs">
                                <span className="font-bold text-primary tabular-nums">{item.points_required?.toLocaleString()} XP</span>
                                <span className="text-muted-foreground">Rs. {item.price_pkr}</span>
                                <span className="text-muted-foreground">Valid {item.expiry_days}d</span>
                              </div>
                            </div>
                            <button onClick={() => toggleItemActive(partner.id, item)}
                              className="text-xs px-3 py-1.5 border border-border rounded-full text-muted-foreground hover:border-primary/40 transition-colors flex-shrink-0">
                              {item.active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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

// ─── Settlement Tab ───────────────────────────────────────────────────────────

interface SettlementItem  { item_name: string; count: number; amount: number; }
interface SettlementEntry {
  partner_id: string; partner_name: string; partner_emoji: string;
  partner_city: string | null; total_owed: number; coupon_count: number;
  items: SettlementItem[];
  recent: { code: string; item_name: string; amount: number; used_at: string }[];
}

function SettlementTab() {
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

  if (loading) return (
    <div className="py-20 text-center"><div className="text-3xl animate-spin mb-3">♻️</div></div>
  );

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
