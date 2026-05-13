"use client";

import communeTransports from "@/data/commune-transports.json";
import communes from "@/data/communes.json";
import quartiers from "@/data/quartiers.json";
import Link from "next/link";
import { use, useMemo, useState } from "react";

type TransportType = "gbaka" | "woro-woro" | "bus";

type RouteOption = {
  id: string;
  ligne: string;
  price: string;
  duration: string;
  frequency: string;
};

type CommuneTransports = {
  gbaka: RouteOption[];
  "woro-woro": RouteOption[];
  bus: RouteOption[];
};

type QuartierCategorie = {
  categorie: string;
  quartiers: string[];
};

const TABS: { key: TransportType; label: string; icon: string; color: string }[] = [
  { key: "gbaka",     label: "Gbaka",     icon: "airport_shuttle", color: "bg-orange-500" },
  { key: "woro-woro", label: "Woro-woro", icon: "directions_car",  color: "bg-yellow-500" },
  { key: "bus",       label: "Bus",       icon: "directions_bus",  color: "bg-blue-500"   },
];

function QuartierSection({ categories }: { categories: QuartierCategorie[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="mt-8 mb-2">
      <p className="text-[11px] font-bold uppercase tracking-widest text-outline mb-4">
        Quartiers
      </p>
      <div className="flex flex-col gap-2">
        {categories.map((cat, idx) => {
          const open = openIdx === idx;
          return (
            <div key={cat.categorie} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIdx(open ? null : idx)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-container transition-colors"
              >
                <span className="font-bold text-sm text-left">{cat.categorie}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-outline bg-surface-container px-2 py-0.5 rounded-full">
                    {cat.quartiers.length}
                  </span>
                  <span
                    className={`material-symbols-outlined text-outline text-[18px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {open && (
                <div className="px-4 pb-3 flex flex-col gap-1 border-t border-outline-variant/10">
                  {cat.quartiers.map((q) => (
                    <div key={q} className="flex items-center gap-2 py-2 border-b border-outline-variant/5 last:border-0">
                      <span className="material-symbols-outlined text-outline-variant text-[14px]">
                        location_on
                      </span>
                      <span className="text-sm font-medium">{q}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<TransportType>("gbaka");

  const commune = useMemo(
    () => (communes as { id: string; name: string; type: string }[]).find((c) => c.id === id),
    [id],
  );

  const transports = useMemo(
    () => (communeTransports as Record<string, CommuneTransports>)[id] ?? null,
    [id],
  );

  const communeQuartiers = useMemo(
    () => (quartiers as Record<string, QuartierCategorie[]>)[id] ?? null,
    [id],
  );

  if (!commune || !transports) {
    return (
      <div className="min-h-screen bg-background text-on-background pt-24 px-6 max-w-2xl mx-auto">
        <Link
          href="/routes"
          className="flex items-center gap-1 text-sm text-outline mb-8 hover:text-on-background transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Communes
        </Link>
        <h1 className="text-3xl font-black tracking-tighter text-primary">Commune introuvable</h1>
      </div>
    );
  }

  const routes = transports[activeTab] ?? [];
  const activeColor = TABS.find((t) => t.key === activeTab)?.color ?? "bg-black";
  const activeIcon = TABS.find((t) => t.key === activeTab)?.icon ?? "directions_bus";

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-black/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto w-full">
          <Link
            href="/routes"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0"
            aria-label="Retour"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-lg tracking-tight leading-none">{commune.name}</h1>
            <p className="text-[11px] text-outline font-medium uppercase tracking-widest">{commune.type}</p>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-2xl mx-auto w-full px-4 pb-32">
        {/* Transport tabs */}
        <div className="flex gap-2 pt-5 pb-4">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl font-bold text-xs transition-all ${
                  active
                    ? "bg-black text-white shadow-lg scale-[1.03]"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Route count */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-outline mb-4">
          {routes.length} trajet{routes.length > 1 ? "s" : ""} disponible{routes.length > 1 ? "s" : ""}
        </p>

        {/* Route list */}
        <div className="flex flex-col gap-3">
          {routes.map((r) => (
            <div
              key={r.id}
              className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl ${activeColor} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-white text-[18px]">{activeIcon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight mb-1">{r.ligne}</p>
                <div className="flex items-center gap-2 text-[11px] text-on-surface-variant flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                    {r.duration}
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span>{r.frequency}</span>
                </div>
              </div>
              <span className="font-black text-sm tracking-tight shrink-0">{r.price}</span>
            </div>
          ))}
        </div>

        {/* Quartiers */}
        {communeQuartiers && <QuartierSection categories={communeQuartiers} />}
      </main>
    </div>
  );
}
