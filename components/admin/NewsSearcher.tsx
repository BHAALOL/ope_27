"use client";

import { useState } from "react";
import {
  Search,
  Globe,
  AlertCircle,
  Clock,
  ExternalLink,
  Plus,
  Loader2,
  Tag,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";

interface NewsResult {
  titre: string;
  resume: string;
  contenu: string;
  source: string;
  sourceUrl: string;
  tags: string[];
  candidatMentioned?: string;
  publishedAt: string;
}

interface NewsSearcherProps {
  onImport: (news: NewsResult) => void;
}

const SUGGESTED_QUERIES = [
  "Présidentielle 2027 dernières nouvelles",
  "Sondages présidentielle 2027",
  "Candidats déclarés présidentielle 2027",
  "Débat politique France aujourd'hui",
  "Réforme politique France actualité",
];

export function NewsSearcher({ onImport }: NewsSearcherProps) {
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NewsResult[]>([]);
  const [searchedAt, setSearchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importedIndices, setImportedIndices] = useState<Set<number>>(
    new Set()
  );

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setImportedIndices(new Set());

    try {
      const res = await fetch("/api/ai/search-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, maxResults }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erreur lors de la recherche");
      }

      setResults(json.results || []);
      setSearchedAt(json.searchedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (result: NewsResult, index: number) => {
    onImport(result);
    setImportedIndices((prev) => new Set([...prev, index]));
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm";

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className={`${inputClass} pl-10`}
            placeholder="Rechercher des actualités récentes..."
          />
        </div>
        <select
          value={maxResults}
          onChange={(e) => setMaxResults(Number(e.target.value))}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
        >
          {[3, 5, 8, 10].map((n) => (
            <option key={n} value={n} className="bg-gray-900">
              {n} résultats
            </option>
          ))}
        </select>
        <Button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          loading={loading}
          className="flex items-center gap-2 bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
        >
          <Globe size={16} />
          Rechercher
        </Button>
      </div>

      {/* Suggested queries */}
      {results.length === 0 && !loading && !error && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Suggestions :</span>
          {SUGGESTED_QUERIES.map((sq) => (
            <button
              key={sq}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              {sq}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Erreur de recherche</p>
            <p className="text-xs text-red-400/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-12 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">
            Recherche en cours via Perplexity...
          </span>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {results.length} résultat(s) trouvé(s)
            </p>
            {searchedAt && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                Recherché {timeAgo(searchedAt)}
              </p>
            )}
          </div>

          {results.map((result, index) => (
            <div
              key={index}
              className="glass rounded-xl p-4 space-y-3 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white leading-tight">
                    {result.titre}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-blue-400">
                      {result.source}
                    </span>
                    {result.sourceUrl && (
                      <a
                        href={result.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {result.publishedAt && (
                      <span className="text-xs text-gray-500">
                        · {timeAgo(result.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleImport(result, index)}
                  disabled={importedIndices.has(index)}
                  size="sm"
                  className={
                    importedIndices.has(index)
                      ? "bg-green-500/20 border-green-500/30 text-green-300"
                      : "bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                  }
                >
                  {importedIndices.has(index) ? (
                    <>
                      <CheckCircle size={14} />
                      Importé
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Importer
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                {result.resume}
              </p>

              {result.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400"
                    >
                      <Tag size={9} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {result.candidatMentioned && (
                <p className="text-[10px] text-indigo-400 bg-indigo-500/10 rounded-lg px-2 py-1 inline-block">
                  Candidat mentionné : {result.candidatMentioned}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-gray-500 text-center">
        Propulsé par Perplexity Sonar Pro · Données en temps réel · Vérifiez
        toujours les sources
      </p>
    </div>
  );
}
