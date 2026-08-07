"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/app/components/LogoMark";

const NAV = [
  { id: "overview",   label: "Overview",  icon: "📊", href: "/admin/overview" },
  { id: "requests",   label: "Requests",  icon: "📦", href: "/admin/requests" },
  { id: "pending",    label: "Approvals", icon: "⏳", href: "/admin/pending" },
  { id: "users",      label: "Users",     icon: "👥", href: "/admin/users" },
  { id: "addxp",      label: "Add XP",    icon: "➕", href: "/admin/addxp" },
  { id: "partners",   label: "Partners",  icon: "🎁", href: "/admin/partners" },
  { id: "settlement", label: "Settle",    icon: "💰", href: "/admin/settlement" },
  { id: "prices",     label: "Prices",    icon: "🏷️", href: "/admin/prices" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [counts, setCounts] = useState({ pendingOrders: 0, pendingUsers: 0 });

  useEffect(() => {
    fetch("/api/admin/check")
      .then(r => {
        if (r.status === 401) { router.push("/auth"); return null; }
        if (r.status === 403) { router.push("/dashboard"); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setReady(true);
        fetch("/api/admin/counts")
          .then(r2 => r2.ok ? r2.json() : null)
          .then(c => { if (c) setCounts(c); });
      })
      .catch(() => router.push("/auth"));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
  }

  if (!ready) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-4xl animate-spin">♻️</div>
    </div>
  );

  const navItems = NAV.map(n => ({
    ...n,
    badge: n.id === "requests" ? counts.pendingOrders
         : n.id === "pending"  ? counts.pendingUsers
         : 0,
    active: pathname === n.href || pathname.startsWith(n.href + "/"),
  }));

  const activeNav = navItems.find(n => n.active) ?? navItems[0];
  const totalBadge = counts.pendingOrders + counts.pendingUsers;

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="fixed inset-y-0 left-0 w-60 hidden md:flex flex-col z-40" style={{ background: "#003c1e" }}>
        <div className="h-16 flex flex-col justify-center px-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
          <LogoMark variant="inverted" size={26} />
          <div className="text-[10px] font-medium mt-1.5" style={{ color: "rgba(255,255,255,0.38)" }}>Admin Panel</div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: item.active ? "rgba(255,255,255,0.10)" : undefined,
                color: item.active ? "white" : "rgba(255,255,255,0.52)",
              }}
            >
              {item.active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r" />
              )}
              <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center tabular-nums flex-shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            <span className="text-base w-5 text-center flex-shrink-0">↩</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 h-14 flex items-center justify-between px-4 flex-shrink-0" style={{ background: "#003c1e" }}>
          <div className="flex items-center gap-2">
            <LogoMark variant="inverted" size={22} />
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>Admin</span>
          </div>
          {totalBadge > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {totalBadge} pending
            </span>
          )}
        </header>

        {/* Desktop page header */}
        <header
          className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between px-7 flex-shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--background) / 0.85)", backdropFilter: "blur(12px)" }}
        >
          <h1 className="font-semibold text-sm tracking-tight">
            {activeNav.icon} {activeNav.label}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-7 py-6 pb-24 md:pb-8">
          <div className="max-w-[960px] mx-auto space-y-5">
            {children}
          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav
        className="fixed bottom-0 inset-x-0 md:hidden z-40 flex overflow-x-auto"
        style={{ background: "#003c1e", borderTop: "1px solid rgba(255,255,255,0.10)" }}
      >
        {navItems.map(item => (
          <Link
            key={item.id}
            href={item.href}
            className="flex-1 min-w-0 flex flex-col items-center py-2 gap-0.5 text-[9px] font-medium relative transition-colors flex-shrink-0"
            style={{ color: item.active ? "#f0a500" : "rgba(255,255,255,0.42)" }}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="truncate w-full text-center px-1">{item.label.split(" ")[0]}</span>
            {item.badge > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
