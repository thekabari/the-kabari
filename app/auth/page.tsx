"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState<"login" | "signup">(
    params.get("tab") === "signup" ? "signup" : "login"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [signupPass, setSignupPass] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }

      if (data.role === "admin") router.push("/admin");
      else if (data.status === "approved") router.push("/dashboard");
      else router.push("/dashboard?pending=true");
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (signupPass.length < 6) { setError("Password kam az kam 6 characters ka hona chahiye"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail, password: signupPass, name, phone, city }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed"); return; }
      router.push("/dashboard?pending=true");
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 w-full max-w-sm">
        <div className="text-2xl font-black text-green-900 tracking-tight mb-6">theKabari ♻️</div>

        <div className="flex bg-gray-50 rounded-xl p-1 gap-1 mb-6">
          {(["login","signup"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
              }`}>
              {t === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
        )}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-xl font-black mb-1">Wapis aao! 👋</h2>
            <p className="text-sm text-gray-400 mb-4">Apne account mein login karo.</p>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}
                placeholder="aap@email.com" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)}
                placeholder="••••••••" className={inputCls} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-400 hover:bg-green-900 text-white py-3 rounded-full font-bold text-base transition-colors disabled:opacity-60 mt-2">
              {loading ? "Logging in..." : "Login Karo"}
            </button>
            <p className="text-center text-sm text-gray-400">
              Account nahi hai?{" "}
              <button type="button" onClick={() => setTab("signup")} className="text-green-600 font-semibold">Sign up karo</button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3">
            <h2 className="text-xl font-black mb-1">Shuru karo! ♻️</h2>
            <p className="text-sm text-gray-400 mb-4">Free account banao aur XP earn karna shuru karo.</p>
            <div>
              <label className={labelCls}>Full Name</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)}
                placeholder="Aapka naam" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={signupEmail} onChange={e=>setSignupEmail(e.target.value)}
                placeholder="aap@email.com" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="text" value={phone} onChange={e=>setPhone(e.target.value)}
                placeholder="+92 300 1234567" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <select value={city} onChange={e=>setCity(e.target.value)} className={inputCls} required>
                <option value="">City chunein</option>
                {["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Peshawar","Quetta"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" value={signupPass} onChange={e=>setSignupPass(e.target.value)}
                placeholder="Min 6 characters" className={inputCls} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-400 hover:bg-green-900 text-white py-3 rounded-full font-bold text-base transition-colors disabled:opacity-60 mt-2">
              {loading ? "Creating account..." : "Account Banao"}
            </button>
            <p className="text-center text-sm text-gray-400">
              Account hai?{" "}
              <button type="button" onClick={() => setTab("login")} className="text-green-600 font-semibold">Login karo</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
