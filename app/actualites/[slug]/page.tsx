import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Newspaper, Clock, ExternalLink, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

async function getArticle(slug: string) {
  try {
    return await prisma.actualite.findUnique({
      where: { slug, published: true },
      include: { candidat: { include: { parti: true } } },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: "Article introuvable" };
  return {
    title: article.titre,
    description: article.resume?.substring(0, 160),
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  const color = article.candidat?.parti?.couleur || "#6366f1";

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/actualites"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <Newspaper size={14} />
          Toutes les actualités
        </Link>

        {/* Article */}
        <article>
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {article.candidat && (
                <Link href={`/candidats/${article.candidat.slug}`}>
                  <span
                    className="inline-flex items-center text-sm px-3 py-1 rounded-full font-medium hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: `${color}20`,
                      color,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {article.candidat.prenom} {article.candidat.nom}
                  </span>
                </Link>
              )}
              {article.source && (
                <span className="text-sm text-gray-500 glass px-3 py-1 rounded-full border border-white/5">
                  {article.source}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              {article.titre}
            </h1>

            {article.resume && (
              <p className="text-xl text-gray-300 leading-relaxed border-l-4 pl-4 border-[#002395]/60">
                {article.resume}
              </p>
            )}

            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Clock size={13} />
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              </div>
              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-gray-300 transition-colors"
                >
                  <ExternalLink size={13} />
                  Source
                </a>
              )}
            </div>
          </div>

          {/* Cover image */}
          {article.image && (
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
              <Image
                src={article.image}
                alt={article.titre}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="glass rounded-2xl p-8">
            <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
              {article.contenu}
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-6">
              <Tag size={14} className="text-gray-500" />
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/actualites?tag=${encodeURIComponent(tag)}`}
                  className="text-xs px-3 py-1 rounded-full glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
