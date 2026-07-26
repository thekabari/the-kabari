"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Profile, Pickup, Order, Partner, PartnerItem, Coupon } from "@/types";
import {
  getLevel, getLevelName, getLevelProgress, getNextLevelXP,
  formatDate, SCRAP_EMOJI, itemPointsCost,
} from "@/lib/utils";
import Link from "next/link";

type Tab = "overview" | "pickups" | "rewards" | "levelup";

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview",        icon: "📊" },
  { id: "pickups",  label: "My Pickups",      icon: "📦" },
  { id: "rewards",  label: "Partner Rewards", icon: "🎁" },
  { id: "levelup",  label: "Level Up",        icon: "🏅" },
];

const LEVELS: [number, string, number][] = [
  [1, "Starter",     0],
  [2, "Collector",   100],
  [3, "Recycler",    250],
  [4, "Green Scout", 500],
  [5, "Eco Warrior", 900],
  [6, "City Hero",   1500],
  [7, "Eco Legend",  2500],
];

const STATUS_CHIP: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-600",
  dispatched: "bg-sky-50 text-sky-600",
  completed:  "bg-accent text-accent-foreground",
  cancelled:  "bg-red-50 text-red-500",
};
const STATUS_LABEL: Record<string, string> = {
  pending:    "⏳ Pending",
  dispatched: "🚚 On the way",
  completed:  "✅ Completed",
  cancelled:  "❌ Cancelled",
};

export default function DashboardPage() {
  return <Suspense><Dashboard /></Suspense>;
}

