"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile, Pickup } from "@/types";
import { getLevel, formatDate } from "@/lib/utils";
import { ScrapIcon } from "@/lib/scrapIcons";
import {
  ArrowPathIcon, UsersIcon, ClockIcon, ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

export default function OverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);

  useEffect(() => {
    fetch("/api/admin").then(r => {
      if (r.status === 401) { router.push("/auth"); return null; }
      if (r.status === 403) { router.push("/dashboard"); return null; }
      return r.json();
    }).then(data => {
      if (!data) return;
      setProfiles(data.profiles ?? []);
      setPickups(data.pickups ?? []);
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="py-20 text-center"><ArrowPathIcon className="size-8 mx-auto animate-spin text-muted-foreground" /></div>;

  const approved  = profiles.filter(p => p.status === "approved" && p.role === "user");
  const pending   = profiles.filter(p => p.status === "pending"  && p.role === "user");
  const totalKg   = approved.reduce((a, u) => a + Number(u.total_kg), 0);

  const kpis = [
    { label: "Approved Users",    value: String(approved.length),       icon: UsersIcon,      chip: "bg-accent" },
    { label: "Pending Approvals", value: String(pending.length),        icon: ClockIcon,      chip: "bg-amber-50 dark:bg-amber-950/30" },
    { label: "Total kg Collected",value: `${totalKg.toFixed(0)} kg`,    icon: ArrowPathIcon,  chip: "bg-sky-50 dark:bg-sky-950/30" },
    { label: "Total Pickups",     value: String(pickups.length),        icon: ArchiveBoxIcon, chip: "bg-emerald-50 dark:bg-emerald-950/30" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Aaj ka summary</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl border border-border bg-card shadow-card px-4 py-4 hover:shadow-elevated transition-all">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <div className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${k.chip}`}><k.icon className="size-4" /></div>
            </div>
            <div className="text-2xl font-bold tabular-nums leading-none">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <h2 className="text-sm font-semibold tracking-tight">Recent Activity</h2>
        </div>
        {pickups.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">Koi activity nahi abhi</div>
        ) : (
          <div className="divide-y divide-border">
            {pickups.slice(0, 10).map(p => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                <ScrapIcon type={p.type} className="size-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">{p.user_name}</span>
                  <span className="text-muted-foreground text-sm"> · {p.type} · {p.kg} kg</span>
                </div>
                <span className="text-primary font-bold text-sm tabular-nums flex-shrink-0">+{p.xp} XP</span>
                <span className="text-muted-foreground text-xs hidden md:block flex-shrink-0">{formatDate(p.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {approved.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <h2 className="text-sm font-semibold tracking-tight">Top Users</h2>
          </div>
          <div className="divide-y divide-border">
            {[...approved].sort((a, b) => b.xp - a.xp).slice(0, 5).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                <div className={`size-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-gray-300 text-gray-700" : i === 2 ? "bg-amber-700/40 text-amber-900" : "bg-muted text-muted-foreground"
                }`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.city} · Level {getLevel(u.xp)}</div>
                </div>
                <div className="text-sm font-bold text-primary tabular-nums">{u.xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
