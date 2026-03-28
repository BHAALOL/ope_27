"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDatetime, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/lib/utils";
import type { Evenement } from "@/types";

export default function AdminAgendaPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  type FormState = {
    titre: string;
    description: string;
    lieu: string;
    ville: string;
    dateDebut: string;
    dateFin: string;
    type: "MEETING" | "DEBAT" | "CONFERENCE" | "AUTRE";
    lienInscription: string;
  };
  const emptyForm: FormState = {
    titre: "",
    description: "",
    lieu: "",
    ville: "",
    dateDebut: "",
    dateFin: "",
    type: "MEETING",
    lienInscription: "",
  };
  const [form, setForm] = useState<FormState>(emptyForm);

  const fetchData = () => {
    fetch("/api/agenda")
      .then((r) => r.json())
      .then((data) => {
        setEvenements(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des événements");
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: form.titre,
          description: form.description || null,
          lieu: form.lieu || null,
          ville: form.ville || null,
          dateDebut: new Date(form.dateDebut).toISOString(),
          dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null,
          type: form.type,
          lienInscription: form.lienInscription || null,
        }),
      });

      if (!res.ok) throw new Error("Erreur");

      setShowForm(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    try {
      const res = await fetch(`/api/agenda?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar size={22} />
            Agenda
          </h1>
          <p className="text-gray-400 mt-1">{evenements.length} événement(s)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus size={16} />
          Nouvel événement
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-5">
            Créer un événement
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Titre *</label>
              <input type="text" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className={inputClass} placeholder="Meeting à Paris" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} rows={3} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "MEETING" | "DEBAT" | "CONFERENCE" | "AUTRE" })}
                className={inputClass}
              >
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Ville</label>
              <input type="text" value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} className={inputClass} placeholder="Paris" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Lieu</label>
              <input type="text" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} className={inputClass} placeholder="Palais des Congrès" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Lien d&apos;inscription</label>
              <input type="url" value={form.lienInscription} onChange={(e) => setForm({ ...form, lienInscription: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date de début *</label>
              <input type="datetime-local" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date de fin</label>
              <input type="datetime-local" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} className={inputClass} />
            </div>

            {error && (
              <div className="sm:col-span-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</div>
            )}

            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" loading={saving}>Créer</Button>
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setForm(emptyForm); }}>Annuler</Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : evenements.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Calendar size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm italic">Aucun événement.</p>
          </div>
        ) : (
          evenements.map((ev) => {
            const typeColors = EVENT_TYPE_COLORS[ev.type] || EVENT_TYPE_COLORS.AUTRE;
            const isPast = new Date(ev.dateDebut) < new Date();
            return (
              <div key={ev.id} className={`glass rounded-xl p-5 border border-white/5 flex items-start justify-between gap-4 ${isPast ? "opacity-60" : ""}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors}`}>
                      {EVENT_TYPE_LABELS[ev.type]}
                    </span>
                    {isPast && <span className="text-xs text-gray-600 px-2 py-0.5 rounded-full border border-gray-700">Passé</span>}
                  </div>
                  <h3 className="font-medium text-white">{ev.titre}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                    <span>{formatDatetime(ev.dateDebut)}</span>
                    {ev.ville && <span>📍 {ev.lieu ? `${ev.lieu}, ` : ""}{ev.ville}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
