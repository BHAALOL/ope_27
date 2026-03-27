export interface Candidat {
  id: string;
  slug: string;
  nom: string;
  prenom: string;
  age?: number | null;
  photo?: string | null;
  parti?: Parti | null;
  partiId?: string | null;
  biographie?: string | null;
  programme?: Record<string, unknown> | null;
  positions?: Record<string, unknown> | null;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  sondages?: Sondage[];
  actualites?: Actualite[];
}

export interface Parti {
  id: string;
  slug: string;
  nom: string;
  sigle?: string | null;
  logo?: string | null;
  couleur?: string | null;
  description?: string | null;
  histoire?: string | null;
  ideologie?: string | null;
  fondation?: number | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  candidats?: Candidat[];
}

export interface Sondage {
  id: string;
  date: string;
  institut: string;
  candidat?: Candidat;
  candidatId: string;
  score: number;
  marge?: number | null;
  source?: string | null;
  createdAt: string;
}

export interface Actualite {
  id: string;
  titre: string;
  slug: string;
  resume?: string | null;
  contenu: string;
  image?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  published: boolean;
  publishedAt?: string | null;
  candidat?: Candidat | null;
  candidatId?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Evenement {
  id: string;
  titre: string;
  description?: string | null;
  lieu?: string | null;
  ville?: string | null;
  dateDebut: string;
  dateFin?: string | null;
  type: TypeEvenement;
  lienInscription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TypeEvenement = 'MEETING' | 'DEBAT' | 'CONFERENCE' | 'AUTRE';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface PollData {
  candidatId: string;
  nom: string;
  prenom: string;
  score: number;
  couleur?: string;
  parti?: string;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export type AIGenerateType = 'candidat' | 'parti';

export interface NewsSearchResult {
  titre: string;
  resume: string;
  contenu: string;
  source: string;
  sourceUrl: string;
  tags: string[];
  candidatMentioned?: string;
  publishedAt: string;
}

export interface NewsSearchResponse {
  success: boolean;
  results?: NewsSearchResult[];
  query?: string;
  searchedAt?: string;
  error?: string;
}

export interface AIGenerateRequest {
  type: AIGenerateType;
  name: string;
  additionalContext?: string;
}

export interface AIGenerateResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}
