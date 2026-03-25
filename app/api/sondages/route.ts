import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SondageSchema = z.object({
  candidatId: z.string(),
  date: z.string(),
  score: z.number().min(0).max(100),
  marge: z.number().nullable().optional(),
  institut: z.string().min(1),
  source: z.string().nullable().optional(),
});

export async function GET(_req: NextRequest) {
  try {
    const sondages = await prisma.sondage.findMany({
      include: { candidat: { include: { parti: true } } },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ data: sondages });
  } catch (error) {
    console.error("GET /api/sondages error:", error);
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
    const data = SondageSchema.parse(body);

    const sondage = await prisma.sondage.create({
      data: {
        candidatId: data.candidatId,
        date: new Date(data.date),
        score: data.score,
        marge: data.marge ?? null,
        institut: data.institut,
        source: data.source ?? null,
      },
      include: { candidat: true },
    });

    return NextResponse.json({ data: sondage }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("POST /api/sondages error:", error);
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

    await prisma.sondage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sondages error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
