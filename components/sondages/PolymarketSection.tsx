"use client";

import { useEffect, useState } from "react";
import { BarChart3, ExternalLink, RefreshCw, TrendingUp } from "lucide-react";
import { timeAgo, formatScore } from "@/lib/utils";
import type { PolymarketEventData } from "@/types";

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(0)}K`;
  return `$${volume.toFixed(0)}`;
}

const OUTCOME_COLORS = [
  "#6366f1", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444",
  "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4",
];

export function PolymarketSection() {
  const [data, setData] = useState<PolymarketEventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/polymarket");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="glass rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <BarChart3 size={16} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Polymarket — Marché prédictif
            </h2>
            <p className="text-xs text-gray-500">
              Probabilités basées sur les paris des traders
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <span className="text-xs text-gray-500">
              {timeAgo(data.lastUpdated)}
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
            aria-label="Rafraîchir"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <RefreshCw size={18} className="animate-spin mr-2" />
          <span className="text-sm">Chargement des données Polymarket...</span>
        </div>
      )}

      {error && !data && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {data && data.outcomes.length > 0 && (
        <>
          {/* Volume badge */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
              Volume total : {formatVolume(data.totalVolume)}
            </span>
          </div>

          {/* Outcome bars */}
          <div className="space-y-3">
            {data.outcomes.map((outcome, index) => {
              const color = OUTCOME_COLORS[index % OUTCOME_COLORS.length];
              const maxProb = data.outcomes[0]?.probabilite || 1;
              return (
                <div key={outcome.candidat} className="flex items-center gap-4">
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
                        {outcome.candidat}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {formatVolume(outcome.volume)}
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{ color }}
                        >
                          {formatScore(outcome.probabilite)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(outcome.probabilite / maxProb) * 100}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <p className="text-[11px] text-gray-500">
              Les marchés prédictifs reflètent les probabilités estimées par les traders, pas des sondages traditionnels.
            </p>
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0"
            >
              Voir sur Polymarket
              <ExternalLink size={11} />
            </a>
          </div>
        </>
      )}

      {data && data.outcomes.length === 0 && (
        <div className="text-center py-8">
          <TrendingUp size={32} className="text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            Aucun marché actif pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
