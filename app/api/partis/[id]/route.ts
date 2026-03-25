import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  nom: z.string().min(1).optional(),
  sigle: z.string().nullable().optional(),
  couleur: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  histoire: z.string().nullable().optional(),
  ideologie: z.string().nullable().optional(),
  fondation: z.number().int().nullable().optional(),
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const parti = await prisma.parti.update({
      where: { id: params.id },
      data: {
        ...(data.nom !== undefined && { nom: data.nom }),
        ...(data.sigle !== undefined && { sigle: data.sigle }),
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
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await prisma.parti.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/partis/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
