import { prisma } from "@/lib/prisma";
import { SondagesCharts } from "@/components/sondages/SondagesCharts";
import { TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sondages",
  description: "Suivez l'évolution des sondages de la présidentielle 2027",
};

async function getSondages() {
  try {
    return await prisma.sondage.findMany({
      include: { candidat: { include: { parti: true } } },
      orderBy: { date: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function SondagesPage() {
  const sondages = await getSondages();

  // Get unique candidates
  const candidateMap = new Map<string, {
    id: string; nom: string; prenom: string; couleur: string; parti?: string;
  }>();
  for (const s of sondages) {
    if (!candidateMap.has(s.candidatId)) {
      candidateMap.set(s.candidatId, {
        id: s.candidatId,
        nom: s.candidat.nom,
        prenom: s.candidat.prenom,
        couleur: s.candidat.parti?.couleur || "#6366f1",
        parti: s.candidat.parti?.sigle || undefined,
      });
    }
  }
  const candidates = Array.from(candidateMap.values());

  // Build time series data
  const dateMap = new Map<string, { date: string; ts: number; [key: string]: string | number }>();
  for (const s of sondages) {
    const dateStr = formatDate(s.date);
    if (!dateMap.has(dateStr)) dateMap.set(dateStr, { date: dateStr, ts: s.date.getTime() });
    const row = dateMap.get(dateStr)!;
    const cName = `${s.candidat.prenom} ${s.candidat.nom}`;
    row[cName] = s.score;
  }
  const timeSeriesData = Array.from(dateMap.values())
    .sort((a, b) => (a.ts as number) - (b.ts as number));

  const chartCandidates = candidates.map((c) => ({
    name: `${c.prenom} ${c.nom}`,
    color: c.couleur,
  }));

  // Latest score per candidate
  const latestScores = new Map<string, number>();
  for (const s of sondages) {
    if (!latestScores.has(s.candidatId)) {
      latestScores.set(s.candidatId, s.score);
    }
  }

  const currentStandings = candidates
    .map((c) => ({
      ...c,
      score: latestScores.get(c.id) || 0,
      name: `${c.prenom.charAt(0)}. ${c.nom}`,
    }))
    .sort((a, b) => b.score - a.score);

  // Get unique institutes
  const institsList = sondages.map((s) => s.institut);
  const institutes: string[] = institsList.filter(
    (inst, idx) => institsList.indexOf(inst) === idx
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={22} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-medium uppercase tracking-wide">
              Sondages
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Intentions de vote
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Évolution des sondages du 1er tour de la présidentielle 2027.
            {sondages.length > 0 && (
              <span className="text-gray-500">
                {" "}Dernière mise à jour :{" "}
                {formatDate(sondages[0].date)}
              </span>
            )}
          </p>
        </div>

        {sondages.length === 0 ? (
          <div className="glass rounded-2xl p-20 text-center">
            <TrendingUp size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucun sondage disponible pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <SondagesCharts
              currentStandings={currentStandings}
              timeSeriesData={timeSeriesData}
              chartCandidates={chartCandidates}
            />

            {/* Institutes */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                Instituts de sondage référencés
              </h3>
              <div className="flex flex-wrap gap-2">
                {institutes.map((inst) => (
                  <span
                    key={inst}
                    className="px-3 py-1 rounded-full text-sm glass border border-white/10 text-gray-300"
                  >
                    {inst}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
