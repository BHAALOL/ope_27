import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const EvenementSchema = z.object({
  titre: z.string().min(1).max(500),
  description: z.string().max(5000).nullable().optional(),
  lieu: z.string().max(300).nullable().optional(),
  ville: z.string().max(200).nullable().optional(),
  dateDebut: z.string().min(1),
  dateFin: z.string().nullable().optional(),
  type: z.enum(["MEETING", "DEBAT", "CONFERENCE", "AUTRE"]).default("MEETING"),
  lienInscription: z.string().url().max(500).nullable().optional(),
});

export async function GET(_req: NextRequest) {
  try {
    const evenements = await prisma.evenement.findMany({
      orderBy: { dateDebut: "asc" },
    });
    const response = NextResponse.json({ data: evenements });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return response;
  } catch (error) {
    console.error("GET /api/agenda error:", error);
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
    const data = EvenementSchema.parse(body);

    const dateDebut = new Date(data.dateDebut);
    if (isNaN(dateDebut.getTime())) {
      return NextResponse.json({ error: "Date de début invalide" }, { status: 400 });
    }

    const dateFin = data.dateFin ? new Date(data.dateFin) : null;
    if (dateFin && isNaN(dateFin.getTime())) {
      return NextResponse.json({ error: "Date de fin invalide" }, { status: 400 });
    }

    if (dateFin && dateFin < dateDebut) {
      return NextResponse.json({ error: "La date de fin doit être après la date de début" }, { status: 400 });
    }

    const evenement = await prisma.evenement.create({
      data: {
        titre: data.titre,
        description: data.description ?? null,
        lieu: data.lieu ?? null,
        ville: data.ville ?? null,
        dateDebut,
        dateFin,
        type: data.type,
        lienInscription: data.lienInscription ?? null,
      },
    });

    return NextResponse.json({ data: evenement }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/agenda error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    await prisma.evenement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }
    console.error("DELETE /api/agenda error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
