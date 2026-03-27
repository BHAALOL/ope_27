import { z } from "zod";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

export interface PerplexityNewsResult {
  titre: string;
  resume: string;
  contenu: string;
  source: string;
  sourceUrl: string;
  tags: string[];
  candidatMentioned?: string;
  publishedAt: string;
}

export interface PerplexitySearchResponse {
  results: PerplexityNewsResult[];
  query: string;
  searchedAt: string;
}

const NewsResultSchema = z.object({
  titre: z.string(),
  resume: z.string(),
  contenu: z.string(),
  source: z.string(),
  sourceUrl: z.string().url().or(z.string()),
  tags: z.array(z.string()),
  candidatMentioned: z.string().optional(),
  publishedAt: z.string(),
});

const NewsArraySchema = z.array(NewsResultSchema);

export async function searchRecentNews(
  query: string,
  options?: { maxResults?: number; candidatNames?: string[] }
): Promise<PerplexitySearchResponse> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("Clé API Perplexity non configurée (PERPLEXITY_API_KEY)");
  }

  const maxResults = options?.maxResults ?? 5;
  const candidatContext = options?.candidatNames?.length
    ? `\nCandidats connus dans notre base: ${options.candidatNames.join(", ")}.`
    : "";

  const systemPrompt = `Tu es un assistant spécialisé dans la veille politique française pour la présidentielle 2027.
Tu dois chercher les actualités les plus récentes et pertinentes.
${candidatContext}

IMPORTANT: Réponds UNIQUEMENT avec un tableau JSON valide (sans markdown, sans commentaires, sans \`\`\`).
Chaque élément du tableau doit avoir cette structure exacte:
{
  "titre": "Titre de l'article",
  "resume": "Résumé en 1-2 phrases",
  "contenu": "Contenu détaillé de l'article (3-5 paragraphes, factuel et informatif)",
  "source": "Nom du média source",
  "sourceUrl": "URL de l'article source",
  "tags": ["tag1", "tag2"],
  "candidatMentioned": "Nom complet du candidat si mentionné (sinon omettre ce champ)",
  "publishedAt": "Date ISO de publication"
}

Retourne entre 1 et ${maxResults} articles récents. Priorise les informations des dernières heures/jours.
Ne retourne que des faits vérifiables avec des sources réelles.`;

  const response = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.PERPLEXITY_MODEL || "sonar-pro",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Recherche les actualités politiques françaises les plus récentes sur: ${query}`,
        },
      ],
      max_tokens: 4096,
      temperature: 0.1,
      return_citations: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Perplexity API error:", response.status, errorBody);
    throw new Error(
      `Erreur Perplexity API (${response.status}): ${response.statusText}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Réponse vide de Perplexity");
  }

  // Parse JSON from response
  let results: PerplexityNewsResult[];
  try {
    const cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    results = NewsArraySchema.parse(arr);
  } catch (parseError) {
    console.error("Failed to parse Perplexity response:", content);
    throw new Error("Impossible de parser la réponse de Perplexity");
  }

  return {
    results,
    query,
    searchedAt: new Date().toISOString(),
  };
}
