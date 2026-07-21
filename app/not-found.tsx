import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">♻️</div>
        <div className="text-[7rem] font-black leading-none text-green-400 mb-2">404</div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Yeh page nahi mila</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
          Lagta hai yeh link expire ho gaya — jaise purana scrap. Ghar wapis chalein?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-green-400 text-white font-bold text-sm hover:bg-green-900 transition-colors"
          >
            Home pe jao ↗
          </Link>
          <Link
            href="/pickup"
            className="px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-sm hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 transition-all"
          >
            Pickup schedule karo
          </Link>
        </div>
      </div>
    </div>
  );
}
