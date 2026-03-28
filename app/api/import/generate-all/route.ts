import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

function buildCandidatPrompt(prenom: string, nom: string, partiNom?: string): string {
  return `Tu es un expert en politique française. Génère des informations complètes et précises sur le candidat politique français "${prenom} ${nom}"${partiNom ? ` du parti "${partiNom}"` : ""} pour une plateforme de suivi de la présidentielle 2027.

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans commentaires) avec exactement cette structure:
{
  "biographie": "Biographie détaillée de 3-4 paragraphes (600-800 mots)",
  "age": 50,
  "programme": {
    "économie": "Position détaillée sur l'économie",
    "education": "Position sur l'éducation",
    "sante": "Position sur la santé",
    "environnement": "Position sur l'environnement et le climat",
    "securite": "Position sur la sécurité",
    "immigration": "Position sur l'immigration",
    "europe": "Position sur l'Europe",
    "logement": "Position sur le logement"
  },
  "positions": {
    "Immigration": "Pour/Contre avec nuances",
    "Europe fédérale": "Pour/Contre avec nuances",
    "Retraites": "Position",
    "Nucléaire": "Pour/Contre",
    "Service national": "Pour/Contre",
    "TVA alimentaire": "Position",
    "ISF": "Pour/Contre",
    "Cannabis": "Pour/Contre"
  }
}

Assure-toi que les informations sont précises et basées sur les positions réelles connues du personnage.`;
}

function buildPartiPrompt(nom: string, sigle?: string): string {
  return `Tu es un expert en politique française. Génère des informations complètes et précises sur le parti politique français "${nom}"${sigle ? ` (${sigle})` : ""} pour une plateforme de suivi de la présidentielle 2027.

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans commentaires) avec exactement cette structure:
{
  "description": "Description courte du parti (2-3 phrases)",
  "histoire": "Histoire détaillée du parti (3-4 paragraphes, 400-600 mots)",
  "ideologie": "Ex: Centre-droit, Gauche, Extrême droite, etc.",
  "fondation": 1958,
  "couleur": "#HEX_COLOR_du_parti"
}

Les informations doivent être précises et basées sur des faits réels si le parti existe.`;
}

async function generateWithAnthropic(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Clé API Anthropic non configurée");

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (!content || content.type !== "text") {
    throw new Error("Réponse inattendue de l'API Anthropic");
  }
  return content.text;
}

async function generateWithOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Clé API OpenAI non configurée");

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1",
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content: "Tu es un expert en politique française. Tu réponds uniquement en JSON valide, sans markdown.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Réponse vide de l'API OpenAI");
  return content;
}

async function generateContent(
  prompt: string,
  provider: "anthropic" | "openai"
): Promise<Record<string, unknown>> {
  const rawText =
    provider === "openai"
      ? await generateWithOpenAI(prompt)
      : await generateWithAnthropic(prompt);
  try {
    return JSON.parse(cleanJsonResponse(rawText));
  } catch {
    console.error("Failed to parse AI response:", rawText.substring(0, 500));
    throw new Error("Impossible de parser la réponse de l'IA");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const provider: "anthropic" | "openai" =
      body.provider === "openai" ? "openai" : "anthropic";

    const results = {
      partisGenerated: [] as string[],
      partisSkipped: [] as string[],
      candidatsGenerated: [] as string[],
      candidatsSkipped: [] as string[],
      errors: [] as string[],
    };

    // 1. Generate content for parties without description
    const partis = await prisma.parti.findMany({
      where: {
        OR: [{ description: null }, { description: "" }],
      },
    });

    for (const parti of partis) {
      try {
        const prompt = buildPartiPrompt(parti.nom, parti.sigle ?? undefined);
        const data = await generateContent(prompt, provider);

        await prisma.parti.update({
          where: { id: parti.id },
          data: {
            description: (data.description as string) || null,
            histoire: (data.histoire as string) || null,
            ideologie: (data.ideologie as string) || null,
            fondation: typeof data.fondation === "number" ? data.fondation : null,
            couleur: (data.couleur as string) || null,
          },
        });

        results.partisGenerated.push(parti.nom);
      } catch (err) {
        results.errors.push(
          `Parti "${parti.nom}": ${err instanceof Error ? err.message : "Erreur"}`
        );
      }
    }

    // 2. Generate content for candidates without biography
    const candidats = await prisma.candidat.findMany({
      where: {
        OR: [{ biographie: null }, { biographie: "" }],
      },
      include: { parti: true },
    });

    for (const candidat of candidats) {
      try {
        const prompt = buildCandidatPrompt(
          candidat.prenom,
          candidat.nom,
          candidat.parti?.nom
        );
        const data = await generateContent(prompt, provider);

        await prisma.candidat.update({
          where: { id: candidat.id },
          data: {
            biographie: (data.biographie as string) || null,
            age: typeof data.age === "number" ? data.age : null,
            programme: data.programme
              ? (data.programme as Record<string, string>)
              : undefined,
            positions: data.positions
              ? (data.positions as Record<string, string>)
              : undefined,
          },
        });

        results.candidatsGenerated.push(
          `${candidat.prenom} ${candidat.nom}`
        );
      } catch (err) {
        results.errors.push(
          `Candidat "${candidat.prenom} ${candidat.nom}": ${err instanceof Error ? err.message : "Erreur"}`
        );
      }
    }

    // Count skipped (already have content)
    const totalPartis = await prisma.parti.count();
    const totalCandidats = await prisma.candidat.count();
    results.partisSkipped = Array(
      totalPartis - partis.length
    ).fill("(déjà enrichi)");
    results.candidatsSkipped = Array(
      totalCandidats - candidats.length
    ).fill("(déjà enrichi)");

    return NextResponse.json({
      success: true,
      provider,
      results: {
        partisGenerated: results.partisGenerated,
        partisSkippedCount: totalPartis - partis.length,
        candidatsGenerated: results.candidatsGenerated,
        candidatsSkippedCount: totalCandidats - candidats.length,
        errors: results.errors,
      },
    });
  } catch (error) {
    console.error("POST /api/import/generate-all error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la génération",
      },
      { status: 500 }
    );
  }
}
