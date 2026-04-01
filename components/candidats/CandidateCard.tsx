import Link from "next/link";
import Image from "next/image";
import { User, TrendingUp } from "lucide-react";
import { getInitials, formatScore } from "@/lib/utils";

interface CandidateCardProps {
  candidat: {
    id: string;
    slug: string;
    nom: string;
    prenom: string;
    age?: number | null;
    photo?: string | null;
    parti?: { nom: string; sigle?: string | null; couleur?: string | null } | null;
    sondages?: Array<{ score: number; date: string }>;
  };
}

export function CandidateCard({ candidat }: CandidateCardProps) {
  const partyColor = candidat.parti?.couleur || "#6366f1";
  const initials = getInitials(candidat.nom, candidat.prenom);
  const latestScore = candidat.sondages?.length
    ? [...candidat.sondages].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]?.score
    : undefined;

  return (
    <Link href={`/candidats/${candidat.slug}`} className="group block">
      <div className="glass rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-white/20 h-full">
        {/* Top gradient bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(to right, ${partyColor}, ${partyColor}80)`,
          }}
        />

        <div className="p-6">
          {/* Avatar + Score */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{
                backgroundColor: `${partyColor}20`,
                border: `2px solid ${partyColor}40`,
              }}
            >
              {candidat.photo ? (
                <Image
                  src={candidat.photo}
                  alt={`${candidat.prenom} ${candidat.nom}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span style={{ color: partyColor }}>{initials}</span>
              )}
            </div>

            {latestScore !== undefined && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <TrendingUp size={10} />
                  <span>Sondage</span>
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: partyColor }}
                >
                  {formatScore(latestScore)}
                </span>
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-white text-lg leading-tight group-hover:text-blue-300 transition-colors">
            {candidat.prenom}{" "}
            <span className="uppercase">{candidat.nom}</span>
          </h3>

          {candidat.age && (
            <p className="text-gray-400 text-sm mt-0.5">{candidat.age} ans</p>
          )}

          {/* Party badge */}
          {candidat.parti && (
            <div className="mt-3">
              <span
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: `${partyColor}15`,
                  color: partyColor,
                  border: `1px solid ${partyColor}30`,
                }}
              >
                <User size={10} />
                {candidat.parti.sigle || candidat.parti.nom}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
