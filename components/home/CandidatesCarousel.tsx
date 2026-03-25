"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, User } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface Candidat {
  id: string;
  slug: string;
  nom: string;
  prenom: string;
  photo?: string | null;
  parti?: { nom: string; sigle?: string | null; couleur?: string | null } | null;
}

interface CandidatesCarouselProps {
  candidats: Candidat[];
}

export function CandidatesCarousel({ candidats }: CandidatesCarouselProps) {
  if (!candidats.length) {
    return null;
  }

  return (
    <section className="py-20 bg-dark-800/50 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User size={20} className="text-[#ED2939]" />
              <span className="text-[#ED2939] text-sm font-medium uppercase tracking-wide">
                Candidats
              </span>
            </div>
            <h2 className="text-3xl font-display font-bold text-white">
              Les prétendants à l&apos;Élysée
            </h2>
          </div>
          <Link
            href="/candidats"
            className="hidden sm:flex items-center gap-2 text-sm text-[#ED2939] hover:text-red-300 transition-colors"
          >
            Tous les candidats
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {candidats.map((candidat) => {
            const partyColor = candidat.parti?.couleur || "#6366f1";
            const initials = getInitials(candidat.nom, candidat.prenom);

            return (
              <Link
                key={candidat.id}
                href={`/candidats/${candidat.slug}`}
                className="group"
              >
                <div className="glass rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-white/20">
                  {/* Avatar */}
                  <div className="relative mx-auto mb-3">
                    <div
                      className="w-16 h-16 rounded-full mx-auto overflow-hidden flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: `${partyColor}20`, border: `2px solid ${partyColor}40` }}
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
                    {/* Party color dot */}
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-900"
                      style={{ backgroundColor: partyColor }}
                    />
                  </div>

                  {/* Name */}
                  <p className="text-xs font-semibold text-white leading-tight">
                    {candidat.prenom}
                  </p>
                  <p className="text-xs font-bold text-white uppercase tracking-wide">
                    {candidat.nom}
                  </p>

                  {/* Party */}
                  {candidat.parti?.sigle && (
                    <span
                      className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${partyColor}20`,
                        color: partyColor,
                      }}
                    >
                      {candidat.parti.sigle}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link
            href="/candidats"
            className="inline-flex items-center gap-2 text-sm text-[#ED2939] hover:text-red-300 transition-colors"
          >
            Tous les candidats
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
