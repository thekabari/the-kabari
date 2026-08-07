"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/types";

interface ScrapRate { slug: string; name: string; emoji: string; rate_pkr: number; }

const FALLBACK_TYPES = ["Paper", "Cardboard", "Plastic", "Metal", "Aluminum", "Copper", "Electronics", "Glass"];
const INPUT_CLS = "w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors";
const LABEL_CLS = "block text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";

export default function AddXPPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState<Profile[]>([]);
  const [rates, setRates] = useState<ScrapRate[]>([]);
  const [xpPerRupee, setXpPerRupee] = useState(1);
  const [toast, setToast] = useState("");

  const [userId, setUserId] = useState("");
  const [type, setType] = useState("Paper");
  const [kg, setKg] = useState("");
  const [cash, setCash] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  useEffect(() => {
    Promise.all([fetch("/api/admin"), fetch("/api/rates")]).then(async ([adminRes, ratesRes]) => {
      if (adminRes.status === 401) { router.push("/auth"); return; }
      if (adminRes.status === 403) { router.push("/dashboard"); return; }
      const [adminData, ratesData] = await Promise.all([adminRes.json(), ratesRes.json()]);
      setApproved((adminData.profiles ?? []).filter((p: Profile) => p.status === "approved" && p.role === "user"));
      setRates(ratesData.rates ?? []);
      setXpPerRupee(ratesData.xp_per_rupee ?? 1);
      setLoading(false);
    });
  }, [router]);

  const availableTypes = rates.length > 0 ? rates.map(r => r.name) : FALLBACK_TYPES;

  function rateForType(t: string): number {
    return rates.find(r => r.name.toLowerCase() === t.toLowerCase())?.rate_pkr ?? 0;
  }

  function handleTypeChange(t: string) {
    setType(t);
    if (kg) {
      const rate = rates.find(r => r.name.toLowerCase() === t.toLowerCase())?.rate_pkr ?? 0;
      setCash(rate ? (parseFloat(kg) * rate).toFixed(0) : "");
    }
  }

  function handleKgChange(v: string) {
    setKg(v);
    const rate = rateForType(type);
    setCash(v && rate ? (parseFloat(v) * rate).toFixed(0) : "");
  }

  const xpPreview = cash ? Math.floor(parseFloat(cash) * xpPerRupee) : 0;
  const rateDisplay = rateForType(type);

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
    showToast("Pickup record ho gaya! ✓");
  }

  if (loading) return <div className="py-20 text-center"><div className="text-4xl animate-spin">♻️</div></div>;

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold z-50 shadow-elevated">
          {toast}
        </div>
      )}
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
            <select value={type} onChange={e => handleTypeChange(e.target.value)} className={INPUT_CLS}>
              {availableTypes.map(t => (
                <option key={t} value={t}>{t}{rateForType(t) ? ` · Rs. ${rateForType(t)}/kg` : ""}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Weight (kg)</label>
              <input type="number" value={kg} onChange={e => handleKgChange(e.target.value)} min="0.1" step="0.1" placeholder="e.g. 5" className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Cash paid (Rs.) {rateDisplay > 0 && <span className="normal-case font-normal text-muted-foreground">— auto from rate</span>}</label>
              <input type="number" value={cash} onChange={e => setCash(e.target.value)} min="0" placeholder={rateDisplay ? `auto (Rs. ${rateDisplay}/kg)` : "e.g. 90"} className={INPUT_CLS} />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Note (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Ghar se pickup, Gulshan" className={INPUT_CLS} />
          </div>
          {(kg || cash) && (
            <div className="bg-accent/60 border border-primary/20 rounded-xl px-4 py-3 text-sm text-accent-foreground font-semibold">
              {kg && rateDisplay > 0 && <span>{kg} kg × Rs. {rateDisplay}/kg = Rs. {Math.round(parseFloat(kg) * rateDisplay)} → </span>}
              {xpPreview > 0 ? <span>+{xpPreview} XP milega 🎉</span> : <span>Cash enter karo XP preview ke liye</span>}
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
