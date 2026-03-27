import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const ActualiteSchema = z.object({
  titre: z.string().min(1).max(500),
  contenu: z.string().min(1).max(50000),
  resume: z.string().max(1000).nullable().optional(),
  image: z.string().url().max(500).nullable().optional(),
  source: z.string().max(200).nullable().optional(),
  sourceUrl: z.string().url().max(500).nullable().optional(),
  candidatId: z.string().max(50).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
  published: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const candidatId = searchParams.get("candidatId");

    const actualites = await prisma.actualite.findMany({
      where: {
        published: true,
        ...(tag ? { tags: { has: tag } } : {}),
        ...(candidatId ? { candidatId } : {}),
      },
      include: { candidat: { include: { parti: true } } },
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ data: actualites });
  } catch (error) {
    console.error("GET /api/actualites error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const data = ActualiteSchema.parse(body);

    // Verify candidatId exists if provided
    if (data.candidatId) {
      const candidat = await prisma.candidat.findUnique({ where: { id: data.candidatId } });
      if (!candidat) {
        return NextResponse.json({ error: "Candidat introuvable" }, { status: 400 });
      }
    }

    const slug = slugify(data.titre);
    const existing = await prisma.actualite.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const actualite = await prisma.actualite.create({
      data: {
        slug: finalSlug,
        titre: data.titre,
        contenu: data.contenu,
        resume: data.resume ?? null,
        image: data.image ?? null,
        source: data.source ?? null,
        sourceUrl: data.sourceUrl ?? null,
        candidatId: data.candidatId ?? null,
        tags: data.tags ?? [],
        published: data.published ?? false,
        publishedAt: data.published ? new Date() : null,
      },
      include: { candidat: true },
    });

    return NextResponse.json({ data: actualite }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/actualites error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
