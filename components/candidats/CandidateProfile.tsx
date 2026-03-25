"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { User, BookOpen, Target, BarChart2, Newspaper, Calendar } from "lucide-react";
import { getInitials, formatDate, formatScore } from "@/lib/utils";
import type { Candidat } from "@/types";

interface CandidateProfileProps {
  candidat: Candidat;
}

type Tab = "biographie" | "programme" | "positions" | "sondages" | "actualites";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "biographie", label: "Biographie", icon: User },
  { id: "programme", label: "Programme", icon: BookOpen },
  { id: "positions", label: "Positions", icon: Target },
  { id: "sondages", label: "Sondages", icon: BarChart2 },
  { id: "actualites", label: "Actualités", icon: Newspaper },
];

export function CandidateProfile({ candidat }: CandidateProfileProps) {
  const [activeTab, setActiveTab] = useState<Tab>("biographie");
  const partyColor = candidat.parti?.couleur || "#6366f1";
  const initials = getInitials(candidat.nom, candidat.prenom);

  const sondagesData = (candidat.sondages || [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((s) => ({
      date: formatDate(s.date),
      score: s.score,
      institut: s.institut,
    }));

  const latestScore = candidat.sondages?.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0]?.score;

  const programme = candidat.programme as Record<string, unknown> | null;
  const positions = candidat.positions as Record<string, unknown> | null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header Card */}
      <div className="glass rounded-3xl overflow-hidden mb-8">
        {/* Gradient header */}
        <div
          className="h-32 relative"
          style={{
            background: `linear-gradient(135deg, ${partyColor}30 0%, ${partyColor}10 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="p-8 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Photo */}
            <div
              className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: `${partyColor}30`,
                border: `3px solid ${partyColor}60`,
              }}
            >
              {candidat.photo ? (
                <Image
                  src={candidat.photo}
                  alt={`${candidat.prenom} ${candidat.nom}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span style={{ color: partyColor }}>{initials}</span>
              )}
            </div>

            {/* Name & Info */}
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-white">
                {candidat.prenom}{" "}
                <span className="uppercase">{candidat.nom}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {candidat.age && (
                  <span className="text-gray-400 text-sm">
                    {candidat.age} ans
                  </span>
                )}
                {candidat.parti && (
                  <Link href={`/partis/${candidat.parti.slug}`}>
                    <span
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: `${partyColor}20`,
                        color: partyColor,
                        border: `1px solid ${partyColor}40`,
                      }}
                    >
                      {candidat.parti.sigle || candidat.parti.nom}
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Score */}
            {latestScore !== undefined && (
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                  Dernier sondage
                </div>
                <div
                  className="text-4xl font-bold font-display"
                  style={{ color: partyColor }}
                >
                  {formatScore(latestScore)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-2xl p-1.5 mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white/15 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="glass rounded-2xl p-8">
        {activeTab === "biographie" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Biographie</h2>
            {candidat.biographie ? (
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {candidat.biographie}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Biographie non disponible.
              </p>
            )}
          </div>
        )}

        {activeTab === "programme" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Programme</h2>
            {programme ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(programme).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <h3
                      className="font-semibold mb-2 capitalize"
                      style={{ color: partyColor }}
                    >
                      {key.replace(/_/g, " ")}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Programme non disponible.</p>
            )}
          </div>
        )}

        {activeTab === "positions" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Positions</h2>
            {positions ? (
              <div className="space-y-4">
                {Object.entries(positions).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-white capitalize">
                        {key.replace(/_/g, " ")}
                      </h3>
                    </div>
                    <div className="text-right text-sm text-gray-300 max-w-xs">
                      {String(value)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Positions non disponibles.
              </p>
            )}
          </div>
        )}

        {activeTab === "sondages" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Évolution dans les sondages</h2>
            {sondagesData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sondagesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
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
                      contentStyle={{
                        backgroundColor: "rgba(10, 10, 20, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      formatter={(v) => [`${v}%`, "Score"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={partyColor}
                      strokeWidth={2.5}
                      dot={{ fill: partyColor, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Aucun sondage disponible.
              </p>
            )}
          </div>
        )}

        {activeTab === "actualites" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Actualités</h2>
            {candidat.actualites && candidat.actualites.length > 0 ? (
              <div className="space-y-4">
                {candidat.actualites.map((actu) => (
                  <Link
                    key={actu.id}
                    href={`/actualites/${actu.slug}`}
                    className="block group"
                  >
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all">
                      <div className="flex items-start gap-3">
                        <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                            {actu.titre}
                          </h3>
                          {actu.resume && (
                            <p className="text-sm text-gray-400 mt-1">
                              {actu.resume}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(actu.publishedAt || actu.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Aucune actualité disponible.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
