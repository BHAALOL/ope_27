import Link from "next/link";
import { Flag, Github, Twitter } from "lucide-react";

const footerLinks = {
  Élection: [
    { href: "/candidats", label: "Candidats" },
    { href: "/partis", label: "Partis" },
    { href: "/sondages", label: "Sondages" },
    { href: "/comparateur", label: "Comparateur" },
  ],
  Infos: [
    { href: "/agenda", label: "Agenda" },
    { href: "/actualites", label: "Actualités" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex">
                <div className="flex-1 bg-[#002395]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#ED2939]" />
              </div>
              <span className="font-display font-bold text-xl">
                Présidentielle 2027
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Suivez en temps réel la campagne présidentielle française de 2027.
              Candidats, programmes, sondages et agenda centralisés.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Flag size={14} className="text-[#ED2939]" />
              <span className="text-xs text-gray-500 italic">
                Site non officiel, à des fins d&apos;information uniquement.
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-3">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Présidentielle 2027. Tous droits
            réservés.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
          </div>
        </div>

        {/* Tricolor stripe */}
        <div className="mt-6 h-1 w-full rounded-full overflow-hidden">
          <div className="h-full tricolor opacity-60" />
        </div>
      </div>
    </footer>
  );
}
