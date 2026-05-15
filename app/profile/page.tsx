"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import type { User } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";
import { getItineraires } from "@/lib/itineraires";
import type { Itineraire } from "@/types/itineraire";

const EMOJI: Record<string, string> = {
  gbaka: "🚐", "woro-woro": "🚖", sotra: "🚌", zemidjan: "🛵", mixte: "🔀",
};

const STATUT: Record<string, { label: string; cls: string }> = {
  en_attente: { label: "En attente", cls: "bg-orange-50 text-orange-600" },
  valide:     { label: "Validé",     cls: "bg-green-50 text-green-600"  },
  rejete:     { label: "Rejeté",     cls: "bg-red-50 text-red-500"      },
};

export default function Page() {
  const [user, setUser]           = useState<User | null>(null);
  const [showAuth, setShowAuth]   = useState(false);
  const [mesItineraires, setMesItineraires] = useState<Itineraire[]>([]);
  const [loadingIt, setLoadingIt] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoadingIt(true);
    supabase
      .from("itineraires")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMesItineraires((data ?? []) as Itineraire[]);
        setLoadingIt(false);
      });
  }, [user]);

  async function handleSignOut() {
    await signOut();
    setUser(null);
    setMesItineraires([]);
  }

  /* ── Non connecté ── */
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-6 pb-32">
        <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-gray-300">person</span>
        </div>
        <div className="text-center">
          <h1 className="font-black text-2xl tracking-tight">Mon profil</h1>
          <p className="text-sm text-gray-500 mt-1">Connecte-toi pour voir tes itinéraires</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAuth(true)}
          className="w-full max-w-xs bg-black text-white rounded-2xl py-4 font-bold text-sm uppercase tracking-widest active:scale-95 transition-all"
        >
          Se connecter
        </button>
        {showAuth && (
          <AuthModal
            onSuccess={(u) => { setUser(u); setShowAuth(false); }}
            onClose={() => setShowAuth(false)}
          />
        )}
      </div>
    );
  }

  /* ── Connecté ── */
  return (
    <div className="min-h-screen bg-white text-black pb-32">
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">person</span>
            </div>
            <div>
              <p className="font-black text-lg tracking-tight">{user.email}</p>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">Membre Rakpa</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-semibold text-gray-400 hover:text-black transition-colors px-3 py-2 rounded-xl hover:bg-gray-50"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="px-5 space-y-8">
        {/* Mes itinéraires */}
        <section>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Mes itinéraires soumis
          </p>

          {loadingIt && (
            <div className="flex justify-center py-8">
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingIt && mesItineraires.length === 0 && (
            <div className="bg-gray-50 rounded-2xl px-4 py-8 text-center space-y-2">
              <p className="text-2xl">🗺️</p>
              <p className="text-sm font-semibold text-gray-500">Aucun itinéraire soumis</p>
              <p className="text-xs text-gray-400">Appuie sur + pour en proposer un</p>
            </div>
          )}

          {!loadingIt && mesItineraires.map((it) => {
            const st = STATUT[it.statut];
            const total = it.votes_up + it.votes_down;
            const pct   = total > 0 ? Math.round((it.votes_up / total) * 100) : 0;
            return (
              <Link
                key={it.id}
                href={`/itineraires/${it.id}`}
                className="flex gap-3 items-start bg-white border border-gray-100 rounded-2xl p-4 mb-3 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
                  {EMOJI[it.type_transport] ?? "🚌"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-sm leading-tight">{it.depart} → {it.arrivee}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{it.commune_depart} → {it.commune_arrivee}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-black rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 shrink-0">
                      {it.votes_up} 👍 · {it.votes_down} 👎
                    </span>
                  </div>
                  {it.statut === "en_attente" && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      {Math.max(0, 5 - it.votes_up)} vote{5 - it.votes_up > 1 ? "s" : ""} restant{5 - it.votes_up > 1 ? "s" : ""} pour valider
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
