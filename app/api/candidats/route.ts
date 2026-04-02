import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const CandidatSchema = z.object({
  prenom: z.string().min(1).max(100),
  nom: z.string().min(1).max(100),
  age: z.number().int().min(18).max(120).nullable().optional(),
  photo: z.string().url().max(500).nullable().optional(),
  partiId: z.string().max(50).nullable().optional(),
  biographie: z.string().max(10000).nullable().optional(),
  programme: z.record(z.unknown()).nullable().optional(),
  positions: z.record(z.unknown()).nullable().optional(),
  published: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let onlyPublished = true;

    // Only allow viewing unpublished candidates if authenticated as admin
    if (searchParams.get("published") === "false") {
      const session = await getServerSession(authOptions);
      const role = session?.user?.role;
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        onlyPublished = false;
      }
    }

    const candidats = await prisma.candidat.findMany({
      where: onlyPublished ? { published: true } : undefined,
      include: {
        parti: true,
        sondages: { orderBy: { date: "desc" }, take: 1 },
      },
      orderBy: { nom: "asc" },
    });

    const response = NextResponse.json({ data: candidats });
    if (onlyPublished) {
      response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    } else {
      response.headers.set("Cache-Control", "private, no-store");
    }
    return response;
  } catch (error) {
    console.error("GET /api/candidats error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const data = CandidatSchema.parse(body);

    // Verify partiId exists if provided
    if (data.partiId) {
      const parti = await prisma.parti.findUnique({ where: { id: data.partiId } });
      if (!parti) {
        return NextResponse.json({ error: "Parti introuvable" }, { status: 400 });
      }
    }

    const baseSlug = slugify(`${data.prenom}-${data.nom}`);

    const candidat = await prisma.$transaction(async (tx) => {
      const existing = await tx.candidat.findUnique({ where: { slug: baseSlug } });
      const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

      return tx.candidat.create({
        data: {
          slug: finalSlug,
          prenom: data.prenom,
          nom: data.nom,
          age: data.age ?? null,
          photo: data.photo ?? null,
          partiId: data.partiId ?? null,
          biographie: data.biographie ?? null,
          programme: data.programme ? (data.programme as Record<string, string>) : undefined,
          positions: data.positions ? (data.positions as Record<string, string>) : undefined,
          published: data.published ?? false,
          featured: data.featured ?? false,
        },
        include: { parti: true },
      });
    });

    return NextResponse.json({ data: candidat }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/candidats error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
