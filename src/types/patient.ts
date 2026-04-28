export interface RefillLog {
  timestamp: number;
  volume: number;
}

export interface Patient {
  id: string;
  name: string;
  room: string;
  totalVolume: number; // ml
  startTime: number; // timestamp ms
  durationMs: number; // total time for the bag to deplete
  refills: RefillLog[];
  acknowledged: "none" | "warning" | "critical";
}

export type Status = "normal" | "warning" | "critical" | "empty";

export function getRemaining(p: Patient, now: number) {
  const elapsed = now - p.startTime;
  const remainingMs = Math.max(0, p.durationMs - elapsed);
  const remainingPct = p.durationMs === 0 ? 0 : remainingMs / p.durationMs;
  const remainingVolume = p.totalVolume * remainingPct;
  return { remainingMs, remainingPct, remainingVolume };
}

export function getStatus(pct: number): Status {
  if (pct <= 0) return "empty";
  if (pct <= 0.1) return "critical";
  if (pct <= 0.2) return "warning";
  return "normal";
}

export function formatDuration(ms: number) {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
