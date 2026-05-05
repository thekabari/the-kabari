"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TRASH_TYPES = [
  { id: "Paper",       emoji: "📰", label: "Paper" },
  { id: "Plastic",     emoji: "🧴", label: "Plastic" },
  { id: "Metal",       emoji: "🔧", label: "Metal" },
  { id: "Electronics", emoji: "💻", label: "Electronics" },
  { id: "Glass",       emoji: "🫙", label: "Glass" },
  { id: "Cardboard",   emoji: "📦", label: "Cardboard" },
  { id: "Other",       emoji: "🗑️", label: "Other" },
];

const CITIES = ["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Peshawar","Quetta"];

interface SessionUser { id: string; name: string; email: string; role: string; }

export default function PickupPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [name, setName]               = useState("");
  const [phone, setPhone]             = useState("");
  const [city, setCity]               = useState("");
  const [address, setAddress]         = useState("");
  const [trashTypes, setTrashTypes]   = useState<string[]>([]);
  const [notes, setNotes]             = useState("");
  const [date, setDate]               = useState("");

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState<{ id: number } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(user => {
        if (user) {
          setSession(user);
          setName(user.name || "");
          setPhone(user.phone || "");
          setCity(user.city || "");
        }
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  function toggleType(t: string) {
    setTrashTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trashTypes.length) { setError("Kam az kam ek trash type chunein"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, city, address, trash_types: trashTypes, notes, scheduled_date: date || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to submit"); return; }
      setSuccess({ id: data.id });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide uppercase";

  if (checkingAuth) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-4xl animate-spin">♻️</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-black text-green-900 text-lg">theKabari ♻️</Link>
        <div className="flex gap-3">
          {session ? (
            <Link href="/dashboard" className="px-4 py-2 rounded-full bg-green-400 text-white text-sm font-semibold hover:bg-green-900 transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth" className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold hover:border-green-400 transition-all">Login</Link>
              <Link href="/auth?tab=signup" className="px-4 py-2 rounded-full bg-green-400 text-white text-sm font-semibold hover:bg-green-900 transition-colors">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10">

        {/* Success State */}
        {success ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">✅</div>
            <h2 className="text-2xl font-black mb-2">Pickup Schedule Ho Gaya!</h2>
            <p className="text-gray-400 text-sm mb-2">Aapki request record ho gayi hai.</p>
            <div className="inline-block bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-mono text-gray-500 mb-6">
              Request #{success.id}
            </div>
            <p className="text-gray-400 text-xs mb-8">
              Hamare team member aapko jald hi contact karenge aur pickup confirm karenge.
            </p>
            <div className="flex flex-col gap-3">
              {session ? (
                <Link href="/dashboard" className="w-full bg-green-400 hover:bg-green-900 text-white py-3 rounded-full font-bold text-sm transition-colors text-center">
                  Dashboard Dekho →
                </Link>
              ) : (
                <Link href="/auth?tab=signup" className="w-full bg-green-400 hover:bg-green-900 text-white py-3 rounded-full font-bold text-sm transition-colors text-center">
                  Account Banao — XP Earn Karo ↗
                </Link>
              )}
              <button onClick={() => { setSuccess(null); setAddress(""); setTrashTypes([]); setNotes(""); setDate(""); }}
                className="w-full border border-gray-200 text-gray-500 py-3 rounded-full font-semibold text-sm hover:border-green-400 transition-colors">
                Naya Pickup Schedule Karo
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <span className="inline-block bg-green-50 border border-green-100 rounded-full px-4 py-1 text-xs font-bold text-green-600 mb-3">
                {session ? "Member Pickup 🌟" : "One-Time Pickup"}
              </span>
              <h1 className="text-3xl font-black tracking-tight mb-2">
                Pickup Schedule Karo ♻️
              </h1>
              <p className="text-gray-400 text-sm">
                {session
                  ? `Salam ${session.name}! Apna scrap pickup schedule karo aur XP earn karo.`
                  : "Scrap pickup ke liye form bharein. Account se aur bhi fayde milte hain!"}
              </p>
            </div>

            {/* Member badge */}
            {session && (
              <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-400 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0">
                  {session.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-green-900">{session.name}</p>
                  <p className="text-xs text-green-600">Member account — XP milega is pickup ke baad</p>
                </div>
              </div>
            )}

            {/* Guest prompt */}
            {!session && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-6 text-sm text-amber-700">
                💡 <Link href="/auth?tab=signup" className="font-bold underline">Account banao</Link> — pickup track karo, XP earn karo, aur leaderboard pe aao!
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 space-y-5">

              {/* Name */}
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Aapka naam" className={inputCls}
                  readOnly={!!session} required />
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls}>Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+92 300 1234567" className={inputCls}
                  readOnly={!!session && !!session.name} required />
              </div>

              {/* City */}
              <div>
                <label className={labelCls}>City</label>
                {session ? (
                  <div className={`${inputCls} text-gray-500`}>{city}</div>
                ) : (
                  <select value={city} onChange={e => setCity(e.target.value)} className={inputCls} required>
                    <option value="">City chunein</option>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                )}
              </div>

              {/* Address */}
              <div>
                <label className={labelCls}>Pickup Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Ghar ka pura address — gali, area, landmark"
                  className={`${inputCls} resize-none`} rows={2} required />
              </div>

              {/* Trash Types */}
              <div>
                <label className={labelCls}>Kya scrap hai? (multiple select kar sakte hain)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {TRASH_TYPES.map(t => (
                    <button key={t.id} type="button" onClick={() => toggleType(t.id)}
                      className={`flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl border text-xs font-semibold transition-all ${
                        trashTypes.includes(t.id)
                          ? "bg-green-50 border-green-400 text-green-700"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-green-200"
                      }`}>
                      <span className="text-xl">{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Date */}
              <div>
                <label className={labelCls}>Preferred Date (optional)</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={inputCls} />
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes (optional)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Koi bhi zaruri baat" className={inputCls} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-green-400 hover:bg-green-900 text-white py-3.5 rounded-full font-bold text-base transition-colors disabled:opacity-60">
                {loading ? "Submitting..." : "Pickup Schedule Karo ✓"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
