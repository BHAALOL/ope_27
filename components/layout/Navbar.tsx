"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/candidats", label: "Candidats" },
  { href: "/partis", label: "Partis" },
  { href: "/sondages", label: "Sondages" },
  { href: "/comparateur", label: "Comparateur" },
  { href: "/agenda", label: "Agenda" },
  { href: "/actualites", label: "Actualités" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-dark shadow-lg shadow-black/20"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex">
                <div className="flex-1 bg-[#002395]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#ED2939]" />
              </div>
              <div className="absolute inset-0 rounded-lg ring-1 ring-white/10" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white group-hover:text-blue-300 transition-colors">
                Présidentielle
              </span>
              <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-[#ED2939]/20 text-[#ED2939] border border-[#ED2939]/30">
                2027
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "text-white bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Admin Link */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#002395]/20 text-blue-300 border border-[#002395]/30 hover:bg-[#002395]/40 transition-all"
            >
              <Flag size={12} />
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-dark border-t border-white/5">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname === link.href
                    ? "text-white bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-300 hover:bg-white/5"
            >
              Administration
            </Link>
          </div>
        </div>
      )}

      {/* Tricolor bottom border */}
      <div className="h-px w-full tricolor opacity-40" />
    </nav>
  );
}
