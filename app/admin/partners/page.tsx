"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Partner } from "@/types";
import {
  PlusIcon, TrashIcon, ArrowPathIcon, BuildingStorefrontIcon,
  MapPinIcon, TagIcon, ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

type PartnerWithCount = Partner & { items?: { id: string }[]; has_password?: boolean };

const INPUT_CLS = "w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors";
const LABEL_CLS = "block text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<PartnerWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [addingPartner, setAddingPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", description: "", category: "cafe", emoji: "☕", city: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function loadPartners() {
    const res = await fetch("/api/admin/partners");
    if (res.status === 401) { router.push("/auth"); return; }
    if (res.status === 403) { router.push("/dashboard"); return; }
    if (res.ok) setPartners(await res.json());
    setLoading(false);
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
      showToast("Partner added");
      setShowAddPartner(false);
      setNewPartner({ name: "", description: "", category: "cafe", emoji: "☕", city: "" });
      loadPartners();
    } else {
      const d = await res.json().catch(() => null);
      showToast(d?.error || "Failed to add partner");
    }
  }

  async function handleDelete(e: React.MouseEvent, partner: Partner) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${partner.name}"? This permanently removes their items and redemption history. This cannot be undone.`)) return;
    setDeletingId(partner.id);
    const res = await fetch(`/api/admin/partners/${partner.id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      showToast("Partner deleted");
      setPartners(ps => ps.filter(p => p.id !== partner.id));
    } else {
      const d = await res.json().catch(() => null);
      showToast(d?.error || "Failed to delete partner");
    }
  }

  if (loading) return <div className="py-20 text-center"><ArrowPathIcon className="size-8 mx-auto animate-spin text-muted-foreground" /></div>;

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
          className="flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-sm font-bold transition-all">
          <PlusIcon className="size-4" /> Add Partner
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
                {addingPartner ? "Adding..." : "Add Partner"}
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
          <BuildingStorefrontIcon className="size-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No partners yet. Add one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {partners.map(partner => (
            <Link key={partner.id} href={`/admin/partners/${partner.id}`}
              className="group rounded-xl border border-border bg-card shadow-card p-4 flex flex-col gap-3 hover:border-primary/40 hover:shadow-elevated transition-all relative">
              <button
                onClick={e => handleDelete(e, partner)}
                disabled={deletingId === partner.id}
                title="Delete partner"
                className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50">
                <TrashIcon className="size-4" />
              </button>

              <div className="flex items-center gap-3 pr-6">
                <div className="size-11 bg-accent rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {partner.emoji}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{partner.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPinIcon className="size-3 flex-shrink-0" />
                    <span className="truncate">{partner.city || "No city set"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${partner.active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                  {partner.active ? "Active" : "Inactive"}
                </span>
                <span className="flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  <TagIcon className="size-3" /> {partner.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  <ArchiveBoxIcon className="size-3" /> {partner.items?.length ?? 0} items
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
