import { z } from "zod";

export const TYPE_ETAPE = [
  "a_pied",
  "gbaka",
  "woro-woro",
  "sotra",
  "zemidjan",
  "correspondance",
] as const;

const etapeSchema = z.object({
  ordre: z.number().int().positive(),
  type: z.enum(TYPE_ETAPE),
  instruction: z.string().min(1),
  quoi_dire: z.string().optional(),
  couleur_vehicule: z.string().optional(),
  duree: z.string().min(1),
  prix: z.string().min(1),
  point_depart: z.string().min(1),
  point_arrivee: z.string().min(1),
  arrets_intermediaires: z.array(z.string()).optional(),
  conseil: z.string().optional(),
});

const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  duree_totale: z.string().min(1),
  prix_total: z.string().min(1),
  nb_correspondances: z.number().int().nonnegative(),
  etapes: z.array(etapeSchema).min(1),
});

export const itineraireSchema = z.object({
  depart: z.string().min(1),
  arrivee: z.string().min(1),
  heure_depart: z.string().min(1),
  alerte_trafic: z.boolean(),
  message_alerte: z.string().optional(),
  options: z.array(optionSchema).min(1),
  option_recommandee: z.string().min(1),
  resume: z.string().min(1),
});

export type ItineraireReponse = z.infer<typeof itineraireSchema>;
export type OptionReponse = z.infer<typeof optionSchema>;
export type EtapeReponse = z.infer<typeof etapeSchema>;

export const erreurItineraireSchema = z.object({
  erreur: z.string().min(1),
  message: z.string().min(1),
  suggestions: z.array(z.string()).optional(),
  itineraire_pieton: z.string().optional(),
});

export type ErreurItineraire = z.infer<typeof erreurItineraireSchema>;
