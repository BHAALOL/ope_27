"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AIGenerator } from "@/components/admin/AIGenerator";
import type { Parti } from "@/types";

export default function NewCandidatPage() {
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
      .then((data) => setPartis(data.data || []))
      .catch(() => setPartis([]));
  }, []);

  const handleAIGenerated = (data: Record<string, unknown>) => {
    setForm((prev) => ({
      ...prev,
      biographie: (data.biographie as string) || prev.biographie,
      age: data.age ? String(data.age) : prev.age,
      programme: data.programme ? JSON.stringify(data.programme, null, 2) : prev.programme,
      positions: data.positions ? JSON.stringify(data.positions, null, 2) : prev.positions,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let programme = null;
      let positions = null;
      if (form.programme.trim()) {
        try {
          programme = JSON.parse(form.programme);
        } catch {
          setError("JSON invalide dans le champ Programme");
          setLoading(false);
          return;
        }
      }
      if (form.positions.trim()) {
        try {
          positions = JSON.parse(form.positions);
        } catch {
          setError("JSON invalide dans le champ Positions");
          setLoading(false);
          return;
        }
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

      if (!res.ok) throw new Error("Erreur lors de la creation");
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
          <p className="text-gray-400 text-sm mt-0.5">Ajouter un candidat</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* AI Generation */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            G&eacute;n&eacute;ration IA
          </h2>
          <AIGenerator
            type="candidat"
            name={`${form.prenom} ${form.nom}`.trim()}
            onGenerated={handleAIGenerated}
          />
        </div>

        {/* Infos de base */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-5">
            Informations de base
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Pr&eacute;nom *</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className={inputClass}
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
                required
              />
            </div>
            <div>
              <label className={labelClass}>&Acirc;ge</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className={inputClass}
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
          />
        </div>

        {/* Programme */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Programme (JSON)
          </h2>
          <textarea
            value={form.programme}
            onChange={(e) => setForm({ ...form, programme: e.target.value })}
            className={`${inputClass} resize-none font-mono text-xs`}
            rows={8}
          />
        </div>

        {/* Positions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Positions (JSON)
          </h2>
          <textarea
            value={form.positions}
            onChange={(e) => setForm({ ...form, positions: e.target.value })}
            className={`${inputClass} resize-none font-mono text-xs`}
            rows={6}
          />
        </div>

        {/* Options */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Options
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-white">Publi&eacute;</span>
                <p className="text-xs text-gray-500">Visible sur le site public</p>
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
                <span className="text-sm font-medium text-white">Mis en avant</span>
                <p className="text-xs text-gray-500">Affich&eacute; sur la page d&apos;accueil</p>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading} size="lg">
            <Save size={16} />
            Cr&eacute;er le candidat
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
