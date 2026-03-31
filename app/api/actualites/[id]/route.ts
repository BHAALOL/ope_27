import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const UpdateSchema = z.object({
  titre: z.string().min(1).max(500).optional(),
  contenu: z.string().min(1).max(50000).optional(),
  resume: z.string().max(1000).nullable().optional(),
  image: z.string().url().max(500).nullable().optional(),
  source: z.string().max(200).nullable().optional(),
  sourceUrl: z.string().url().max(500).nullable().optional(),
  candidatId: z.string().max(50).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  published: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actualite = await prisma.actualite.findUnique({
      where: { id: params.id },
      include: { candidat: true },
    });
    if (!actualite) {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }
    return NextResponse.json({ data: actualite });
  } catch (error) {
    console.error("GET /api/actualites/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const data = UpdateSchema.parse(body);

    // Verify candidatId exists if provided
    if (data.candidatId) {
      const candidat = await prisma.candidat.findUnique({ where: { id: data.candidatId } });
      if (!candidat) {
        return NextResponse.json({ error: "Candidat introuvable" }, { status: 400 });
      }
    }

    const existing = await prisma.actualite.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }

    const actualite = await prisma.actualite.update({
      where: { id: params.id },
      data: {
        ...(data.titre !== undefined && { titre: data.titre }),
        ...(data.contenu !== undefined && { contenu: data.contenu }),
        ...(data.resume !== undefined && { resume: data.resume }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.source !== undefined && { source: data.source }),
        ...(data.sourceUrl !== undefined && { sourceUrl: data.sourceUrl }),
        ...(data.candidatId !== undefined && { candidatId: data.candidatId }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.published !== undefined && {
          published: data.published,
          publishedAt:
            data.published && !existing.publishedAt ? new Date() : existing.publishedAt,
        }),
      },
    });

    return NextResponse.json({ data: actualite });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }
    console.error("PUT /api/actualites/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    await prisma.actualite.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }
    console.error("DELETE /api/actualites/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