function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const isPending = params.get("pending") === "true";
  const [tab, setTab] = useState<Tab>("overview");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null);
  const [redeemingItem, setRedeemingItem] = useState<string | null>(null);
  const [redeemMsg, setRedeemMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) { router.push("/auth"); return; }
      const { profile: prof, pickups: picks, orders: ords } = await res.json();
      if (!prof) { router.push("/auth"); return; }
      if (prof.role === "admin") { router.push("/admin"); return; }
      setProfile(prof);
      setPickups(picks ?? []);
      setOrders(ords ?? []);
      setLoading(false);
    })();

    Promise.all([
      fetch("/api/partners").then(r => r.ok ? r.json() : []),
      fetch("/api/partners/my-coupons").then(r => r.ok ? r.json() : []),
    ]).then(([p, c]) => { setPartners(p); setCoupons(c); });
  }, []);

  async function redeemItem(itemId: string) {
    setRedeemingItem(itemId);
    setRedeemMsg(null);
    const res = await fetch("/api/partners/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: itemId }),
    });
    const data = await res.json();
    setRedeemingItem(null);
    if (!res.ok) {
      setRedeemMsg({ type: "err", text: data.error || "Redemption failed" });
    } else {
      setRedeemMsg({ type: "ok", text: `Coupon generated! Code: ${data.coupon.code}` });
      Promise.all([
        fetch("/api/dashboard").then(r => r.json()).then(d => { if (d.profile) setProfile(d.profile); }),
        fetch("/api/partners/my-coupons").then(r => r.ok ? r.json() : []).then(setCoupons),
      ]);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
  }

  if (loading) return <LoadingScreen />;
  if (!profile) return null;
  if (isPending || profile.status === "pending") return <PendingScreen onLogout={handleLogout} />;
  if (profile.status === "rejected") return <RejectedScreen onLogout={handleLogout} />;

  const lvl = getLevel(profile.xp);
  const pct = getLevelProgress(profile.xp);
  const nextXP = getNextLevelXP(profile.xp);

  const activeNav = NAV.find(n => n.id === tab)!;

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      {/* ── SIDEBAR (desktop) ───────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 w-60 hidden md:flex flex-col z-40" style={{ background: "#003c1e" }}>
        {/* Brand */}
        <div className="h-16 flex items-center px-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
          <span className="font-black text-white text-lg tracking-tight">theKabari</span>
          <span className="ml-2 text-base">♻️</span>
        </div>

        {/* XP pill */}
        <div className="px-4 pt-5 pb-3 flex-shrink-0">
          <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.38)" }}>XP Balance</p>
            <p className="text-white text-xl font-black tabular-nums">{profile.xp.toLocaleString()}</p>
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.28)" }}>
              <span>Lvl {lvl} — {getLevelName(profile.xp)}</span>
              <span>{nextXP ? `${nextXP.toLocaleString()} next` : "Max!"}</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === item.id ? "text-white" : "hover:text-white"
              }`}
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
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 flex-shrink-0 space-y-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
          <Link
            href="/leaderboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
            style={{ color: "rgba(255,255,255,0.52)" }}
          >
            <span className="text-base w-5 text-center flex-shrink-0">🏆</span>
            <span>Leaderboard</span>
          </Link>
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

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 h-14 flex items-center justify-between px-4 flex-shrink-0" style={{ background: "#003c1e" }}>
          <span className="font-black text-white text-base">theKabari ♻️</span>
          <div className="flex items-center gap-2.5">
            <span className="text-amber-400 text-sm font-bold tabular-nums">{profile.xp.toLocaleString()} XP</span>
            <Link href="/pickup" className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#f0a500", color: "#003c1e" }}>
              + Pickup
            </Link>
          </div>
        </header>

        {/* Desktop page header */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between px-7 flex-shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--background) / 0.85)", backdropFilter: "blur(12px)" }}>
          <h1 className="font-semibold text-sm tracking-tight">
            {activeNav.icon} {activeNav.label}
          </h1>
          <Link href="/pickup" className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
            + Schedule Pickup
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-7 py-6 pb-24 md:pb-8">
          <div className="max-w-[860px] mx-auto space-y-5">
            {tab === "overview" && (
              <OverviewTab
                profile={profile} orders={orders} pickups={pickups}
                lvl={lvl} pct={pct} nextXP={nextXP} onTabSwitch={setTab}
              />
            )}
            {tab === "pickups" && (
              <PickupsTab orders={orders} pickups={pickups} />
            )}
            {tab === "rewards" && (
              <RewardsTab
                profile={profile} partners={partners} coupons={coupons}
                expandedPartner={expandedPartner} setExpandedPartner={setExpandedPartner}
                redeemingItem={redeemingItem} redeemItem={redeemItem} redeemMsg={redeemMsg}
              />
            )}
            {tab === "levelup" && (
              <LevelUpTab profile={profile} lvl={lvl} pct={pct} nextXP={nextXP} />
            )}
          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV (mobile) ──────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden z-40 flex"
        style={{ background: "#003c1e", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-colors"
            style={{ color: tab === item.id ? "#f0a500" : "rgba(255,255,255,0.42)" }}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span>{item.label.split(" ")[0]}</span>
          </button>
        ))}
        <Link href="/leaderboard"
          className="flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium"
          style={{ color: "rgba(255,255,255,0.42)" }}>
          <span className="text-lg leading-none">🏆</span>
          <span>Ranks</span>
        </Link>
      </nav>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  profile, orders, pickups, lvl, pct, nextXP, onTabSwitch,
}: {
  profile: Profile; orders: Order[]; pickups: Pickup[];
  lvl: number; pct: number; nextXP: number | null;
  onTabSwitch: (t: Tab) => void;
}) {
  const kpis = [
    { label: "Total XP",    value: profile.xp.toLocaleString(),         sub: "Lifetime earned",   icon: "⚡", chip: "bg-accent" },
    { label: "Level",       value: String(lvl),                         sub: getLevelName(profile.xp), icon: "🏅", chip: "bg-amber-50" },
    { label: "kg Recycled", value: Number(profile.total_kg).toFixed(1), sub: "Total weight",      icon: "♻️", chip: "bg-sky-50" },
    { label: "Cash Earned", value: `Rs. ${profile.total_cash}`,         sub: "All pickups",        icon: "💵", chip: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-2xl bg-primary text-primary-foreground px-5 py-5 relative overflow-hidden">
        <div className="absolute w-52 h-52 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)", top: "-5rem", right: "-3rem" }} />
        <div className="absolute w-32 h-32 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)", bottom: "-1rem", left: "-1rem" }} />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-primary-foreground/60 text-sm">Salam, {profile.name} 👋</p>
            <h1 className="text-xl font-black tracking-tight mt-1">Level {lvl} — {getLevelName(profile.xp)}</h1>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-primary-foreground/50">
                <span>Progress to level {lvl + 1}</span>
                <span>{nextXP ? `${(nextXP - profile.xp).toLocaleString()} XP to go` : "Max level!"}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.18)" }}>
                <div className="h-full rounded-full bg-primary-foreground transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-4xl sm:text-5xl font-black tabular-nums leading-none">{profile.xp.toLocaleString()}</div>
            <div className="text-primary-foreground/50 text-xs mt-1">XP</div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl border border-border bg-card shadow-card px-4 py-4 hover:shadow-elevated hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <div className={`size-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${k.chip}`}>
                {k.icon}
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums leading-none">{k.value}</div>
            <p className="mt-1.5 text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <h2 className="text-sm font-semibold tracking-tight">Recent Requests</h2>
            <button onClick={() => onTabSwitch("pickups")} className="text-xs text-primary font-medium hover:opacity-70 transition-opacity">
              View all →
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="py-8 text-center px-4">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm text-muted-foreground mb-3">No pickup requests yet</p>
              <Link href="/pickup" className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                + Schedule Pickup
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.slice(0, 4).map(o => (
                <div key={o.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate max-w-[120px]">{o.trash_types.join(", ")}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_CHIP[o.status] ?? STATUS_CHIP.pending}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{o.address}</div>
                  </div>
                  {o.xp_awarded ? (
                    <span className="text-xs font-bold text-primary flex-shrink-0 tabular-nums">+{o.xp_awarded} XP</span>
                  ) : (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {o.scheduled_date
                        ? new Date(o.scheduled_date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })
                        : formatDate(o.created_at)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <h2 className="text-sm font-semibold tracking-tight">Recent Pickups</h2>
            <span className="text-xs text-muted-foreground">{pickups.length} total</span>
          </div>
          {pickups.length === 0 ? (
            <div className="py-8 text-center px-4">
              <div className="text-3xl mb-2">♻️</div>
              <p className="text-sm text-muted-foreground">No pickups recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pickups.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                  <div className="size-8 bg-accent rounded-lg flex items-center justify-center text-base flex-shrink-0">
                    {SCRAP_EMOJI[p.type] || "♻️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{p.type} — {p.kg} kg</div>
                    <div className="text-xs text-muted-foreground">{formatDate(p.created_at)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-primary tabular-nums">+{p.xp} XP</div>
                    <div className="text-xs text-muted-foreground tabular-nums">Rs. {p.cash}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pickups Tab ──────────────────────────────────────────────────────────────

function PickupsTab({ orders, pickups }: { orders: Order[]; pickups: Pickup[] }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <h2 className="text-sm font-semibold tracking-tight">My Pickup Requests</h2>
          <Link href="/pickup" className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
            + New
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="py-12 text-center px-4">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-muted-foreground text-sm mb-4">Koi pickup request nahi abhi.</p>
            <Link href="/pickup" className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
              Pehla Pickup Schedule Karo →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map(o => (
              <div key={o.id} className="flex items-start gap-3 px-5 py-4 hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{o.trash_types.join(", ")}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_CHIP[o.status] ?? STATUS_CHIP.pending}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{o.address}</div>
                  {o.notes && <div className="text-xs text-muted-foreground mt-0.5 italic">{o.notes}</div>}
                </div>
                <div className="text-right flex-shrink-0 text-xs text-muted-foreground">
                  {o.scheduled_date
                    ? new Date(o.scheduled_date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })
                    : formatDate(o.created_at)}
                  {o.xp_awarded ? (
                    <div className="text-primary font-bold tabular-nums mt-1">+{o.xp_awarded} XP</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <h2 className="text-sm font-semibold tracking-tight">Pickup History</h2>
          <span className="text-xs text-muted-foreground">{pickups.length} completed</span>
        </div>
        {pickups.length === 0 ? (
          <div className="py-12 text-center px-4">
            <div className="text-4xl mb-3">♻️</div>
            <p className="text-muted-foreground text-sm">Abhi tak koi pickup nahi.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pickups.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors">
                <div className="size-10 bg-accent rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {SCRAP_EMOJI[p.type] || "♻️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{p.type} — {p.kg} kg</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {formatDate(p.created_at)}{p.note ? ` · ${p.note}` : ""}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-primary tabular-nums">+{p.xp} XP</div>
                  <div className="text-xs text-muted-foreground tabular-nums">Rs. {p.cash}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rewards Tab ──────────────────────────────────────────────────────────────

function RewardsTab({
  profile, partners, coupons, expandedPartner, setExpandedPartner,
  redeemingItem, redeemItem, redeemMsg,
}: {
  profile: Profile; partners: Partner[]; coupons: Coupon[];
  expandedPartner: string | null; setExpandedPartner: (id: string | null) => void;
  redeemingItem: string | null; redeemItem: (id: string) => void;
  redeemMsg: { type: "ok" | "err"; text: string } | null;
}) {
  const activeCoupons = coupons.filter(c => c.status === "active" && new Date(c.expires_at) > new Date()).length;

  return (
    <div className="space-y-5">
      {/* Balance row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card shadow-card px-4 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Available XP</p>
            <p className="text-2xl font-black tabular-nums text-primary">{profile.xp.toLocaleString()}</p>
          </div>
          <div className="size-10 bg-accent rounded-xl flex items-center justify-center text-xl flex-shrink-0">⚡</div>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-card px-4 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Active Coupons</p>
            <p className="text-2xl font-black tabular-nums">{activeCoupons}</p>
          </div>
          <div className="size-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🎟️</div>
        </div>
      </div>

      {redeemMsg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
          redeemMsg.type === "ok"
            ? "bg-accent/50 text-accent-foreground border-primary/20"
            : "bg-red-50 text-red-600 border-red-100"
        }`}>
          {redeemMsg.type === "ok" ? "✅ " : "❌ "}{redeemMsg.text}
        </div>
      )}

      {/* Partner deals */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <h2 className="text-sm font-semibold tracking-tight">Partner Deals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Spend XP to get exclusive coupons</p>
        </div>
        {partners.length === 0 ? (
          <div className="py-10 text-center px-4">
            <div className="text-3xl mb-2">🏪</div>
            <p className="text-sm text-muted-foreground">Partner deals coming soon!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {partners.map(partner => {
              const isOpen = expandedPartner === partner.id;
              return (
                <div key={partner.id}>
                  <button
                    onClick={() => setExpandedPartner(isOpen ? null : partner.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className="size-11 bg-accent rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {partner.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{partner.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {partner.city ? `${partner.city} · ` : ""}
                        {partner.items?.length || 0} deal{(partner.items?.length ?? 0) !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <span className="text-muted-foreground text-xs flex-shrink-0">{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 py-3 space-y-2.5" style={{ background: "hsl(var(--muted) / 0.35)", borderTop: "1px solid hsl(var(--border))" }}>
                      {(partner.items ?? []).map((item: PartnerItem & { points_required?: number }) => {
                        const pts = item.points_required ?? itemPointsCost(item.price_pkr);
                        const canAfford = profile.xp >= pts;
                        return (
                          <div key={item.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</div>
                              )}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="text-xs font-bold text-primary tabular-nums">{pts.toLocaleString()} XP</span>
                                <span className="text-xs text-muted-foreground">Rs. {item.price_pkr}</span>
                                <span className="text-muted-foreground/30 text-xs">·</span>
                                <span className="text-xs text-muted-foreground">Valid {item.expiry_days}d</span>
                              </div>
                            </div>
                            <button
                              onClick={() => redeemItem(item.id)}
                              disabled={!canAfford || redeemingItem === item.id}
                              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                canAfford
                                  ? "bg-primary text-primary-foreground hover:opacity-90"
                                  : "bg-muted text-muted-foreground cursor-not-allowed"
                              }`}
                            >
                              {redeemingItem === item.id ? "..." : canAfford ? "Redeem" : "Need more XP"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My coupons */}
      {coupons.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <h2 className="text-sm font-semibold tracking-tight">My Coupons</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Show the code at the partner location</p>
          </div>
          <div className="divide-y divide-border">
            {coupons.map(c => {
              const expired = c.status === "expired" || new Date(c.expires_at) < new Date();
              const used = c.status === "used";
              return (
                <div key={c.id} className={`px-5 py-4 ${used || expired ? "opacity-50" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="size-10 bg-accent rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {(c.partner as Partner & { emoji?: string })?.emoji || "🎁"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{(c.item as PartnerItem | null)?.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          used    ? "bg-muted text-muted-foreground" :
                          expired ? "bg-red-50 text-red-500" :
                                    "bg-accent text-accent-foreground"
                        }`}>
                          {used ? "Used" : expired ? "Expired" : "Active"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{(c.partner as Partner | null)?.name}</div>
                      <div className="mt-2 bg-muted/60 border border-border rounded-lg px-3 py-2 font-mono text-xs font-bold text-foreground tracking-widest select-all">
                        {c.code}
                      </div>
                      {!used && !expired && (
                        <div className="text-xs text-muted-foreground mt-1.5">
                          Valid until {new Date(c.expires_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Level Up Tab ─────────────────────────────────────────────────────────────

function LevelUpTab({ profile, lvl, pct, nextXP }: {
  profile: Profile; lvl: number; pct: number; nextXP: number | null;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-primary text-primary-foreground px-5 py-5 relative overflow-hidden">
        <div className="absolute w-52 h-52 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)", top: "-5rem", right: "-3rem" }} />
        <div className="relative">
          <p className="text-primary-foreground/60 text-sm mb-1">Current Level</p>
          <h1 className="text-3xl font-black tracking-tight">Lvl {lvl} — {getLevelName(profile.xp)}</h1>
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-sm text-primary-foreground/60">
              <span>{profile.xp.toLocaleString()} XP earned</span>
              <span>{nextXP ? `${nextXP.toLocaleString()} XP next level` : "Max level reached!"}</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.18)" }}>
              <div className="h-full rounded-full bg-primary-foreground transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-primary-foreground/40 text-xs">{Math.round(pct)}% through level {lvl}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <h2 className="text-sm font-semibold tracking-tight">Level Roadmap</h2>
        </div>
        <div className="p-4 space-y-2">
          {LEVELS.map(([l, name, xpReq]) => {
            const reached = lvl >= l;
            const isCurrent = lvl === l;
            return (
              <div
                key={l}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isCurrent ? "border border-primary/20 bg-accent/60" : reached ? "opacity-40" : ""}`}
              >
                <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {l}
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{name}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      You are here
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">{xpReq.toLocaleString()} XP</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Utility screens ──────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">♻️</div>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

function PendingScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="rounded-2xl border border-border bg-card shadow-card p-10 max-w-sm w-full text-center">
        <div className="size-16 bg-amber-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">⏳</div>
        <h2 className="text-2xl font-black mb-2">Approval ka wait karo</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          Aapka account register ho gaya! theKabari team aapko jald hi approve kar degi.
        </p>
        <p className="text-muted-foreground/60 text-xs mb-6">Usually 24 ghante mein approve hota hai.</p>
        <button onClick={onLogout} className="px-6 py-2.5 rounded-full border border-border text-sm font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors">
          ← Wapis Jao
        </button>
      </div>
    </div>
  );
}

function RejectedScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="rounded-2xl border border-border bg-card shadow-card p-10 max-w-sm w-full text-center">
        <div className="size-16 bg-red-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">❌</div>
        <h2 className="text-2xl font-black mb-2">Account Reject Ho Gaya</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Aapka account reject ho gaya hai. Contact karo: hello@thekabari.pk
        </p>
        <button onClick={onLogout} className="px-6 py-2.5 rounded-full border border-border text-sm font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors">
          ← Logout
        </button>
      </div>
    </div>
  );
}
