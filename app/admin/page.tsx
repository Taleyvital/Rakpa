"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Itineraire } from "@/types/itineraire";

const ADMIN_PIN = "rakpa2026";

const EMOJI: Record<string, string> = {
  gbaka: "🚐", "woro-woro": "🚖", sotra: "🚌", zemidjan: "🛵", mixte: "🔀",
};

const STATUT_TABS = [
  { key: "en_attente", label: "En attente" },
  { key: "valide",     label: "Validés"    },
  { key: "rejete",     label: "Rejetés"    },
] as const;

type StatutTab = typeof STATUT_TABS[number]["key"];

export default function AdminPage() {
  const [pin, setPin]         = useState("");
  const [auth, setAuth]       = useState(false);
  const [pinError, setPinError] = useState(false);

  const [tab, setTab]         = useState<StatutTab>("en_attente");
  const [items, setItems]     = useState<Itineraire[]>([]);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState<string | null>(null);

  async function load(statut: StatutTab) {
    setLoading(true);
    const { data } = await supabase
      .from("itineraires")
      .select("*")
      .eq("statut", statut)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Itineraire[]);
    setLoading(false);
  }

  useEffect(() => {
    if (auth) load(tab);
  }, [auth, tab]);

  async function setStatut(id: string, statut: "valide" | "rejete" | "en_attente") {
    setWorking(id);
    await supabase.from("itineraires").update({ statut }).eq("id", id);
    setItems((prev) => prev.filter((it) => it.id !== id));
    setWorking(null);
  }

  /* ── PIN screen ── */
  if (!auth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
          <img src="/rakpa-logo.png" alt="Rakpa" className="w-full h-full object-contain p-1" />
        </div>
        <div className="text-center">
          <h1 className="text-white font-black text-2xl tracking-tight">Rakpa Admin</h1>
          <p className="text-zinc-500 text-sm mt-1">Modération des itinéraires</p>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <input
            type="password"
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-4 py-4 text-center text-lg font-bold tracking-[0.3em] placeholder:tracking-normal placeholder:text-zinc-600 outline-none focus:border-white transition-colors"
            placeholder="Code PIN"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setPinError(false); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (pin === ADMIN_PIN) setAuth(true);
                else setPinError(true);
              }
            }}
          />
          {pinError && <p className="text-red-500 text-xs text-center font-semibold">Code incorrect</p>}
          <button
            type="button"
            onClick={() => {
              if (pin === ADMIN_PIN) setAuth(true);
              else setPinError(true);
            }}
            className="w-full bg-white text-black rounded-2xl py-4 font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
          >
            Entrer
          </button>
        </div>
      </div>
    );
  }

  /* ── Admin dashboard ── */
  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-lg tracking-tight">Rakpa Admin</h1>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">Modération</p>
        </div>
        <button
          type="button"
          onClick={() => setAuth(false)}
          className="text-xs text-gray-400 hover:text-black transition-colors font-medium"
        >
          Déconnexion
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 flex gap-1 pt-2">
        {STATUT_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all ${
              tab === t.key
                ? "bg-black text-white"
                : "text-gray-400 hover:text-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-5 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <span className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-3">✅</p>
            <p className="font-semibold text-sm">Aucun itinéraire dans cette catégorie</p>
          </div>
        )}

        {!loading && items.map((it) => (
          <div key={it.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
                {EMOJI[it.type_transport] ?? "🚌"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm leading-tight">{it.depart} → {it.arrivee}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{it.commune_depart} → {it.commune_arrivee}</p>
                <div className="flex gap-3 mt-1 text-[11px] text-gray-500 font-medium">
                  <span>⏱ {it.duree_min}–{it.duree_max} min</span>
                  <span>💰 {it.prix_min}–{it.prix_max} F</span>
                  <span>📍 {it.nb_etapes} segment{it.nb_etapes !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            {it.conseil_general && (
              <p className="text-xs text-gray-500 italic bg-gray-50 rounded-xl px-3 py-2">
                "{it.conseil_general}"
              </p>
            )}

            {/* Votes */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span>👍 {it.votes_up}</span>
              <span>👎 {it.votes_down}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Link
                href={`/itineraires/${it.id}`}
                target="_blank"
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 text-center hover:bg-gray-50 transition-colors"
              >
                Voir le détail
              </Link>

              {tab !== "valide" && (
                <button
                  type="button"
                  disabled={working === it.id}
                  onClick={() => setStatut(it.id, "valide")}
                  className="flex-1 py-2.5 rounded-xl bg-black text-white text-xs font-bold active:scale-95 transition-all disabled:opacity-40"
                >
                  {working === it.id ? "…" : "✅ Valider"}
                </button>
              )}

              {tab !== "rejete" && (
                <button
                  type="button"
                  disabled={working === it.id}
                  onClick={() => setStatut(it.id, "rejete")}
                  className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold active:scale-95 transition-all disabled:opacity-40"
                >
                  {working === it.id ? "…" : "❌ Rejeter"}
                </button>
              )}

              {tab === "rejete" && (
                <button
                  type="button"
                  disabled={working === it.id}
                  onClick={() => setStatut(it.id, "en_attente")}
                  className="flex-1 py-2.5 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold active:scale-95 transition-all disabled:opacity-40"
                >
                  {working === it.id ? "…" : "↩️ Remettre"}
                </button>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
