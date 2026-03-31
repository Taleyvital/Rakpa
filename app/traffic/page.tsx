"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import traffic from "@/data/traffic.json";

type TrafficAxis = {
  id: string;
  code: string;
  name: string;
  path: string;
  status: string;
  congestionPercent: number;
  eta: string;
};

export default function Page() {
  const router = useRouter();
  const initial = useMemo(() => traffic as { headline: string; delayPercent: string; axes: TrafficAxis[] }, []);
  const [data, setData] = useState(initial);
  const axes = data.axes;

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <header className="bg-white/90 dark:bg-black/80 backdrop-blur-xl fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-black shadow-sm">
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
        <button className="text-black dark:text-white hover:opacity-70 transition-opacity active:duration-150 scale-95">
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      <main className="pt-24 px-6 max-w-5xl mx-auto">
        <section className="mb-12">
          <h1 className="font-bold tracking-tight text-4xl lg:text-5xl text-primary mb-2">
            Trafic en temps réel
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <button
              type="button"
              className="text-on-surface-variant text-sm font-medium tracking-wide"
              onClick={() => {
                setData((prev) => ({
                  ...prev,
                  axes: prev.axes.map((a) => {
                    const jitter = Math.round((Math.random() * 8 - 4) * 10) / 10;
                    const next = Math.max(0, Math.min(100, Math.round(a.congestionPercent + jitter)));
                    return { ...a, congestionPercent: next };
                  }),
                }));
              }}
            >
              Dernière mise à jour à l'instant
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 relative h-[400px] rounded-lg overflow-hidden bg-surface-container shadow-sm">
            <img
              alt="Map view"
              className="w-full h-full object-cover grayscale opacity-40 mix-blend-multiply"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1XpShQX1WMG6T6AW_2POGOFpJ6G1-NLJ__Ll9UnuNe2GFKEEsMOlyp8f7n3WJzXmmYMsHaWuAj8LfnVN5pQYIa3dEIPD1Sfr3R9s3cPJOyA-NRZ-4KPY6-MpM8c4mh1y2IEIS6j43fqhQ1EXXaI5qpGBhucVOookZ72oTWW8OdUG5BZdC6TnkdMDRealMGBBM310SyrYIlQuzhSNRM3j7Dr7M88xw_Gr9MTncELDqWamH0X0QxWP6N8p-TzB_Evjo_Xz7iCO-71w"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/85 backdrop-blur-[20px] p-6 rounded-lg border border-white/20">
              <div className="flex justify-between items-end">
                <div>
                  <span className="label-sm text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-1 block">
                    STATUT GLOBAL
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {data.headline}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black tracking-tighter">
                    {data.delayPercent}
                  </span>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
                    DE RETARD
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.04)] flex-1">
              <span className="material-symbols-outlined text-4xl mb-4">cloud</span>
              <h4 className="text-lg font-bold mb-1">Ciel Voilé</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Visibilité optimale sur l'ensemble du réseau urbain.
              </p>
            </div>

            <button
              type="button"
              className="bg-primary text-on-primary-container p-6 rounded-lg flex-1 flex flex-col justify-between"
              onClick={() => router.push("/routes")}
              aria-label="Calculer l'itinéraire"
            >
              <span className="material-symbols-outlined text-4xl">alt_route</span>
              <div>
                <h4 className="text-lg font-bold">Calculer l'itinéraire</h4>
                <p className="text-xs opacity-60">Évitez les zones congestionnées</p>
              </div>
            </button>
          </div>
        </div>

        <section className="mb-12">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Axes principaux</h2>
            <span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant">
              {axes.length} AXES SURVEILLÉS
            </span>
          </div>

          <div className="space-y-10">
            {axes.map((axis) => {
              const barClassName =
                axis.id === "pdg"
                  ? "absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-700"
                  : axis.id === "adn"
                    ? "absolute top-0 left-0 h-full bg-primary/40 rounded-full transition-all duration-700"
                    : "absolute top-0 left-0 h-full bg-primary/10 rounded-full transition-all duration-700";

              return (
                <div key={axis.id} className="group">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center font-bold text-xs">
                        {axis.code}
                      </span>
                      <div>
                        <h3 className="font-bold text-lg">{axis.name}</h3>
                        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                          {axis.path}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-xl tracking-tighter">
                        {axis.status}
                      </span>
                    </div>
                  </div>

                  <div className="relative h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={barClassName}
                      style={{ width: `${axis.congestionPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      {axis.congestionPercent}% Congestion
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Temps estimé : {axis.eta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
