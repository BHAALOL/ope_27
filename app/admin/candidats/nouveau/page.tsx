"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AIGenerator } from "@/components/admin/AIGenerator";
import type { Parti } from "@/types";

export default function NouveauCandidatPage() {
  const router = useRouter();
  const [partis, setPartis] = useState<Parti[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    age: "",
    photo: "",
    partiId: "",
    biographie: "",
    programme: "",
    positions: "",
    published: false,
    featured: false,
  });

  useEffect(() => {
    fetch("/api/partis")
      .then((r) => r.json())
      .then((data) => setPartis(data.data || []));
  }, []);

  const handleAIGenerated = (data: Record<string, unknown>) => {
    setForm((prev) => ({
      ...prev,
      biographie: (data.biographie as string) || prev.biographie,
      programme: data.programme ? JSON.stringify(data.programme, null, 2) : prev.programme,
      positions: data.positions ? JSON.stringify(data.positions, null, 2) : prev.positions,
      age: data.age ? String(data.age) : prev.age,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let programme = null;
      let positions = null;
      try {
        if (form.programme.trim()) programme = JSON.parse(form.programme);
      } catch {
        setError("Le JSON du programme est invalide");
        setLoading(false);
        return;
      }
      try {
        if (form.positions.trim()) positions = JSON.parse(form.positions);
      } catch {
        setError("Le JSON des positions est invalide");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/candidats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: form.prenom,
          nom: form.nom,
          age: form.age ? parseInt(form.age) : null,
          photo: form.photo || null,
          partiId: form.partiId || null,
          biographie: form.biographie || null,
          programme,
          positions,
          published: form.published,
          featured: form.featured,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de la création");
      }

      router.push("/admin/candidats");
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
          href="/admin/candidats"
          className="p-2 rounded-xl glass hover:bg-white/10 text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Nouveau candidat</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Créer un nouveau candidat avec l&apos;aide de l&apos;IA
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* AI Generation */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Génération IA
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Entrez le nom du candidat ci-dessous, puis utilisez l&apos;IA pour générer automatiquement
            sa biographie, son programme et ses positions.
          </p>
          <AIGenerator
            type="candidat"
            name={`${form.prenom} ${form.nom}`.trim()}
            onGenerated={handleAIGenerated}
            disabled={!form.prenom && !form.nom}
          />
        </div>

        {/* Infos de base */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-5">
            Informations de base
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Prénom *</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className={inputClass}
                placeholder="Emmanuel"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Nom *</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className={inputClass}
                placeholder="Macron"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Âge</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className={inputClass}
                placeholder="49"
                min={18}
                max={100}
              />
            </div>
            <div>
              <label className={labelClass}>Parti</label>
              <select
                value={form.partiId}
                onChange={(e) => setForm({ ...form, partiId: e.target.value })}
                className={inputClass}
              >
                <option value="">Sans parti</option>
                {partis.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sigle ? `${p.sigle} — ${p.nom}` : p.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>URL de la photo</label>
              <input
                type="url"
                value={form.photo}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                className={inputClass}
                placeholder="https://exemple.com/photo.jpg"
              />
            </div>
          </div>
        </div>

        {/* Biographie */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Biographie
          </h2>
          <textarea
            value={form.biographie}
            onChange={(e) => setForm({ ...form, biographie: e.target.value })}
            className={`${inputClass} resize-none`}
            rows={8}
            placeholder="Biographie du candidat..."
          />
        </div>

        {/* Programme */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
            Programme (JSON)
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Format: {`{"économie": "...", "éducation": "...", "santé": "..."}`}
          </p>
          <textarea
            value={form.programme}
            onChange={(e) => setForm({ ...form, programme: e.target.value })}
            className={`${inputClass} resize-none font-mono text-xs`}
            rows={8}
            placeholder='{"économie": "...", "environnement": "..."}'
          />
        </div>

        {/* Positions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
            Positions (JSON)
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Format: {`{"immigration": "Pour le contrôle", "europe": "Fédéraliste"}`}
          </p>
          <textarea
            value={form.positions}
            onChange={(e) => setForm({ ...form, positions: e.target.value })}
            className={`${inputClass} resize-none font-mono text-xs`}
            rows={6}
            placeholder='{"immigration": "...", "europe": "..."}'
          />
        </div>

        {/* Options */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Options
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-white">Publier</span>
                <p className="text-xs text-gray-500">Le candidat sera visible sur le site</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 rounded accent-yellow-500"
              />
              <div>
                <span className="text-sm font-medium text-white">Mettre en avant</span>
                <p className="text-xs text-gray-500">Affiché sur la page d&apos;accueil</p>
              </div>
            </label>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" loading={loading} size="lg">
            <Save size={16} />
            Créer le candidat
          </Button>
          <Link href="/admin/candidats">
            <Button type="button" variant="ghost" size="lg">
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
