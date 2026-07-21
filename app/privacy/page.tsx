import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "theKabari ki Privacy Policy — aapka data kaise collect, use aur protect kiya jata hai.",
  alternates: { canonical: "https://thekabari.pk/privacy" },
};

const SECTIONS = [
  {
    heading: "1. Information We Collect",
    body: `When you create an account or schedule a pickup, we collect:
• Full name, email address, and phone number
• City and pickup address
• Scrap type, weight, and cash/XP earned per transaction
• Account login credentials (password stored as a one-way hash — we never see it in plain text)
• Device/browser information for security and analytics

For guest (one-time) pickups we collect name, phone, city, address, and scrap type — no account is created.`,
  },
  {
    heading: "2. How We Use Your Information",
    body: `We use your data solely to operate theKabari's service:
• Schedule and confirm scrap pickups
• Process Easypaisa or cash payments at the door
• Award XP and update your leaderboard rank
• Send pickup confirmations and account notifications (SMS/WhatsApp)
• Generate ESG/CSR reports for corporate partners
• Improve our platform through aggregate, anonymised analytics (Google Analytics 4)`,
  },
  {
    heading: "3. Data Sharing",
    body: `We do NOT sell your personal data. We share limited data only with:
• Supabase (our database host, servers in EU) — to store your account and transaction records
• Google Analytics — anonymised usage data with IP anonymisation enabled
• Our field team — name, phone, and address shared only for your scheduled pickup
• Easypaisa — transaction details required to process your payment

All third parties are contractually bound to protect your data and use it only for the stated purpose.`,
  },
  {
    heading: "4. Data Retention",
    body: `• Account data is retained while your account is active.
• If you delete your account, personal data is removed within 30 days. Anonymised transaction records (for aggregate reporting) may be retained longer.
• Guest pickup records are retained for 90 days, then deleted.`,
  },
  {
    heading: "5. Cookies & Analytics",
    body: `We use cookies for:
• Session authentication (httpOnly cookie, expires in 7 days)
• Google Analytics 4 (anonymised, no cross-site tracking)

You can clear cookies in your browser at any time. Disabling cookies will log you out of your account.`,
  },
  {
    heading: "6. Security",
    body: `We take security seriously:
• Passwords are hashed with bcrypt (industry standard, never stored in plain text)
• All data in transit is encrypted via HTTPS/TLS
• Admin routes require server-side role verification on every request
• We do not store payment credentials — cash and Easypaisa transactions happen at the door`,
  },
  {
    heading: "7. Your Rights",
    body: `You have the right to:
• Access the personal data we hold about you
• Correct inaccurate data
• Request deletion of your account and data
• Withdraw consent for marketing communications

To exercise any of these rights, email: privacy@thekabari.pk`,
  },
  {
    heading: "8. Children's Privacy",
    body: `theKabari is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has created an account, contact us and we will delete it promptly.`,
  },
  {
    heading: "9. Changes to This Policy",
    body: `We may update this Privacy Policy as our service evolves. We will notify registered users via email of any material changes. Continued use of theKabari after the effective date constitutes acceptance of the updated policy.`,
  },
  {
    heading: "10. Contact Us",
    body: `Questions about this policy?
Email: privacy@thekabari.pk
WhatsApp: +92 300 000 0000 (Business hours: Mon–Sat, 9am–6pm)`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 md:px-12 h-14 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-black text-green-900 dark:text-green-400 text-lg">theKabari</Link>
        <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">← Back to home</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-12">
        <div className="mb-10">
          <span className="inline-block bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 text-green-600 dark:text-green-400 text-xs font-bold px-4 py-1 rounded-full mb-4">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">Privacy Policy</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: July 2025 · Effective: July 2025</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl px-5 py-4 mb-10 text-sm text-amber-700 dark:text-amber-400">
          <strong>Summary:</strong> We collect your name, contact info, and scrap pickup data to run our service. We don't sell your data. You can request deletion anytime by emailing privacy@thekabari.pk.
        </div>

        <div className="space-y-8">
          {SECTIONS.map(s => (
            <div key={s.heading} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="text-base font-black text-gray-900 dark:text-white mb-3">{s.heading}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-xs text-gray-400 dark:text-gray-600">
          <Link href="/terms" className="hover:text-green-600 dark:hover:text-green-400 transition-colors mr-4">Terms of Service</Link>
          <Link href="/" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
