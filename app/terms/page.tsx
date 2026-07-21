import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "theKabari ke Terms of Service — service use karne ke rules aur conditions.",
  alternates: { canonical: "https://thekabari.pk/terms" },
};

const SECTIONS = [
  {
    heading: "1. Acceptance of Terms",
    body: `By creating an account on theKabari or submitting a pickup request (as a guest or member), you agree to these Terms of Service. If you do not agree, please do not use the service.`,
  },
  {
    heading: "2. Description of Service",
    body: `theKabari provides a scrap collection and recycling service in selected cities across Pakistan. Users can:
• Schedule free doorstep pickup of recyclable materials
• Receive cash or Easypaisa payment based on weight and current market rates
• Earn XP points and unlock badges via our gamified loyalty system
• View their rank on the public leaderboard

We do not guarantee a specific rate per kilogram. Rates are indicative and based on current market prices; the final rate is confirmed at the time of pickup.`,
  },
  {
    heading: "3. Eligibility",
    body: `You must be at least 16 years old to create an account. By registering, you confirm that the information you provide is accurate and complete. Corporate accounts must be registered by an authorised representative of the company.`,
  },
  {
    heading: "4. Account Approval",
    body: `New accounts require approval by theKabari's team before the dashboard is unlocked. We reserve the right to approve, reject, or suspend any account at our discretion. Rejection or suspension does not entitle you to any compensation.`,
  },
  {
    heading: "5. Pickup Scheduling & Cancellation",
    body: `• Pickups are scheduled based on team availability in your city.
• We will confirm your pickup via WhatsApp or SMS.
• You may cancel or reschedule at any time before the team departs.
• If our team arrives and no one is available, we reserve the right to mark the request as cancelled and deprioritise future bookings.`,
  },
  {
    heading: "6. Payment Terms",
    body: `• Payment is made at the door, at the time of pickup — cash or Easypaisa.
• Payment is calculated based on the weight measured by our team using calibrated digital scales.
• In the event of a dispute over weight, our team's measurement is final.
• XP is credited to your account after the pickup is marked complete by admin.
• theKabari is not responsible for delays in Easypaisa transfers caused by the payment network.`,
  },
  {
    heading: "7. Prohibited Materials",
    body: `The following materials are NOT accepted:
• Hazardous chemicals, industrial waste, or medical waste
• Radioactive materials
• Any materials that are illegal to possess or transfer under Pakistani law

Misrepresentation of materials may result in immediate account suspension.`,
  },
  {
    heading: "8. XP, Badges & Leaderboard",
    body: `XP points, badges, and leaderboard rank are cosmetic rewards with no monetary value unless explicitly stated in a promotion. theKabari reserves the right to modify, reset, or remove XP and badges at any time. We are not liable for any loss of virtual rewards.`,
  },
  {
    heading: "9. Corporate Accounts",
    body: `Corporate partners agree to additional terms discussed and agreed upon before onboarding. ESG reports are provided on a best-effort basis. Corporate invoices are GST-inclusive where applicable and due within 15 days of issue.`,
  },
  {
    heading: "10. Intellectual Property",
    body: `All content on theKabari — including design, copy, logos, and software — is owned by theKabari and protected under applicable intellectual property laws. You may not copy, reproduce, or repurpose any content without written permission.`,
  },
  {
    heading: "11. Limitation of Liability",
    body: `theKabari is not liable for:
• Damage to property during pickup (though our team takes every precaution)
• Delays due to circumstances beyond our control (traffic, weather, team illness)
• Loss of income resulting from account suspension
• Inaccuracies in the indicative scrap rate table

Our total liability to you in any 12-month period shall not exceed the total amount paid to you by us in that period.`,
  },
  {
    heading: "12. Termination",
    body: `Either party may terminate the relationship at any time. You may delete your account by contacting support@thekabari.pk. We may terminate accounts that violate these terms, engage in fraud, or abuse the platform. Pending payments at the time of termination will be honoured.`,
  },
  {
    heading: "13. Governing Law",
    body: `These Terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the courts of Karachi, Pakistan.`,
  },
  {
    heading: "14. Changes to Terms",
    body: `We may update these Terms at any time. Material changes will be communicated to registered users via email at least 7 days before taking effect. Continued use of the service after the effective date constitutes acceptance of the revised Terms.`,
  },
  {
    heading: "15. Contact",
    body: `For any questions about these Terms:
Email: support@thekabari.pk
WhatsApp: +92 300 000 0000`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 md:px-12 h-14 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-black text-green-900 dark:text-green-400 text-lg">theKabari</Link>
        <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">← Back to home</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-12">
        <div className="mb-10">
          <span className="inline-block bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 text-green-600 dark:text-green-400 text-xs font-bold px-4 py-1 rounded-full mb-4">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">Terms of Service</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: July 2025 · Effective: July 2025</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl px-5 py-4 mb-10 text-sm text-blue-700 dark:text-blue-400">
          <strong>Summary:</strong> Use theKabari fairly, provide accurate information, and respect our team. We'll pay you promptly, treat your data with care, and give you the best possible service.
        </div>

        <div className="space-y-6">
          {SECTIONS.map(s => (
            <div key={s.heading} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="text-base font-black text-gray-900 dark:text-white mb-3">{s.heading}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-xs text-gray-400 dark:text-gray-600">
          <Link href="/privacy" className="hover:text-green-600 dark:hover:text-green-400 transition-colors mr-4">Privacy Policy</Link>
          <Link href="/" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
