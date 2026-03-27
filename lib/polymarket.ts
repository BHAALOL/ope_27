const GAMMA_API_BASE = "https://gamma-api.polymarket.com";
const EVENT_SLUG = "next-french-presidential-election";

export interface PolymarketOutcome {
  candidat: string;
  probabilite: number;
  volume: number;
}

export interface PolymarketEventData {
  titre: string;
  slug: string;
  outcomes: PolymarketOutcome[];
  lastUpdated: string;
  totalVolume: number;
  sourceUrl: string;
}

interface GammaMarket {
  id: string;
  question: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  active: boolean;
  closed: boolean;
  updatedAt: string;
  clobTokenIds: string;
}

interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  markets: GammaMarket[];
}

/**
 * Extrait le nom du candidat depuis la question du marché Polymarket.
 * Ex: "Will Jordan Bardella win the next French presidential election?" -> "Jordan Bardella"
 */
function extractCandidateName(question: string): string {
  const match = question.match(/^Will (.+?) win/i);
  return match ? match[1] : question;
}

/**
 * Récupère les données de l'événement "Next French Presidential Election" depuis Polymarket.
 */
export async function fetchPolymarketElection(): Promise<PolymarketEventData> {
  const url = `${GAMMA_API_BASE}/events?slug=${EVENT_SLUG}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 }, // Cache 5 minutes
  });

  if (!response.ok) {
    throw new Error(
      `Erreur Polymarket API (${response.status}): ${response.statusText}`
    );
  }

  const events: GammaEvent[] = await response.json();

  if (!events || events.length === 0) {
    throw new Error("Événement Polymarket introuvable");
  }

  const event = events[0];
  let totalVolume = 0;

  const outcomes: PolymarketOutcome[] = event.markets
    .filter((m) => m.active && !m.closed)
    .map((market) => {
      const prices = JSON.parse(market.outcomePrices || "[]") as string[];
      const volume = parseFloat(market.volume || "0");
      totalVolume += volume;

      // For binary markets, index 0 is YES probability
      const yesProbability = prices.length > 0 ? parseFloat(prices[0]) : 0;

      return {
        candidat: extractCandidateName(market.question),
        probabilite: Math.round(yesProbability * 1000) / 10, // Convert to percentage with 1 decimal
        volume,
      };
    })
    .sort((a, b) => b.probabilite - a.probabilite);

  return {
    titre: event.title,
    slug: event.slug,
    outcomes,
    lastUpdated: new Date().toISOString(),
    totalVolume,
    sourceUrl: `https://polymarket.com/event/${EVENT_SLUG}`,
  };
}
