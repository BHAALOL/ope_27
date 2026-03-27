"use client";

import { useState } from "react";
import { Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AIGenerateType, AIProvider } from "@/types";

interface AIGeneratorProps {
  type: AIGenerateType;
  name: string;
  additionalContext?: string;
  onGenerated: (data: Record<string, unknown>) => void;
  disabled?: boolean;
}

const PROVIDERS: { value: AIProvider; label: string; color: string; icon: string }[] = [
  {
    value: "anthropic",
    label: "Claude",
    color: "bg-indigo-500/20 border-indigo-500/30 text-indigo-300",
    icon: "🟣",
  },
  {
    value: "openai",
    label: "GPT",
    color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    icon: "🟢",
  },
];

export function AIGenerator({
  type,
  name,
  additionalContext,
  onGenerated,
  disabled = false,
}: AIGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [provider, setProvider] = useState<AIProvider>("anthropic");
  const [usedProvider, setUsedProvider] = useState<AIProvider | null>(null);

  const handleGenerate = async () => {
    if (!name.trim()) {
      setError("Veuillez entrer un nom");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setUsedProvider(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, additionalContext, provider }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erreur lors de la génération");
      }

      onGenerated(json.data);
      setUsedProvider(json.provider || provider);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const activeProvider = PROVIDERS.find((p) => p.value === provider)!;

  return (
    <div className="space-y-3">
      {/* Provider selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Modèle :</span>
        <div className="flex gap-1.5">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setProvider(p.value)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                provider === p.value
                  ? p.color
                  : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20"
              }`}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        loading={loading}
        disabled={disabled || loading || !name.trim()}
        variant="secondary"
        className={`w-full justify-center gap-2 ${activeProvider.color} hover:opacity-80`}
      >
        <Sparkles size={16} />
        {loading
          ? `Génération via ${activeProvider.label}...`
          : `Générer avec ${activeProvider.label}`}
      </Button>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
          <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>
            Contenu généré avec succès via{" "}
            {PROVIDERS.find((p) => p.value === usedProvider)?.label || usedProvider}
            {" "}! Vérifiez et ajustez les informations.
          </span>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        {provider === "anthropic"
          ? "Propulsé par Claude (Anthropic)"
          : "Propulsé par GPT (OpenAI)"}{" "}
        · Les informations générées peuvent être inexactes
      </p>
    </div>
  );
}
