export type LedMode = "AUTO" | "GREEN" | "RED";

export interface RfidLog {
  id: number;
  uid: string;
  vehicle: string;
  authorized: boolean;
  gate: "OPEN" | "CLOSED";
  time: string;
}

export interface WeightLog {
  id: number;
  weight: number;
  limit: number;
  status: "NORMAL" | "OVERLOAD";
  buzzer: boolean;
  led: "GREEN" | "RED" | "OFF";
  time: string;
}

export const WEIGHT_MAX = 5000;

export function formatTime(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`;
}

export function prettyUid(uid: string) {
  return (uid.match(/.{1,2}/g) ?? [uid]).join(" ").toUpperCase();
}

export function prettyVehicle(v: string) {
  const m = v.replace(/\s/g, "").match(/^([A-Z]{2})(\d{2})([A-Z]{1,2})(\d{4})$/i);
  return m ? `${m[1]} ${m[2]} ${m[3]} ${m[4]}`.toUpperCase() : v;
}
