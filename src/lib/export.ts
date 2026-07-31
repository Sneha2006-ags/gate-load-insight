import type { RfidLog, WeightLog } from "./telemetry-types";

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(name: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  download(name, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

export async function exportPdf(
  name: string,
  title: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const [{ jsPDF }, autoTableMod] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleString(), 14, 22);
  autoTableMod.default(doc, {
    head: [headers],
    body: rows.map((r) => r.map(String)),
    startY: 28,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });
  doc.save(name);
}

export const rfidHeaders = ["Time", "RFID UID", "Vehicle Number", "Authorized", "Gate Status"];
export const rfidRows = (logs: RfidLog[]) =>
  logs.map((l) => [l.time, l.uid, l.vehicle, l.authorized ? "YES" : "NO", l.gate]);

export const weightHeaders = ["Timestamp", "Weight (g)", "Status", "Buzzer", "LED", "Limit (g)"];
export const weightRows = (logs: WeightLog[]) =>
  logs.map((l) => [l.time, l.weight, l.status, l.buzzer ? "ON" : "OFF", l.led, l.limit]);
