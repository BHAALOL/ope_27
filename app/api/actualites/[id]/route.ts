import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  titre: z.string().min(1).optional(),
  contenu: z.string().optional(),
  resume: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
  candidatId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const existing = await prisma.actualite.findUnique({ where: { id: params.id } });

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
            data.published && !existing?.publishedAt ? new Date() : existing?.publishedAt,
        }),
      },
    });

    return NextResponse.json({ data: actualite });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await prisma.actualite.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/actualites/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
