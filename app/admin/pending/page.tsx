"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/types";
import { formatDate } from "@/lib/utils";

export default function PendingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Profile[]>([]);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function load() {
    const r = await fetch("/api/admin");
    if (r.status === 401) { router.push("/auth"); return; }
    if (r.status === 403) { router.push("/dashboard"); return; }
    const data = await r.json();
    setPending((data.profiles ?? []).filter((p: Profile) => p.status === "pending" && p.role === "user"));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(id: string) {
    await fetch("/api/admin/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id }) });
    showToast("User approve ho gaya! ✓");
    load();
  }

  async function reject(id: string) {
    await fetch("/api/admin/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id }) });
    showToast("User reject ho gaya.");
    load();
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
        <h1 className="text-2xl font-black tracking-tight">Pending Approvals</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Naaye users ko approve ya reject karo</p>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        {pending.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-muted-foreground text-sm">Koi pending request nahi</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pending.map(u => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-4 flex-wrap hover:bg-muted/40 transition-colors">
                <div className="size-10 rounded-xl bg-accent flex items-center justify-center font-black text-accent-foreground text-sm flex-shrink-0">
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.phone} · {u.city} · {formatDate(u.created_at)}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => approve(u.id)}
                    className="px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground rounded-full text-xs font-bold transition-colors">
                    ✓ Approve
                  </button>
                  <button onClick={() => reject(u.id)}
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
  );
}
