"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PollChart } from "./PollChart";
import { formatScore } from "@/lib/utils";

interface Candidate {
  id: string;
  nom: string;
  prenom: string;
  couleur: string;
  parti?: string;
  score: number;
  name: string;
}

interface SondagesChartsProps {
  currentStandings: Candidate[];
  timeSeriesData: Array<{ date: string; ts: number; [key: string]: string | number }>;
  chartCandidates: Array<{ name: string; color: string }>;
}

const defaultColors = [
  "#002395", "#ED2939", "#6366f1", "#22c55e",
  "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6",
];

export function SondagesCharts({
  currentStandings,
  timeSeriesData,
  chartCandidates,
}: SondagesChartsProps) {
  return (
    <>
      {/* Current standings bar chart */}
      <div className="glass rounded-2xl p-8">
        <h2 className="text-lg font-semibold mb-6">
          Classement actuel — Intentions de vote (1er tour)
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentStandings}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              layout="vertical"
            >
              <XAxis
                type="number"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#e5e7eb", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 10, 20, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(v) => [`${v}%`, "Score"]}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {currentStandings.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.couleur || defaultColors[index % defaultColors.length]}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time series */}
      {timeSeriesData.length > 1 && (
        <div className="glass rounded-2xl p-8">
          <h2 className="text-lg font-semibold mb-6">Évolution dans le temps</h2>
          <div className="h-80">
            <PollChart
              data={timeSeriesData}
              candidates={chartCandidates}
            />
          </div>
        </div>
      )}

      {/* Scores table */}
      <div className="glass rounded-2xl p-8">
        <h2 className="text-lg font-semibold mb-5">Dernières données</h2>
        <div className="space-y-3">
          {currentStandings.map((c, index) => {
            const color = c.couleur || defaultColors[index % defaultColors.length];
            return (
              <div key={c.id} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-6 text-right">
                  {index + 1}
                </span>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {c.prenom} {c.nom}
                    </span>
                    <span className="text-sm font-bold" style={{ color }}>
                      {formatScore(c.score)}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(c.score / (currentStandings[0]?.score || 1)) * 100}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
