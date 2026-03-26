import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Building2, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partis politiques",
  description: "Partis politiques engagés dans la présidentielle 2027",
};

async function getPartis() {
  try {
    return await prisma.parti.findMany({
      where: { published: true },
      include: { candidats: { where: { published: true } } },
      orderBy: { nom: "asc" },
    });
  } catch (error) {
    console.error("getPartis error:", error);
    return [];
  }
}

export default async function PartisPage() {
  const partis = await getPartis();

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#ED2939]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={22} className="text-[#ED2939]" />
            <span className="text-[#ED2939] text-sm font-medium uppercase tracking-wide">
              Partis
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Partis politiques
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Les formations politiques engagées dans la course à la présidence.
          </p>
        </div>

        {/* Grid */}
        {partis.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partis.map((parti) => {
              const color = parti.couleur || "#6366f1";
              return (
                <Link
                  key={parti.id}
                  href={`/partis/${parti.slug}`}
                  className="group block"
                >
                  <div className="glass rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-white/20 h-full">
                    {/* Color bar */}
                    <div
                      className="h-2"
                      style={{ backgroundColor: color }}
                    />
                    <div className="p-6">
                      {/* Logo / Sigle */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold font-display"
                          style={{
                            backgroundColor: `${color}20`,
                            color,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {parti.sigle?.substring(0, 2) || parti.nom.substring(0, 2)}
                        </div>
                        {parti.ideologie && (
                          <span className="text-xs px-2.5 py-1 rounded-full glass text-gray-400 border border-white/10">
                            {parti.ideologie}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h2
                        className="font-display text-xl font-bold mb-1 group-hover:opacity-80 transition-opacity"
                        style={{ color }}
                      >
                        {parti.sigle || parti.nom}
                      </h2>
                      <p className="text-sm text-gray-400 mb-3">{parti.nom}</p>

                      {/* Description */}
                      {parti.description && (
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                          {parti.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                        {parti.fondation && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-white">
                              {parti.fondation}
                            </div>
                            <div className="text-xs text-gray-500">Fondation</div>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-lg font-bold text-white flex items-center gap-1">
                            <Users size={14} />
                            {parti.candidats.length}
                          </div>
                          <div className="text-xs text-gray-500">Candidat(s)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="glass rounded-2xl p-16 text-center">
            <Building2 size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucun parti disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
