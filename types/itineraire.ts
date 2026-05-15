export type TypeTransport = 'gbaka' | 'woro-woro' | 'sotra' | 'zemidjan' | 'mixte';
export type TypeEtape = 'gbaka' | 'woro-woro' | 'sotra' | 'zemidjan' | 'a_pied' | 'correspondance';
export type StatutItineraire = 'en_attente' | 'valide' | 'rejete';

export interface ItineraireEtape {
  id: string;
  itineraire_id: string;
  ordre: number;
  type: TypeEtape;
  point_depart: string;
  point_arrivee: string;
  instruction?: string;
  quoi_dire?: string;
  arrets_intermediaires: string[];
  prix: number;
  duree: number;
}

export interface Itineraire {
  id: string;
  created_at: string;
  user_id: string | null;
  depart: string;
  arrivee: string;
  commune_depart?: string;
  commune_arrivee?: string;
  type_transport: TypeTransport;
  prix_min: number;
  prix_max: number;
  duree_min: number;
  duree_max: number;
  description?: string;
  conseil_general?: string;
  votes_up: number;
  votes_down: number;
  statut: StatutItineraire;
  nb_etapes: number;
  utilise_count: number;
  etapes?: ItineraireEtape[];
}

export interface NouvelleEtapeForm {
  type: TypeEtape;
  point_depart: string;
  point_arrivee: string;
  quoi_dire: string;
  arrets_intermediaires: string[];
  prix: number | '';
  duree: number | '';
}

export interface NouvelItineraireForm {
  depart: string;
  commune_depart: string;
  arrivee: string;
  commune_arrivee: string;
  type_transport: TypeTransport | '';
  prix_min: number | '';
  prix_max: number | '';
  duree_min: number | '';
  duree_max: number | '';
  conseil_general: string;
  etapes: NouvelleEtapeForm[];
}
