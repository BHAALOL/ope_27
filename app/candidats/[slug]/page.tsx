import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CandidateProfile } from "@/components/candidats/CandidateProfile";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

async function getCandidat(slug: string) {
  try {
    return await prisma.candidat.findUnique({
      where: { slug, published: true },
      include: {
        parti: true,
        sondages: {
          orderBy: { date: "desc" },
          take: 20,
        },
        actualites: {
          where: { published: true },
          orderBy: { publishedAt: "desc" },
          take: 5,
        },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const candidat = await getCandidat(params.slug);
  if (!candidat) return { title: "Candidat introuvable" };
  return {
    title: `${candidat.prenom} ${candidat.nom}`,
    description: candidat.biographie?.substring(0, 160),
  };
}

export default async function CandidatPage({ params }: PageProps) {
  const candidat = await getCandidat(params.slug);

  if (!candidat) {
    notFound();
  }

  // Serialize for client component, cast JSON fields
  const serialized = {
    id: candidat.id,
    slug: candidat.slug,
    nom: candidat.nom,
    prenom: candidat.prenom,
    age: candidat.age,
    photo: candidat.photo,
    biographie: candidat.biographie,
    programme: candidat.programme as Record<string, unknown> | null,
    positions: candidat.positions as Record<string, unknown> | null,
    published: candidat.published,
    featured: candidat.featured,
    partiId: candidat.partiId,
    createdAt: candidat.createdAt.toISOString(),
    updatedAt: candidat.updatedAt.toISOString(),
    parti: candidat.parti
      ? {
          id: candidat.parti.id,
          slug: candidat.parti.slug,
          nom: candidat.parti.nom,
          sigle: candidat.parti.sigle,
          couleur: candidat.parti.couleur,
          logo: candidat.parti.logo,
          description: candidat.parti.description,
          histoire: candidat.parti.histoire,
          ideologie: candidat.parti.ideologie,
          fondation: candidat.parti.fondation,
          published: candidat.parti.published,
          createdAt: candidat.parti.createdAt.toISOString(),
          updatedAt: candidat.parti.updatedAt.toISOString(),
        }
      : null,
    sondages: candidat.sondages.map((s) => ({
      id: s.id,
      date: s.date.toISOString(),
      createdAt: s.createdAt.toISOString(),
      candidatId: s.candidatId,
      score: s.score,
      marge: s.marge,
      source: s.source,
      institut: s.institut,
    })),
    actualites: candidat.actualites.map((a) => ({
      id: a.id,
      titre: a.titre,
      slug: a.slug,
      resume: a.resume,
      contenu: a.contenu,
      image: a.image,
      source: a.source,
      sourceUrl: a.sourceUrl,
      published: a.published,
      publishedAt: a.publishedAt?.toISOString() ?? null,
      candidatId: a.candidatId,
      tags: a.tags,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
  };

  return <CandidateProfile candidat={serialized} />;
}
