"use client";

import MapCanvas from "@/components/MapCanvas";
import { useRef, useState } from "react";

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

const TRANSPORT_ICONS: Record<string, string> = {
  "a_pied": "directions_walk",
  "gbaka": "airport_shuttle",
  "woro-woro": "directions_car",
  "sotra": "directions_bus",
  "zemidjan": "two_wheeler",
  "correspondance": "swap_horiz",
};

const TRANSPORT_COLORS: Record<string, string> = {
  "a_pied": "bg-gray-200 text-gray-600",
  "gbaka": "bg-orange-500 text-white",
  "woro-woro": "bg-yellow-400 text-black",
  "sotra": "bg-blue-500 text-white",
  "zemidjan": "bg-green-500 text-white",
  "correspondance": "bg-gray-300 text-gray-600",
};

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`,
      { headers: { "User-Agent": "RakpaApp/1.0" } },
    );
    const data = await res.json();
    const addr = data.address ?? {};
    const parts = [
      addr.neighbourhood,
      addr.suburb,
      addr.city_district,
      addr.town,
      addr.city,
    ].filter(Boolean);
    return parts.slice(0, 2).join(" ") || "Abidjan";
  } catch {
    return "Abidjan";
  }
}

export default function Home() {
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [userPosition, setUserPosition] = useState<[number, number] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeOption, setActiveOption] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  async function locateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(coords);
        setUserPosition(coords);
        const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setFrom(name);
        toRef.current?.focus();
      },
      () => {
        setMapCenter([5.3599517, -4.0082563]);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10_000 },
    );
  }

  async function search() {
    if (!from.trim() || !to.trim()) return;
    setLoading(true);
    setError(null);
    setItinerary(null);

    const now = new Date();
    const heure = now.toLocaleTimeString("fr-CI", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Abidjan",
    });
    const jour = now.toLocaleDateString("fr-CI", {
      weekday: "long",
      timeZone: "Africa/Abidjan",
    });

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
        setSheetOpen(true);
      }
    } catch {
      setError("Impossible de contacter Rakpa AI");
    } finally {
      setLoading(false);
    }
  }

  const option = itinerary?.options[activeOption];

  return (
    <div className="bg-background text-on-background antialiased overflow-hidden h-screen w-screen">
      {/* Map background */}
      <div className="fixed inset-0 z-0">
        <div className="w-full h-full grayscale bg-white relative">
          <MapCanvas center={mapCenter} userPosition={userPosition} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-black shadow-sm">
            <img alt="Rakpa logo" className="w-full h-full object-contain p-1" src="/rakpa-logo.png" />
          </div>
          <h1 className="font-bold tracking-tight text-2xl Inter text-black dark:text-white">Rakpa</h1>
        </div>
        <button
          className="material-symbols-outlined text-black dark:text-white text-2xl hover:opacity-70 transition-opacity"
          onClick={() => fromRef.current?.focus()}
          aria-label="Rechercher"
          type="button"
        >
          search
        </button>
      </header>

      {/* Search panel */}
      <main className="relative z-10 pt-24 px-6">
        <div className="max-w-xl mx-auto space-y-3">
          {/* Departure input */}
          <div className="bg-white/90 backdrop-blur-2xl rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.06)] p-2 flex items-center gap-3">
            <div className="pl-4 text-primary">
              <span className="material-symbols-outlined text-[20px]">my_location</span>
            </div>
            <input
              ref={fromRef}
              className="bg-transparent border-none focus:ring-0 w-full text-base font-medium placeholder:text-gray-400 py-3"
              placeholder="Depuis… (ou clique GPS)"
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") toRef.current?.focus(); }}
            />
            <button
              type="button"
              onClick={locateMe}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0 mr-1"
              aria-label="Utiliser ma position"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">gps_fixed</span>
            </button>
          </div>

          {/* Destination input */}
          <div className="bg-white/90 backdrop-blur-2xl rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.06)] p-2 flex items-center gap-3">
            <div className="pl-4 text-primary">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
            </div>
            <input
              ref={toRef}
              className="bg-transparent border-none focus:ring-0 w-full text-base font-medium placeholder:text-gray-400 py-3"
              placeholder="Où vas-tu, djaa ?"
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") search(); }}
            />
            <button
              type="button"
              onClick={search}
              disabled={loading || !from.trim() || !to.trim()}
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-all disabled:opacity-30 shrink-0 mr-1"
              aria-label="Calculer itinéraire"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <span className="material-symbols-outlined text-white text-[20px]">arrow_forward</span>
              }
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Transport filter pills */}
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {["Tout", "Gbaka", "Sotra", "Wôrô-wôrô"].map((label, i) => (
              <button
                key={label}
                className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all active:scale-95 ${
                  i === 0
                    ? "bg-black text-white"
                    : "bg-white/80 backdrop-blur-md text-black border border-black/5 shadow-sm hover:bg-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom sheet — itinerary result */}
      {itinerary && sheetOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end pointer-events-none">
          <div
            className="absolute inset-0 bg-black/20 pointer-events-auto"
            onClick={() => setSheetOpen(false)}
          />
          <div
            className="relative pointer-events-auto bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                    {itinerary.depart} → {itinerary.arrivee}
                  </p>
                  <p className="font-black text-lg tracking-tight leading-tight">{itinerary.resume}</p>
                </div>
                <button type="button" onClick={() => setSheetOpen(false)}>
                  <span className="material-symbols-outlined text-gray-400">close</span>
                </button>
              </div>

              {itinerary.alerte_trafic && itinerary.message_alerte && (
                <div className="mt-2 flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-2 rounded-xl">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  {itinerary.message_alerte}
                </div>
              )}

              {/* Option tabs */}
              {itinerary.options.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {itinerary.options.map((opt, idx) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setActiveOption(idx)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeOption === idx
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {opt.label}
                      <span className="block font-normal opacity-70">{opt.duree_totale} • {opt.prix_total}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Steps */}
            <div className="overflow-y-auto overscroll-contain flex-1 px-5 py-4 space-y-3">
              {option?.etapes.map((etape) => (
                <div key={etape.ordre} className="flex gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TRANSPORT_COLORS[etape.type] ?? "bg-gray-200 text-gray-600"}`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {TRANSPORT_ICONS[etape.type] ?? "directions"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug">{etape.instruction}</p>

                    {etape.quoi_dire && (
                      <div className="mt-1 bg-blue-50 text-blue-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg">
                        {etape.quoi_dire}
                      </div>
                    )}

                    {etape.conseil && (
                      <p className="text-xs text-gray-500 mt-1">{etape.conseil}</p>
                    )}

                    {etape.arrets_intermediaires && etape.arrets_intermediaires.length > 0 && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        Via : {etape.arrets_intermediaires.join(" → ")}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400 font-medium">
                      <span>{etape.point_depart} → {etape.point_arrivee}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] font-bold">
                      <span className="text-gray-600">{etape.duree}</span>
                      {etape.prix !== "0 FCFA" && <span className="text-primary">{etape.prix}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
