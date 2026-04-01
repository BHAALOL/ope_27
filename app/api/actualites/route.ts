import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/api-auth";
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
    let onlyPublished = true;

    // Only allow viewing unpublished articles if authenticated as admin
    if (searchParams.get("published") === "false") {
      const session = await getServerSession(authOptions);
      const role = session?.user?.role;
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        onlyPublished = false;
      }
    }

    const actualites = await prisma.actualite.findMany({
      where: {
        ...(onlyPublished ? { published: true } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
        ...(candidatId ? { candidatId } : {}),
      },
      include: { candidat: { include: { parti: true } } },
      orderBy: { createdAt: "desc" },
    });

    const response = NextResponse.json({ data: actualites });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return response;
  } catch (error) {
    console.error("GET /api/actualites error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const data = ActualiteSchema.parse(body);

    // Verify candidatId exists if provided
    if (data.candidatId) {
      const candidat = await prisma.candidat.findUnique({ where: { id: data.candidatId } });
      if (!candidat) {
        return NextResponse.json({ error: "Candidat introuvable" }, { status: 400 });
      }
    }

    const baseSlug = slugify(data.titre);

    const actualite = await prisma.$transaction(async (tx) => {
      const existing = await tx.actualite.findUnique({ where: { slug: baseSlug } });
      const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

      return tx.actualite.create({
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
