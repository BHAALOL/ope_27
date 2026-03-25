import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Newspaper, Clock } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";

interface Actualite {
  id: string;
  titre: string;
  slug: string;
  resume?: string | null;
  image?: string | null;
  source?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  candidat?: { nom: string; prenom: string; parti?: { couleur?: string | null } | null } | null;
}

interface LatestNewsProps {
  actualites: Actualite[];
}

export function LatestNews({ actualites }: LatestNewsProps) {
  if (!actualites.length) {
    return null;
  }

  const [featured, ...rest] = actualites;

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Newspaper size={20} className="text-indigo-400" />
              <span className="text-indigo-400 text-sm font-medium uppercase tracking-wide">
                Actualités
              </span>
            </div>
            <h2 className="text-3xl font-display font-bold text-white">
              Dernières nouvelles
            </h2>
          </div>
          <Link
            href="/actualites"
            className="hidden sm:flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Toutes les actualités
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured article */}
          {featured && (
            <Link
              href={`/actualites/${featured.slug}`}
              className="lg:col-span-2 group"
            >
              <article className="glass rounded-2xl overflow-hidden h-full hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20">
                {featured.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={featured.image}
                      alt={featured.titre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-[#002395]/20 to-indigo-900/20 flex items-center justify-center">
                    <Newspaper size={48} className="text-gray-600" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {featured.candidat && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: `${featured.candidat.parti?.couleur || "#6366f1"}20`,
                          color: featured.candidat.parti?.couleur || "#818cf8",
                        }}
                      >
                        {featured.candidat.prenom} {featured.candidat.nom}
                      </span>
                    )}
                    {featured.source && (
                      <span className="text-xs text-gray-500">
                        {featured.source}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {featured.titre}
                  </h3>
                  {featured.resume && (
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {truncate(featured.resume, 150)}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>
                      {formatDate(featured.publishedAt || featured.createdAt)}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Side articles */}
          <div className="space-y-4">
            {rest.map((article) => (
              <Link
                key={article.id}
                href={`/actualites/${article.slug}`}
                className="group block"
              >
                <article className="glass rounded-xl p-4 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20">
                  <div className="flex gap-3">
                    {article.image ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={article.image}
                          alt={article.titre}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-dark-600 flex items-center justify-center flex-shrink-0">
                        <Newspaper size={20} className="text-gray-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2 mb-1">
                        {article.titre}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={10} />
                        <span>
                          {formatDate(article.publishedAt || article.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link
            href="/actualites"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Toutes les actualités
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
