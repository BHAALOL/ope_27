import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Users, Plus, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getCandidats() {
  try {
    return await prisma.candidat.findMany({
      include: { parti: { select: { nom: true, sigle: true, couleur: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminCandidatsPage() {
  const candidats = await getCandidats();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={22} />
            Candidats
          </h1>
          <p className="text-gray-400 mt-1">{candidats.length} candidat(s) au total</p>
        </div>
        <Link
          href="/admin/candidats/nouveau"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#002395] text-white text-sm font-medium hover:bg-[#002395]/80 transition-all"
        >
          <Plus size={16} />
          Nouveau candidat
        </Link>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Candidat
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Parti
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {candidats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500 text-sm italic">
                    Aucun candidat. Créez-en un !
                  </td>
                </tr>
              ) : (
                candidats.map((c) => {
                  const color = c.parti?.couleur || "#6366f1";
                  return (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {c.prenom} {c.nom}
                          </p>
                          <p className="text-xs text-gray-500">/{c.slug}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {c.parti ? (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${color}20`,
                              color,
                            }}
                          >
                            {c.parti.sigle || c.parti.nom}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600 italic">Sans parti</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                            c.published
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {c.published ? "Publié" : "Brouillon"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {c.featured ? (
                          <span className="text-xs text-yellow-400">★ Oui</span>
                        ) : (
                          <span className="text-xs text-gray-600">Non</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {formatDate(c.createdAt.toISOString())}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/candidats/${c.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                        >
                          <Pencil size={12} />
                          Modifier
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
