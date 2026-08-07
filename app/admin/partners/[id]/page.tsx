"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Partner, PartnerItem } from "@/types";
import { itemPointsCost } from "@/lib/utils";
import {
  ArrowLeftIcon, ArrowPathIcon, ArrowTopRightOnSquareIcon, ClipboardDocumentIcon,
  CheckIcon, PencilSquareIcon, PlusIcon, LockClosedIcon, LockOpenIcon,
  BanknotesIcon, MapPinIcon, TagIcon,
} from "@heroicons/react/24/outline";

type PartnerDetail = Omit<Partner, "items"> & { items?: (PartnerItem & { points_required: number })[]; has_password?: boolean };

const INPUT_CLS = "w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors";
const LABEL_CLS = "block text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";

export default function PartnerDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);

  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", category: "cafe", emoji: "", city: "" });

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);

  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", price_pkr: "", expiry_days: "60" });

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function loadPartner() {
    const res = await fetch(`/api/admin/partners/${id}`);
    if (res.status === 401) { router.push("/auth"); return; }
    if (res.status === 403) { router.push("/dashboard"); return; }
    if (res.status === 404) { setPartner(null); setLoading(false); return; }
    if (res.ok) {
      const p = await res.json();
      const withPoints: PartnerDetail = {
        ...p,
        items: (p.items ?? []).map((it: PartnerItem) => ({ ...it, points_required: itemPointsCost(it.price_pkr) })),
      };
      setPartner(withPoints);
      setEditForm({ name: p.name, description: p.description || "", category: p.category, emoji: p.emoji, city: p.city || "" });
    }
    setLoading(false);
  }

  useEffect(() => { loadPartner(); }, [id]);

  async function handleCopyLink() {
    const url = `${window.location.origin}/business/${partner?.portal_slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleToggleActive() {
    if (!partner) return;
    const res = await fetch(`/api/admin/partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !partner.active }),
    });
    if (res.ok) {
      showToast(partner.active ? "Partner deactivated" : "Partner activated");
      setPartner(p => p ? { ...p, active: !p.active } : p);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    const res = await fetch(`/api/admin/partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setSavingEdit(false);
    if (res.ok) {
      showToast("Details saved");
      setEditing(false);
      loadPartner();
    } else {
      const d = await res.json().catch(() => null);
      showToast(d?.error || "Failed to save");
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setSettingPassword(true);
    const res = await fetch(`/api/admin/partners/${id}/set-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await res.json().catch(() => null);
    setSettingPassword(false);
    if (!res.ok) { showToast(data?.error || "Failed to set password"); return; }
    showToast(newPassword ? "Portal password set" : "Password cleared — portal is now public");
    setPasswordOpen(false);
    setNewPassword("");
    setPartner(p => p ? { ...p, has_password: !!newPassword } : p);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/admin/partners/${id}/items`, {
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
      showToast("Item added");
      setAddingItem(false);
      setNewItem({ name: "", description: "", price_pkr: "", expiry_days: "60" });
      loadPartner();
    } else {
      const d = await res.json().catch(() => null);
      showToast(d?.error || "Failed to add item");
    }
  }

  async function toggleItemActive(item: PartnerItem) {
    await fetch(`/api/admin/partners/${id}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: item.id, active: !item.active }),
    });
    showToast(item.active ? "Item deactivated" : "Item activated");
    loadPartner();
  }

  if (loading) return <div className="py-20 text-center"><ArrowPathIcon className="size-8 mx-auto animate-spin text-muted-foreground" /></div>;

  if (!partner) return (
    <div className="space-y-5">
      <Link href="/admin/partners" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeftIcon className="size-4" /> Back to Partners
      </Link>
      <div className="rounded-xl border border-border bg-card shadow-card py-16 text-center">
        <p className="text-muted-foreground text-sm">Partner not found.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold z-50 shadow-elevated">
          {toast}
        </div>
      )}

      <Link href="/admin/partners" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeftIcon className="size-4" /> Back to Partners
      </Link>

      {/* ── Details section ── */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-14 bg-accent rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {partner.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black tracking-tight">{partner.name}</h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${partner.active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                  {partner.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><TagIcon className="size-3.5" /> {partner.category}</span>
                <span className="flex items-center gap-1"><MapPinIcon className="size-3.5" /> {partner.city || "No city set"}</span>
              </div>
              {partner.description && <p className="text-sm text-muted-foreground mt-1.5 max-w-md">{partner.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleToggleActive}
              className="text-xs px-3 py-1.5 border border-border rounded-full text-muted-foreground hover:border-primary/40 transition-colors">
              {partner.active ? "Deactivate" : "Activate"}
            </button>
            <button onClick={() => setEditing(v => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors">
              <PencilSquareIcon className="size-3.5" /> {editing ? "Close" : "Edit"}
            </button>
          </div>
        </div>

        {editing && (
          <form onSubmit={handleSaveEdit} className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Name *</label>
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={INPUT_CLS} required />
              </div>
              <div>
                <label className={LABEL_CLS}>City</label>
                <input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} className={INPUT_CLS} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={LABEL_CLS}>Emoji</label>
                <input value={editForm.emoji} onChange={e => setEditForm(f => ({ ...f, emoji: e.target.value }))} className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Category</label>
                <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className={INPUT_CLS}>
                  {["cafe","restaurant","retail","health","fitness","education","entertainment"].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Description</label>
                <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className={INPUT_CLS} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={savingEdit}
                className="px-5 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-xs font-bold transition-all disabled:opacity-60">
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="px-5 py-2 border border-border text-muted-foreground rounded-full text-xs font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
          <a href={`/business/${partner.portal_slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-full text-foreground hover:border-primary/40 transition-colors">
            <ArrowTopRightOnSquareIcon className="size-3.5" /> Public Dashboard
          </a>
          <button onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-full text-foreground hover:border-primary/40 transition-colors">
            {copied ? <CheckIcon className="size-3.5 text-primary" /> : <ClipboardDocumentIcon className="size-3.5" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <Link href={`/admin/settlement/${partner.id}`}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-full text-foreground hover:border-primary/40 transition-colors">
            <BanknotesIcon className="size-3.5" /> Compensation
          </Link>
        </div>

        {/* Portal Access */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {partner.has_password ? <LockClosedIcon className="size-4 text-amber-600 flex-shrink-0" /> : <LockOpenIcon className="size-4 text-muted-foreground flex-shrink-0" />}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Portal Access</p>
                <p className="text-xs text-muted-foreground">
                  {partner.has_password ? "Password-protected — only partners with credentials can login" : "Public — anyone with the link can access"}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setPasswordOpen(v => !v); setNewPassword(""); }}
              className="text-xs px-3 py-1.5 border border-border rounded-full text-muted-foreground hover:border-primary/40 transition-colors flex-shrink-0">
              {partner.has_password ? "Change / Remove Password" : "Set Password"}
            </button>
          </div>

          {passwordOpen && (
            <form onSubmit={handleSetPassword} className="mt-3 flex gap-2 flex-wrap">
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
              <button type="button" onClick={() => setPasswordOpen(false)}
                className="px-4 py-2 border border-border text-muted-foreground rounded-full text-xs transition-colors">
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Items section ── */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold">Redeemable Items</p>
          <button onClick={() => setAddingItem(v => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary hover:opacity-90 text-primary-foreground rounded-full font-bold transition-all">
            <PlusIcon className="size-3.5" /> Add Item
          </button>
        </div>

        {addingItem && (
          <form onSubmit={handleAddItem} className="bg-muted/40 rounded-xl border border-border p-4 mb-3 space-y-3">
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
                Add Item
              </button>
              <button type="button" onClick={() => setAddingItem(false)}
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
              <div key={item.id} className={`bg-muted/30 rounded-xl border border-border p-3 flex items-center gap-3 ${!item.active ? "opacity-50" : ""}`}>
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
                <button onClick={() => toggleItemActive(item)}
                  className="text-xs px-3 py-1.5 border border-border rounded-full text-muted-foreground hover:border-primary/40 transition-colors flex-shrink-0">
                  {item.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
