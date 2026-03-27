import { NextResponse } from "next/server";
import { fetchPolymarketElection } from "@/lib/polymarket";

export async function GET() {
  try {
    const data = await fetchPolymarketElection();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/polymarket error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
