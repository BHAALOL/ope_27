import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const PartiSchema = z.object({
  nom: z.string().min(1).max(200),
  sigle: z.string().max(20).nullable().optional(),
  logo: z.string().url().max(500).nullable().optional(),
  couleur: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hex invalide").nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  histoire: z.string().max(10000).nullable().optional(),
  ideologie: z.string().max(200).nullable().optional(),
  fondation: z.number().int().min(1700).max(new Date().getFullYear()).nullable().optional(),
  published: z.boolean().optional().default(false),
});

export async function GET(_req: NextRequest) {
  try {
    const partis = await prisma.parti.findMany({
      include: { candidats: { where: { published: true }, select: { id: true } } },
      orderBy: { nom: "asc" },
    });
    return NextResponse.json({ data: partis });
  } catch (error) {
    console.error("GET /api/partis error:", error);
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
    const data = PartiSchema.parse(body);

    const slug = slugify(data.sigle || data.nom);
    const existing = await prisma.parti.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const parti = await prisma.parti.create({
      data: {
        slug: finalSlug,
        nom: data.nom,
        sigle: data.sigle ?? null,
        logo: data.logo ?? null,
        couleur: data.couleur ?? null,
        description: data.description ?? null,
        histoire: data.histoire ?? null,
        ideologie: data.ideologie ?? null,
        fondation: data.fondation ?? null,
        published: data.published ?? false,
      },
    });

    return NextResponse.json({ data: parti }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/partis error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
