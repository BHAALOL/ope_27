import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CandidateCard } from "@/components/candidats/CandidateCard";
import { Building2, Calendar, Users } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

async function getParti(slug: string) {
  try {
    return await prisma.parti.findUnique({
      where: { slug, published: true },
      include: {
        candidats: {
          where: { published: true },
          include: {
            sondages: { orderBy: { date: "desc" }, take: 1 },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parti = await getParti(params.slug);
  if (!parti) return { title: "Parti introuvable" };
  return {
    title: parti.nom,
    description: parti.description?.substring(0, 160),
  };
}

export default async function PartiPage({ params }: PageProps) {
  const parti = await getParti(params.slug);
  if (!parti) notFound();

  const color = parti.couleur || "#6366f1";

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/partis"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <Building2 size={14} />
          Tous les partis
        </Link>

        {/* Header */}
        <div className="glass rounded-3xl overflow-hidden mb-10">
          <div
            className="h-4"
            style={{ backgroundColor: color }}
          />
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Logo */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold font-display flex-shrink-0"
                style={{
                  backgroundColor: `${color}20`,
                  color,
                  border: `2px solid ${color}40`,
                }}
              >
                {parti.sigle?.substring(0, 2) || parti.nom.substring(0, 2)}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-3 mb-2">
                  <h1 className="font-display text-3xl font-bold" style={{ color }}>
                    {parti.sigle || parti.nom}
                  </h1>
                  {parti.ideologie && (
                    <span className="mt-1 text-xs px-2.5 py-1 rounded-full glass text-gray-300 border border-white/10">
                      {parti.ideologie}
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-lg mb-3">{parti.nom}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  {parti.fondation && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      Fondé en {parti.fondation}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users size={14} />
                    {parti.candidats.length} candidat(s)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {parti.description && (
          <div className="glass rounded-2xl p-8 mb-8">
            <h2 className="text-lg font-semibold mb-4">À propos</h2>
            <p className="text-gray-300 leading-relaxed">{parti.description}</p>
          </div>
        )}

        {/* Histoire */}
        {parti.histoire && (
          <div className="glass rounded-2xl p-8 mb-8">
            <h2 className="text-lg font-semibold mb-4">Histoire</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {parti.histoire}
            </p>
          </div>
        )}

        {/* Candidats */}
        {parti.candidats.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-5">
              Candidats du parti
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {parti.candidats.map((candidat) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
