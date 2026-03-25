import { HeroSection } from "@/components/home/HeroSection";
import { PollsOverview } from "@/components/home/PollsOverview";
import { CandidatesCarousel } from "@/components/home/CandidatesCarousel";
import { LatestNews } from "@/components/home/LatestNews";
import { prisma } from "@/lib/prisma";

async function getHomeData() {
  try {
    const [candidats, sondages, actualites] = await Promise.all([
      prisma.candidat.findMany({
        where: { published: true, featured: true },
        include: { parti: true },
        orderBy: { createdAt: "asc" },
        take: 6,
      }),
      prisma.sondage.findMany({
        include: { candidat: { include: { parti: true } } },
        orderBy: { date: "desc" },
        take: 30,
      }),
      prisma.actualite.findMany({
        where: { published: true },
        include: { candidat: true },
        orderBy: { publishedAt: "desc" },
        take: 4,
      }),
    ]);
    return { candidats, sondages, actualites };
  } catch {
    return { candidats: [], sondages: [], actualites: [] };
  }
}

export default async function HomePage() {
  const { candidats, sondages, actualites } = await getHomeData();

  // Build latest poll data per candidate
  const latestPollMap = new Map<
    string,
    { nom: string; prenom: string; score: number; couleur?: string; parti?: string }
  >();
  for (const s of sondages) {
    if (!latestPollMap.has(s.candidatId)) {
      latestPollMap.set(s.candidatId, {
        nom: s.candidat.nom,
        prenom: s.candidat.prenom,
        score: s.score,
        couleur: s.candidat.parti?.couleur ?? undefined,
        parti: s.candidat.parti?.sigle ?? undefined,
      });
    }
  }
  const pollData = Array.from(latestPollMap.values()).sort(
    (a, b) => b.score - a.score
  );

  return (
    <div className="min-h-screen">
      <HeroSection />
      <PollsOverview pollData={pollData} />
      <CandidatesCarousel
        candidats={candidats.map((c) => ({
          id: c.id,
          slug: c.slug,
          nom: c.nom,
          prenom: c.prenom,
          photo: c.photo,
          parti: c.parti
            ? { nom: c.parti.nom, sigle: c.parti.sigle, couleur: c.parti.couleur }
            : null,
        }))}
      />
      <LatestNews
        actualites={actualites.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
          publishedAt: a.publishedAt?.toISOString() ?? null,
          candidat: a.candidat
            ? {
                ...a.candidat,
                createdAt: a.candidat.createdAt.toISOString(),
                updatedAt: a.candidat.updatedAt.toISOString(),
              }
            : null,
        }))}
      />
    </div>
  );
}
