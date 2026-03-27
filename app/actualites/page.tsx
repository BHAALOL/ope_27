import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Newspaper, Clock, Tag } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Actualités de la campagne présidentielle 2027",
};

interface PageProps {
  searchParams: { tag?: string; candidat?: string };
}

async function getActualites(tag?: string, candidatId?: string) {
  try {
    return await prisma.actualite.findMany({
      where: {
        published: true,
        ...(tag ? { tags: { has: tag } } : {}),
        ...(candidatId ? { candidatId } : {}),
      },
      include: {
        candidat: { include: { parti: true } },
      },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getCandidats() {
  try {
    return await prisma.candidat.findMany({
      where: { published: true },
      select: { id: true, nom: true, prenom: true },
      orderBy: { nom: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function ActualitesPage({ searchParams }: PageProps) {
  const [actualites, candidats] = await Promise.all([
    getActualites(searchParams.tag, searchParams.candidat),
    getCandidats(),
  ]);

  // Get all unique tags
  const rawTags = (
    await prisma.actualite
      .findMany({ where: { published: true }, select: { tags: true } })
      .catch(() => [])
  ).flatMap((a) => a.tags);
  const allTags: string[] = rawTags.filter(
    (tag, idx) => rawTags.indexOf(tag) === idx
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-orange-900/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper size={22} className="text-orange-400" />
            <span className="text-orange-400 text-sm font-medium uppercase tracking-wide">
              Actualités
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Fil d&apos;actualité
          </h1>
          <p className="text-gray-400">
            Toutes les nouvelles de la campagne présidentielle 2027.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            {actualites.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center">
                <Newspaper size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucune actualité disponible.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {actualites.map((article) => {
                  const color = article.candidat?.parti?.couleur || "#6366f1";
                  return (
                    <Link
                      key={article.id}
                      href={`/actualites/${article.slug}`}
                      className="group block"
                    >
                      <article className="glass rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20">
                        <div className="flex gap-0">
                          {article.image && (
                            <div className="relative w-48 flex-shrink-0 hidden sm:block">
                              <Image
                                src={article.image}
                                alt={article.titre}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="p-5 flex-1">
                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {article.candidat && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{
                                    backgroundColor: `${color}20`,
                                    color,
                                  }}
                                >
                                  {article.candidat.prenom} {article.candidat.nom}
                                </span>
                              )}
                              {article.source && (
                                <span className="text-xs text-gray-500">
                                  {article.source}
                                </span>
                              )}
                              {article.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                              {article.titre}
                            </h2>

                            {article.resume && (
                              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                                {truncate(article.resume, 200)}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock size={11} />
                              <span>
                                {formatDate(article.publishedAt || article.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            {/* Candidate filter */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                Par candidat
              </h3>
              <div className="space-y-1">
                <Link
                  href="/actualites"
                  className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    !searchParams.candidat
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Tous
                </Link>
                {candidats.map((c) => (
                  <Link
                    key={c.id}
                    href={`/actualites?candidat=${c.id}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      searchParams.candidat === c.id
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {c.prenom} {c.nom}
                  </Link>
                ))}
              </div>
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Tag size={13} />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/actualites?tag=${encodeURIComponent(tag)}`}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        searchParams.tag === tag
                          ? "bg-white/15 text-white border-white/20"
                          : "text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
