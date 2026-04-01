import { prisma } from "@/lib/prisma";
import { CandidateCard } from "@/components/candidats/CandidateCard";
import { Users } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Candidats",
  description: "Découvrez tous les candidats à la présidentielle 2027",
};

async function getCandidats(partiId?: string) {
  try {
    return await prisma.candidat.findMany({
      where: {
        published: true,
        ...(partiId ? { partiId } : {}),
      },
      include: {
        parti: true,
        sondages: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
      orderBy: { nom: "asc" },
    });
  } catch {
    return [];
  }
}

async function getPartis() {
  try {
    return await prisma.parti.findMany({
      where: { published: true },
      orderBy: { nom: "asc" },
    });
  } catch {
    return [];
  }
}

interface PageProps {
  searchParams: { parti?: string };
}

export default async function CandidatsPage({ searchParams }: PageProps) {
  const [candidats, partis] = await Promise.all([
    getCandidats(searchParams.parti),
    getPartis(),
  ]);

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Background */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#002395]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Users size={22} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-medium uppercase tracking-wide">
              Candidats
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Les prétendants à l&apos;Élysée
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Découvrez l&apos;ensemble des candidats déclarés ou pressentis pour
            l&apos;élection présidentielle du 25 avril 2027.
          </p>
        </div>

        {/* Party filters */}
        {partis.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <a
              href="/candidats"
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                !searchParams.parti
                  ? "bg-white/15 text-white border-white/20"
                  : "text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              Tous
            </a>
            {partis.map((parti) => (
              <a
                key={parti.id}
                href={`/candidats?parti=${parti.id}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  searchParams.parti === parti.id
                    ? "bg-white/15 text-white border-white/20"
                    : "text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                {parti.sigle || parti.nom}
              </a>
            ))}
          </div>
        )}

        {/* Grid */}
        {candidats.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {candidats.map((candidat) => (
              <CandidateCard
                key={candidat.id}
                candidat={{
                  ...candidat,
                  sondages: candidat.sondages.map((s) => ({
                    score: s.score,
                    date: s.date.toISOString(),
                  })),
                }}
              />
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-16 text-center">
            <Users size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              Aucun candidat disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
