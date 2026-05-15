import { supabase } from "@/lib/supabase";
import type {
  Itineraire,
  NouvelItineraireForm,
} from "@/types/itineraire";

export async function getItineraires(depart?: string, arrivee?: string): Promise<Itineraire[]> {
  let query = supabase
    .from("itineraires")
    .select("*")
    .eq("statut", "valide")
    .order("created_at", { ascending: false });

  if (depart) query = query.ilike("depart", `%${depart}%`);
  if (arrivee) query = query.ilike("arrivee", `%${arrivee}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Itineraire[];
}

export async function getItineraireById(id: string): Promise<Itineraire | null> {
  const { data, error } = await supabase
    .from("itineraires")
    .select("*, etapes:itineraire_etapes(*)")
    .eq("id", id)
    .single();

  if (error) return null;

  if (data?.etapes) {
    data.etapes = (data.etapes as { ordre: number }[]).sort((a, b) => a.ordre - b.ordre);
  }
  return data as Itineraire;
}

export async function getItinerairesEnAttente(): Promise<Itineraire[]> {
  const { data, error } = await supabase
    .from("itineraires")
    .select("*")
    .eq("statut", "en_attente")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Itineraire[];
}

export async function creerItineraire(
  form: NouvelItineraireForm,
  userId: string,
): Promise<string> {
  const { data: itineraire, error } = await supabase
    .from("itineraires")
    .insert({
      user_id: userId || null,
      depart: form.depart.trim(),
      arrivee: form.arrivee.trim(),
      commune_depart: form.commune_depart || null,
      commune_arrivee: form.commune_arrivee || null,
      type_transport: form.type_transport,
      prix_min: Number(form.prix_min),
      prix_max: Number(form.prix_max),
      duree_min: Number(form.duree_min),
      duree_max: Number(form.duree_max),
      conseil_general: form.conseil_general.trim() || null,
      nb_etapes: form.etapes.length,
    })
    .select("id")
    .single();

  if (error) throw error;

  const id = itineraire.id as string;

  if (form.etapes.length > 0) {
    const etapes = form.etapes.map((e, i) => ({
      itineraire_id: id,
      ordre: i + 1,
      type: e.type,
      point_depart: e.point_depart.trim(),
      point_arrivee: e.point_arrivee.trim(),
      quoi_dire: e.quoi_dire.trim() || null,
      arrets_intermediaires: e.arrets_intermediaires,
      prix: Number(e.prix) || 0,
      duree: Number(e.duree) || 0,
    }));

    const { error: etapesError } = await supabase
      .from("itineraire_etapes")
      .insert(etapes);

    if (etapesError) throw etapesError;
  }

  return id;
}

export async function voter(
  itineraireId: string,
  userId: string,
  vote: "up" | "down",
): Promise<void> {
  const { error } = await supabase
    .from("itineraire_votes")
    .upsert(
      { itineraire_id: itineraireId, user_id: userId, vote },
      { onConflict: "itineraire_id,user_id" },
    );

  if (error) throw error;
}

export async function getMonVote(
  itineraireId: string,
  userId: string,
): Promise<"up" | "down" | null> {
  const { data } = await supabase
    .from("itineraire_votes")
    .select("vote")
    .eq("itineraire_id", itineraireId)
    .eq("user_id", userId)
    .maybeSingle();

  return (data?.vote as "up" | "down") ?? null;
}
