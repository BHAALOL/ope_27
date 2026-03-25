import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Users, Building2, BarChart2, Newspaper, Calendar, TrendingUp } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getStats() {
  try {
    const [candidats, partis, sondages, actualites, evenements] = await Promise.all([
      prisma.candidat.count(),
      prisma.parti.count(),
      prisma.sondage.count(),
      prisma.actualite.count(),
      prisma.evenement.count(),
    ]);
    const published = await prisma.candidat.count({ where: { published: true } });
    return { candidats, partis, sondages, actualites, evenements, published };
  } catch {
    return { candidats: 0, partis: 0, sondages: 0, actualites: 0, evenements: 0, published: 0 };
  }
}

const statCards = [
  {
    label: "Candidats",
    key: "candidats" as const,
    icon: Users,
    href: "/admin/candidats",
    color: "#002395",
  },
  {
    label: "Partis",
    key: "partis" as const,
    icon: Building2,
    href: "/admin/partis",
    color: "#ED2939",
  },
  {
    label: "Sondages",
    key: "sondages" as const,
    icon: BarChart2,
    href: "/admin/sondages",
    color: "#6366f1",
  },
  {
    label: "Actualités",
    key: "actualites" as const,
    icon: Newspaper,
    href: "/admin/actualites",
    color: "#f59e0b",
  },
  {
    label: "Événements",
    key: "evenements" as const,
    icon: Calendar,
    href: "/admin/agenda",
    color: "#14b8a6",
  },
];

export default async function AdminDashboard() {
  const [session, stats] = await Promise.all([
    getServerSession(authOptions),
    getStats(),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Bonjour, {session?.user?.name || "Admin"} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          Tableau de bord — Présidentielle 2027
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <Link key={card.key} href={card.href}>
              <div className="glass rounded-2xl p-5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/15 group">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${card.color}20` }}
                >
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: card.color }}
                >
                  {value}
                </div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {card.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Published vs Total */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Candidats publiés
          </h2>
          <div className="flex items-end gap-4">
            <div>
              <div className="text-4xl font-bold text-white">{stats.published}</div>
              <div className="text-sm text-gray-400">sur {stats.candidats} total</div>
            </div>
            <div className="flex-1 mb-2">
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#002395] rounded-full transition-all"
                  style={{
                    width: `${stats.candidats > 0 ? (stats.published / stats.candidats) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/admin/candidats/nouveau", label: "+ Candidat", color: "#002395" },
              { href: "/admin/partis/nouveau", label: "+ Parti", color: "#ED2939" },
              { href: "/admin/sondages", label: "+ Sondage", color: "#6366f1" },
              { href: "/admin/agenda", label: "+ Événement", color: "#14b8a6" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: `${action.color}20`,
                  color: action.color,
                  border: `1px solid ${action.color}30`,
                }}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="mt-6 glass rounded-2xl p-5 flex items-center gap-4">
        <div className="p-2 rounded-xl bg-indigo-500/20">
          <TrendingUp size={18} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-sm text-white font-medium">
            Utilisez l&apos;IA pour générer du contenu
          </p>
          <p className="text-xs text-gray-400">
            Lors de la création d&apos;un candidat ou d&apos;un parti, vous pouvez utiliser Claude AI pour
            générer automatiquement la biographie et le programme.
          </p>
        </div>
      </div>
    </div>
  );
}
