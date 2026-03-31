export type RecStop = {
  id: string;
  t: number;
};

export type RecSession = {
  id: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  distanceKm: number;
  gpsPoints: number;
  stops: RecStop[];
};

const STORAGE_KEY = "rakpa:recSessions";

export function loadRecSessions(): RecSession[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecSession[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveRecSessions(sessions: RecSession[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function addRecSession(session: RecSession) {
  const current = loadRecSessions();
  saveRecSessions([session, ...current]);
}

export function formatTimer(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
