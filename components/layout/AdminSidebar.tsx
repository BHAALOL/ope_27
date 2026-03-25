"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart2,
  Newspaper,
  Calendar,
  LogOut,
  ChevronRight,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/candidats", label: "Candidats", icon: Users },
  { href: "/admin/partis", label: "Partis", icon: Building2 },
  { href: "/admin/sondages", label: "Sondages", icon: BarChart2 },
  { href: "/admin/actualites", label: "Actualités", icon: Newspaper },
  { href: "/admin/agenda", label: "Agenda", icon: Calendar },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-dark-800 border-r border-white/5 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" prefetch={false} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex">
            <div className="flex-1 bg-[#002395]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#ED2939]" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-white">
              Présidentielle
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#ED2939] font-semibold">2027</span>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href, link.exact);

          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-[#002395]/20 text-white border border-[#002395]/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                size={16}
                className={cn(
                  "transition-colors",
                  active ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
                )}
              />
              <span>{link.label}</span>
              {active && (
                <ChevronRight
                  size={14}
                  className="ml-auto text-blue-400"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link
          href="/"
          prefetch={false}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Flag size={16} />
          Voir le site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
