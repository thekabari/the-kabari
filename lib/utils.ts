import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const XP_RATES: Record<string, number> = {
  Paper: 4, Plastic: 5, Metal: 8,
  Electronics: 12, Glass: 3, Cardboard: 4,
};

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1500, 2500, 4000, 6000, 10000];

export const LEVEL_NAMES = [
  "", "Starter", "Collector", "Recycler", "Green Scout",
  "Eco Warrior", "City Hero", "Eco Legend", "Planet Guardian",
  "Supreme Recycler", "Kabari Master",
];

export function getLevel(xp: number) {
  let lvl = 1;
  LEVEL_THRESHOLDS.forEach((t, i) => { if (xp >= t) lvl = i + 1; });
  return Math.min(lvl, LEVEL_THRESHOLDS.length);
}

export function getLevelName(xp: number) {
  return LEVEL_NAMES[getLevel(xp)] || "Kabari Master";
}

export function getNextLevelXP(xp: number) {
  const lvl = getLevel(xp);
  return LEVEL_THRESHOLDS[lvl] ?? null;
}

export function getLevelProgress(xp: number) {
  const lvl = getLevel(xp);
  const prev = LEVEL_THRESHOLDS[lvl - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[lvl] ?? xp;
  return next === prev ? 100 : Math.round(((xp - prev) / (next - prev)) * 100);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export const SCRAP_EMOJI: Record<string, string> = {
  Paper: "📄", Plastic: "🧴", Metal: "🔩",
  Electronics: "💻", Glass: "🫙", Cardboard: "📦",
};

// 1 PKR cash received at pickup = 1 XP (earning side)
export function cashToXP(cashPkr: number): number {
  return Math.floor(cashPkr);
}

// 1 PKR item value = 20 XP to redeem (spending side)
export const POINTS_PER_PKR = 20;

export function itemPointsCost(pricePkr: number): number {
  return pricePkr * POINTS_PER_PKR;
}
