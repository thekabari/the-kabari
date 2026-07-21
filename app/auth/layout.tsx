import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login / Sign Up",
  description: "theKabari account banao ya login karo. Free signup, instant XP, aur door-to-door scrap pickup.",
  alternates: { canonical: "https://thekabari.pk/auth" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
