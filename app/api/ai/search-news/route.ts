import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchRecentNews } from "@/lib/perplexity";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SearchSchema = z.object({
  query: z.string().min(1).max(500),
  maxResults: z.number().min(1).max(10).optional().default(5),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
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
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la recherche",
      },
      { status: 500 }
    );
  }
}
