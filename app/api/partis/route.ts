import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/api-auth";
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let onlyPublished = true;

    if (searchParams.get("published") === "false") {
      const session = await getServerSession(authOptions);
      const role = session?.user?.role;
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        onlyPublished = false;
      }
    }

    const partis = await prisma.parti.findMany({
      where: onlyPublished ? { published: true } : undefined,
      include: { candidats: { where: { published: true }, select: { id: true } } },
      orderBy: { nom: "asc" },
    });
    const response = NextResponse.json({ data: partis });
    if (onlyPublished) {
      response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    } else {
      response.headers.set("Cache-Control", "private, no-store");
    }
    return response;
  } catch (error) {
    console.error("GET /api/partis error:", error);
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
    const data = PartiSchema.parse(body);

    const baseSlug = slugify(data.sigle || data.nom);

    const parti = await prisma.$transaction(async (tx) => {
      const existing = await tx.parti.findUnique({ where: { slug: baseSlug } });
      const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

      return tx.parti.create({
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
