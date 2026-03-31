"use client";

import routes from "@/data/routes.json";
import Link from "next/link";
import { useMemo, useState } from "react";

type RouteItem = {
  id: string;
  title: string;
  subtitle: string;
  badge: string | null;
  icon: string;
  price: string;
  priceOld: string | null;
  duration: string;
  frequency: string;
  from: string;
  to: string;
};

export default function Page() {
  const allRoutes = useMemo(() => routes as RouteItem[], []);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromLabel, setFromLabel] = useState("Yopougon, Gare");
  const [toLabel, setToLabel] = useState("Plateau, Centre");

  const filteredRoutes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allRoutes;
    return allRoutes.filter((r) => {
      const hay = `${r.title} ${r.subtitle} ${r.from} ${r.to}`.toLowerCase();
      return hay.includes(q);
    });
  }, [allRoutes, searchQuery]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="bg-white/90 dark:bg-black/80 backdrop-blur-xl docked full-width top-0 z-50">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-black shadow-sm">
              <img
                alt="Rakpa logo"
                className="w-full h-full object-contain p-1"
                src="/rakpa-logo.png"
              />
            </div>
            <span className="text-2xl font-black text-black dark:text-white tracking-tighter">
              Rakpa
            </span>
          </div>
          <button
            className="hover:opacity-70 transition-opacity scale-95 active:duration-150"
            type="button"
            aria-label="Rechercher un itinéraire"
            onClick={() => {
              const next = window.prompt("Rechercher un itinéraire", searchQuery);
              if (next !== null) setSearchQuery(next);
            }}
          >
            <span className="material-symbols-outlined text-black dark:text-white text-2xl">
              search
            </span>
          </button>
        </div>
      </header>

      <main className="flex-grow px-6 pt-8 max-w-2xl mx-auto w-full">
        <section className="mb-12">
          <h1 className="text-[3.5rem] font-bold leading-[1.1] tracking-tighter text-primary mb-4">
            Itinéraires
          </h1>
          <p className="text-on-surface-variant text-body-md max-w-xs leading-relaxed">
            Explorez les options de transit urbain les plus efficaces pour votre trajet.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4 mb-10">
          <div
            className="bg-surface-container-lowest p-6 rounded-lg flex items-center justify-between group cursor-pointer transition-all hover:bg-white shadow-sm"
            role="button"
            tabIndex={0}
            onClick={() => {
              setFromLabel(toLabel);
              setToLabel(fromLabel);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFromLabel(toLabel);
                setToLabel(fromLabel);
              }
            }}
          >
            <div className="flex flex-col">
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-outline mb-1">
                DÉPART
              </span>
              <span className="text-title-md font-semibold">{fromLabel}</span>
            </div>
            <span className="material-symbols-outlined text-outline">sync_alt</span>
            <div className="flex flex-col text-right">
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-outline mb-1">
                ARRIVÉE
              </span>
              <span className="text-title-md font-semibold">{toLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {filteredRoutes.map((r, idx) => {
            const cardClassName =
              idx === 1
                ? "bg-surface-container-low rounded-lg p-8 flex flex-col gap-6 border border-transparent"
                : "bg-surface-container-lowest rounded-lg p-8 flex flex-col gap-6 relative overflow-hidden group border border-outline-variant/5";

            const iconWrapClassName =
              idx === 0
                ? "w-12 h-12 rounded-full bg-primary flex items-center justify-center"
                : idx === 1
                  ? "w-12 h-12 rounded-full bg-white flex items-center justify-center"
                  : "w-12 h-12 rounded-full bg-surface-container flex items-center justify-center";

            const iconClassName =
              idx === 0
                ? "material-symbols-outlined text-white"
                : "material-symbols-outlined text-primary";

            return (
              <div key={r.id} className={cardClassName}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={iconWrapClassName}>
                      <span className={iconClassName}>{r.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-title-md font-bold">{r.title}</h3>
                      <p className="text-label-sm text-outline tracking-wider uppercase">
                        {r.subtitle}
                      </p>
                    </div>
                  </div>
                  {r.badge ? (
                    <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      {r.badge}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[2.5rem] font-black tracking-tight">
                      {r.price}
                    </span>
                    {r.priceOld ? (
                      <span className="text-outline text-body-md line-through">
                        {r.priceOld}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="text-body-md font-medium">{r.duration}</span>
                    <span className="mx-2 text-outline-variant text-xs">•</span>
                    <span className="text-body-md">{r.frequency}</span>
                  </div>
                </div>

                <div className="pt-6 mt-2 border-t border-outline-variant/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-body-md font-semibold">{r.from}</span>
                    <span className="material-symbols-outlined text-outline text-xs">
                      arrow_forward
                    </span>
                    <span className="text-body-md font-semibold">{r.to}</span>
                  </div>
                  <Link
                    href={`/routes/${r.id}`}
                    className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    aria-label={`Voir le détail ${r.title}`}
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
