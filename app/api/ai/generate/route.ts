import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const RequestSchema = z.object({
  type: z.enum(["candidat", "parti"]),
  name: z.string().min(1),
  additionalContext: z.string().optional(),
});

function buildCandidatPrompt(name: string, context?: string): string {
  return `Tu es un expert en politique française. Génère des informations complètes et précises sur le candidat politique français "${name}" pour une plateforme de suivi de la présidentielle 2027.

${context ? `Contexte supplémentaire: ${context}` : ""}

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

Assure-toi que les informations sont précises, basées sur les positions réelles connues du personnage si c'est une figure publique. Si c'est un personnage fictif, crée des positions cohérentes avec son profil politique supposé.`;
}

function buildPartiPrompt(name: string, context?: string): string {
  return `Tu es un expert en politique française. Génère des informations complètes et précises sur le parti politique français "${name}" pour une plateforme de suivi de la présidentielle 2027.

${context ? `Contexte supplémentaire: ${context}` : ""}

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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { type, name, additionalContext } = RequestSchema.parse(body);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Clé API Anthropic non configurée" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const prompt =
      type === "candidat"
        ? buildCandidatPrompt(name, additionalContext)
        : buildPartiPrompt(name, additionalContext);

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Réponse inattendue de l'API");
    }

    // Parse the JSON response
    let data: Record<string, unknown>;
    try {
      // Clean up potential markdown code blocks
      const text = content.text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      data = JSON.parse(text);
    } catch {
      console.error("Failed to parse AI response:", content.text);
      return NextResponse.json(
        { success: false, error: "Impossible de parser la réponse de l'IA" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides" },
        { status: 400 }
      );
    }
    console.error("POST /api/ai/generate error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Erreur lors de la génération",
      },
      { status: 500 }
    );
  }
}
