"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Partner, PartnerItem } from "@/types";
import { itemPointsCost } from "@/lib/utils";

type PartnerWithItems = Partner & { items?: (PartnerItem & { points_required: number })[]; has_password?: boolean };

const INPUT_CLS = "w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors";
const LABEL_CLS = "block text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";

export default function PartnersPage() {
  const router = useRouter();
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
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function loadPartners() {
    const res = await fetch("/api/admin/partners");
    if (res.status === 401) { router.push("/auth"); return; }
    if (res.status === 403) { router.push("/dashboard"); return; }
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

  useEffect(() => { loadPartners(); }, []);

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
      const d = await res.json().catch(() => null);
      showToast(d?.error || "Failed to add item");
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

  if (loading) return <div className="py-20 text-center"><div className="text-4xl animate-spin">♻️</div></div>;

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold z-50 shadow-elevated">
          {toast}
        </div>
      )}

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
                      <a href={`/business/${partner.portal_slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary/70 hover:text-primary underline decoration-dotted transition-colors">
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
                          className="text-xs px-3 py-1.5 border border-border rounded-full text-muted-foreground hover:border-primary/40 transition-colors flex-shrink-0">
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
                            className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-bold transition-all disabled:opacity-50 flex-shrink-0">
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
                              placeholder="Free Coffee" className={INPUT_CLS} required />
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
                        {(partner.items ?? []).map(item => (
                          <div key={item.id} className={`bg-card rounded-xl border border-border p-3 flex items-center gap-3 ${!item.active ? "opacity-50" : ""}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm">{item.name}</span>
                                {!item.active && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>}
                              </div>
                              {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                              <div className="flex gap-3 mt-1 text-xs">
                                <span className="font-bold text-primary tabular-nums">{(item as typeof item & { points_required?: number }).points_required?.toLocaleString()} XP</span>
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
