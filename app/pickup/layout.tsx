import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule a Pickup",
  description: "Free scrap pickup schedule karo — ghar se pickup, instant payment. Paper, plastic, metal, electronics sab kuch.",
  alternates: { canonical: "https://thekabari.pk/pickup" },
};

export default function PickupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
