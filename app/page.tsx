"use client";
import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./components/ThemeToggle";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-green-50 dark:border-gray-800">
        <div className="px-5 md:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-green-900 dark:text-green-400 tracking-tight">theKabari</Link>

          <div className="hidden md:flex gap-8 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <a href="#how" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">How it works</a>
            <a href="#services" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Services</a>
            <Link href="/leaderboard" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Leaderboard</Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth" className="hidden sm:block px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:border-green-400 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-all">
              Login
            </Link>
            <Link href="/auth?tab=signup" className="px-4 py-2 rounded-full bg-green-400 text-white text-sm font-semibold hover:bg-green-900 transition-colors whitespace-nowrap">
              <span className="hidden sm:inline">Shuru Karo </span><span className="sm:hidden">Join </span>↗
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Menu">
              {menuOpen
                ? <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 flex flex-col gap-1">
            <a href="#how" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors">How it works</a>
            <a href="#services" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors">Services</a>
            <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors">🏆 Leaderboard</Link>
            <Link href="/auth" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors sm:hidden">Login</Link>
            <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
              <Link href="/pickup" onClick={() => setMenuOpen(false)}
                className="block w-full text-center px-4 py-3 bg-green-400 text-white text-sm font-bold rounded-xl hover:bg-green-900 transition-colors">
                📦 Pickup Schedule Karo
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* TICKER */}
      <div className="bg-green-400 overflow-hidden py-2">
        <div className="flex animate-[ticker_30s_linear_infinite] whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex gap-12 mr-12">
              {["Ahmed from Karachi recycled 12kg paper ✦","Sara from Lahore got Eco Warrior badge ✦","Islamabad city just unlocked ✦","Fatima hit Level 5 Recycler ✦","Hassan collected 8kg metal ✦"].map((t, j) => (
                <span key={j} className="text-white/85 text-xs font-medium">{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-5 md:px-12 py-12 sm:py-20 md:py-28 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 mb-5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Pakistan ka #1 gamified scrap pickup
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.95] tracking-tighter mb-5 text-gray-900 dark:text-white">
            Scrap se <span className="text-green-400">XP</span><br />
            <span className="[WebkitTextStroke:2px_#0f963c] text-transparent">kamao.</span><br />
            Paise lo.
          </h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mb-7">
            Free doorstep pickup. Instant Easypaisa payment. Real XP aur badges earn karo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link href="/auth?tab=signup" className="px-7 py-4 rounded-full bg-green-400 text-white font-bold text-base hover:bg-green-900 transition-colors text-center">
              Pehla quest shuru karo ↗
            </Link>
            <a href="#how" className="px-7 py-4 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-base hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 transition-all text-center">
              Kaise kaam karta hai?
            </a>
          </div>
          <div className="flex gap-6 sm:gap-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex-wrap">
            {[["8k+","active players"],["50k+","kg recycled"],["10+","cities"]].map(([n, l]) => (
              <div key={l}>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">{n}</div>
                <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Phone mockup — hidden on small mobile */}
        <div className="hidden sm:flex justify-center">
          <div className="bg-green-50 dark:bg-green-950/40 rounded-[2.5rem] p-8 relative">
            <div className="bg-gray-900 rounded-[1.8rem] w-52 p-4 shadow-2xl mx-auto">
              <div className="w-14 h-1.5 bg-gray-800 rounded mx-auto mb-3" />
              <div className="bg-[#111e14] rounded-2xl p-4 min-h-72">
                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Your XP</p>
                <p className="text-[13px] font-bold text-white mb-2">Ahmed K. — Level 4</p>
                <div className="bg-white/10 rounded-full h-1.5 mb-1"><div className="bg-green-400 h-full rounded-full w-[68%]" /></div>
                <p className="text-[9px] text-white/30 mb-4">680 / 1000 XP</p>
                <div className="h-px bg-white/5 mb-3" />
                <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-2.5 mb-3">
                  <p className="text-[8px] text-amber-400 uppercase tracking-widest mb-1">Active Quest</p>
                  <p className="text-[11px] font-bold text-white">Karachi Clean Drive</p>
                  <p className="text-[9px] text-white/30">6 / 10 kg plastic</p>
                </div>
                {[["📄","Paper","+4 XP/kg"],["🧴","Plastic","+5 XP/kg"],["🔩","Metal","+8 XP/kg"]].map(([e,n,x]) => (
                  <div key={n} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-2 py-1.5 mb-1.5">
                    <span className="text-xs">{e}</span>
                    <span className="text-[10px] text-white/60 flex-1">{n}</span>
                    <span className="text-[9px] font-bold text-green-400">{x}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-6 -right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2 text-sm font-semibold dark:text-white whitespace-nowrap">
              <span className="w-2 h-2 bg-green-400 rounded-full" />Pickup scheduled!
            </div>
            <div className="absolute -bottom-2 -left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg px-3 py-2">
              <div className="text-xl font-black text-green-400">+48 XP</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">just earned</div>
            </div>
          </div>
        </div>
      </section>

      {/* SCRAP TYPES */}
      <div className="bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800 py-3 px-5 md:px-12 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center gap-3 min-w-max sm:min-w-0 sm:flex-wrap">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">Hum collect karte hain</span>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <div className="flex gap-2 flex-nowrap sm:flex-wrap">
            {["Paper","Metal","Plastic","Electronics","Glass","Cardboard","Appliances"].map(s => (
              <span key={s} className="bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="py-14 sm:py-20 px-5 md:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <span className="inline-block bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-4 py-1 text-xs font-bold text-green-600 dark:text-green-400 mb-4">Tutorial</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-3 text-gray-900 dark:text-white">Kaam kaise hota hai?</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md mb-10 leading-relaxed">Char simple steps mein XP earn karo, paise lo, aur Pakistan ko saaf karo.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { n:"01", title:"Pickup schedule karo", desc:"Time slot chuno. Hum ghar aate hain — koi minimum weight nahi.", badge:"Free" },
              { n:"02", title:"Darwaze pe tolte hain", desc:"Hamare trained team aapke saamne digital scales se scrap tolte hain." },
              { n:"03", title:"Paise + XP milta hai", desc:"Cash ya Easypaisa transfer — aur XP seedha profile mein add hota hai.", badge:"Instant" },
              { n:"04", title:"Badges unlock karo", desc:"Milestones hit karo, city badges unlock karo, leaderboard pe chado." },
            ].map(s => (
              <div key={s.n} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-transparent hover:border-green-100 dark:hover:border-green-900 hover:-translate-y-1 transition-all relative overflow-hidden">
                <div className="absolute bottom-[-1rem] right-[-0.5rem] text-[5rem] font-black text-green-400/5 leading-none pointer-events-none">{s.n}</div>
                {s.badge && <span className="absolute top-4 right-4 bg-green-400 text-white text-[10px] font-bold px-3 py-1 rounded-full">{s.badge}</span>}
                <div className="text-xs font-bold text-gray-300 dark:text-gray-600 mb-3 tracking-widest">Step {s.n}</div>
                <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-white">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-14 sm:py-20 px-5 md:px-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <span className="inline-block bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-4 py-1 text-xs font-bold text-green-600 dark:text-green-400 mb-4">Skill tree</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-3 text-gray-900 dark:text-white">Hamare services</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md mb-10 leading-relaxed">Level up karo — jitna zyada recycle karo, utni zyada services unlock hoti hain.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title:"Scrap collection", desc:"30+ recyclables ki free door-to-door pickup.", lvl:"Level 1", color:"green" },
              { title:"Bulk disposal", desc:"Renovation ya clearout ke liye bade loads.", lvl:"Level 3", color:"green" },
              { title:"E-waste pickup", desc:"Electronics aur batteries ka certified disposal.", lvl:"Level 5", color:"amber" },
              { title:"Corporate scrap", desc:"Factories aur offices ke liye recurring contracts.", lvl:"Level 10", color:"amber" },
              { title:"Paper shredding", desc:"Confidential documents ka secure disposal.", lvl:"Level 10", color:"pink" },
              { title:"Zero waste events", desc:"Conferences aur weddings ke liye waste partner.", lvl:"Level 20", color:"pink" },
            ].map(s => (
              <div key={s.title} className="bg-white dark:bg-gray-950 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-green-100 dark:hover:border-green-900 hover:-translate-y-1 transition-all">
                <h4 className="font-bold mb-1 text-gray-900 dark:text-white">{s.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{s.desc}</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  s.color==="green" ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400" :
                  s.color==="amber" ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" :
                  "bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400"
                }`}>{s.lvl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-5 md:px-12 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="bg-green-900 rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute w-64 h-64 rounded-full bg-white/5 -top-16 -left-16" />
            <div className="absolute w-48 h-48 rounded-full bg-white/5 -bottom-12 -right-12" />
            <span className="relative inline-block bg-white/10 border border-white/15 rounded-full px-4 py-1 text-xs font-bold text-white/80 mb-5">Join the movement</span>
            <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Tayaar ho Pakistan<br/>saaf karne ke liye?</h2>
            <p className="relative text-white/50 text-sm sm:text-base mb-8 max-w-md mx-auto">Hazaron log pehle se XP earn kar rahe hain. Aaj hi shuru karo — free hai, fast hai, fun hai.</p>
            <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth?tab=signup" className="px-8 py-4 rounded-full bg-green-400 text-white font-bold hover:bg-green-600 transition-colors">
                Pehla quest shuru karo ↗
              </Link>
              <Link href="/leaderboard" className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-colors">
                Leaderboard dekho
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 dark:bg-gray-950 dark:border-t dark:border-gray-800 px-5 md:px-12 pt-12 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl font-black text-white mb-3">theKabari</div>
            <p className="text-sm text-white/35 leading-relaxed">Pakistan ka pehla gamified scrap pickup — XP kamao, paise lo, Pakistan saaf karo.</p>
          </div>
          {[
            { h:"Individuals", links:["Scrap collection","E-waste pickup","Scrap rates","XP & Levels"] },
            { h:"Businesses", links:["Corporate scrap","Paper shredding","Zero waste events","Become a partner"] },
            { h:"Company", links:["About us","Careers","Contact","Privacy policy"] },
          ].map(col => (
            <div key={col.h}>
              <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">{col.h}</h4>
              {col.links.map(l => <a key={l} href="#" className="block text-sm text-white/40 hover:text-white/80 mb-2.5 transition-colors">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-white/20">© 2025 theKabari — Made with love in Pakistan</span>
          <div className="flex gap-4">
            {["Privacy","Terms","Sitemap"].map(l => <a key={l} href="#" className="text-xs text-white/25 hover:text-white/60 transition-colors">{l}</a>)}
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>
    </div>
  );
}
