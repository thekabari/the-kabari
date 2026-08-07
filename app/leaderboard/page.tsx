import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "theKabari ka top recyclers ka leaderboard. Dekho kaun hai Pakistan ka best recycler — XP, kg, aur rank.",
  alternates: { canonical: "https://thekabari.pk/leaderboard" },
};
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLevel, getLevelName } from "@/lib/utils";
import Link from "next/link";
import { Profile } from "@/types";
import { TrophyIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

export const revalidate = 60;

export default async function LeaderboardPage() {
  const supabase = createAdminClient();

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  const { data: players } = await supabase
    .from("profiles")
    .select("id, name, city, xp, total_kg, total_cash, role")
    .eq("status", "approved")
    .eq("role", "user")
    .order("xp", { ascending: false })
    .limit(50);

  const { data: myProfile } = session
    ? await supabase.from("profiles").select("id, xp").eq("id", session.id).single()
    : { data: null };

  const DUMMY_PLAYERS = [
    { id: "d1", name: "Ahmed Khan",    city: "Karachi",   xp: 4820, total_kg: 96.5,  total_cash: 4800, role: "user" },
    { id: "d2", name: "Sara Malik",    city: "Lahore",    xp: 3610, total_kg: 72.2,  total_cash: 3600, role: "user" },
    { id: "d3", name: "Hassan Raza",   city: "Islamabad", xp: 2990, total_kg: 59.8,  total_cash: 2990, role: "user" },
    { id: "d4", name: "Fatima Noor",   city: "Karachi",   xp: 2440, total_kg: 48.8,  total_cash: 2440, role: "user" },
    { id: "d5", name: "Usman Ali",     city: "Faisalabad",xp: 1870, total_kg: 37.4,  total_cash: 1870, role: "user" },
    { id: "d6", name: "Ayesha Baig",   city: "Lahore",    xp: 1550, total_kg: 31.0,  total_cash: 1550, role: "user" },
    { id: "d7", name: "Bilal Sheikh",  city: "Rawalpindi",xp: 1200, total_kg: 24.0,  total_cash: 1200, role: "user" },
    { id: "d8", name: "Zara Hussain",  city: "Karachi",   xp:  870, total_kg: 17.4,  total_cash:  870, role: "user" },
    { id: "d9", name: "Kamran Iqbal",  city: "Multan",    xp:  620, total_kg: 12.4,  total_cash:  620, role: "user" },
    { id: "d10",name: "Nadia Qureshi", city: "Islamabad", xp:  380, total_kg:  7.6,  total_cash:  380, role: "user" },
  ];

  const isDummy = !players || players.length === 0;
  const displayPlayers = isDummy ? DUMMY_PLAYERS : players;
  const myRank = players?.findIndex(p => p.id === myProfile?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-black text-green-900 text-lg">theKabari</Link>
        <div className="flex gap-2 sm:gap-3">
          {session ? (
            <Link href="/dashboard" className="px-3 sm:px-4 py-2 rounded-full bg-green-400 text-white text-sm font-semibold hover:bg-green-900 transition-colors whitespace-nowrap">
              My Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth" className="hidden sm:block px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold hover:border-green-400 hover:text-green-600 transition-all">Login</Link>
              <Link href="/auth?tab=signup" className="px-3 sm:px-4 py-2 rounded-full bg-green-400 text-white text-sm font-semibold hover:bg-green-900 transition-colors whitespace-nowrap">Join ↗</Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <span className="inline-block bg-green-50 border border-green-100 rounded-full px-4 py-1 text-xs font-bold text-green-600 mb-3">Leaderboard</span>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Is mahine ke<br/>top players <TrophyIcon className="size-8 text-amber-400 inline-block align-middle ml-1" /></h1>
          <p className="text-gray-400 text-sm">Jitna zyada recycle karo — utna zyada XP, utna zyada rank.</p>
        </div>

        {myProfile && myRank !== undefined && myRank >= 0 && (
          <div className="bg-green-900 rounded-2xl p-5 mb-6 text-white flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0">
              #{myRank + 1}
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-xs mb-0.5">Aapki rank</p>
              <p className="font-black text-lg">#{myRank + 1} overall</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">{myProfile.xp}</div>
              <div className="text-white/50 text-xs">XP</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { n: displayPlayers.length, l: "Players" },
            { n: `${displayPlayers.reduce((a, p) => a + Number(p.total_kg ?? 0), 0).toFixed(0)} kg`, l: "Total recycled" },
            { n: displayPlayers[0]?.xp || 0, l: "Top XP" },
          ].map(s => (
            <div key={s.l} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-black text-gray-900">{s.n}</div>
              <div className="text-xs text-gray-400 mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-black text-base">Top Recyclers</h2>
            {isDummy && <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">Sample data</span>}
          </div>
          <div className="divide-y divide-gray-50">
            {displayPlayers.map((player, i) => {
              const isMe = player.id === myProfile?.id;
              const lvl = getLevel(player.xp);
              return (
                <div key={player.id}
                  className={`flex items-center gap-3 px-5 py-4 transition-colors ${
                    isMe ? "bg-green-50" : isDummy ? "opacity-75 hover:opacity-100" : "hover:bg-gray-50"
                  }`}>
                  <div className={`w-8 flex items-center justify-center font-black text-base flex-shrink-0 ${
                    i === 0 ? "text-amber-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-gray-300"
                  }`}>
                    {i < 3 ? <TrophyIcon className="size-5" /> : `#${i + 1}`}
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    i === 0 ? "bg-amber-50 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-500" :
                    i === 2 ? "bg-orange-50 text-orange-700" : isMe ? "bg-green-100 text-green-700" : "bg-gray-50 text-gray-400"
                  }`}>
                    {player.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{player.name}</span>
                      {isMe && <span className="text-xs bg-green-400 text-white px-2 py-0.5 rounded-full">Aap</span>}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${i < 3 ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                        Lvl {lvl}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {player.city} · {getLevelName(player.xp)} · {Number(player.total_kg ?? 0).toFixed(1)} kg
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-base font-black text-green-600">{player.xp.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!session && (
          <div className="mt-6 bg-green-900 rounded-2xl p-6 text-center text-white">
            <h3 className="text-xl font-black mb-2 flex items-center justify-center gap-2">Leaderboard pe aao! <RocketLaunchIcon className="size-5" /></h3>
            <p className="text-white/60 text-sm mb-4">Sign up karo, scrap recycle karo, aur apna naam yahan dekho.</p>
            <Link href="/auth?tab=signup" className="inline-block bg-green-400 text-white px-8 py-3 rounded-full font-bold hover:bg-green-600 transition-colors">
              Join Now — It's Free ↗
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
