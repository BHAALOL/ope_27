import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const UpdateSchema = z.object({
  nom: z.string().min(1).max(200).optional(),
  sigle: z.string().max(20).nullable().optional(),
  logo: z.string().url().max(500).nullable().optional(),
  couleur: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hex invalide").nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  histoire: z.string().max(10000).nullable().optional(),
  ideologie: z.string().max(200).nullable().optional(),
  fondation: z.number().int().min(1700).max(new Date().getFullYear()).nullable().optional(),
  published: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parti = await prisma.parti.findUnique({
      where: { id: params.id },
      include: {
        candidats: {
          include: { sondages: { orderBy: { date: "desc" }, take: 1 } },
        },
      },
    });
    if (!parti) {
      return NextResponse.json({ error: "Parti introuvable" }, { status: 404 });
    }
    return NextResponse.json({ data: parti });
  } catch (error) {
    console.error("GET /api/partis/[id] error:", error);
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

    const parti = await prisma.parti.update({
      where: { id: params.id },
      data: {
        ...(data.nom !== undefined && { nom: data.nom }),
        ...(data.sigle !== undefined && { sigle: data.sigle }),
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.couleur !== undefined && { couleur: data.couleur }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.histoire !== undefined && { histoire: data.histoire }),
        ...(data.ideologie !== undefined && { ideologie: data.ideologie }),
        ...(data.fondation !== undefined && { fondation: data.fondation }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    return NextResponse.json({ data: parti });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Parti introuvable" }, { status: 404 });
    }
    console.error("PUT /api/partis/[id] error:", error);
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

    await prisma.parti.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Parti introuvable" }, { status: 404 });
    }
    console.error("DELETE /api/partis/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
