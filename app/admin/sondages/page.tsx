"use client";

import { useState, useEffect } from "react";
import { BarChart2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate, formatScore } from "@/lib/utils";
import type { Sondage, Candidat } from "@/types";

export default function AdminSondagesPage() {
  const [sondages, setSondages] = useState<Sondage[]>([]);
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    candidatId: "",
    date: new Date().toISOString().split("T")[0],
    score: "",
    marge: "",
    institut: "",
    source: "",
  });

  const fetchData = () => {
    Promise.all([
      fetch("/api/sondages").then((r) => r.json()),
      fetch("/api/candidats?published=false").then((r) => r.json()),
    ]).then(([sondagesData, candidatsData]) => {
      setSondages(sondagesData.data || []);
      setCandidats(candidatsData.data || []);
      setLoading(false);
    }).catch(() => {
      setError("Erreur lors du chargement des données");
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/sondages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidatId: form.candidatId,
          date: new Date(form.date).toISOString(),
          score: parseFloat(form.score),
          marge: form.marge ? parseFloat(form.marge) : null,
          institut: form.institut,
          source: form.source || null,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'ajout");

      setForm({ candidatId: "", date: new Date().toISOString().split("T")[0], score: "", marge: "", institut: "", source: "" });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce sondage ?")) return;
    await fetch(`/api/sondages?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm";

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <BarChart2 size={22} />
        <div>
          <h1 className="text-2xl font-bold text-white">Sondages</h1>
          <p className="text-gray-400 text-sm mt-0.5">{sondages.length} entrée(s)</p>
        </div>
      </div>

      {/* Add form */}
      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-5">
          Ajouter un sondage
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Candidat *</label>
            <select
              value={form.candidatId}
              onChange={(e) => setForm({ ...form, candidatId: e.target.value })}
              className={inputClass}
              required
            >
              <option value="">Sélectionner...</option>
              {candidats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.prenom} {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Score (%) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              className={inputClass}
              placeholder="23.5"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Institut *</label>
            <input
              type="text"
              value={form.institut}
              onChange={(e) => setForm({ ...form, institut: e.target.value })}
              className={inputClass}
              placeholder="Ipsos, IFOP..."
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Marge d&apos;erreur (%)</label>
            <input
              type="number"
              step="0.1"
              value={form.marge}
              onChange={(e) => setForm({ ...form, marge: e.target.value })}
              className={inputClass}
              placeholder="2.5"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Source (URL)</label>
            <input
              type="url"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className={inputClass}
              placeholder="https://..."
            />
          </div>

          {error && (
            <div className="md:col-span-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <Button type="submit" loading={adding} className="w-full justify-center">
              <Plus size={15} />
              Ajouter
            </Button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Candidat</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Institut</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </td>
                </tr>
              ) : sondages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm italic">
                    Aucun sondage.
                  </td>
                </tr>
              ) : (
                sondages.map((s) => (
                  <tr key={s.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-white">
                      {s.candidat?.prenom} {s.candidat?.nom}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {formatDate(s.date)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-bold text-blue-300">
                        {formatScore(s.score)}
                      </span>
                      {s.marge && (
                        <span className="text-xs text-gray-500 ml-1">
                          ±{s.marge}%
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">{s.institut}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                        aria-label="Supprimer ce sondage"
                      >
                        <Trash2 size={14} />
                      </button>
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
