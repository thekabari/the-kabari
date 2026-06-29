"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "./components/ThemeToggle";
import { motion, useInView, AnimatePresence, useMotionValue, animate, useTransform, type Variants } from "framer-motion";

/* ── Easing & spring ────────────────────────────── */
const EASE  = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 260, damping: 22 } as const;

/* ── Variants ───────────────────────────────────── */
const fadeUpBig: Variants = {
  hidden: { opacity: 0, y: 70, filter: "blur(6px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { ease: EASE, duration: 0.75 } },
};
const cardReveal: Variants = {
  hidden: { opacity: 0, y: 80, rotate: 4, scale: 0.94 },
  show:   { opacity: 1, y: 0,  rotate: 0, scale: 1,    transition: { ...SPRING } },
};
const scaleUpBig: Variants = {
  hidden: { opacity: 0, scale: 0.72 },
  show:   { opacity: 1, scale: 1,    transition: { ease: EASE, duration: 0.55 } },
};
const slideRightBig: Variants = {
  hidden: { opacity: 0, x: 70, filter: "blur(4px)" },
  show:   { opacity: 1, x: 0,  filter: "blur(0px)", transition: { ease: EASE, duration: 0.7 } },
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

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Link href="/" className="text-xl font-black text-green-900 dark:text-green-400 tracking-tight">theKabari</Link>

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
              <a href="#corporate" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors">🏢 For Business</a>
              <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors">🏆 Leaderboard</Link>
              <Link href="/auth" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl transition-colors sm:hidden">Login</Link>
              <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
                <Link href="/pickup" onClick={() => setMenuOpen(false)} className="block w-full text-center px-4 py-3 bg-green-400 text-white text-sm font-bold rounded-xl hover:bg-green-900 transition-colors">
                  📦 Pickup Schedule Karo
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

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
            Free doorstep pickup. Instant Easypaisa payment. Real XP aur badges earn karo.
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
                {[["📄","Paper","+4 XP/kg"],["🧴","Plastic","+5 XP/kg"],["🔩","Metal","+8 XP/kg"]].map(([e,n,x]) => (
                  <div key={n} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-2 py-1.5 mb-1.5">
                    <span className="text-xs">{e}</span>
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
              { n:"01", title:"Pickup schedule karo", desc:"Time slot chuno. Hum ghar aate hain — koi minimum weight nahi.", badge:"Free" },
              { n:"02", title:"Darwaze pe tolte hain", desc:"Hamare trained team aapke saamne digital scales se scrap tolte hain." },
              { n:"03", title:"Paise + XP milta hai", desc:"Cash ya Easypaisa transfer — aur XP seedha profile mein add hota hai.", badge:"Instant" },
              { n:"04", title:"Badges unlock karo", desc:"Milestones hit karo, city badges unlock karo, leaderboard pe chado." },
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
                className="text-white/45 text-sm sm:text-base max-w-lg leading-relaxed"
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
                  <div className="text-[10px] text-white/35 mt-0.5 leading-tight">{s.l}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Main grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InView variants={staggerFast(0, 0.08)} className="grid grid-cols-2 gap-3">
              {[
                { icon: "🔄", title: "Recurring Pickups", desc: "Weekly or monthly scheduled collections — set it and forget it." },
                { icon: "📊", title: "ESG Reports", desc: "Monthly PDF reports: tonnage, CO₂ offset, material breakdown." },
                { icon: "🧾", title: "Digital Invoicing", desc: "GST-ready invoices auto-generated after every pickup." },
                { icon: "👔", title: "Dedicated Manager", desc: "A single point of contact for your account, always." },
                { icon: "🏭", title: "Bulk Pricing", desc: "Volume-based rates — the more you recycle, the more you earn." },
                { icon: "🔒", title: "Secure Disposal", desc: "Certified shredding for confidential documents and e-waste." },
              ].map(f => (
                <motion.div key={f.title} variants={cardReveal}
                  whileHover={{ y: -10, scale: 1.04, backgroundColor: "rgba(255,255,255,0.09)", borderColor: "rgba(74,222,128,0.35)", boxShadow: "0 16px 40px -8px rgba(34,197,94,0.2)", transition: { ease: "easeOut", duration: 0.18 } }}
                  className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 cursor-default group"
                >
                  <motion.div
                    whileHover={{ scale: 1.4, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                    className="text-2xl mb-2 inline-block"
                  >{f.icon}</motion.div>
                  <h4 className="text-white text-sm font-bold mb-1 group-hover:text-green-400 transition-colors">{f.title}</h4>
                  <p className="text-white/35 text-xs leading-relaxed">{f.desc}</p>
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
                  className="w-10 h-10 bg-green-400/15 rounded-2xl flex items-center justify-center text-xl mb-4 inline-flex"
                >🏢</motion.div>
                <h3 className="text-white text-xl font-black mb-2">Partner karo theKabari se</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Form bharo — aapka dedicated account manager 48 ghante mein contact karega.
                </p>
              </div>
              <CorporateForm />
              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <p className="text-white/25 text-xs text-center">
                  Already a partner? Email{" "}
                  <a href="mailto:corporate@thekabari.pk" className="text-green-400/70 hover:text-green-400 transition-colors">
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
            <span className="text-white/25 text-xs font-semibold uppercase tracking-widest whitespace-nowrap">Trusted by</span>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center sm:justify-start">
              {["Textile Mills","Restaurant Chains","IT Companies","Hospitals","Construction Firms","Retail Brands"].map((b, i) => (
                <motion.span key={b}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ease: EASE, duration: 0.4, delay: 0.05 + i * 0.08 }}
                  whileHover={{ opacity: 1, color: "rgba(74,222,128,0.8)", y: -2, transition: { duration: 0.15 } }}
                  className="text-white/30 text-sm font-semibold cursor-default"
                >{b}</motion.span>
              ))}
            </div>
          </motion.div>
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
            className="w-14 h-14 bg-green-400/15 rounded-full flex items-center justify-center text-2xl mb-4"
          >✅</motion.div>
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
