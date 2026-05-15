"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItineraireById, voter, getMonVote } from "@/lib/itineraires";
import { supabase } from "@/lib/supabase";
import VoteButtons from "@/components/VoteButtons";
import AuthModal from "@/components/AuthModal";
import type { Itineraire } from "@/types/itineraire";
import type { User } from "@/lib/auth";

const SEGMENT_COLORS: Record<string, string> = {
  gbaka:          "bg-orange-100 text-orange-700",
  "woro-woro":    "bg-yellow-100 text-yellow-700",
  sotra:          "bg-blue-100 text-blue-700",
  zemidjan:       "bg-green-100 text-green-700",
  a_pied:         "bg-gray-100 text-gray-500",
  correspondance: "bg-purple-100 text-purple-700",
};

const SEGMENT_EMOJI: Record<string, string> = {
  gbaka:          "🚐",
  "woro-woro":    "🚖",
  sotra:          "🚌",
  zemidjan:       "🛵",
  a_pied:         "🚶",
  correspondance: "🔄",
};

const STATUT_BADGE: Record<string, { label: string; cls: string }> = {
  en_attente: { label: "En attente de votes",  cls: "bg-orange-50 text-orange-700" },
  valide:     { label: "Validé par la communauté", cls: "bg-green-50 text-green-700" },
  rejete:     { label: "Rejeté",               cls: "bg-red-50 text-red-500" },
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [itineraire, setItineraire] = useState<Itineraire | null>(null);
  const [loading, setLoading] = useState(true);
  const [monVote, setMonVote] = useState<"up" | "down" | null>(null);
  const [voting, setVoting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const userId = user?.id ?? null;

  useEffect(() => {
    getItineraireById(id).then((data) => {
      setItineraire(data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!userId) return;
    getMonVote(id, userId).then(setMonVote);
  }, [id, userId]);

  async function handleVote(vote: "up" | "down") {
    if (!userId) { setShowAuth(true); return; }
    if (voting) return;
    setVoting(true);
    try {
      await voter(id, userId, vote);
      setMonVote(vote);
      // Rafraîchir les compteurs
      const updated = await getItineraireById(id);
      setItineraire(updated);
    } finally {
      setVoting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!itineraire) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-4xl">😕</p>
        <p className="font-bold text-lg">Itinéraire introuvable</p>
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-500 underline">
          Retour
        </button>
      </div>
    );
  }

  const statut = STATUT_BADGE[itineraire.statut];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-black text-base tracking-tight truncate">
            {itineraire.depart} → {itineraire.arrivee}
          </p>
          <p className="text-[11px] text-gray-400 font-medium">
            {itineraire.commune_depart} → {itineraire.commune_arrivee}
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-5 pb-32 space-y-5">

        {/* Statut */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold ${statut.cls}`}>
          <span className="material-symbols-outlined text-[16px]">
            {itineraire.statut === "valide" ? "verified" : itineraire.statut === "rejete" ? "cancel" : "how_to_vote"}
          </span>
          {statut.label}
        </div>

        {/* Infos globales */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Durée</p>
            <p className="font-black text-base">{itineraire.duree_min}–{itineraire.duree_max}</p>
            <p className="text-[10px] text-gray-400">min</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Prix</p>
            <p className="font-black text-base">{itineraire.prix_min}–{itineraire.prix_max}</p>
            <p className="text-[10px] text-gray-400">FCFA</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Segments</p>
            <p className="font-black text-base">{itineraire.nb_etapes || (itineraire.etapes?.length ?? 0)}</p>
            <p className="text-[10px] text-gray-400">étape{itineraire.nb_etapes !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Votes */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Votes de la communauté</p>
            <p className="text-xs text-gray-400 font-medium">
              {itineraire.votes_up + itineraire.votes_down} vote{itineraire.votes_up + itineraire.votes_down !== 1 ? "s" : ""}
            </p>
          </div>
          <VoteButtons
            itineraireId={id}
            votesUp={itineraire.votes_up}
            votesDown={itineraire.votes_down}
            monVote={monVote}
            userId={userId}
            onVote={handleVote}
          />
          {!userId && (
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="w-full py-3 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
            >
              Se connecter pour voter
            </button>
          )}
          {itineraire.statut === "en_attente" && (
            <p className="text-xs text-gray-400 text-center border-t border-gray-200 pt-2">
              {Math.max(0, 5 - itineraire.votes_up)} vote{5 - itineraire.votes_up > 1 ? "s" : ""} positif{5 - itineraire.votes_up > 1 ? "s" : ""} restant{5 - itineraire.votes_up > 1 ? "s" : ""} pour valider
            </p>
          )}
        </div>

        {/* Timeline du trajet */}
        {itineraire.etapes && itineraire.etapes.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Détail du trajet</p>

            {/* Départ */}
            <div className="flex gap-3 items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[13px]">trip_origin</span>
              </div>
              <span className="text-sm font-bold">{itineraire.depart}</span>
            </div>

            {itineraire.etapes.map((etape, i) => (
              <div key={etape.id} className="flex gap-3">
                {/* Timeline */}
                <div className="flex flex-col items-center w-8 shrink-0">
                  <div className="w-px h-3 bg-gray-200" />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${SEGMENT_COLORS[etape.type] ?? "bg-gray-100"}`}>
                    {SEGMENT_EMOJI[etape.type] ?? "🚌"}
                  </div>
                  {i < itineraire.etapes!.length - 1 && <div className="w-px flex-1 bg-gray-200 min-h-[12px]" />}
                </div>

                {/* Contenu */}
                <div className="flex-1 pt-3 pb-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">
                      {etape.point_depart} → {etape.point_arrivee}
                    </p>
                    {(etape.prix > 0 || etape.duree > 0) && (
                      <div className="flex gap-2 text-[11px] text-gray-400 font-medium">
                        {etape.duree > 0 && <span>{etape.duree} min</span>}
                        {etape.prix > 0 && <span className="font-bold text-black">{etape.prix} F</span>}
                      </div>
                    )}
                  </div>

                  {etape.quoi_dire && (
                    <div className="bg-black text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 w-fit">
                      <span className="material-symbols-outlined text-[13px] opacity-70">record_voice_over</span>
                      {etape.quoi_dire}
                    </div>
                  )}

                  {etape.arrets_intermediaires.length > 0 && (
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Via : {etape.arrets_intermediaires.join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Arrivée */}
            <div className="flex gap-3 items-center mt-1">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[13px]">location_on</span>
              </div>
              <span className="text-sm font-bold">{itineraire.arrivee}</span>
            </div>
          </div>
        )}

        {/* Conseil */}
        {showAuth && (
          <AuthModal
            onSuccess={(u) => { setUser(u); setShowAuth(false); }}
            onClose={() => setShowAuth(false)}
          />
        )}

        {itineraire.conseil_general && (
          <div className="bg-gray-50 rounded-2xl px-4 py-3 flex gap-3">
            <span className="text-lg shrink-0">💡</span>
            <p className="text-sm text-gray-600 font-medium">{itineraire.conseil_general}</p>
          </div>
        )}
      </main>
    </div>
  );
}
