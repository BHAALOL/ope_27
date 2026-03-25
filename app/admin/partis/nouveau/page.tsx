"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AIGenerator } from "@/components/admin/AIGenerator";

export default function NouveauPartiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: "",
    sigle: "",
    couleur: "#6366f1",
    ideologie: "",
    fondation: "",
    description: "",
    histoire: "",
    published: false,
  });

  const handleAIGenerated = (data: Record<string, unknown>) => {
    setForm((prev) => ({
      ...prev,
      description: (data.description as string) || prev.description,
      histoire: (data.histoire as string) || prev.histoire,
      ideologie: (data.ideologie as string) || prev.ideologie,
      fondation: data.fondation ? String(data.fondation) : prev.fondation,
      couleur: (data.couleur as string) || prev.couleur,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/partis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          sigle: form.sigle || null,
          couleur: form.couleur || null,
          ideologie: form.ideologie || null,
          fondation: form.fondation ? parseInt(form.fondation) : null,
          description: form.description || null,
          histoire: form.histoire || null,
          published: form.published,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de la création");
      }

      router.push("/admin/partis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/partis"
          className="p-2 rounded-xl glass hover:bg-white/10 text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Nouveau parti</h1>
          <p className="text-gray-400 text-sm mt-0.5">Créer un nouveau parti politique</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* AI Generation */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Génération IA
          </h2>
          <AIGenerator
            type="parti"
            name={form.nom}
            onGenerated={handleAIGenerated}
            disabled={!form.nom}
          />
        </div>

        {/* Infos de base */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-5">
            Informations de base
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nom complet *</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className={inputClass}
                placeholder="La République En Marche"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Sigle</label>
              <input
                type="text"
                value={form.sigle}
                onChange={(e) => setForm({ ...form, sigle: e.target.value })}
                className={inputClass}
                placeholder="LREM"
              />
            </div>
            <div>
              <label className={labelClass}>Idéologie</label>
              <input
                type="text"
                value={form.ideologie}
                onChange={(e) => setForm({ ...form, ideologie: e.target.value })}
                className={inputClass}
                placeholder="Centre, Centre-droit..."
              />
            </div>
            <div>
              <label className={labelClass}>Année de fondation</label>
              <input
                type="number"
                value={form.fondation}
                onChange={(e) => setForm({ ...form, fondation: e.target.value })}
                className={inputClass}
                placeholder="1958"
                min={1800}
                max={2030}
              />
            </div>
            <div>
              <label className={labelClass}>Couleur</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.couleur}
                  onChange={(e) => setForm({ ...form, couleur: e.target.value })}
                  className="h-10 w-14 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.couleur}
                  onChange={(e) => setForm({ ...form, couleur: e.target.value })}
                  className={`${inputClass} flex-1`}
                  placeholder="#6366f1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Description
          </h2>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${inputClass} resize-none`}
            rows={4}
            placeholder="Courte description du parti..."
          />
        </div>

        {/* Histoire */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Histoire
          </h2>
          <textarea
            value={form.histoire}
            onChange={(e) => setForm({ ...form, histoire: e.target.value })}
            className={`${inputClass} resize-none`}
            rows={8}
            placeholder="Histoire du parti..."
          />
        </div>

        {/* Options */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Options
          </h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-white">Publier</span>
              <p className="text-xs text-gray-500">Le parti sera visible sur le site</p>
            </div>
          </label>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading} size="lg">
            <Save size={16} />
            Créer le parti
          </Button>
          <Link href="/admin/partis">
            <Button type="button" variant="ghost" size="lg">
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
