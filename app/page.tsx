"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "./components/ThemeToggle";
import { LogoMark } from "./components/LogoMark";
import { ScrapIcon } from "@/lib/scrapIcons";
import { motion, useInView, AnimatePresence, useMotionValue, animate, useTransform, type Variants } from "framer-motion";
import {
  BuildingOfficeIcon, TrophyIcon, ArchiveBoxIcon, GiftIcon, ArrowTrendingUpIcon,
  BanknotesIcon, TagIcon, ArrowPathIcon, LockClosedIcon,
  CheckCircleIcon, ShoppingBagIcon, DocumentCheckIcon, TicketIcon, StarIcon,
  ChartBarIcon, DocumentTextIcon, UserIcon, BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

/* ── Easing & spring ────────────────────────────── */
const EASE  = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 260, damping: 22 } as const;

/* ── Variants ───────────────────────────────────── */
const cardReveal: Variants = {
  hidden: { opacity: 0, y: 80, rotate: 4, scale: 0.94 },
  show:   { opacity: 1, y: 0,  rotate: 0, scale: 1,    transition: { ...SPRING } },
};
const staggerFast = (delay = 0, gap = 0.13): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: gap, delayChildren: delay } },
});

/* ── Clip-reveal for headings (editorial wipe) ── */
function ClipLine({ children, delay = 0, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <div ref={ref} className={`overflow-hidden pb-1 ${className}`}>
      <motion.div
        initial={{ y: "110%", skewY: 4 }}
        animate={inView ? { y: "0%", skewY: 0 } : {}}
        transition={{ ease: EASE, duration: 0.8, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── Scroll-stagger wrapper ──────────────────── */
function InView({ children, className, variants = staggerFast() }: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Count-up number ─────────────────────────── */
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const display = useTransform(count, v => Math.round(v) + suffix);
  useEffect(() => {
    if (inView) animate(count, value, { duration: 1.6, ease: "easeOut" });
  }, [inView, count, value]);
  return <motion.span ref={ref}>{display}</motion.span>;
}

const FALLBACK_RATES = [
  { emoji:"📰", name:"Paper",       rate_pkr:9,   hot:false },
  { emoji:"📦", name:"Cardboard",   rate_pkr:12,  hot:false },
  { emoji:"🧴", name:"Plastic",     rate_pkr:22,  hot:false },
  { emoji:"🔧", name:"Iron / Steel",rate_pkr:47,  hot:true  },
  { emoji:"⚙️", name:"Aluminum",    rate_pkr:110, hot:true  },
  { emoji:"🔌", name:"Copper",      rate_pkr:450, hot:true  },
  { emoji:"💻", name:"Electronics", rate_pkr:60,  hot:false },
  { emoji:"🫙", name:"Glass",       rate_pkr:4,   hot:false },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [liveRates, setLiveRates] = useState(FALLBACK_RATES);

  useEffect(() => {
    fetch("/api/rates").then(r => r.ok ? r.json() : null).then(data => {
      if (data?.rates?.length) {
        setLiveRates(data.rates.map((r: { emoji: string; name: string; rate_pkr: number; hot: boolean }) => ({
          emoji: r.emoji, name: r.name, rate_pkr: r.rate_pkr, hot: r.hot,
        })));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: EASE, duration: 0.6 }}
        className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-green-50 dark:border-gray-800"
      >
        <div className="px-5 md:px-12 h-16 flex items-center justify-between">
          <Link href="/"><LogoMark size={28} /></Link>

          <div className="hidden md:flex gap-8 text-sm text-gray-500 dark:text-gray-400 font-medium">
            {[["#how","How it works"],["#services","Services"],["#corporate","For Business"]].map(([href, label]) => (
              <a key={href} href={href} className="hover:text-green-600 dark:hover:text-green-400 transition-colors">{label}</a>
            ))}
            <Link href="/leaderboard" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Leaderboard</Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth" className="hidden sm:block px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:border-green-400 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-all">
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.07, y: -2 }} whileTap={{ scale: 0.94 }}>
              <Link href="/auth?tab=signup" className="px-4 py-2 rounded-full bg-green-400 text-white text-sm font-semibold hover:bg-green-900 transition-colors whitespace-nowrap block">
                <span className="hidden sm:inline">Shuru Karo </span><span className="sm:hidden">Join </span>↗
              </Link>
            </motion.div>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Menu">
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen
                  ? <motion.svg key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></motion.svg>
                  : <motion.svg key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></motion.svg>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ ease: EASE, duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 flex flex-col gap-1"
            >
              <a href="#how" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors">How it works</a>
              <a href="#services" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors">Services</a>
              <a href="#corporate" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors"><BuildingOfficeIcon className="size-4" /> For Business</a>
              <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors"><TrophyIcon className="size-4" /> Leaderboard</Link>
              <Link href="/auth" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors sm:hidden">Login</Link>
              <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
                <Link href="/pickup" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 bg-green-400 text-white text-sm font-bold rounded-xl hover:bg-green-900 transition-colors">
                  <ArchiveBoxIcon className="size-4" /> Pickup Schedule Karo
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-5 md:px-12 py-12 sm:py-20 md:py-28 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ease: EASE, duration: 0.55 }}
            className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 mb-5"
          >
            <motion.span animate={{ scale: [1, 1.8, 1] }} transition={{ duration: 1.8, repeat: Infinity }} className="w-2 h-2 bg-green-400 rounded-full inline-block" />
            Pakistan ka #1 gamified scrap pickup
          </motion.div>

          {/* H1 — clip-wipe per line */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.95] tracking-tighter mb-5 text-gray-900 dark:text-white">
            <div className="overflow-hidden pb-1">
              <motion.span
                initial={{ y: "110%", skewY: 5 }}
                animate={{ y: "0%", skewY: 0 }}
                transition={{ ease: EASE, duration: 0.75, delay: 0.05 }}
                className="block"
              >
                Scrap se <span className="text-green-400">XP</span>
              </motion.span>
            </div>
            <div className="overflow-hidden pb-1">
              <motion.span
                initial={{ y: "110%", skewY: 5 }}
                animate={{ y: "0%", skewY: 0 }}
                transition={{ ease: EASE, duration: 0.75, delay: 0.16 }}
                style={{ WebkitTextStroke: "3px #4ade80", textShadow: "0 0 40px rgba(74,222,128,0.35)" }}
                className="block text-transparent"
              >kamao.</motion.span>
            </div>
            <div className="overflow-hidden pb-1">
              <motion.span
                initial={{ y: "110%", skewY: 5 }}
                animate={{ y: "0%", skewY: 0 }}
                transition={{ ease: EASE, duration: 0.75, delay: 0.27 }}
                className="block"
              >Paise lo.</motion.span>
            </div>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ ease: EASE, duration: 0.7, delay: 0.38 }}
            className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mb-7"
          >
            Free doorstep pickup. Pehli pickup pe instant reward. Rs. 3,000 balance pe cash, discounts, aur partner perks earn karo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: EASE, duration: 0.6, delay: 0.48 }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <motion.div whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.94 }}>
              <Link href="/auth?tab=signup" className="block px-7 py-4 rounded-full bg-green-400 text-white font-bold text-base hover:bg-green-900 transition-colors text-center">
                Pehla quest shuru karo ↗
              </Link>
            </motion.div>
            <motion.a href="#how" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
              className="px-7 py-4 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-base hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 transition-all text-center">
              Kaise kaam karta hai?
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.62 }}
            className="flex gap-6 sm:gap-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex-wrap"
          >
            {[["8k+","active players"],["50k+","kg recycled"],["10+","cities"]].map(([n, l], i) => (
              <motion.div key={l}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ease: EASE, duration: 0.55, delay: 0.66 + i * 0.12 }}>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">{n}</div>
                <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-0.5">{l}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 8, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
          transition={{ ease: EASE, duration: 0.85, delay: 0.2 }}
          className="hidden sm:flex justify-center"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="bg-green-50 dark:bg-green-950/40 rounded-[2.5rem] p-8 relative"
          >
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
                {[["Paper","+4 XP/kg"],["Plastic","+5 XP/kg"],["Metal","+8 XP/kg"]].map(([n,x]) => (
                  <div key={n} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-2 py-1.5 mb-1.5">
                    <ScrapIcon type={n} className="size-3.5 text-white/60" />
                    <span className="text-[10px] text-white/60 flex-1">{n}</span>
                    <span className="text-[9px] font-bold text-green-400">{x}</span>
                  </div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 24, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1, y: [0, -7, 0] }}
              transition={{ opacity: { delay: 1, duration: 0.45 }, x: { delay: 1, ease: EASE, duration: 0.45 }, scale: { delay: 1, ease: EASE, duration: 0.45 }, y: { delay: 2, duration: 3, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute top-6 -right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold dark:text-white whitespace-nowrap"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full" />Pickup scheduled!
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -24, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1, y: [0, 8, 0] }}
              transition={{ opacity: { delay: 1.25, duration: 0.45 }, x: { delay: 1.25, ease: EASE, duration: 0.45 }, scale: { delay: 1.25, ease: EASE, duration: 0.45 }, y: { delay: 2.4, duration: 3.5, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute -bottom-2 -left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-3 py-2"
            >
              <div className="text-xl font-black text-green-400">+48 XP</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">just earned</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* SCRAP TYPES */}
      <div className="bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800 py-3 px-5 md:px-12 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center gap-3 min-w-max sm:min-w-0 sm:flex-wrap">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">Hum collect karte hain</span>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <div className="flex gap-2 flex-nowrap sm:flex-wrap">
            {["Paper","Metal","Plastic","Electronics","Glass","Cardboard","Appliances"].map((s, i) => (
              <motion.span key={s}
                initial={{ opacity: 0, y: 12, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ease: EASE, duration: 0.4, delay: 0.7 + i * 0.06 }}
                className="bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap"
              >{s}</motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* SCRAP RATES */}
      <section className="py-14 sm:py-20 px-5 md:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ ease: EASE, duration: 0.5 }}
                className="inline-block bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-4 py-1 text-xs font-bold text-green-600 dark:text-green-400 mb-4"
              >Live Rates</motion.span>
              <ClipLine className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">
                Aaj ke market rates
              </ClipLine>
              <motion.p
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ ease: EASE, duration: 0.6, delay: 0.1 }}
                className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md leading-relaxed"
              >Hamare kaarigar darwaze pe aake tolte hain — in rates pe cash ya Easypaisa milta hai. Koi hidden charges nahi.</motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ ease: EASE, duration: 0.5 }}
              className="flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-4 py-2 self-start md:self-auto flex-shrink-0"
            >
              <motion.span animate={{ scale: [1, 1.6, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 bg-green-400 rounded-full inline-block" />
              <span className="text-xs font-bold text-green-600 dark:text-green-400">Daily updated</span>
            </motion.div>
          </div>
          <InView variants={staggerFast(0, 0.07)} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {liveRates.map(r => (
              <motion.div key={r.name} variants={cardReveal}
                whileHover={{ y: -8, scale: 1.03, boxShadow: "0 16px 32px -8px rgba(34,197,94,0.15)", transition: { ease: "easeOut", duration: 0.18 } }}
                className="relative bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 cursor-default"
              >
                {r.hot && (
                  <span className="absolute top-3 right-3 bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wide">HOT</span>
                )}
                <div className="text-2xl mb-2">{r.emoji}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">{r.name}</div>
                <div className="text-xl font-black text-green-600 dark:text-green-400 tabular-nums">Rs. {r.rate_pkr}</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500">per kg</div>
              </motion.div>
            ))}
          </InView>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-gray-500 dark:text-gray-400 mt-5"
          >* Rates market price ke saath change hote hain. Final rate pickup ke waqt confirm hoga.</motion.p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-14 sm:py-20 px-5 md:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ ease: EASE, duration: 0.5 }}
              className="inline-block bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-4 py-1 text-xs font-bold text-green-600 dark:text-green-400 mb-4"
            >Tutorial</motion.span>
            <ClipLine delay={0.05} className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">
              Kaam kaise hota hai?
            </ClipLine>
            <motion.p
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ ease: EASE, duration: 0.65, delay: 0.15 }}
              className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md leading-relaxed"
            >Char simple steps mein XP earn karo, paise lo, aur Pakistan ko saaf karo.</motion.p>
          </div>

          <InView variants={staggerFast(0, 0.13)} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { n:"01", title:"Pickup schedule karo", desc:"Time slot chuno. Hum ghar aate hain — koi minimum weight nahi, koi charge nahi.", badge:"Free" },
              { n:"02", title:"Darwaze pe tolte hain", desc:"Hamare trained team aapke saamne digital scales se scrap tolte hain — transparent aur real-time." },
              { n:"03", title:"Balance + XP earn karo", desc:"Scrap ke weight se balance milta hai. Pehli pickup pe instant reward — baad mein Rs. 3,000 pe redeem.", badge:"Instant" },
              { n:"04", title:"Cash ya perks lo", desc:"Rs. 3,000 balance pe Easypaisa cash milta hai — ya partner discounts, vouchers, aur badges anytime." },
            ].map(s => (
              <motion.div key={s.n} variants={cardReveal}
                whileHover={{ y: -14, scale: 1.03, boxShadow: "0 24px 48px -12px rgba(34,197,94,0.18)", transition: { ease: "easeOut", duration: 0.2 } }}
                className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-transparent hover:border-green-100 dark:hover:border-green-900 transition-colors relative overflow-hidden cursor-default"
              >
                <div className="absolute bottom-[-1rem] right-[-0.5rem] text-[5rem] font-black text-green-400/5 leading-none pointer-events-none">{s.n}</div>
                {s.badge && <span className="absolute top-4 right-4 bg-green-400 text-white text-[10px] font-bold px-3 py-1 rounded-full">{s.badge}</span>}
                <div className="text-xs font-bold text-gray-300 dark:text-gray-600 mb-3 tracking-widest">Step {s.n}</div>
                <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-white">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </InView>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-14 sm:py-20 px-5 md:px-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <InView variants={staggerFast(0, 0.1)} className="mb-10">
            <motion.span variants={cardReveal} className="inline-block bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-4 py-1 text-xs font-bold text-green-600 dark:text-green-400 mb-4">Real users</motion.span>
            <ClipLine className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">Log kya kehte hain</ClipLine>
            <motion.p variants={cardReveal} className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md leading-relaxed">Hazaron families aur businesses pehle se theKabari ke saath scrap recycle kar rahe hain.</motion.p>
          </InView>
          <InView variants={staggerFast(0, 0.13)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Sadia Imran",    city: "Karachi",    role: "Homeowner",          quote: "Pehle scrap bekarne ke liye kabaari ka wait karna padta tha. Ab seedha app se pickup schedule kiya, usi din aa gaye. Cash bhi mila aur XP bhi!", rating: 5 },
              { name: "Tariq Mehmood",  city: "Lahore",     role: "Textile Factory Owner", quote: "Factory ka iron scrap manage karna mushkil tha. theKabari ne recurring pickup set up kiya, aur monthly ESG report bhi milti hai — board presentations ke liye perfect.", rating: 5 },
              { name: "Hamza Qureshi",  city: "Islamabad",  role: "University Student",   quote: "Hostel mein electronics waste hoti rehti thi. Pehli pickup pe instant reward mila — uske baad balance accumulate hota raha. Rs. 3,000 reach karte hi Easypaisa pe cash aa gaya. Addiction ho gayi!", rating: 5 },
            ].map(t => (
              <motion.div key={t.name} variants={cardReveal}
                whileHover={{ y: -10, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)", transition: { ease: "easeOut", duration: 0.2 } }}
                className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col gap-4 cursor-default"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                  <div className="w-9 h-9 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center font-black text-sm text-green-700 dark:text-green-400 flex-shrink-0">
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role} · {t.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </InView>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-14 sm:py-20 px-5 md:px-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ ease: EASE, duration: 0.5 }}
              className="inline-block bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-4 py-1 text-xs font-bold text-green-600 dark:text-green-400 mb-4"
            >Skill tree</motion.span>
            <ClipLine delay={0.05} className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">
              Hamare services
            </ClipLine>
            <motion.p
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ ease: EASE, duration: 0.65, delay: 0.15 }}
              className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md leading-relaxed"
            >Level up karo — jitna zyada recycle karo, utni zyada services unlock hoti hain.</motion.p>
          </div>
          <InView variants={staggerFast(0, 0.1)} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title:"Scrap collection", desc:"30+ recyclables ki free door-to-door pickup.", lvl:"Level 1", color:"green" },
              { title:"Bulk disposal", desc:"Renovation ya clearout ke liye bade loads.", lvl:"Level 3", color:"green" },
              { title:"E-waste pickup", desc:"Electronics aur batteries ka certified disposal.", lvl:"Level 5", color:"amber" },
              { title:"Corporate scrap", desc:"Factories aur offices ke liye recurring contracts.", lvl:"Level 10", color:"amber" },
              { title:"Paper shredding", desc:"Confidential documents ka secure disposal.", lvl:"Level 10", color:"pink" },
              { title:"Zero waste events", desc:"Conferences aur weddings ke liye waste partner.", lvl:"Level 20", color:"pink" },
            ].map(s => (
              <motion.div key={s.title} variants={cardReveal}
                whileHover={{ y: -12, scale: 1.03, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)", transition: { ease: "easeOut", duration: 0.2 } }}
                className="bg-white dark:bg-gray-950 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-green-100 dark:hover:border-green-900 transition-colors cursor-default"
              >
                <h4 className="font-bold mb-1 text-gray-900 dark:text-white">{s.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{s.desc}</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  s.color==="green" ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400" :
                  s.color==="amber" ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" :
                  "bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400"
                }`}>{s.lvl}</span>
              </motion.div>
            ))}
          </InView>
        </div>
      </section>

      {/* REWARDS MODEL */}
      <section className="py-14 sm:py-24 px-5 md:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ ease: EASE, duration: 0.5 }}
              className="inline-block bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-4 py-1 text-xs font-bold text-green-600 dark:text-green-400 mb-4"
            >Rewards</motion.span>
            <ClipLine className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">
              Aapko kya milega?
            </ClipLine>
            <motion.p
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ ease: EASE, duration: 0.6, delay: 0.1 }}
              className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-lg leading-relaxed"
            >Pehli pickup instant — baad mein jitna zyada recycle karo, utna zyada milega. Simple hai.</motion.p>
          </div>

          {/* Journey strip */}
          <InView variants={staggerFast(0, 0.15)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              {
                step: "Pehli Pickup",
                tag: "Instant Reward",
                tagColor: "bg-green-400 text-white",
                icon: GiftIcon,
                title: "Seedha milta hai",
                desc: "Pehli pickup ke baad hum turant aapko reward karte hain — koi threshold nahi, koi wait nahi.",
                glow: true,
              },
              {
                step: "Har Pickup",
                tag: "Balance Builds",
                tagColor: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
                icon: ArrowTrendingUpIcon,
                title: "Balance accumulate hota hai",
                desc: "Har pickup ke baad aapka balance badhta rehta hai. Scrap ka weight aur type se rate decide hota hai.",
                glow: false,
              },
              {
                step: "Rs. 3,000+",
                tag: "Redeem Now",
                tagColor: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
                icon: BanknotesIcon,
                title: "Cash ya Easypaisa",
                desc: "Balance Rs. 3,000 par pohonch jaye — Easypaisa ya cash pe redeem kar lo. Koi expiry nahi.",
                glow: false,
              },
              {
                step: "Kabhi Bhi",
                tag: "Always Available",
                tagColor: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
                icon: TagIcon,
                title: "Partner Discounts",
                desc: "Balance se hata ke — partner cafes, shops aur brands pe discounts balance ke bina bhi milte hain.",
                glow: false,
              },
            ].map((r, i) => (
              <motion.div key={r.step} variants={cardReveal}
                whileHover={{ y: -10, boxShadow: r.glow ? "0 24px 48px -12px rgba(74,222,128,0.25)" : "0 20px 40px -10px rgba(0,0,0,0.1)", transition: { ease: "easeOut", duration: 0.18 } }}
                className={`relative rounded-2xl p-6 border flex flex-col gap-3 cursor-default ${
                  r.glow
                    ? "bg-green-900 border-green-700 text-white"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                }`}
              >
                {r.glow && (
                  <motion.div
                    animate={{ opacity: [0.15, 0.3, 0.15] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl bg-green-400 pointer-events-none"
                  />
                )}
                <div className="relative flex items-start justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${r.tagColor}`}>{r.tag}</span>
                  <r.icon className={`size-6 ${r.glow ? "text-white" : "text-gray-400"}`} />
                </div>
                <div className="relative">
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${r.glow ? "text-white/40" : "text-gray-400 dark:text-gray-600"}`}>{r.step}</div>
                  <div className={`text-base font-black mb-1 ${r.glow ? "text-white" : "text-gray-900 dark:text-white"}`}>{r.title}</div>
                  <p className={`text-sm leading-relaxed ${r.glow ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}>{r.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-full flex items-center justify-center z-10 text-gray-400 text-xs font-bold" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>→</div>
                )}
              </motion.div>
            ))}
          </InView>

          {/* Other rewards grid */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-10">
            <motion.p
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ ease: EASE, duration: 0.5 }}
              className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5"
            >Aur bhi milta hai</motion.p>
            <InView variants={staggerFast(0, 0.09)} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { icon: TagIcon,           label: "Cafe Discounts",     desc: "Partner cafes pe 10–20% off" },
                { icon: ShoppingBagIcon,   label: "Shop Vouchers",     desc: "Partner brands pe redeem karo" },
                { icon: TrophyIcon,        label: "XP & Badges",       desc: "Leaderboard pe rank badhao" },
                { icon: DocumentCheckIcon, label: "Eco Certificate",   desc: "Monthly recycling certificate" },
                { icon: TicketIcon,        label: "Lucky Draws",       desc: "Har mahine prize lucky draw" },
                { icon: StarIcon,          label: "VIP Pickups",       desc: "Priority scheduling milta hai" },
              ].map(p => (
                <motion.div key={p.label} variants={cardReveal}
                  whileHover={{ y: -6, scale: 1.04, transition: { ease: "easeOut", duration: 0.15 } }}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center cursor-default"
                >
                  <p.icon className="size-6 mx-auto mb-2 text-green-500" />
                  <div className="text-xs font-bold text-gray-900 dark:text-white mb-1">{p.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{p.desc}</div>
                </motion.div>
              ))}
            </InView>
          </div>
        </div>
      </section>

      {/* CORPORATE */}
      <section id="corporate" className="py-14 sm:py-24 px-5 md:px-12 bg-[#0a1a0e] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.06, 0.14, 0.06] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500 rounded-full blur-[80px]"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-[80px]"
          />
          {/* Horizontal scan line */}
          <motion.div
            initial={{ top: "-2px", opacity: 0.5 }}
            whileInView={{ top: "102%", opacity: 0 }}
            viewport={{ once: true }}
            transition={{ ease: "linear", duration: 1.8, delay: 0.2 }}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/60 to-transparent"
          />
        </div>

        <div className="max-w-6xl mx-auto relative">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-16">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.6, x: -20 }} whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ ease: EASE, duration: 0.55 }}
                className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 text-xs font-bold text-green-400 mb-5"
              >
                <motion.span animate={{ scale: [1, 2, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                Enterprise & SME Solutions
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white leading-[1.0] mb-4">
                <ClipLine delay={0.05}>Apni company ka</ClipLine>
                <ClipLine delay={0.18}><span className="text-green-400">waste problem</span></ClipLine>
                <ClipLine delay={0.31}>hum solve karte hain.</ClipLine>
              </h2>
              <motion.p
                initial={{ opacity: 0, y: 36, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ ease: EASE, duration: 0.7, delay: 0.2 }}
                className="text-white/70 text-sm sm:text-base max-w-lg leading-relaxed"
              >
                Factories, offices, hospitals, restaurants — har scale ke liye managed scrap collection. CSR-ready reports. Zero hassle.
              </motion.p>
            </div>

            {/* Count-up stats */}
            <div className="flex flex-row md:flex-col gap-3 md:gap-4 flex-shrink-0">
              {[
                { n: 40, suffix: "+", l: "businesses onboarded" },
                { n: 12, suffix: " tons", l: "avg. monthly pickup" },
                { n: 48, suffix: "h", l: "onboarding turnaround" },
              ].map((s, i) => (
                <motion.div key={s.l}
                  initial={{ opacity: 0, x: 50, scale: 0.8 }} whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ ...SPRING, delay: i * 0.12 }}
                  whileHover={{ scale: 1.08, y: -4, transition: { ease: "easeOut", duration: 0.18 } }}
                  className="bg-white/[0.06] border border-white/[0.1] rounded-2xl px-4 py-3 text-center min-w-[90px] cursor-default"
                >
                  <div className="text-xl sm:text-2xl font-black text-green-400">
                    <CountUp value={s.n} suffix={s.suffix} />
                  </div>
                  <div className="text-[10px] text-white/60 mt-0.5 leading-tight">{s.l}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Main grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InView variants={staggerFast(0, 0.08)} className="grid grid-cols-2 gap-3">
              {[
                { icon: ArrowPathIcon, title: "Recurring Pickups", desc: "Weekly or monthly scheduled collections — set it and forget it." },
                { icon: ChartBarIcon, title: "ESG Reports", desc: "Monthly PDF reports: tonnage, CO₂ offset, material breakdown." },
                { icon: DocumentTextIcon, title: "Digital Invoicing", desc: "GST-ready invoices auto-generated after every pickup." },
                { icon: UserIcon, title: "Dedicated Manager", desc: "A single point of contact for your account, always." },
                { icon: BuildingOffice2Icon, title: "Bulk Pricing", desc: "Volume-based rates — the more you recycle, the more you earn." },
                { icon: LockClosedIcon, title: "Secure Disposal", desc: "Certified shredding for confidential documents and e-waste." },
              ].map(f => (
                <motion.div key={f.title} variants={cardReveal}
                  whileHover={{ y: -10, scale: 1.04, backgroundColor: "rgba(255,255,255,0.09)", borderColor: "rgba(74,222,128,0.35)", boxShadow: "0 16px 40px -8px rgba(34,197,94,0.2)", transition: { ease: "easeOut", duration: 0.18 } }}
                  className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 cursor-default group"
                >
                  <motion.div
                    whileHover={{ scale: 1.4, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                    className="mb-2 inline-block text-green-400"
                  ><f.icon className="size-6" /></motion.div>
                  <h4 className="text-white text-sm font-bold mb-1 group-hover:text-green-400 transition-colors">{f.title}</h4>
                  <p className="text-white/65 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </InView>

            <motion.div
              initial={{ opacity: 0, x: 70, rotate: -2, filter: "blur(6px)" }} whileInView={{ opacity: 1, x: 0, rotate: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ ease: EASE, duration: 0.8, delay: 0.1 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col"
            >
              <div className="mb-6">
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="w-10 h-10 bg-green-400/15 rounded-2xl flex items-center justify-center text-green-400 mb-4 inline-flex"
                ><BuildingOfficeIcon className="size-5" /></motion.div>
                <h3 className="text-white text-xl font-black mb-2">Partner karo theKabari se</h3>
                <p className="text-white/65 text-sm leading-relaxed">
                  Form bharo — aapka dedicated account manager 48 ghante mein contact karega.
                </p>
              </div>
              <CorporateForm />
              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <p className="text-white/50 text-sm text-center">
                  Already a partner? Email{" "}
                  <a href="mailto:corporate@thekabari.pk" className="text-green-400/80 hover:text-green-400 transition-colors">
                    corporate@thekabari.pk
                  </a>
                </p>
              </div>
            </motion.div>
          </div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ ease: EASE, duration: 0.65 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-8"
          >
            <span className="text-white/50 text-xs font-semibold uppercase tracking-widest whitespace-nowrap">Trusted by</span>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center sm:justify-start">
              {["Textile Mills","Restaurant Chains","IT Companies","Hospitals","Construction Firms","Retail Brands"].map((b, i) => (
                <motion.span key={b}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ease: EASE, duration: 0.4, delay: 0.05 + i * 0.08 }}
                  whileHover={{ opacity: 1, color: "rgba(74,222,128,0.8)", y: -2, transition: { duration: 0.15 } }}
                  className="text-white/60 text-sm font-semibold cursor-default"
                >{b}</motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-20 px-5 md:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ ease: EASE, duration: 0.5 }}
              className="inline-block bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-full px-4 py-1 text-xs font-bold text-green-600 dark:text-green-400 mb-4"
            >FAQ</motion.span>
            <ClipLine className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">
              Common sawalat
            </ClipLine>
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ ease: EASE, duration: 0.55, delay: 0.1 }}
              className="text-gray-500 dark:text-gray-400 text-sm sm:text-base"
            >Koi sawaal hai? Hum ne yahan cover kiya hai.</motion.p>
          </div>
          <FAQSection />
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-5 md:px-12 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 40 }} whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ ease: EASE, duration: 0.8 }}
            className="bg-green-900 rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden"
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.12, 0.05] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-64 h-64 rounded-full bg-white -top-16 -left-16"
            />
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.05, 0.12, 0.05] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute w-48 h-48 rounded-full bg-white -bottom-12 -right-12"
            />
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ ease: EASE, duration: 0.5, delay: 0.05 }}
              className="relative inline-block bg-white/10 border border-white/15 rounded-full px-4 py-1 text-xs font-bold text-white/80 mb-5"
            >Join the movement</motion.span>
            <div className="relative overflow-hidden mb-4">
              <motion.h2
                initial={{ y: "100%", skewY: 3 }} whileInView={{ y: "0%", skewY: 0 }}
                viewport={{ once: true }} transition={{ ease: EASE, duration: 0.75, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter"
              >Tayaar ho Pakistan<br/>saaf karne ke liye?</motion.h2>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ ease: EASE, duration: 0.6, delay: 0.2 }}
              className="relative text-white/50 text-sm sm:text-base mb-8 max-w-md mx-auto"
            >Hazaron log pehle se XP earn kar rahe hain. Aaj hi shuru karo — free hai, fast hai, fun hai.</motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ ease: EASE, duration: 0.55, delay: 0.3 }}
              className="relative flex flex-col sm:flex-row gap-3 justify-center"
            >
              <motion.div whileHover={{ scale: 1.07, y: -3 }} whileTap={{ scale: 0.94 }}>
                <Link href="/auth?tab=signup" className="block px-8 py-4 rounded-full bg-green-400 text-white font-bold hover:bg-green-600 transition-colors">
                  Pehla quest shuru karo ↗
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link href="/leaderboard" className="block px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-colors">
                  Leaderboard dekho
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* WHATSAPP FLOAT */}
      <motion.a
        href="https://wa.me/923001234567?text=Salam%2C%20mujhe%20scrap%20pickup%20schedule%20karni%20hai"
        target="_blank" rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ease: EASE, duration: 0.5, delay: 1.5 }}
        whileHover={{ scale: 1.12, y: -3 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full shadow-xl flex items-center justify-center"
        aria-label="WhatsApp"
      >
        <motion.div
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-40"
        />
        <svg className="w-7 h-7 text-white relative" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </motion.a>

      {/* FOOTER */}
      <footer className="bg-gray-900 dark:bg-gray-950 dark:border-t dark:border-gray-800 px-5 md:px-12 pt-12 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3"><LogoMark variant="inverted" size={26} /></div>
            <p className="text-sm text-white/60 leading-relaxed">Pakistan ka pehla gamified scrap pickup — XP kamao, paise lo, Pakistan saaf karo.</p>
          </div>
          {[
            { h:"Individuals", links:["Scrap collection","E-waste pickup","Scrap rates","XP & Levels"] },
            { h:"Businesses", links:["Corporate scrap","Paper shredding","Zero waste events","Become a partner"] },
            { h:"Company", links:["About us","Careers","Contact","Privacy policy"] },
          ].map(col => (
            <div key={col.h}>
              <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">{col.h}</h4>
              {col.links.map(l => <a key={l} href="#" className="block text-sm text-white/60 hover:text-white/90 mb-2.5 transition-colors">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-white/40">© 2025 theKabari — Made with love in Pakistan</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-white/45 hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms"   className="text-xs text-white/45 hover:text-white/70 transition-colors">Terms</Link>
            <a href="/sitemap.xml" className="text-xs text-white/45 hover:text-white/70 transition-colors">Sitemap</a>
          </div>
        </div>
      </footer>


    </div>
  );
}

const FAQS = [
  { q: "Kya pickup free hai?", a: "Haan, bilkul free hai. Koi delivery charge, pickup fee, ya hidden cost nahi — aap sirf apna scrap dete hain aur balance earn karte hain." },
  { q: "Pehli pickup pe kya hota hai?", a: "Pehli pickup special hai — aapko instant reward milta hai bina kisi minimum balance ke. Yeh theKabari ka welcome gift hai. Iske baad balance accumulate hona shuru ho jata hai." },
  { q: "Rs. 3,000 threshold kyun hai?", a: "Yeh model aapke liye actually faydemand hai — balance accumulate hone se aapko ek meaningful payout milta hai rather than Rs. 50 Rs. 50 ke chote amounts. Jitna zyada recycle karoge, utni jaldi Rs. 3,000 pohancho ge." },
  { q: "Rs. 3,000 hone ke baad kaise redeem karein?", a: "Dashboard pe 'Redeem' button activate ho jata hai. Aap Easypaisa transfer, cash pickup, ya partner discounts/vouchers mein se choose kar sakte hain." },
  { q: "Partner discounts ke liye bhi Rs. 3,000 chahiye?", a: "Nahi! Partner discounts (cafes, shops, brands) aapko kisi bhi waqt milte hain — chahe aapka balance Rs. 0 ho ya Rs. 5,000. Yeh alag benefit hai sirf member hone ke naate." },
  { q: "Minimum weight kitna hona chahiye?", a: "Koi minimum weight nahi hai. Chahe 1 kg ho ya 1000 kg — hum aate hain. Bade loads ke liye bulk pricing bhi available hai." },
  { q: "Konse areas cover hote hain?", a: "Abhi Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar aur Quetta mein service available hai. Jaldi aur cities aa rahe hain." },
  { q: "Corporate accounts ke liye kya special hai?", a: "Corporate partners ko dedicated account manager, monthly ESG report, GST-ready invoices, aur volume-based pricing milti hai. Upar 'For Business' section mein form bharo." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
      {FAQS.map((faq, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ ease: EASE, duration: 0.45, delay: i * 0.07 }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{faq.q}</span>
            <motion.div
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ ease: EASE, duration: 0.25 }}
              className="flex-shrink-0 w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
              </svg>
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ ease: EASE, duration: 0.35 }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function CorporateForm() {
  const EASE = [0.16, 1, 0.3, 1] as const;
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [volume, setVolume] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setSent(true);
    setLoading(false);
  }

  const inputCls = "w-full px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-green-400/50 focus:bg-white/[0.09] transition-colors";

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div key="success"
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ease: EASE, duration: 0.5 }}
          className="flex-1 flex flex-col items-center justify-center text-center py-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
            className="w-14 h-14 bg-green-400/15 rounded-full flex items-center justify-center text-green-400 mb-4"
          ><CheckCircleIcon className="size-8" /></motion.div>
          <h4 className="text-white font-black text-lg mb-2">Request mil gayi!</h4>
          <p className="text-white/40 text-sm">Aapka manager 48 ghante mein contact karega.</p>
        </motion.div>
      ) : (
        <motion.form key="form"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -16 }}
          onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3"
        >
          {[
            { val: company, set: setCompany, ph: "Company name" },
            { val: contact, set: setContact, ph: "Your name & designation" },
            { val: phone,   set: setPhone,   ph: "Phone / WhatsApp" },
          ].map((f, i) => (
            <motion.input key={f.ph}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ ease: EASE, duration: 0.4, delay: i * 0.07 }}
              value={f.val} onChange={e => f.set(e.target.value)}
              placeholder={f.ph} className={inputCls} required
            />
          ))}
          <motion.select
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ ease: EASE, duration: 0.4, delay: 0.21 }}
            value={volume} onChange={e => setVolume(e.target.value)}
            className={inputCls} required
          >
            <option value="" className="bg-gray-900">Monthly scrap volume</option>
            <option className="bg-gray-900">Less than 100 kg</option>
            <option className="bg-gray-900">100 kg – 1 ton</option>
            <option className="bg-gray-900">1 – 5 tons</option>
            <option className="bg-gray-900">5+ tons</option>
          </motion.select>
          <motion.button
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ease: EASE, duration: 0.4, delay: 0.28 }}
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.95 }}
            type="submit" disabled={loading}
            className="mt-1 w-full bg-green-400 hover:bg-green-500 text-white py-3 rounded-full font-bold text-sm transition-colors disabled:opacity-60"
          >
            {loading ? (
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>
                Sending...
              </motion.span>
            ) : "Request a Callback ↗"}
          </motion.button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
