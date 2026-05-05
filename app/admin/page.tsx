"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile, Pickup, Order } from "@/types";
import { getLevel, getLevelName, formatDate, SCRAP_EMOJI, XP_RATES } from "@/lib/utils";

type Tab = "overview" | "pending" | "requests" | "users" | "addxp";

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

  const pending = profiles.filter(p => p.status === "pending" && p.role === "user");
  const approved = profiles.filter(p => p.status === "approved" && p.role === "user");

  const pendingOrders = orders.filter(o => o.status === "pending");

  const navItems: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: "overview",  label: "Overview",  icon: "📊" },
    { id: "requests",  label: "Requests",  icon: "📦", badge: pendingOrders.length },
    { id: "pending",   label: "Approvals", icon: "⏳", badge: pending.length },
    { id: "users",     label: "All Users", icon: "👥" },
    { id: "addxp",     label: "Add XP",    icon: "➕" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3 animate-spin">♻️</div><p className="text-gray-400 text-sm">Loading admin panel...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-900 text-white px-5 py-3 rounded-2xl text-sm font-semibold z-50 shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-gray-50">
          <div className="font-black text-green-900 text-lg">theKabari</div>
          <div className="text-xs text-gray-400 mt-0.5">Admin Panel</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                tab === item.id ? "bg-green-50 text-green-700 font-semibold" : "text-gray-500 hover:bg-gray-50"
              }`}>
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-50">
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            ← Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Overview 📊</h1>
            <p className="text-gray-400 text-sm mb-6">Aaj ka summary</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { n: approved.length, l: "Approved users", green: true },
                { n: pending.length, l: "Pending requests" },
                { n: `${approved.reduce((a, u) => a + Number(u.total_kg), 0).toFixed(0)} kg`, l: "Total kg collected" },
                { n: pickups.length, l: "Total pickups" },
              ].map(s => (
                <div key={s.l} className={`${s.green ? "bg-green-400" : "bg-white"} rounded-2xl border border-gray-100 p-4`}>
                  <div className={`text-2xl font-black tracking-tight ${s.green ? "text-white" : "text-gray-900"}`}>{s.n}</div>
                  <div className={`text-xs mt-1 ${s.green ? "text-white/70" : "text-gray-400"}`}>{s.l}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50"><h2 className="font-black text-sm">Recent Activity</h2></div>
              {pickups.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">Koi activity nahi abhi</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pickups.slice(0, 10).map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                      <span className="text-lg">{SCRAP_EMOJI[p.type] || "♻️"}</span>
                      <div className="flex-1">
                        <span className="font-semibold">{p.user_name}</span>
                        <span className="text-gray-400"> · {p.type} · {p.kg} kg</span>
                      </div>
                      <span className="text-green-600 font-bold">+{p.xp} XP</span>
                      <span className="text-gray-400 text-xs hidden md:block">{formatDate(p.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PENDING */}
        {tab === "pending" && (
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Pending Requests ⏳</h1>
            <p className="text-gray-400 text-sm mb-6">Naaye users ko approve ya reject karo</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {pending.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-sm">Koi pending request nahi</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pending.map(u => (
                    <div key={u.id} className="flex items-center gap-4 px-5 py-4 flex-wrap">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center font-black text-green-700 flex-shrink-0">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{u.name}</div>
                        <div className="text-xs text-gray-400 truncate">{u.phone} · {u.city} · {formatDate(u.created_at)}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approveUser(u.id)}
                          className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-400 hover:text-white rounded-full text-xs font-bold transition-colors">
                          ✓ Approve
                        </button>
                        <button onClick={() => rejectUser(u.id)}
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
        )}

        {/* ALL USERS */}
        {tab === "users" && (
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">All Users 👥</h1>
            <p className="text-gray-400 text-sm mb-6">Saare approved users aur unki stats</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {approved.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-sm">Koi approved user nahi abhi</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3 text-left">User</th>
                        <th className="px-5 py-3 text-left">City</th>
                        <th className="px-5 py-3 text-left">Level</th>
                        <th className="px-5 py-3 text-right">XP</th>
                        <th className="px-5 py-3 text-right">Kg</th>
                        <th className="px-5 py-3 text-right">Cash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {approved.sort((a, b) => b.xp - a.xp).map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold">{u.name}</div>
                            <div className="text-xs text-gray-400">{u.phone}</div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500">{u.city}</td>
                          <td className="px-5 py-3.5">
                            <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full">
                              Lvl {getLevel(u.xp)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-green-600">{u.xp}</td>
                          <td className="px-5 py-3.5 text-right text-gray-500">{Number(u.total_kg).toFixed(1)}</td>
                          <td className="px-5 py-3.5 text-right text-gray-500">Rs.{u.total_cash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADD XP */}
        {tab === "requests" && (
          <RequestsTab orders={orders} onUpdate={() => { loadAll(); }} showToast={showToast} />
        )}

        {tab === "addxp" && (
          <AddXPTab approved={approved} onSuccess={() => { showToast("Pickup record ho gaya! ✓"); loadAll(); }} />
        )}

      </main>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 z-50">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 relative ${tab === item.id ? "text-green-600" : "text-gray-400"}`}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-semibold">{item.label}</span>
            {item.badge ? <span className="absolute top-0 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{item.badge}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

const STATUS_FILTERS = ["all", "pending", "dispatched", "completed", "cancelled"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function RequestsTab({ orders, onUpdate, showToast }: {
  orders: Order[];
  onUpdate: () => void;
  showToast: (msg: string) => void;
}) {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [completing, setCompleting] = useState<number | null>(null);
  const [completeForm, setCompleteForm] = useState({ weight_kg: "", cash_paid: "", xp_awarded: "", trash_type: "" });

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

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

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-green-400 transition-colors";

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight mb-1">Pickup Requests 📦</h1>
      <p className="text-gray-400 text-sm mb-5">Saare pickup requests manage karo</p>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1 scrollbar-hide">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize whitespace-nowrap flex-shrink-0 ${
              filter === s ? "bg-green-400 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-green-300"
            }`}>
            {s === "all" ? `All (${orders.length})` :
             s === "pending"    ? `⏳ Pending (${orders.filter(o=>o.status==="pending").length})` :
             s === "dispatched" ? `🚚 Dispatched (${orders.filter(o=>o.status==="dispatched").length})` :
             s === "completed"  ? `✅ Completed (${orders.filter(o=>o.status==="completed").length})` :
                                  `❌ Cancelled (${orders.filter(o=>o.status==="cancelled").length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">Koi request nahi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start gap-4 flex-wrap">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      o.status === "pending"    ? "bg-amber-50 text-amber-600" :
                      o.status === "dispatched" ? "bg-blue-50 text-blue-600"  :
                      o.status === "completed"  ? "bg-green-50 text-green-600":
                                                  "bg-red-50 text-red-400"
                    }`}>
                      {o.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {(o as Order & { pickup_type?: string }).pickup_type === "regular" ? "👤 Member" : "🎟️ One-Time"}
                    </span>
                    <span className="text-xs text-gray-400">#{o.id}</span>
                  </div>
                  <p className="font-bold text-sm">{o.user_name}</p>
                  <p className="text-xs text-gray-500">{(o as Order & { phone?: string }).phone} · {o.user_city}</p>
                  <p className="text-xs text-gray-400 mt-1 truncate">📍 {o.address}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {o.trash_types.map(t => (
                      <span key={t} className="text-[10px] bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5 font-medium">{t}</span>
                    ))}
                  </div>
                  {o.notes && <p className="text-xs text-gray-400 mt-1 italic">"{o.notes}"</p>}
                  {o.scheduled_date && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      📅 {new Date(o.scheduled_date).toLocaleDateString("en-PK", { weekday:"short", day:"numeric", month:"short" })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {o.status === "pending" && (
                    <>
                      <button onClick={() => patchOrder(o.id, "dispatch")}
                        className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-full text-xs font-bold transition-colors">
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
                      <button onClick={() => setCompleting(o.id)}
                        className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-full text-xs font-bold transition-colors">
                        ✓ Complete
                      </button>
                      <button onClick={() => patchOrder(o.id, "cancel")}
                        className="px-4 py-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-full text-xs font-bold transition-colors">
                        ✗ Cancel
                      </button>
                    </>
                  )}
                  {o.status === "completed" && (
                    <div className="text-right text-xs text-gray-400">
                      {o.weight_kg && <div>{o.weight_kg} kg</div>}
                      {o.cash_paid  && <div>Rs. {o.cash_paid}</div>}
                      {o.xp_awarded && <div className="text-green-600 font-bold">+{o.xp_awarded} XP</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Complete Form (inline) */}
              {completing === o.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Pickup Complete Karo</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Weight (kg)</label>
                      <input type="number" min="0" step="0.5" placeholder="e.g. 5"
                        value={completeForm.weight_kg}
                        onChange={e => setCompleteForm(f => ({ ...f, weight_kg: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Cash (Rs.)</label>
                      <input type="number" min="0" placeholder="e.g. 150"
                        value={completeForm.cash_paid}
                        onChange={e => setCompleteForm(f => ({ ...f, cash_paid: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">XP Awarded</label>
                      <input type="number" min="0" placeholder="e.g. 40"
                        value={completeForm.xp_awarded}
                        onChange={e => setCompleteForm(f => ({ ...f, xp_awarded: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Main Type</label>
                      <select value={completeForm.trash_type}
                        onChange={e => setCompleteForm(f => ({ ...f, trash_type: e.target.value }))}
                        className={inputCls}>
                        <option value="">Auto</option>
                        {o.trash_types.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => patchOrder(o.id, "complete", { ...completeForm })}
                      className="px-5 py-2 bg-green-400 hover:bg-green-900 text-white rounded-full text-xs font-bold transition-colors">
                      Confirm Complete ✓
                    </button>
                    <button onClick={() => setCompleting(null)}
                      className="px-5 py-2 border border-gray-200 text-gray-500 rounded-full text-xs font-semibold hover:border-red-200 hover:text-red-400 transition-colors">
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

function AddXPTab({ approved, onSuccess }: {
  approved: Profile[];
  onSuccess: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [type, setType] = useState("Paper");
  const [kg, setKg] = useState("");
  const [cash, setCash] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const xpPreview = kg && type ? Math.round(parseFloat(kg) * (XP_RATES[type] || 0)) : 0;
  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { setError("User chunein"); return; }
    if (!kg || parseFloat(kg) <= 0) { setError("Weight dalen"); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/admin/pickup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, type, kg, cash, note }),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error || "Failed to record pickup"); setLoading(false); return; }

    setUserId(""); setKg(""); setCash(""); setNote("");
    setLoading(false);
    onSuccess();
  }

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight mb-1">Add XP / Pickup ➕</h1>
      <p className="text-gray-400 text-sm mb-6">Kisi user ka pickup record karo aur XP do</p>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg">
        {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>User chunein</label>
            <select value={userId} onChange={e => setUserId(e.target.value)} className={inputCls}>
              <option value="">-- User chunein --</option>
              {approved.map(u => <option key={u.id} value={u.id}>{u.name} — {u.city}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Scrap type</label>
            <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
              {Object.entries(XP_RATES).map(([t, r]) => (
                <option key={t} value={t}>{t} (+{r} XP/kg)</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Weight (kg)</label>
              <input type="number" value={kg} onChange={e => setKg(e.target.value)} min="0.5" step="0.5" placeholder="e.g. 5" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cash paid (Rs.)</label>
              <input type="number" value={cash} onChange={e => setCash(e.target.value)} min="0" placeholder="e.g. 90" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Note (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Ghar se pickup, Gulshan" className={inputCls} />
          </div>

          {xpPreview > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 font-semibold">
              {kg} kg {type} = +{xpPreview} XP milega 🎉
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-green-400 hover:bg-green-900 text-white py-3 rounded-full font-bold text-sm transition-colors disabled:opacity-60">
            {loading ? "Recording..." : "Pickup Record Karo ✓"}
          </button>
        </form>
      </div>
    </div>
  );
}
