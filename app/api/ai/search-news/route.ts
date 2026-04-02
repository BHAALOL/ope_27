import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { searchRecentNews } from "@/lib/perplexity";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SearchSchema = z.object({
  query: z.string().min(1).max(500),
  maxResults: z.number().min(1).max(10).optional().default(5),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    // Rate limit: 10 searches per minute per user
    const userId = "session" in auth ? auth.session.user.id : "unknown";
    const rateCheck = checkRateLimit(`ai-search:${userId}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Trop de requêtes. Veuillez patienter." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const { query, maxResults } = SearchSchema.parse(body);

    // Fetch existing candidates to help Perplexity match names
    const candidats = await prisma.candidat.findMany({
      select: { nom: true, prenom: true },
    });
    const candidatNames = candidats.map((c) => `${c.prenom} ${c.nom}`);

    const response = await searchRecentNews(query, {
      maxResults,
      candidatNames,
    });

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides" },
        { status: 400 }
      );
    }
    console.error("POST /api/ai/search-news error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
