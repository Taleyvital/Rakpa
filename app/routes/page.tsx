"use client";

import communes from "@/data/communes.json";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getItineraires } from "@/lib/itineraires";
import type { Itineraire } from "@/types/itineraire";

type Etape = {
  ordre: number;
  type: string;
  instruction: string;
  quoi_dire?: string;
  couleur_vehicule?: string;
  duree: string;
  prix: string;
  point_depart: string;
  point_arrivee: string;
  arrets_intermediaires?: string[];
  conseil?: string;
};

type Option = {
  id: string;
  label: string;
  duree_totale: string;
  prix_total: string;
  nb_correspondances: number;
  etapes: Etape[];
};

type Itinerary = {
  depart: string;
  arrivee: string;
  heure_depart: string;
  alerte_trafic: boolean;
  message_alerte?: string;
  options: Option[];
  option_recommandee: string;
  resume: string;
};

type Commune = {
  id: string;
  name: string;
  type: string;
  icon: string;
  population: string;
};

const TRANSPORT_ICONS: Record<string, string> = {
  "a_pied": "directions_walk",
  "gbaka": "airport_shuttle",
  "woro-woro": "directions_car",
  "sotra": "directions_bus",
  "zemidjan": "two_wheeler",
  "correspondance": "swap_horiz",
};

