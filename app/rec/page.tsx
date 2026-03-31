"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createId } from "@/lib/id";
import { addRecSession, formatTimer } from "@/lib/recSessions";

export default function Page() {
  const router = useRouter();
  const initialElapsedSeconds = 12 * 60 + 45;
  const startedAtRef = useRef(Date.now() - initialElapsedSeconds * 1000);
  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds);
  const [distanceKm, setDistanceKm] = useState(4.82);
  const [gpsPoints, setGpsPoints] = useState(1204);
  const stopsRef = useRef<{ id: string; t: number }[]>([]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      setDistanceKm((prevDistance) => prevDistance + 0.01);
      setGpsPoints((prevGpsPoints) => prevGpsPoints + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="h-full overflow-hidden flex flex-col bg-black text-white">
      <header className="flex justify-between items-center px-6 py-8 w-full">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-zinc-500 mb-1">
            Session Active
          </span>
          <h1 className="font-black text-2xl tracking-tighter uppercase italic">
            Rakpa REC
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400">
            ENREGISTREMENT
          </span>
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-between px-8 pb-12">
        <section className="flex flex-col items-center justify-center flex-grow py-12">
          <div className="relative flex flex-col items-center">
            <div className="absolute -top-12 -left-12 opacity-5 pointer-events-none select-none">
              <span className="text-[12rem] font-black italic leading-none">
                REC
              </span>
            </div>
            <h2 className="text-[8rem] md:text-[12rem] font-bold tracking-tighter leading-none mb-4 font-headline">
              {formatTimer(elapsedSeconds)}
            </h2>
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="text-xs font-medium tracking-widest uppercase">
                Temps de parcours
              </span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 mb-12">
          <div className="glass-effect glow-border rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase mb-2">
              Distance (km)
            </span>
            <span className="text-4xl font-bold tracking-tight">{distanceKm.toFixed(2)}</span>
          </div>

          <div className="glass-effect glow-border rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase mb-2">
              Points GPS
            </span>
            <span className="text-4xl font-bold tracking-tight">
              {gpsPoints.toLocaleString("fr-FR")}
            </span>
          </div>
        </section>

        <section className="flex flex-col items-center gap-8">
          <button
            className="group relative flex flex-col items-center justify-center"
            onClick={() => {
              stopsRef.current = [...stopsRef.current, { id: createId("stop"), t: elapsedSeconds }];
            }}
          >
            <div className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-transform duration-300 group-active:scale-90">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'wght' 400" }}
              >
                add
              </span>
            </div>
            <span className="mt-4 text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">
              Marquer un arrêt
            </span>
          </button>

          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img
              alt="Rakpa logo"
              className="w-full h-full object-contain p-1"
              src="/rakpa-logo.png"
            />
          </div>

          <div className="w-full h-24 rounded-lg overflow-hidden relative opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCohPn_GGHaKLT4XnnJDuwP70XQH3nJaXMZsoomnQgwTFzVyeCsBLeXl7HU1b9jPlDEGbKChRKq5HPEvFao0Vbwyy9VU67jqGc7ZuYRK7Z0PtVAkWdnlYtIXKltOzUS3gklMRr8RiC8UrFjauHuTng5ADR_aY5FBG1UnJg3WPBShhzEW7MZBTX7mf-JtCujlneGzXz2yHZmwuyLy9nbpLOTlUngEMzeGTAdPC4BJBaERjgTYcCtbsZy5NbbAUuFaTflSNZghwZXmQ8"
              alt="Map Context"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-white">
                location_on
              </span>
              <span className="text-[10px] font-medium text-white tracking-wider">
                Rue de Rivoli, Paris
              </span>
            </div>
          </div>

          <button
            className="w-full h-20 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold text-lg tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-3"
            onClick={() => {
              const endedAt = Date.now();

              addRecSession({
                id: createId("rec"),
                startedAt: startedAtRef.current,
                endedAt,
                durationSeconds: elapsedSeconds,
                distanceKm,
                gpsPoints,
                stops: stopsRef.current,
              });

              router.push("/profile");
            }}
          >
            <span>Terminer</span>
            <span className="material-symbols-outlined">check_circle</span>
          </button>
        </section>
      </main>

      <footer className="px-8 py-6 border-t border-zinc-900 flex justify-between items-center opacity-30">
        <div className="text-[8px] font-mono tracking-tighter">
          COORD: 48.8566 N, 2.3522 E
        </div>
        <div className="text-[8px] font-mono tracking-tighter uppercase">
          RAKPA ENGINE v2.04
        </div>
      </footer>
    </div>
  );
}
