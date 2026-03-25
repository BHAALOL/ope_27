import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const EvenementSchema = z.object({
  titre: z.string().min(1),
  description: z.string().nullable().optional(),
  lieu: z.string().nullable().optional(),
  ville: z.string().nullable().optional(),
  dateDebut: z.string(),
  dateFin: z.string().nullable().optional(),
  type: z.enum(["MEETING", "DEBAT", "CONFERENCE", "AUTRE"]).default("MEETING"),
  lienInscription: z.string().nullable().optional(),
});

export async function GET(_req: NextRequest) {
  try {
    const evenements = await prisma.evenement.findMany({
      orderBy: { dateDebut: "asc" },
    });
    return NextResponse.json({ data: evenements });
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

    const evenement = await prisma.evenement.create({
      data: {
        titre: data.titre,
        description: data.description ?? null,
        lieu: data.lieu ?? null,
        ville: data.ville ?? null,
        dateDebut: new Date(data.dateDebut),
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
        type: data.type,
        lienInscription: data.lienInscription ?? null,
      },
    });

    return NextResponse.json({ data: evenement }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
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
    console.error("DELETE /api/agenda error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