const TRANSPORT_COLORS: Record<string, string> = {
  "a_pied": "bg-gray-100 text-gray-500",
  "gbaka": "bg-orange-500 text-white",
  "woro-woro": "bg-yellow-400 text-black",
  "sotra": "bg-blue-500 text-white",
  "zemidjan": "bg-green-500 text-white",
  "correspondance": "bg-gray-100 text-gray-500",
};

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`,
      { headers: { "User-Agent": "RakpaApp/1.0" } },
    );
    const data = await res.json();
    const addr = data.address ?? {};
    const parts = [addr.neighbourhood, addr.suburb, addr.city_district, addr.town, addr.city].filter(Boolean);
    return parts.slice(0, 2).join(" ") || "Abidjan";
  } catch {
    return "Abidjan";
  }
}

export default function Page() {
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeOption, setActiveOption] = useState(0);
  const [communaute, setCommunaute] = useState<Itineraire[]>([]);

  useEffect(() => {
    getItineraires().then(setCommunaute).catch(() => {});
  }, []);

  async function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setFrom(name);
        setLocating(false);
        toRef.current?.focus();
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10_000 },
    );
  }

  async function search() {
    if (!from.trim() || !to.trim()) return;
    setLoading(true);
    setError(null);
    setItinerary(null);

    const now = new Date();
    const heure = now.toLocaleTimeString("fr-CI", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Abidjan" });
    const jour = now.toLocaleDateString("fr-CI", { weekday: "long", timeZone: "Africa/Abidjan" });

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position_actuelle: from, destination: to, heure, jour }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Erreur inconnue");
      } else {
        setItinerary(data as Itinerary);
        setActiveOption(0);
      }
    } catch {
      setError("Impossible de contacter Rakpa AI");
    } finally {
      setLoading(false);
    }
  }

  const option = itinerary?.options[activeOption];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-black/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto w-full">
          <div className="w-9 h-9 rounded-full bg-white overflow-hidden border-2 border-black shadow-sm shrink-0">
            <img alt="Rakpa logo" className="w-full h-full object-contain p-1" src="/rakpa-logo.png" />
          </div>
          <h1 className="font-black text-lg tracking-tight">Itinéraires</h1>
        </div>
      </header>

      <main className="flex-grow max-w-2xl mx-auto w-full px-4 pb-32">
        {/* Search form */}
        <div className="pt-5 space-y-2">
          {/* From */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-outline-variant/10 flex items-center gap-2 px-4">
            <span className="material-symbols-outlined text-[18px] text-green-500 shrink-0">radio_button_checked</span>
            <input
              ref={fromRef}
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") toRef.current?.focus(); }}
              placeholder="Depuis…"
              className="flex-1 bg-transparent py-4 text-sm font-medium placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={locateMe}
              disabled={locating}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0 disabled:opacity-50"
              aria-label="Ma position"
            >
              {locating
                ? <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                : <span className="material-symbols-outlined text-[16px] text-gray-500">gps_fixed</span>
              }
            </button>
          </div>

          {/* Connector line */}
          <div className="flex items-center gap-2 pl-6">
            <div className="w-px h-4 bg-gray-200 ml-[1px]" />
          </div>

          {/* To */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-outline-variant/10 flex items-center gap-2 px-4">
            <span className="material-symbols-outlined text-[18px] text-red-500 shrink-0">location_on</span>
            <input
              ref={toRef}
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") search(); }}
              placeholder="Où vas-tu, djaa ?"
              className="flex-1 bg-transparent py-4 text-sm font-medium placeholder:text-gray-400 focus:outline-none"
            />
            {to && (
              <button type="button" onClick={() => setTo("")} className="text-gray-300 hover:text-gray-500">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={search}
            disabled={loading || !from.trim() || !to.trim()}
            className="w-full py-4 rounded-2xl bg-black text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 mt-1"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rakpa cherche…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">alt_route</span>
                Calculer l'itinéraire
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 text-red-700 text-sm font-semibold px-4 py-3 rounded-2xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Results */}
        {itinerary && (
          <div className="mt-6 space-y-4">
            {/* Summary + alert */}
            <div>
              <h2 className="text-[2rem] font-black leading-none tracking-tighter mb-1">
                {itinerary.resume}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {itinerary.depart} → {itinerary.arrivee}
              </p>
              {itinerary.alerte_trafic && itinerary.message_alerte && (
                <div className="mt-3 flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  {itinerary.message_alerte}
                </div>
              )}
            </div>

            {/* Option tabs */}
            {itinerary.options.length > 1 && (
              <div className="flex gap-2">
                {itinerary.options.map((opt, idx) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActiveOption(idx)}
                    className={`flex-1 py-3 px-3 rounded-2xl text-xs font-bold transition-all text-left ${
                      activeOption === idx
                        ? "bg-black text-white"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="block">{opt.label}</span>
                    <span className={`block mt-0.5 font-normal ${activeOption === idx ? "opacity-60" : "opacity-70"}`}>
                      {opt.duree_totale} · {opt.prix_total}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Steps — vertical timeline */}
            {option && (
              <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                {option.etapes.map((etape, idx) => {
                  const isLast = idx === option.etapes.length - 1;
                  return (
                    <div key={etape.ordre} className={`flex gap-4 px-4 py-4 ${!isLast ? "border-b border-gray-50" : ""}`}>
                      {/* Icon + vertical line */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${TRANSPORT_COLORS[etape.type] ?? "bg-gray-100 text-gray-500"}`}>
                          <span className="material-symbols-outlined text-[17px]">
                            {TRANSPORT_ICONS[etape.type] ?? "directions"}
                          </span>
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-gray-100 min-h-[16px]" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-1">
                        <p className="font-semibold text-sm leading-snug">{etape.instruction}</p>

                        {/* quoi_dire — most important */}
                        {etape.quoi_dire && (
                          <div className="mt-2 bg-black text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px] opacity-70">record_voice_over</span>
                            {etape.quoi_dire}
                          </div>
                        )}

                        {/* Intermediate stops */}
                        {etape.arrets_intermediaires && etape.arrets_intermediaires.length > 0 && (
                          <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                            Via : {etape.arrets_intermediaires.join(" · ")}
                          </p>
                        )}

                        {/* Conseil */}
                        {etape.conseil && (
                          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{etape.conseil}</p>
                        )}

                        {/* Duration + price */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {etape.duree}
                          </span>
                          {etape.prix !== "0 FCFA" && (
                            <span className="text-[11px] font-bold text-primary">{etape.prix}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Total footer */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total</span>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm">{option.duree_totale}</span>
                    <span className="font-black text-sm text-primary">{option.prix_total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Explorer communes — secondary section */}
        {!itinerary && !loading && (
          <div className="mt-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-outline mb-4">
              Explorer par commune
            </p>
            <div className="flex flex-col divide-y divide-outline-variant/10">
              {(communes as Commune[]).map((c) => (
                <Link
                  key={c.id}
                  href={`/routes/${c.id}`}
                  className="flex items-center gap-4 py-3.5 hover:bg-surface-container-lowest rounded-xl px-3 -mx-3 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm">{c.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-outline ml-2">{c.type}</span>
                    <p className="text-xs text-on-surface-variant">{c.population}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant text-[18px] group-hover:text-primary transition-colors">
                    chevron_right
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Itinéraires communautaires */}
        {!itinerary && !loading && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-outline">
                Proposés par la communauté
              </p>
              {communaute.length > 0 && (
                <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full">
                  {communaute.length}
                </span>
              )}
            </div>

            {communaute.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl px-4 py-6 text-center space-y-2">
                <p className="text-2xl">🗺️</p>
                <p className="text-sm font-semibold text-gray-500">Aucun itinéraire validé pour l'instant</p>
                <p className="text-xs text-gray-400">Appuie sur + pour proposer le premier !</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {communaute.map((it) => {
                  const EMOJI: Record<string, string> = {
                    gbaka: "🚐", "woro-woro": "🚖", sotra: "🚌", zemidjan: "🛵", mixte: "🔀",
                  };
                  const total = it.votes_up + it.votes_down;
                  const pct = total > 0 ? Math.round((it.votes_up / total) * 100) : 0;
                  return (
                    <Link
                      key={it.id}
                      href={`/itineraires/${it.id}`}
                      className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 flex gap-3 items-start hover:shadow-md transition-shadow active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
                        {EMOJI[it.type_transport] ?? "🚌"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm leading-tight">
                          {it.depart} → {it.arrivee}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {it.commune_depart} → {it.commune_arrivee}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-gray-500">
                          <span>⏱ {it.duree_min}–{it.duree_max} min</span>
                          <span>💰 {it.prix_min}–{it.prix_max} F</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">{it.votes_up} 👍</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-gray-300 text-[18px] shrink-0 mt-1">
                        chevron_right
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
