"use client";

import MapCanvas from "@/components/MapCanvas";
import { useMemo, useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const places = useMemo(
    () =>
      [
        { label: "Plateau", center: [5.3236, -4.0167] as [number, number] },
        { label: "Yopougon", center: [5.3364, -4.0707] as [number, number] },
        { label: "Cocody", center: [5.3514, -3.9852] as [number, number] },
        { label: "Treichville", center: [5.2987, -4.0152] as [number, number] },
        { label: "Marcory", center: [5.2956, -3.9934] as [number, number] },
      ],
    [],
  );
  const [query, setQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(
    undefined,
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return places.filter((p) => p.label.toLowerCase().includes(q));
  }, [query, places]);

  function applySearch(nextQuery: string) {
    const q = nextQuery.trim().toLowerCase();
    if (!q) return;
    const match = places.find((p) => p.label.toLowerCase().includes(q));
    if (match) {
      setMapCenter(match.center);
      setShowSuggestions(false);
      setQuery(match.label);
    }
  }

  return (
    <div className="bg-background text-on-background antialiased overflow-hidden h-screen w-screen">
      <div className="fixed inset-0 z-0">
        <div className="w-full h-full grayscale bg-white relative">
          <MapCanvas center={mapCenter} />
          <div className="absolute inset-0 bg-white/50 pointer-events-none"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-black shadow-sm">
            <img
              alt="Rakpa logo"
              className="w-full h-full object-contain p-1"
              src="/rakpa-logo.png"
            />
          </div>
          <h1 className="font-bold tracking-tight text-2xl Inter text-black dark:text-white">Rakpa</h1>
        </div>
        <button
          className="material-symbols-outlined text-black dark:text-white text-2xl hover:opacity-70 transition-opacity scale-95 active:duration-150"
          onClick={() => inputRef.current?.focus()}
          aria-label="Rechercher"
          type="button"
        >
          search
        </button>
      </header>

      <main className="relative z-10 pt-24 px-6">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-white/90 backdrop-blur-2xl rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.06)] p-2 flex items-center gap-3">
            <div className="pl-4 text-primary">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              ref={inputRef}
              className="bg-transparent border-none focus:ring-0 w-full text-lg font-medium placeholder:text-gray-400 py-3"
              placeholder="Où vas-tu, djaa ?"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch(query);
                if (e.key === "Escape") setShowSuggestions(false);
              }}
            />
            <div className="pr-2">
              <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-primary">mic</span>
              </button>
            </div>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-white/95 backdrop-blur-2xl rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] overflow-hidden">
              {suggestions.map((place) => (
                <button
                  key={place.label}
                  type="button"
                  className="w-full px-6 py-3 text-left hover:bg-surface-container transition-colors flex items-center gap-3"
                  onClick={() => {
                    setMapCenter(place.center);
                    setQuery(place.label);
                    setShowSuggestions(false);
                  }}
                >
                  <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                  <span className="text-base font-medium">{place.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            <button className="px-6 py-2.5 rounded-full bg-black text-white font-bold text-sm whitespace-nowrap transition-all active:scale-95">
              Tout
            </button>
            <button className="px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-md text-black font-semibold text-sm whitespace-nowrap border border-black/5 shadow-sm hover:bg-white transition-all active:scale-95">
              Gbaka
            </button>
            <button className="px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-md text-black font-semibold text-sm whitespace-nowrap border border-black/5 shadow-sm hover:bg-white transition-all active:scale-95">
              Sotra
            </button>
            <button className="px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-md text-black font-semibold text-sm whitespace-nowrap border border-black/5 shadow-sm hover:bg-white transition-all active:scale-95">
              Wôrô-wôrô
            </button>
          </div>
        </div>
      </main>

      <div className="fixed bottom-32 left-6 right-6 z-10 flex flex-row gap-4 max-w-4xl mx-auto items-end">
        <div className="bg-white/90 backdrop-blur-2xl p-6 rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.06)] flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1 block">
                Prochain départ
              </span>
              <h3 className="text-xl font-bold tracking-tight">Express 102 — Plateau</h3>
            </div>
            <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
              4 min
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                12
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
            </div>
            <span>Forte affluence prévue</span>
          </div>
        </div>

        <div className="bg-black text-white p-6 rounded-lg shadow-xl w-48 aspect-square flex flex-col justify-between">
          <span className="material-symbols-outlined text-3xl font-light">bolt</span>
          <div>
            <div className="text-3xl font-bold tracking-tighter leading-none">2.4</div>
            <div className="text-[10px] font-medium uppercase tracking-widest opacity-60">
              KM PROCHES
            </div>
          </div>
        </div>
      </div>

      <button
        className="fixed bottom-28 right-6 z-50 w-16 h-16 rounded-full bg-black text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        type="button"
        aria-label="Recentrer sur ma position"
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setMapCenter([pos.coords.latitude, pos.coords.longitude]);
            },
            () => {
              setMapCenter([5.3599517, -4.0082563]);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 10_000 },
          );
        }}
      >
        <span className="material-symbols-outlined text-3xl">my_location</span>
      </button>
    </div>
  );
}
