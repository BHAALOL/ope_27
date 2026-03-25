"use client";

import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, ArrowRight } from "lucide-react";
import { formatScore } from "@/lib/utils";

interface PollData {
  nom: string;
  prenom: string;
  score: number;
  couleur?: string;
  parti?: string;
}

interface PollsOverviewProps {
  pollData: PollData[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: PollData }>;
}) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="glass-dark rounded-xl px-4 py-3 text-sm border border-white/10">
        <p className="font-semibold text-white">
          {d.prenom} {d.nom}
        </p>
        {d.parti && <p className="text-gray-400 text-xs">{d.parti}</p>}
        <p className="text-blue-300 font-bold mt-1">{formatScore(d.score)}</p>
      </div>
    );
  }
  return null;
};

export function PollsOverview({ pollData }: PollsOverviewProps) {
  if (!pollData.length) {
    return null;
  }

  const chartData = pollData.slice(0, 8).map((p) => ({
    ...p,
    name: `${p.prenom.charAt(0)}. ${p.nom}`,
  }));

  const defaultColors = [
    "#002395",
    "#ED2939",
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ec4899",
    "#14b8a6",
    "#8b5cf6",
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium uppercase tracking-wide">
                Derniers sondages
              </span>
            </div>
            <h2 className="text-3xl font-display font-bold text-white">
              Intentions de vote
            </h2>
            <p className="text-gray-400 mt-1">
              Résultats du premier tour selon les derniers sondages disponibles
            </p>
          </div>
          <Link
            href="/sondages"
            className="hidden sm:flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Voir tous les sondages
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">
              Comparaison
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.couleur || defaultColors[index % defaultColors.length]}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rankings */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">
              Classement
            </h3>
            <div className="space-y-3">
              {pollData.slice(0, 6).map((candidate, index) => {
                const color =
                  candidate.couleur ||
                  defaultColors[index % defaultColors.length];
                const maxScore = pollData[0]?.score || 100;
                const width = (candidate.score / maxScore) * 100;

                return (
                  <div key={`${candidate.prenom}-${candidate.nom}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-5">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium text-white">
                          {candidate.prenom} {candidate.nom}
                        </span>
                        {candidate.parti && (
                          <span className="text-xs text-gray-500">
                            ({candidate.parti})
                          </span>
                        )}
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color }}
                      >
                        {formatScore(candidate.score)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${width}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 sm:hidden text-center">
          <Link
            href="/sondages"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Voir tous les sondages
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
