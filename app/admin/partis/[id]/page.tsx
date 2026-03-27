"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AIGenerator } from "@/components/admin/AIGenerator";
import type { Parti } from "@/types";

export default function EditPartiPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: "",
    sigle: "",
    logo: "",
    couleur: "#6366f1",
    ideologie: "",
    fondation: "",
    description: "",
    histoire: "",
    published: false,
  });

  useEffect(() => {
    fetch(`/api/partis/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Parti introuvable");
        return r.json();
      })
      .then((data) => {
        const p: Parti = data.data;
        setForm({
          nom: p.nom,
          sigle: p.sigle || "",
          logo: p.logo || "",
          couleur: p.couleur || "#6366f1",
          ideologie: p.ideologie || "",
          fondation: p.fondation ? String(p.fondation) : "",
          description: p.description || "",
          histoire: p.histoire || "",
          published: p.published,
        });
        setFetching(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
        setFetching(false);
      });
  }, [id]);

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
      const res = await fetch(`/api/partis/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          sigle: form.sigle || null,
          logo: form.logo || null,
          couleur: form.couleur || null,
          ideologie: form.ideologie || null,
          fondation: form.fondation ? parseInt(form.fondation) : null,
          description: form.description || null,
          histoire: form.histoire || null,
          published: form.published,
        }),
      });

      if (!res.ok) throw new Error("Erreur de mise à jour");
      router.push("/admin/partis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer ce parti ? Cette action est irréversible.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/partis/${id}`, { method: "DELETE" });
      router.push("/admin/partis");
    } catch {
      setError("Erreur lors de la suppression");
      setDeleting(false);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/partis" className="p-2 rounded-xl glass hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{form.sigle || form.nom}</h1>
            <p className="text-gray-400 text-sm mt-0.5">Modifier le parti</p>
          </div>
        </div>
        <Button variant="danger" onClick={handleDelete} loading={deleting} size="sm">
          <Trash2 size={14} />
          Supprimer
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Génération IA
          </h2>
          <AIGenerator
            type="parti"
            name={form.nom}
            onGenerated={handleAIGenerated}
          />
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-5">
            Informations de base
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nom complet *</label>
              <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Sigle</label>
              <input type="text" value={form.sigle} onChange={(e) => setForm({ ...form, sigle: e.target.value })} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>URL du logo / image</label>
              <input type="url" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className={inputClass} placeholder="https://exemple.com/logo.png" />
            </div>
            <div>
              <label className={labelClass}>Idéologie</label>
              <input type="text" value={form.ideologie} onChange={(e) => setForm({ ...form, ideologie: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Année de fondation</label>
              <input type="number" value={form.fondation} onChange={(e) => setForm({ ...form, fondation: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Couleur</label>
              <div className="flex gap-2">
                <input type="color" value={form.couleur} onChange={(e) => setForm({ ...form, couleur: e.target.value })} className="h-10 w-14 rounded-lg bg-white/5 border border-white/10 cursor-pointer" />
                <input type="text" value={form.couleur} onChange={(e) => setForm({ ...form, couleur: e.target.value })} className={`${inputClass} flex-1`} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Description</h2>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} rows={4} />
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Histoire</h2>
          <textarea value={form.histoire} onChange={(e) => setForm({ ...form, histoire: e.target.value })} className={`${inputClass} resize-none`} rows={8} />
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Options</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded accent-blue-500" />
            <span className="text-sm font-medium text-white">Publié</span>
          </label>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading} size="lg">
            <Save size={16} />
            Enregistrer
          </Button>
          <Link href="/admin/partis">
            <Button type="button" variant="ghost" size="lg">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
