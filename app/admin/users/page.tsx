"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/types";
import { getLevel } from "@/lib/utils";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState<Profile[]>([]);

  useEffect(() => {
    fetch("/api/admin").then(r => {
      if (r.status === 401) { router.push("/auth"); return null; }
      if (r.status === 403) { router.push("/dashboard"); return null; }
      return r.json();
    }).then(data => {
      if (!data) return;
      setApproved((data.profiles ?? []).filter((p: Profile) => p.status === "approved" && p.role === "user"));
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="py-20 text-center"><ArrowPathIcon className="size-8 mx-auto animate-spin text-muted-foreground" /></div>;

  const sorted = [...approved].sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight">All Users</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Saare approved users aur unki stats — {approved.length} total</p>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        {approved.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Koi approved user nahi abhi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "hsl(var(--muted))" }}>
                <tr>
                  {["User", "City", "Level", "XP", "Kg", "Cash"].map(h => (
                    <th key={h} className={`px-5 py-3 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold ${["XP","Kg","Cash"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map(u => (
                  <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.phone}</div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{u.city}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                        Lvl {getLevel(u.xp)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-primary tabular-nums">{u.xp.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground tabular-nums">{Number(u.total_kg).toFixed(1)}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground tabular-nums">Rs.{u.total_cash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
