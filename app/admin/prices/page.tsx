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

const INPUT_CLS = "w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors";
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

const BLANK_NEW: Omit<ScrapRate, "slug"> & { slug: string } = {
  slug: "", name: "", emoji: "♻️", rate_pkr: 0, hot: false,
};

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function PricesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rates, setRates] = useState<ScrapRate[]>(DEFAULT_RATES);
  const [xpPerRupee, setXpPerRupee] = useState("1");
  const [tablesMissing, setTablesMissing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRate, setNewRate] = useState({ ...BLANK_NEW });
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
      } else {
        // If DB is empty (rates were deleted), fall back to defaults so list isn't blank
        setRates(data.rates?.length ? data.rates : DEFAULT_RATES);
        setXpPerRupee(String(data.xp_per_rupee ?? 1));
      }
      setLoading(false);
    });
  }, [router]);

  function updateRate(slug: string, field: keyof ScrapRate, value: string | boolean | number) {
    setRates(rs => rs.map(r => r.slug === slug ? { ...r, [field]: value } : r));
  }

  function deleteRate(slug: string) {
    setRates(rs => rs.filter(r => r.slug !== slug));
  }

  function addRate(e: React.FormEvent) {
    e.preventDefault();
    const slug = newRate.slug || toSlug(newRate.name);
    if (!slug || !newRate.name) return;
    if (rates.some(r => r.slug === slug)) {
      showToast(`Slug "${slug}" already exists`);
      return;
    }
    setRates(rs => [...rs, { ...newRate, slug }]);
    setNewRate({ ...BLANK_NEW });
    setShowAddForm(false);
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
      showToast(d?.error || "Save failed — DB tables missing? Check migration below.");
    }
  }

  if (loading) return <div className="py-20 text-center"><div className="text-4xl animate-spin">♻️</div></div>;

  const xpMult = parseFloat(xpPerRupee) || 0;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold z-50 shadow-elevated">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Scrap Rates & XP</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Yahan set karo — cash auto-calculate hoga completion pe, XP bhi automatically milega
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setRates(DEFAULT_RATES); showToast("Defaults restored — Save karo to apply"); }}
            className="px-5 py-2.5 border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground rounded-full text-sm font-semibold transition-all">
            ↺ Restore Defaults
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-sm font-bold transition-all disabled:opacity-60">
            {saving ? "Saving..." : "Save Rates ✓"}
          </button>
        </div>
      </div>

      {tablesMissing && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
          <p className="font-bold mb-1">⚠️ DB tables missing</p>
          <p className="text-xs mb-2">
            <code className="font-mono">scrap_rates</code> aur <code className="font-mono">settings</code> tables nahi bani.
            Supabase SQL editor mein run karo:
          </p>
          <pre className="text-[11px] bg-amber-100 rounded-lg p-3 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">{`CREATE TABLE IF NOT EXISTS scrap_rates (
  slug text PRIMARY KEY, name text NOT NULL, emoji text NOT NULL,
  rate_pkr numeric NOT NULL DEFAULT 0, hot boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY, value text NOT NULL, updated_at timestamptz DEFAULT now()
);
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
              Rs. 100 → {Math.floor(100 * xpMult)} XP
            </p>
          </div>
        </div>
      </div>

      {/* Rates Table */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-2"
          style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}>
          <div>
            <p className="font-bold text-sm">Scrap Rates (Rs./kg)</p>
            <p className="text-xs text-muted-foreground mt-0.5">{rates.length} materials</p>
          </div>
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="px-4 py-1.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-bold transition-all">
            + Add Material
          </button>
        </div>

        {/* Add new rate form */}
        {showAddForm && (
          <form onSubmit={addRate}
            className="px-5 py-4 flex flex-wrap gap-3 items-end"
            style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--accent) / 0.4)" }}>
            <div className="w-16">
              <label className={LABEL_CLS}>Emoji</label>
              <input value={newRate.emoji} onChange={e => setNewRate(r => ({ ...r, emoji: e.target.value }))}
                placeholder="♻️" className={INPUT_CLS} />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className={LABEL_CLS}>Name *</label>
              <input value={newRate.name}
                onChange={e => setNewRate(r => ({ ...r, name: e.target.value, slug: toSlug(e.target.value) }))}
                placeholder="e.g. Rubber" className={INPUT_CLS} required />
            </div>
            <div className="w-32">
              <label className={LABEL_CLS}>Slug</label>
              <input value={newRate.slug} onChange={e => setNewRate(r => ({ ...r, slug: toSlug(e.target.value) }))}
                placeholder="auto" className={`${INPUT_CLS} font-mono text-xs`} />
            </div>
            <div className="w-32">
              <label className={LABEL_CLS}>Rate (Rs./kg) *</label>
              <input type="number" min="0" step="0.5" value={newRate.rate_pkr || ""}
                onChange={e => setNewRate(r => ({ ...r, rate_pkr: parseFloat(e.target.value) || 0 }))}
                placeholder="0" className={INPUT_CLS} required />
            </div>
            <div>
              <label className={LABEL_CLS}>Hot</label>
              <div
                onClick={() => setNewRate(r => ({ ...r, hot: !r.hot }))}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer mt-1 ${newRate.hot ? "bg-primary" : "bg-muted border border-border"}`}>
                <div className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${newRate.hot ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit"
                className="px-4 py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-bold transition-all">
                Add ✓
              </button>
              <button type="button" onClick={() => { setShowAddForm(false); setNewRate({ ...BLANK_NEW }); }}
                className="px-4 py-2.5 border border-border text-muted-foreground rounded-full text-xs font-semibold transition-colors hover:border-destructive/40 hover:text-destructive">
                Cancel
              </button>
            </div>
          </form>
        )}

        {rates.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-sm mb-3">Koi rates nahi. Defaults restore karo ya manually add karo.</p>
            <button
              onClick={() => { setRates(DEFAULT_RATES); showToast("Defaults loaded — Save karo to apply"); }}
              className="px-5 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-sm font-bold transition-all">
              ↺ Restore Defaults
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rates.map(rate => (
              <div key={rate.slug} className="flex items-center gap-3 px-5 py-3 flex-wrap">
                <div className="size-9 bg-accent/50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {rate.emoji}
                </div>
                <div className="w-24 flex-shrink-0">
                  <p className="font-semibold text-sm">{rate.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{rate.slug}</p>
                </div>
                <div className="flex-1 min-w-[110px]">
                  <label className={LABEL_CLS}>Rs./kg</label>
                  <input
                    type="number" min="0" step="0.5" value={rate.rate_pkr}
                    onChange={e => updateRate(rate.slug, "rate_pkr", parseFloat(e.target.value) || 0)}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="flex-shrink-0">
                  <label className={LABEL_CLS}>Hot</label>
                  <div
                    onClick={() => updateRate(rate.slug, "hot", !rate.hot)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer mt-1 ${rate.hot ? "bg-primary" : "bg-muted border border-border"}`}>
                    <div className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${rate.hot ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </div>
                {xpMult > 0 && rate.rate_pkr > 0 ? (
                  <div className="text-xs text-muted-foreground tabular-nums flex-shrink-0 text-right">
                    <p className="font-semibold text-foreground">Rs. {rate.rate_pkr}/kg</p>
                    <p>→ {Math.floor(rate.rate_pkr * xpMult)} XP/kg</p>
                  </div>
                ) : <div className="flex-shrink-0 w-20" />}
                <button
                  onClick={() => deleteRate(rate.slug)}
                  className="size-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                  title="Remove">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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
