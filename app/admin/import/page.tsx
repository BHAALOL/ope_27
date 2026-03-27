"use client";

import { useState } from "react";
import {
  Download,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Building2,
} from "lucide-react";

type Provider = "anthropic" | "openai";

interface ImportResults {
  polymarketCandidates: number;
  results: {
    partisCreated: string[];
    partisExisting: string[];
    candidatsCreated: string[];
    candidatsExisting: string[];
    errors: string[];
  };
}

interface GenerateResults {
  results: {
    partisGenerated: string[];
    partisSkippedCount: number;
    candidatsGenerated: string[];
    candidatsSkippedCount: number;
    errors: string[];
  };
}

export default function ImportPage() {
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [importing, setImporting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [generateResults, setGenerateResults] = useState<GenerateResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    setImportResults(null);

    try {
      const res = await fetch("/api/import/polymarket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'import");
      }

      setImportResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setImporting(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setGenerateResults(null);

    try {
      const res = await fetch("/api/import/generate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      setGenerateResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">
          Import en masse
        </h1>
        <p className="text-gray-400 mt-1">
          Importez les candidats depuis Polymarket et générez automatiquement leur contenu via IA
        </p>
      </div>

      {/* Provider Selection */}
      <div className="bg-dark-800 border border-white/5 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">
          Fournisseur IA
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setProvider("anthropic")}
            className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
              provider === "anthropic"
                ? "border-[#D97706] bg-[#D97706]/10 text-[#D97706]"
                : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="font-semibold">Claude (Anthropic)</div>
            <div className="text-xs mt-1 opacity-70">claude-sonnet</div>
          </button>
          <button
            onClick={() => setProvider("openai")}
            className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
              provider === "openai"
                ? "border-[#10A37F] bg-[#10A37F]/10 text-[#10A37F]"
                : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="font-semibold">GPT (OpenAI)</div>
            <div className="text-xs mt-1 opacity-70">gpt-4.1</div>
          </button>
        </div>
      </div>

      {/* Step 1: Import from Polymarket */}
      <div className="bg-dark-800 border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
            1
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Importer depuis Polymarket
            </h2>
            <p className="text-xs text-gray-500">
              Récupère les candidats, identifie leurs partis via IA, et crée les fiches en base
            </p>
          </div>
        </div>

        <button
          onClick={handleImport}
          disabled={importing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
        >
          {importing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Import en cours... (identification des partis via IA)
            </>
          ) : (
            <>
              <Download size={16} />
              Importer les candidats Polymarket
            </>
          )}
        </button>

        {/* Import Results */}
        {importResults && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 size={16} />
              <span>
                {importResults.polymarketCandidates} candidats trouvés sur
                Polymarket
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Candidates */}
              <div className="bg-dark-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                  <Users size={14} />
                  Candidats
                </div>
                {importResults.results.candidatsCreated.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-green-400 font-medium mb-1">
                      Créés ({importResults.results.candidatsCreated.length})
                    </div>
                    {importResults.results.candidatsCreated.map((name) => (
                      <div key={name} className="text-xs text-gray-400">
                        + {name}
                      </div>
                    ))}
                  </div>
                )}
                {importResults.results.candidatsExisting.length > 0 && (
                  <div>
                    <div className="text-xs text-yellow-400 font-medium mb-1">
                      Déjà existants (
                      {importResults.results.candidatsExisting.length})
                    </div>
                    {importResults.results.candidatsExisting.map((name) => (
                      <div key={name} className="text-xs text-gray-500">
                        = {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Parties */}
              <div className="bg-dark-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                  <Building2 size={14} />
                  Partis
                </div>
                {importResults.results.partisCreated.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-green-400 font-medium mb-1">
                      Créés ({importResults.results.partisCreated.length})
                    </div>
                    {importResults.results.partisCreated.map((name) => (
                      <div key={name} className="text-xs text-gray-400">
                        + {name}
                      </div>
                    ))}
                  </div>
                )}
                {importResults.results.partisExisting.length > 0 && (
                  <div>
                    <div className="text-xs text-yellow-400 font-medium mb-1">
                      Déjà existants (
                      {importResults.results.partisExisting.length})
                    </div>
                    {importResults.results.partisExisting.map((name) => (
                      <div key={name} className="text-xs text-gray-500">
                        = {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {importResults.results.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-1">
                  <XCircle size={14} />
                  Erreurs ({importResults.results.errors.length})
                </div>
                {importResults.results.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-400/70">
                    {err}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Generate AI Content */}
      <div className="bg-dark-800 border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold">
            2
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Générer le contenu IA
            </h2>
            <p className="text-xs text-gray-500">
              Enrichit les fiches vides : biographies, programmes, positions,
              histoire des partis
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <AlertTriangle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-400/80">
            Cette opération peut prendre plusieurs minutes selon le nombre de
            fiches à enrichir. Chaque candidat et parti sans contenu sera traité
            séquentiellement.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
        >
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Génération en cours... (cela peut prendre quelques minutes)
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Générer le contenu pour toutes les fiches vides
            </>
          )}
        </button>

        {/* Generate Results */}
        {generateResults && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 size={16} />
              Génération terminée
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                  <Users size={14} />
                  Candidats
                </div>
                <div className="text-xs text-green-400">
                  {generateResults.results.candidatsGenerated.length} enrichi(s)
                </div>
                {generateResults.results.candidatsSkippedCount > 0 && (
                  <div className="text-xs text-gray-500">
                    {generateResults.results.candidatsSkippedCount} déjà
                    enrichi(s)
                  </div>
                )}
                {generateResults.results.candidatsGenerated.map((name) => (
                  <div key={name} className="text-xs text-gray-400 mt-1">
                    + {name}
                  </div>
                ))}
              </div>

              <div className="bg-dark-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                  <Building2 size={14} />
                  Partis
                </div>
                <div className="text-xs text-green-400">
                  {generateResults.results.partisGenerated.length} enrichi(s)
                </div>
                {generateResults.results.partisSkippedCount > 0 && (
                  <div className="text-xs text-gray-500">
                    {generateResults.results.partisSkippedCount} déjà enrichi(s)
                  </div>
                )}
                {generateResults.results.partisGenerated.map((name) => (
                  <div key={name} className="text-xs text-gray-400 mt-1">
                    + {name}
                  </div>
                ))}
              </div>
            </div>

            {generateResults.results.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-1">
                  <XCircle size={14} />
                  Erreurs ({generateResults.results.errors.length})
                </div>
                {generateResults.results.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-400/70">
                    {err}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <XCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
