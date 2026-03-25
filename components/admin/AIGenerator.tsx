"use client";

import { useState } from "react";
import { Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AIGenerateType } from "@/types";

interface AIGeneratorProps {
  type: AIGenerateType;
  name: string;
  additionalContext?: string;
  onGenerated: (data: Record<string, unknown>) => void;
  disabled?: boolean;
}

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

  const handleGenerate = async () => {
    if (!name.trim()) {
      setError("Veuillez entrer un nom");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, additionalContext }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erreur lors de la génération");
      }

      onGenerated(json.data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGenerate}
        loading={loading}
        disabled={disabled || loading || !name.trim()}
        variant="secondary"
        className="w-full justify-center gap-2 bg-indigo-500/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30"
      >
        <Sparkles size={16} />
        {loading ? "Génération en cours..." : "Générer avec l'IA"}
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
          <span>Contenu généré avec succès ! Vérifiez et ajustez les informations.</span>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        Propulsé par Claude AI · Les informations générées peuvent être inexactes
      </p>
    </div>
  );
}
