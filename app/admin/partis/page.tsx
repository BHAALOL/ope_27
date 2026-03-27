import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Building2, Plus, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getPartis() {
  try {
    return await prisma.parti.findMany({
      include: { candidats: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminPartisPage() {
  const partis = await getPartis();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 size={22} />
            Partis
          </h1>
          <p className="text-gray-400 mt-1">{partis.length} parti(s) au total</p>
        </div>
        <Link
          href="/admin/partis/nouveau"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ED2939] text-white text-sm font-medium hover:bg-[#ED2939]/80 transition-all"
        >
          <Plus size={16} />
          Nouveau parti
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Parti
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Idéologie
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Candidats
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Statut
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
              {partis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500 text-sm italic">
                    Aucun parti. Créez-en un !
                  </td>
                </tr>
              ) : (
                partis.map((p) => {
                  const color = p.couleur || "#6366f1";
                  return (
                    <tr key={p.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.logo ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden">
                              <Image src={p.logo} alt={p.nom} width={32} height={32} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                              style={{ backgroundColor: `${color}20`, color }}
                            >
                              {p.sigle?.substring(0, 2) || p.nom.substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{p.sigle || p.nom}</p>
                            <p className="text-xs text-gray-500">{p.sigle ? p.nom : `/${p.slug}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {p.ideologie || <span className="italic text-gray-600">—</span>}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {p.candidats.length}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                            p.published
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {p.published ? "Publié" : "Brouillon"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">
                        {formatDate(p.createdAt.toISOString())}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/partis/${p.id}`}
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
