import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchPolymarketElection } from "@/lib/polymarket";
import { slugify } from "@/lib/utils";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

interface CandidatPartiInfo {
  prenom: string;
  nom: string;
  parti_nom: string;
  parti_sigle: string;
}

function buildIdentifyPartiesPrompt(candidateNames: string[]): string {
  const list = candidateNames.map((n, i) => `${i + 1}. ${n}`).join("\n");
  return `Tu es un expert en politique française. Pour chaque candidat ci-dessous, identifie son parti politique actuel (ou le plus récent) pour la présidentielle 2027.

Candidats:
${list}

Réponds UNIQUEMENT avec un tableau JSON valide (sans markdown, sans commentaires) avec cette structure:
[
  { "prenom": "Prénom", "nom": "Nom", "parti_nom": "Nom complet du parti", "parti_sigle": "SIGLE" },
  ...
]

Si un candidat est indépendant ou sans parti, utilise parti_nom: "Indépendant" et parti_sigle: "IND".
Assure-toi que les noms de partis sont cohérents (même orthographe pour le même parti).`;
}

function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

async function identifyPartiesWithAnthropic(
  candidateNames: string[]
): Promise<CandidatPartiInfo[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Clé API Anthropic non configurée");

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      { role: "user", content: buildIdentifyPartiesPrompt(candidateNames) },
    ],
  });

  const content = message.content[0];
  if (!content || content.type !== "text") {
    throw new Error("Réponse inattendue de l'API Anthropic");
  }
  return JSON.parse(cleanJsonResponse(content.text));
}

async function identifyPartiesWithOpenAI(
  candidateNames: string[]
): Promise<CandidatPartiInfo[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Clé API OpenAI non configurée");

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content:
          "Tu es un expert en politique française. Tu réponds uniquement en JSON valide, sans markdown.",
      },
      {
        role: "user",
        content: buildIdentifyPartiesPrompt(candidateNames),
      },
    ],
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Réponse vide de l'API OpenAI");
  return JSON.parse(cleanJsonResponse(content));
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Rate limit: 5 requests per minute
    const rlKey = getRateLimitKey(req, "import-polymarket");
    const rl = checkRateLimit(rlKey, { maxRequests: 5, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez dans quelques instants." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const provider = body.provider === "openai" ? "openai" : "anthropic";

    // 1. Fetch candidates from Polymarket
    const polyData = await fetchPolymarketElection();
    const candidateNames = polyData.outcomes.map((o) => o.candidat);

    if (candidateNames.length === 0) {
      return NextResponse.json(
        { error: "Aucun candidat trouvé sur Polymarket" },
        { status: 404 }
      );
    }

    // 2. Use AI to identify parties for each candidate
    const candidatsInfo =
      provider === "openai"
        ? await identifyPartiesWithOpenAI(candidateNames)
        : await identifyPartiesWithAnthropic(candidateNames);

    const results = {
      partisCreated: [] as string[],
      partisExisting: [] as string[],
      candidatsCreated: [] as string[],
      candidatsExisting: [] as string[],
      errors: [] as string[],
    };

    // 3. Process each candidate
    for (const info of candidatsInfo) {
      try {
        // --- Handle Party ---
        let partiId: string | null = null;

        // Search by name (case-insensitive) or sigle
        const existingParti = await prisma.parti.findFirst({
          where: {
            OR: [
              { nom: { equals: info.parti_nom, mode: "insensitive" } },
              { sigle: { equals: info.parti_sigle, mode: "insensitive" } },
            ],
          },
        });

        if (existingParti) {
          partiId = existingParti.id;
          if (!results.partisExisting.includes(info.parti_nom)) {
            results.partisExisting.push(info.parti_nom);
          }
        } else {
          // Create the party
          const partiSlug = slugify(info.parti_sigle || info.parti_nom);
          const existingSlug = await prisma.parti.findUnique({
            where: { slug: partiSlug },
          });
          const finalPartiSlug = existingSlug
            ? `${partiSlug}-${Date.now()}`
            : partiSlug;

          const newParti = await prisma.parti.create({
            data: {
              slug: finalPartiSlug,
              nom: info.parti_nom,
              sigle: info.parti_sigle || null,
              published: true,
            },
          });
          partiId = newParti.id;
          results.partisCreated.push(info.parti_nom);
        }

        // --- Handle Candidate ---
        const existingCandidat = await prisma.candidat.findFirst({
          where: {
            AND: [
              { nom: { equals: info.nom, mode: "insensitive" } },
              { prenom: { equals: info.prenom, mode: "insensitive" } },
            ],
          },
        });

        if (existingCandidat) {
          results.candidatsExisting.push(`${info.prenom} ${info.nom}`);
        } else {
          const candidatSlug = slugify(`${info.prenom}-${info.nom}`);
          const existingSlug = await prisma.candidat.findUnique({
            where: { slug: candidatSlug },
          });
          const finalCandidatSlug = existingSlug
            ? `${candidatSlug}-${Date.now()}`
            : candidatSlug;

          await prisma.candidat.create({
            data: {
              slug: finalCandidatSlug,
              prenom: info.prenom,
              nom: info.nom,
              partiId,
              published: true,
            },
          });
          results.candidatsCreated.push(`${info.prenom} ${info.nom}`);
        }
      } catch (err) {
        results.errors.push(
          `${info.prenom} ${info.nom}: ${err instanceof Error ? err.message : "Erreur inconnue"}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      provider,
      polymarketCandidates: candidateNames.length,
      results,
    });
  } catch (error) {
    console.error("POST /api/import/polymarket error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur lors de l'import",
      },
      { status: 500 }
    );
  }
}
