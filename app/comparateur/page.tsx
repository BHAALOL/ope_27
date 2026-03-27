"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BarChart2, X, Plus } from "lucide-react";
import { getInitials, formatScore } from "@/lib/utils";
import type { Candidat } from "@/types";

export default function ComparateurPage() {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [selected, setSelected] = useState<Candidat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidats")
      .then((r) => {
        if (!r.ok) throw new Error("Erreur de chargement");
        return r.json();
      })
      .then((data) => {
        setCandidats(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setCandidats([]);
        setLoading(false);
      });
  }, []);

  const addCandidat = (c: Candidat) => {
    if (selected.length >= 3 || selected.find((s) => s.id === c.id)) return;
    setSelected([...selected, c]);
  };

  const removeCandidat = (id: string) => {
    setSelected(selected.filter((s) => s.id !== id));
  };

  const programmeKeys = Array.from(
    new Set(
      selected.flatMap((c) =>
        c.programme ? Object.keys(c.programme as Record<string, unknown>) : []
      )
    )
  );

  const positionKeys = Array.from(
    new Set(
      selected.flatMap((c) =>
        c.positions ? Object.keys(c.positions as Record<string, unknown>) : []
      )
    )
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={22} className="text-purple-400" />
            <span className="text-purple-400 text-sm font-medium uppercase tracking-wide">
              Comparateur
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Comparer les candidats
          </h1>
          <p className="text-gray-400">
            Sélectionnez jusqu&apos;à 3 candidats pour comparer leurs programmes et positions.
          </p>
        </div>

        {/* Candidate selector */}
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Sélectionner des candidats ({selected.length}/3)
          </h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Chargement...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {candidats.map((c) => {
                const isSelected = !!selected.find((s) => s.id === c.id);
                const color = c.parti?.couleur || "#6366f1";
                return (
                  <button
                    key={c.id}
                    onClick={() => isSelected ? removeCandidat(c.id) : addCandidat(c)}
                    disabled={!isSelected && selected.length >= 3}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all ${
                      isSelected
                        ? "text-white border-white/30 bg-white/15"
                        : "text-gray-400 border-white/10 hover:border-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {c.prenom} {c.nom}
                    {isSelected && (
                      <X size={12} className="text-gray-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selected.length === 0 ? (
          <div className="glass rounded-2xl p-20 text-center">
            <Plus size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              Sélectionnez des candidats ci-dessus pour commencer la comparaison.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Candidate headers */}
            <div
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {selected.map((c) => {
                const color = c.parti?.couleur || "#6366f1";
                return (
                  <div key={c.id} className="glass rounded-2xl p-6 relative text-center">
                    <button
                      onClick={() => removeCandidat(c.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold"
                      style={{
                        backgroundColor: `${color}20`,
                        border: `2px solid ${color}40`,
                        color,
                      }}
                    >
                      {c.photo ? (
                        <Image
                          src={c.photo}
                          alt={`${c.prenom} ${c.nom}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        getInitials(c.nom, c.prenom)
                      )}
                    </div>
                    <h3 className="font-semibold text-white">
                      {c.prenom} <span className="uppercase">{c.nom}</span>
                    </h3>
                    {c.parti && (
                      <p className="text-xs mt-1" style={{ color }}>
                        {c.parti.sigle || c.parti.nom}
                      </p>
                    )}
                    {c.sondages && c.sondages.length > 0 && (
                      <p className="text-2xl font-bold mt-2" style={{ color }}>
                        {formatScore(c.sondages[0].score)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Programme comparison */}
            {programmeKeys.length > 0 && (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h2 className="text-lg font-semibold">Programme</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {programmeKeys.map((key) => (
                    <div
                      key={key}
                      className="grid gap-0 divide-x divide-white/5"
                      style={{ gridTemplateColumns: `minmax(120px, 200px) repeat(${selected.length}, 1fr)` }}
                    >
                      <div className="px-4 sm:px-6 py-4 bg-white/3">
                        <span className="text-sm font-medium text-gray-300 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                      </div>
                      {selected.map((c) => {
                        const prog = c.programme as Record<string, string> | null;
                        const value = prog?.[key];
                        return (
                          <div key={c.id} className="px-4 sm:px-6 py-4">
                            <p className="text-sm text-gray-400">
                              {value || (
                                <span className="text-gray-600 italic">
                                  Non renseigné
                                </span>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positions comparison */}
            {positionKeys.length > 0 && (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h2 className="text-lg font-semibold">Positions</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {positionKeys.map((key) => (
                    <div
                      key={key}
                      className="grid gap-0 divide-x divide-white/5"
                      style={{ gridTemplateColumns: `minmax(120px, 200px) repeat(${selected.length}, 1fr)` }}
                    >
                      <div className="px-4 sm:px-6 py-4 bg-white/3">
                        <span className="text-sm font-medium text-gray-300 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                      </div>
                      {selected.map((c) => {
                        const pos = c.positions as Record<string, string> | null;
                        const value = pos?.[key];
                        return (
                          <div key={c.id} className="px-4 sm:px-6 py-4">
                            <p className="text-sm text-gray-400">
                              {value || (
                                <span className="text-gray-600 italic">
                                  Non renseigné
                                </span>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {programmeKeys.length === 0 && positionKeys.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-gray-500">
                  Aucune donnée de programme ou de positions disponible pour les candidats sélectionnés.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
