"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Profile, Pickup, Order } from "@/types";
import { getLevel, getLevelName, getLevelProgress, getNextLevelXP, formatDate, SCRAP_EMOJI } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const params = useSearchParams();
  const isPending = params.get("pending") === "true";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/dashboard");
      if (!res.ok) { router.push("/auth"); return; }
      const { profile: prof, pickups: picks, orders: ords } = await res.json();
      if (!prof) { router.push("/auth"); return; }
      if (prof.role === "admin") { router.push("/admin"); return; }
      setProfile(prof);
      setPickups(picks);
      setOrders(ords || []);
      setLoading(false);
    }
    load();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP NAV */}
      <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <span className="font-black text-green-900 text-lg">theKabari</span>
        <div className="flex items-center gap-4">
          <Link href="/leaderboard" className="text-sm text-gray-500 hover:text-green-600 font-medium transition-colors">
            🏆 Leaderboard
          </Link>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        {/* HERO CARD */}
        <div className="bg-green-900 rounded-3xl p-7 mb-6 text-white relative overflow-hidden">
          <div className="absolute w-40 h-40 rounded-full bg-white/5 -top-10 -right-10" />
          <div className="absolute w-24 h-24 rounded-full bg-white/5 bottom-4 left-4" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Salam,</p>
                <h1 className="text-2xl font-black tracking-tight">{profile.name} 👋</h1>
                <p className="text-white/60 text-sm mt-1">Level {lvl} — {getLevelName(profile.xp)}</p>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2 text-center">
                <div className="text-2xl font-black">{profile.xp}</div>
                <div className="text-white/50 text-xs">Total XP</div>
              </div>
            </div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-2">XP Progress to Level {lvl + 1}</p>
            <div className="bg-white/15 rounded-full h-2.5 mb-2 overflow-hidden">
              <div className="bg-white rounded-full h-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-white/40">
              <span>{profile.xp} XP</span>
              <span>{nextXP ? `Next level: ${nextXP} XP` : "🏆 Max Level!"}</span>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { n: profile.xp.toLocaleString(), l: "Total XP", c: "bg-green-400 text-white" },
            { n: `Lvl ${lvl}`, l: getLevelName(profile.xp), c: "bg-white" },
            { n: `${Number(profile.total_kg).toFixed(1)} kg`, l: "kg recycled", c: "bg-white" },
            { n: `Rs.${profile.total_cash}`, l: "Cash earned", c: "bg-white" },
          ].map(s => (
            <div key={s.l} className={`${s.c} rounded-2xl p-4 border border-gray-100`}>
              <div className={`text-2xl font-black tracking-tight ${s.c.includes("green") ? "text-white" : "text-gray-900"}`}>{s.n}</div>
              <div className={`text-xs mt-1 ${s.c.includes("green") ? "text-white/70" : "text-gray-400"}`}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* MY REQUESTS */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-black text-base">My Pickup Requests</h2>
            <Link href="/pickup"
              className="bg-green-400 hover:bg-green-900 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
              + Schedule Pickup
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <div className="text-3xl mb-3">📦</div>
              <p className="text-sm mb-4">Koi pickup request nahi abhi.</p>
              <Link href="/pickup"
                className="inline-block bg-green-400 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-green-900 transition-colors">
                Pehla Pickup Schedule Karo →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map(o => (
                <div key={o.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{o.trash_types.join(", ")}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.status === "pending"    ? "bg-amber-50 text-amber-600" :
                        o.status === "dispatched" ? "bg-blue-50 text-blue-600"  :
                        o.status === "completed"  ? "bg-green-50 text-green-600":
                                                    "bg-red-50 text-red-400"
                      }`}>
                        {o.status === "pending"    ? "⏳ Pending"    :
                         o.status === "dispatched" ? "🚚 On the way" :
                         o.status === "completed"  ? "✅ Completed"  : "❌ Cancelled"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{o.address}</div>
                  </div>
                  <div className="text-right flex-shrink-0 text-xs text-gray-400">
                    {o.scheduled_date
                      ? new Date(o.scheduled_date).toLocaleDateString("en-PK", { day:"numeric", month:"short" })
                      : formatDate(o.created_at)}
                    {o.xp_awarded ? <div className="text-green-600 font-bold">+{o.xp_awarded} XP</div> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT PICKUPS */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-black text-base">Recent Pickups</h2>
            <span className="text-xs text-gray-400">{pickups.length} total</span>
          </div>
          {pickups.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-4xl mb-3">♻️</div>
              <p className="text-sm">Abhi tak koi pickup nahi.<br/>Pehla quest shuru karo!</p>
              <Link href="/#contact" className="inline-block mt-4 bg-green-400 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-green-900 transition-colors">
                Pickup Schedule Karo ↗
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pickups.slice(0, 8).map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {SCRAP_EMOJI[p.type] || "♻️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{p.type} — {p.kg} kg</div>
                    <div className="text-xs text-gray-400 truncate">
                      {formatDate(p.created_at)}{p.note ? ` · ${p.note}` : ""}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-green-600">+{p.xp} XP</div>
                    <div className="text-xs text-gray-400">Rs. {p.cash}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LEVEL GUIDE */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-black text-base mb-4">Level Roadmap</h2>
          <div className="space-y-2">
            {[
              [1,"Starter","0 XP"],
              [2,"Collector","100 XP"],
              [3,"Recycler","250 XP"],
              [4,"Green Scout","500 XP"],
              [5,"Eco Warrior","900 XP"],
              [6,"City Hero","1500 XP"],
              [7,"Eco Legend","2500 XP"],
            ].map(([l, name, xpReq]) => (
              <div key={l} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${
                Number(l) === lvl ? "bg-green-50 border border-green-100" :
                Number(l) < lvl ? "opacity-40" : ""
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  Number(l) <= lvl ? "bg-green-400 text-white" : "bg-gray-100 text-gray-400"
                }`}>{l}</div>
                <div className="flex-1">
                  <span className="text-sm font-semibold">{name}</span>
                  {Number(l) === lvl && <span className="ml-2 text-xs bg-green-400 text-white px-2 py-0.5 rounded-full">Aap yahan hain</span>}
                </div>
                <span className="text-xs text-gray-400">{xpReq}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">♻️</div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function PendingScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-gray-100 p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">⏳</div>
        <h2 className="text-2xl font-black mb-2">Approval ka wait karo</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          Aapka account register ho gaya! theKabari team aapko jald hi approve kar degi.
        </p>
        <p className="text-gray-300 text-xs mb-6">Usually 24 ghante mein approve hota hai.</p>
        <button onClick={onLogout} className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-500 hover:border-red-200 hover:text-red-500 transition-colors">
          ← Wapis Jao
        </button>
      </div>
    </div>
  );
}

function RejectedScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-gray-100 p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">❌</div>
        <h2 className="text-2xl font-black mb-2">Account Reject Ho Gaya</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Aapka account reject ho gaya hai. Contact karo: hello@thekabari.pk
        </p>
        <button onClick={onLogout} className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-500 hover:border-red-200 hover:text-red-500 transition-colors">
          ← Logout
        </button>
      </div>
    </div>
  );
}
