import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 overflow-hidden">
          <div className="flex w-full h-full">
            <div className="flex-1 bg-[#002395]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#ED2939]" />
          </div>
        </div>

        <h1 className="font-display text-6xl font-bold gradient-text mb-4">
          404
        </h1>
        <h2 className="text-xl font-semibold text-white mb-2">
          Page introuvable
        </h2>
        <p className="text-gray-400 mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#002395] hover:bg-[#002395]/80 text-white font-semibold transition-all"
          >
            <Home size={16} />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/candidats"
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={16} />
            Voir les candidats
          </Link>
        </div>
      </div>
    </div>
  );
}
