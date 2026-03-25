import { prisma } from "@/lib/prisma";
import { Calendar, MapPin, Clock, ExternalLink } from "lucide-react";
import { formatDatetime, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Calendrier de la campagne présidentielle 2027",
};

async function getEvenements() {
  try {
    return await prisma.evenement.findMany({
      orderBy: { dateDebut: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function AgendaPage() {
  const evenements = await getEvenements();

  const now = new Date();
  const upcoming = evenements.filter(
    (e) => new Date(e.dateDebut) >= now
  );
  const past = evenements.filter(
    (e) => new Date(e.dateDebut) < now
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-teal-900/10 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={22} className="text-teal-400" />
            <span className="text-teal-400 text-sm font-medium uppercase tracking-wide">
              Agenda
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Calendrier de campagne
          </h1>
          <p className="text-gray-400">
            Meetings, débats, conférences — ne manquez aucun événement.
          </p>
        </div>

        {evenements.length === 0 ? (
          <div className="glass rounded-2xl p-20 text-center">
            <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              Aucun événement programmé pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-teal-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  À venir ({upcoming.length})
                </h2>
                <div className="space-y-4">
                  {upcoming.map((event) => {
                    const typeColors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.AUTRE;
                    return (
                      <div
                        key={event.id}
                        className="glass rounded-2xl p-6 border border-white/5 hover:border-white/15 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Date badge */}
                          <div className="flex-shrink-0 text-center glass rounded-xl p-3 min-w-[72px]">
                            <div className="text-2xl font-bold text-white">
                              {new Date(event.dateDebut).getDate()}
                            </div>
                            <div className="text-xs text-gray-400 uppercase">
                              {new Date(event.dateDebut).toLocaleDateString("fr-FR", {
                                month: "short",
                              })}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${typeColors}`}>
                                {EVENT_TYPE_LABELS[event.type]}
                              </span>
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2">
                              {event.titre}
                            </h3>

                            {event.description && (
                              <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                                {event.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1.5">
                                <Clock size={13} />
                                <span>{formatDatetime(event.dateDebut)}</span>
                              </div>
                              {event.ville && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin size={13} />
                                  <span>
                                    {event.lieu ? `${event.lieu}, ` : ""}
                                    {event.ville}
                                  </span>
                                </div>
                              )}
                            </div>

                            {event.lienInscription && (
                              <a
                                href={event.lienInscription}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 transition-colors"
                              >
                                S&apos;inscrire
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past events */}
            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-500 mb-4">
                  Événements passés ({past.length})
                </h2>
                <div className="space-y-3 opacity-60">
                  {past.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="glass rounded-xl p-4 border border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[48px]">
                          <div className="text-lg font-bold text-gray-400">
                            {new Date(event.dateDebut).getDate()}
                          </div>
                          <div className="text-xs text-gray-600 uppercase">
                            {new Date(event.dateDebut).toLocaleDateString("fr-FR", {
                              month: "short",
                            })}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-300">{event.titre}</h3>
                          {event.ville && (
                            <p className="text-xs text-gray-500">{event.ville}</p>
                          )}
                        </div>
                        <span className="ml-auto text-xs text-gray-600 px-2 py-0.5 rounded-full border border-gray-700">
                          Terminé
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
