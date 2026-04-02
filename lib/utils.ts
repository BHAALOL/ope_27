import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "d MMMM yyyy", { locale: fr });
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy", { locale: fr });
}

export function formatDatetime(date: string | Date): string {
  return format(new Date(date), "d MMMM yyyy à HH:mm", { locale: fr });
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function daysUntilElection(): number {
  const electionDate = new Date("2027-04-25T00:00:00Z");
  const today = new Date();
  return Math.max(0, differenceInDays(electionDate, today));
}

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "untitled";
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

export function getInitials(nom: string, prenom: string): string {
  if (!nom || !prenom) return "?";
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function getPartyColor(couleur?: string | null): string {
  return couleur || "#6366f1";
}

export function scoreToColor(score: number): string {
  if (score >= 30) return "#22c55e";
  if (score >= 20) return "#3b82f6";
  if (score >= 10) return "#f59e0b";
  return "#6b7280";
}

export function formatScore(score: number): string {
  return `${score.toFixed(1)}%`;
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  MEETING: "Meeting",
  DEBAT: "Débat",
  CONFERENCE: "Conférence",
  AUTRE: "Autre",
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  MEETING: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  DEBAT: "bg-red-500/20 text-red-300 border-red-500/30",
  CONFERENCE: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  AUTRE: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export const IDEOLOGY_COLORS: Record<string, string> = {
  "Centre": "#f59e0b",
  "Centre-droit": "#3b82f6",
  "Droite": "#1d4ed8",
  "Extrême droite": "#1e3a8a",
  "Centre-gauche": "#ec4899",
  "Gauche": "#ef4444",
  "Extrême gauche": "#991b1b",
  "Écologie": "#22c55e",
  "Libéral": "#8b5cf6",
};
