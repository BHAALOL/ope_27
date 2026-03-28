"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Newspaper, Plus, Pencil, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NewsSearcher } from "@/components/admin/NewsSearcher";
import { formatDate } from "@/lib/utils";
import type { Actualite, Candidat } from "@/types";

export default function AdminActualitesPage() {
  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const emptyForm = {
    titre: "",
    contenu: "",
    resume: "",
    source: "",
    sourceUrl: "",
    image: "",
    candidatId: "",
    tags: "",
    published: false,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchData = () => {
    Promise.all([
      fetch("/api/actualites?published=false").then((r) => r.json()),
      fetch("/api/candidats?published=false").then((r) => r.json()),
    ]).then(([aData, cData]) => {
      setActualites(aData.data || []);
      setCandidats(cData.data || []);
      setLoading(false);
    }).catch(() => {
      setError("Erreur lors du chargement des données");
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (a: Actualite) => {
    setEditId(a.id);
    setForm({
      titre: a.titre,
      contenu: a.contenu,
      resume: a.resume || "",
      source: a.source || "",
      sourceUrl: a.sourceUrl || "",
      image: a.image || "",
      candidatId: a.candidatId || "",
      tags: a.tags.join(", "),
      published: a.published,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const body = {
        titre: form.titre,
        contenu: form.contenu,
        resume: form.resume || null,
        source: form.source || null,
        sourceUrl: form.sourceUrl || null,
        image: form.image || null,
        candidatId: form.candidatId || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        published: form.published,
      };

      const url = editId ? `/api/actualites/${editId}` : "/api/actualites";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Erreur");

      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      const res = await fetch(`/api/actualites/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  const handleImportNews = (news: { titre: string; resume: string; contenu: string; source: string; sourceUrl: string; tags: string[]; candidatMentioned?: string }) => {
    // Find matching candidat by name
    let matchedCandidatId = "";
    if (news.candidatMentioned) {
      const match = candidats.find((c) => {
        const fullName = `${c.prenom} ${c.nom}`.toLowerCase();
        return news.candidatMentioned!.toLowerCase().includes(fullName) ||
               fullName.includes(news.candidatMentioned!.toLowerCase());
      });
      if (match) matchedCandidatId = match.id;
    }

    setForm({
      titre: news.titre,
      contenu: news.contenu,
      resume: news.resume,
      source: news.source,
      sourceUrl: news.sourceUrl,
      image: "",
      candidatId: matchedCandidatId,
      tags: news.tags.join(", "),
      published: false,
    });
    setEditId(null);
    setShowForm(true);
    setShowSearch(false);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Newspaper size={22} />
            Actualités
          </h1>
          <p className="text-gray-400 mt-1">{actualites.length} article(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => { setShowSearch(!showSearch); setShowForm(false); }}
            variant="secondary"
            className="flex items-center gap-2 bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
          >
            <Globe size={16} />
            Rechercher des news
          </Button>
          <Button
            onClick={() => { setShowForm(!showForm); setShowSearch(false); setEditId(null); setForm(emptyForm); }}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Nouvel article
          </Button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-5 flex items-center gap-2">
            <Globe size={14} />
            Recherche d&apos;actualités en temps réel
          </h2>
          <NewsSearcher onImport={handleImportNews} />
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-5">
            {editId ? "Modifier l'article" : "Créer un article"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Titre *</label>
              <input type="text" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Résumé</label>
              <input type="text" value={form.resume} onChange={(e) => setForm({ ...form, resume: e.target.value })} className={inputClass} placeholder="Courte description..." />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Contenu *</label>
              <textarea value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} className={`${inputClass} resize-none`} rows={8} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Source</label>
                <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputClass} placeholder="Le Monde, AFP..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">URL source</label>
                <input type="url" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Image (URL)</label>
                <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Candidat lié</label>
                <select value={form.candidatId} onChange={(e) => setForm({ ...form, candidatId: e.target.value })} className={inputClass}>
                  <option value="">Aucun</option>
                  {candidats.map((c) => (
                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tags (séparés par virgule)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} placeholder="économie, santé, ..." />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded accent-blue-500" />
              <span className="text-sm text-white">Publier</span>
            </label>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</div>
            )}

            <div className="flex gap-3">
              <Button type="submit" loading={saving}>Enregistrer</Button>
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null); }}>Annuler</Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Titre</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Candidat</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center"><div className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></td></tr>
              ) : actualites.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm italic">Aucun article.</td></tr>
              ) : (
                actualites.map((a) => (
                  <tr key={a.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-white line-clamp-1">{a.titre}</p>
                      <p className="text-xs text-gray-500">/{a.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {a.candidat ? `${a.candidat.prenom} ${a.candidat.nom}` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${a.published ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                        {a.published ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {formatDate(a.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/actualites/${a.slug}`} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all">
                          <Newspaper size={14} />
                        </Link>
                        <button onClick={() => handleEdit(a)} className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 transition-all">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
