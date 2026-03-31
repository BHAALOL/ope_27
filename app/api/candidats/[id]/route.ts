import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const UpdateSchema = z.object({
  prenom: z.string().min(1).max(100).optional(),
  nom: z.string().min(1).max(100).optional(),
  age: z.number().int().min(18).max(120).nullable().optional(),
  photo: z.string().url().max(500).nullable().optional(),
  partiId: z.string().max(50).nullable().optional(),
  biographie: z.string().max(10000).nullable().optional(),
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
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const data = UpdateSchema.parse(body);

    // Verify partiId exists if provided
    if (data.partiId) {
      const parti = await prisma.parti.findUnique({ where: { id: data.partiId } });
      if (!parti) {
        return NextResponse.json({ error: "Parti introuvable" }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.prenom !== undefined) updateData.prenom = data.prenom;
    if (data.nom !== undefined) updateData.nom = data.nom;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.photo !== undefined) updateData.photo = data.photo;
    if (data.partiId !== undefined) updateData.partiId = data.partiId;
    if (data.biographie !== undefined) updateData.biographie = data.biographie;
    if (data.programme !== undefined) updateData.programme = data.programme ?? Prisma.JsonNull;
    if (data.positions !== undefined) updateData.positions = data.positions ?? Prisma.JsonNull;
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
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });
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
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    await prisma.candidat.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });
    }
    console.error("DELETE /api/candidats/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
