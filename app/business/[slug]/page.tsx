"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface PartnerInfo {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  city: string | null;
  active: boolean;
}

interface Settlement {
  total_owed: number;
  coupon_count: number;
  coupons: { code: string; item_name: string; amount: number; used_at: string }[];
}

interface CouponDetails {
  id: string;
  code: string;
  status: "active" | "used" | "expired";
  expires_at: string;
  used_at: string | null;
  customer_name: string;
  item: { name: string; description: string | null; price_pkr: number } | null;
}

export default function BusinessPortalPage() {
  const { slug } = useParams<{ slug: string }>();
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [code, setCode] = useState("");
  const [looking, setLooking] = useState(false);
  const [coupon, setCoupon] = useState<CouponDetails | null>(null);
  const [verifyError, setVerifyError] = useState("");

  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [showSettlement, setShowSettlement] = useState(false);

  const [marking, setMarking] = useState(false);
  const [markDone, setMarkDone] = useState(false);
  const [markError, setMarkError] = useState("");

  useEffect(() => {
    fetch(`/api/business/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setPartner)
      .catch(() => setNotFound(true));

    fetch(`/api/business/${slug}/settlement`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSettlement(d); })
      .catch(() => {});
  }, [slug]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLooking(true);
    setVerifyError("");
    setCoupon(null);
    setMarkDone(false);
    setMarkError("");

    const res = await fetch(`/api/business/${slug}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json();
    setLooking(false);
    if (!res.ok) { setVerifyError(data.error || "Not found"); return; }
    setCoupon(data);
  }

  async function handleMarkUsed() {
    if (!coupon) return;
    setMarking(true);
    setMarkError("");
    const res = await fetch(`/api/business/${slug}/use`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon.code }),
    });
    const data = await res.json();
    setMarking(false);
    if (!res.ok) { setMarkError(data.error || "Failed"); return; }
    setMarkDone(true);
    setCoupon(prev => prev ? { ...prev, status: "used" } : prev);
  }

  if (notFound) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-black mb-2">Portal Not Found</h1>
        <p className="text-gray-400 text-sm">This business portal link is invalid or has been removed.</p>
      </div>
    </div>
  );

  if (!partner) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-3xl animate-spin">♻️</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-900 text-white px-6 py-8 text-center">
        <div className="text-5xl mb-3">{partner.emoji}</div>
        <h1 className="text-2xl font-black tracking-tight">{partner.name}</h1>
        {partner.city && <p className="text-white/60 text-sm mt-1">{partner.city}</p>}
        <p className="text-white/50 text-xs mt-3">theKabari Partner Portal — Coupon Verification</p>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">

        {/* Verify form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <h2 className="font-black text-base mb-1">Verify Coupon Code</h2>
          <p className="text-gray-400 text-xs mb-4">Enter the code shown in the customer's app</p>
          <form onSubmit={handleVerify} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="KBRI-XXXX-XXXX-XXXX"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm font-mono focus:outline-none focus:border-green-400 focus:bg-white transition-colors uppercase"
              maxLength={19}
            />
            <button
              type="submit"
              disabled={looking || !code.trim()}
              className="px-5 py-2.5 bg-green-400 hover:bg-green-900 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {looking ? "..." : "Check"}
            </button>
          </form>
          {verifyError && (
            <p className="mt-3 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{verifyError}</p>
          )}
        </div>

        {/* Coupon result */}
        {coupon && (
          <div className={`bg-white rounded-2xl border-2 p-6 ${
            coupon.status === "active" ? "border-green-400" :
            coupon.status === "used" ? "border-gray-200" : "border-red-200"
          }`}>
            {/* Status badge */}
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-4 ${
              coupon.status === "active" ? "bg-green-50 text-green-600" :
              coupon.status === "used" ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-500"
            }`}>
              {coupon.status === "active" ? "✅ Valid" : coupon.status === "used" ? "✓ Already Used" : "⚠️ Expired"}
            </div>

            {/* Item */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Item</p>
              <p className="text-xl font-black">{coupon.item?.name}</p>
              {coupon.item?.description && (
                <p className="text-gray-500 text-sm mt-0.5">{coupon.item.description}</p>
              )}
              <p className="text-green-600 font-bold text-sm mt-1">Rs. {coupon.item?.price_pkr?.toLocaleString()}</p>
            </div>

            {/* Customer */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Customer</p>
              <p className="font-semibold text-sm">{coupon.customer_name}</p>
            </div>

            {/* Expiry */}
            <div className="mb-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                {coupon.status === "used" ? "Used On" : "Valid Until"}
              </p>
              <p className="font-semibold text-sm">
                {new Date(coupon.status === "used" && coupon.used_at ? coupon.used_at : coupon.expires_at)
                  .toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            {/* Code */}
            <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-center font-mono text-sm font-bold text-gray-500 mb-5 border border-gray-100">
              {coupon.code}
            </div>

            {coupon.status === "active" && !markDone && (
              <>
                {markError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-3">{markError}</p>
                )}
                <button
                  onClick={handleMarkUsed}
                  disabled={marking}
                  className="w-full bg-green-400 hover:bg-green-900 text-white py-3 rounded-full font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {marking ? "Recording..." : "✓ Mark as Used — Record Sale"}
                </button>
              </>
            )}

            {(coupon.status === "used" || markDone) && (
              <div className="text-center py-2 text-green-600 font-bold text-sm">
                ✅ Sale recorded successfully
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!coupon && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-sm mb-3">How to verify</h3>
            <ol className="space-y-2 text-sm text-gray-500">
              <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-green-50 text-green-600 text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>Ask customer to open their theKabari app</li>
              <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-green-50 text-green-600 text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>Customer shows coupon code in Rewards section</li>
              <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-green-50 text-green-600 text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>Enter the code above and click Check</li>
              <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-green-50 text-green-600 text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>If valid, provide the item and click Mark as Used</li>
            </ol>
          </div>
        )}

        {/* Settlement summary */}
        {settlement && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowSettlement(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div>
                <p className="font-black text-sm">Outstanding Settlement</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {settlement.coupon_count} coupon{settlement.coupon_count !== 1 ? "s" : ""} redeemed at this location
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div className="font-black text-lg text-amber-600">Rs. {settlement.total_owed.toLocaleString()}</div>
                <div className="text-xs text-gray-400">theKabari owes you</div>
              </div>
            </button>

            {showSettlement && settlement.coupon_count > 0 && (
              <div className="border-t border-gray-50 px-5 py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[300px]">
                    <thead className="text-gray-400 text-[10px] uppercase tracking-wide">
                      <tr>
                        <th className="text-left pb-2">Code</th>
                        <th className="text-left pb-2">Item</th>
                        <th className="text-left pb-2">Date</th>
                        <th className="text-right pb-2">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {settlement.coupons.map(c => (
                        <tr key={c.code}>
                          <td className="py-2 font-mono text-gray-500 pr-3">{c.code}</td>
                          <td className="py-2 pr-3">{c.item_name}</td>
                          <td className="py-2 text-gray-400 pr-3">
                            {c.used_at ? new Date(c.used_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : "—"}
                          </td>
                          <td className="py-2 text-right font-bold text-amber-600">Rs. {c.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400 mt-4 border-t border-gray-50 pt-3">
                  To settle, contact us at <span className="font-semibold text-gray-600">hello@thekabari.pk</span>
                </p>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-300 mt-6">
          Powered by <span className="font-bold text-gray-400">theKabari</span> · Partner Portal
        </p>
      </div>
    </div>
  );
}
