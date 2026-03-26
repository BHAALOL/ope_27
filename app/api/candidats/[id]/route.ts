import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  prenom: z.string().min(1).optional(),
  nom: z.string().min(1).optional(),
  age: z.number().int().nullable().optional(),
  photo: z.string().nullable().optional(),
  partiId: z.string().nullable().optional(),
  biographie: z.string().nullable().optional(),
  programme: z.record(z.unknown()).nullable().optional(),
  positions: z.record(z.unknown()).nullable().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidat = await prisma.candidat.findUnique({
      where: { id: params.id },
      include: {
        parti: true,
        sondages: { orderBy: { date: "desc" } },
        actualites: { where: { published: true }, orderBy: { publishedAt: "desc" } },
      },
    });

    if (!candidat) {
      return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });
    }

    return NextResponse.json({ data: candidat });
  } catch (error) {
    console.error("GET /api/candidats/[id] error:", error);
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

    const updateData: Record<string, unknown> = {};
    if (data.prenom !== undefined) updateData.prenom = data.prenom;
    if (data.nom !== undefined) updateData.nom = data.nom;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.photo !== undefined) updateData.photo = data.photo;
    if (data.partiId !== undefined) updateData.partiId = data.partiId;
    if (data.biographie !== undefined) updateData.biographie = data.biographie;
    if (data.programme !== undefined) updateData.programme = data.programme ? JSON.parse(JSON.stringify(data.programme)) : null;
    if (data.positions !== undefined) updateData.positions = data.positions ? JSON.parse(JSON.stringify(data.positions)) : null;
    if (data.published !== undefined) updateData.published = data.published;
    if (data.featured !== undefined) updateData.featured = data.featured;

    const candidat = await prisma.candidat.update({
      where: { id: params.id },
      data: updateData,
      include: { parti: true },
    });

    return NextResponse.json({ data: candidat });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("PUT /api/candidats/[id] error:", error);
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

    await prisma.candidat.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/candidats/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
