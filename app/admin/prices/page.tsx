"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ScrapRate {
  slug: string;
  name: string;
  emoji: string;
  rate_pkr: number;
  hot: boolean;
}

const INPUT_CLS = "w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors tabular-nums";
const LABEL_CLS = "block text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";

const DEFAULT_RATES: ScrapRate[] = [
  { slug: "paper",       name: "Paper",       emoji: "📄", rate_pkr: 9,   hot: false },
  { slug: "cardboard",   name: "Cardboard",   emoji: "📦", rate_pkr: 12,  hot: false },
  { slug: "plastic",     name: "Plastic",     emoji: "🧴", rate_pkr: 22,  hot: false },
  { slug: "metal",       name: "Metal",       emoji: "🔩", rate_pkr: 47,  hot: true  },
  { slug: "aluminum",    name: "Aluminum",    emoji: "⚙️", rate_pkr: 110, hot: true  },
  { slug: "copper",      name: "Copper",      emoji: "🔌", rate_pkr: 450, hot: true  },
  { slug: "electronics", name: "Electronics", emoji: "💻", rate_pkr: 60,  hot: false },
  { slug: "glass",       name: "Glass",       emoji: "🫙", rate_pkr: 4,   hot: false },
];

export default function PricesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rates, setRates] = useState<ScrapRate[]>(DEFAULT_RATES);
  const [xpPerRupee, setXpPerRupee] = useState("1");
  const [tablesMissing, setTablesMissing] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3500); }

  useEffect(() => {
    fetch("/api/admin/prices").then(async r => {
      if (r.status === 401) { router.push("/auth"); return; }
      if (r.status === 403) { router.push("/dashboard"); return; }
      const data = await r.json();
      if (data.tablesMissing) {
        setTablesMissing(true);
        setRates(DEFAULT_RATES);
        setXpPerRupee("1");
      } else {
        setRates(data.rates ?? DEFAULT_RATES);
        setXpPerRupee(String(data.xp_per_rupee ?? 1));
      }
      setLoading(false);
    });
  }, [router]);

  function updateRate(slug: string, field: keyof ScrapRate, value: string | boolean | number) {
    setRates(rs => rs.map(r => r.slug === slug ? { ...r, [field]: value } : r));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/prices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rates, xp_per_rupee: parseFloat(xpPerRupee) || 1 }),
    });
    setSaving(false);
    if (res.ok) {
      setTablesMissing(false);
      showToast("Rates saved! Landing page aur requests pe reflect ho jayenge ✓");
    } else {
      const d = await res.json().catch(() => null);
      showToast(d?.error || "Save failed — DB tables missing? Check migration.");
    }
  }

  if (loading) return <div className="py-20 text-center"><div className="text-4xl animate-spin">♻️</div></div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold z-50 shadow-elevated">
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Scrap Rates & XP</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Yahan set karo — cash auto-calculate hoga completion pe, XP bhi automatically milega
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-sm font-bold transition-all disabled:opacity-60">
          {saving ? "Saving..." : "Save Rates ✓"}
        </button>
      </div>

      {tablesMissing && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
          <p className="font-bold mb-1">⚠️ DB tables missing</p>
          <p className="text-xs">
            <code className="font-mono">scrap_rates</code> aur <code className="font-mono">settings</code> tables nahi bani abhi.
            Neeche SQL run karo Supabase SQL editor mein, phir yahan rates save karo:
          </p>
          <pre className="mt-2 text-[11px] bg-amber-100 rounded-lg p-3 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">{`CREATE TABLE IF NOT EXISTS scrap_rates (
  slug text PRIMARY KEY,
  name text NOT NULL,
  emoji text NOT NULL,
  rate_pkr numeric NOT NULL DEFAULT 0,
  hot boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
-- Also for partner portal passwords:
ALTER TABLE partners ADD COLUMN IF NOT EXISTS portal_password_hash text;`}</pre>
        </div>
      )}

      {/* XP Setting */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <p className="font-bold text-sm">XP per Rupee</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Har 1 Rs. cash pe kitna XP milega. Example: 1.5 = Rs. 100 → 150 XP
            </p>
          </div>
          <div className="w-40">
            <label className={LABEL_CLS}>XP / Re. 1</label>
            <input
              type="number" min="0.01" step="0.01" value={xpPerRupee}
              onChange={e => setXpPerRupee(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div className="bg-accent/60 border border-primary/20 rounded-xl px-4 py-3 self-end">
            <p className="text-xs text-muted-foreground">Preview</p>
            <p className="font-black text-base tabular-nums">
              Rs. 100 → {Math.floor(100 * (parseFloat(xpPerRupee) || 0))} XP
            </p>
          </div>
        </div>
      </div>

      {/* Rates Table */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}>
          <p className="font-bold text-sm">Scrap Rates (Rs./kg)</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Yeh rates pickup completion pe auto-calculation ke liye use honge
          </p>
        </div>
        <div className="divide-y divide-border">
          {rates.map(rate => (
            <div key={rate.slug} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <div className="size-10 bg-accent/50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {rate.emoji}
              </div>
              <div className="w-28 flex-shrink-0">
                <p className="font-semibold text-sm">{rate.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{rate.slug}</p>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className={LABEL_CLS}>Rate (Rs./kg)</label>
                <input
                  type="number" min="0" step="0.5" value={rate.rate_pkr}
                  onChange={e => updateRate(rate.slug, "rate_pkr", parseFloat(e.target.value) || 0)}
                  className={INPUT_CLS}
                />
              </div>
              <div className="flex-shrink-0">
                <label className={LABEL_CLS}>Hot deal</label>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <div
                    onClick={() => updateRate(rate.slug, "hot", !rate.hot)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${rate.hot ? "bg-primary" : "bg-muted border border-border"}`}
                  >
                    <div className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${rate.hot ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{rate.hot ? "🔥 Hot" : "—"}</span>
                </label>
              </div>
              <div className="text-right flex-shrink-0 text-xs text-muted-foreground tabular-nums">
                {parseFloat(xpPerRupee) > 0 && rate.rate_pkr > 0 ? (
                  <>
                    <p className="font-semibold">1 kg → Rs. {rate.rate_pkr}</p>
                    <p>→ {Math.floor(rate.rate_pkr * parseFloat(xpPerRupee))} XP</p>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-sm font-bold transition-all disabled:opacity-60">
          {saving ? "Saving..." : "Save All Rates ✓"}
        </button>
      </div>
    </div>
  );
}
