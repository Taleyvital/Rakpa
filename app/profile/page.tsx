"use client";

import { useEffect, useState } from "react";
import type { RecSession } from "@/lib/recSessions";
import { formatTimer, loadRecSessions } from "@/lib/recSessions";

export default function Page() {
  const [sessions, setSessions] = useState<RecSession[]>([]);

  useEffect(() => {
    setSessions(loadRecSessions());
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-background pt-24 px-6 max-w-2xl mx-auto w-full">
      <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">Profil</h1>
      <p className="text-on-surface-variant text-sm font-medium tracking-wide">
        Historique des trajets enregistrés.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="bg-surface-container-lowest rounded-lg p-8 flex flex-col gap-6 border border-outline-variant/5"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-title-md font-bold">Session REC</h3>
                <p className="text-label-sm text-outline tracking-wider uppercase">
                  {new Date(s.endedAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {formatTimer(s.durationSeconds)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-medium tracking-widest text-outline uppercase mb-2">
                  Distance (km)
                </span>
                <span className="text-3xl font-black tracking-tight">{s.distanceKm.toFixed(2)}</span>
              </div>
              <div className="bg-surface-container-low rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-medium tracking-widest text-outline uppercase mb-2">
                  Points GPS
                </span>
                <span className="text-3xl font-black tracking-tight">
                  {s.gpsPoints.toLocaleString("fr-FR")}
                </span>
              </div>
            </div>

            <div className="pt-6 mt-2 border-t border-outline-variant/10 flex items-center justify-between">
              <span className="text-body-md text-on-surface-variant">
                Arrêts marqués : {s.stops.length}
              </span>
              <span className="text-body-md text-on-surface-variant">
                ID: {s.id}
              </span>
            </div>
          </div>
        ))}

        {sessions.length === 0 ? (
          <div className="text-on-surface-variant text-sm font-medium tracking-wide">
            Aucun trajet enregistré.
          </div>
        ) : null}
      </div>
    </div>
  );
}
