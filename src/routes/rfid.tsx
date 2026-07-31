import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, DoorOpen, Lightbulb, ScanLine, ShieldCheck, Truck } from "lucide-react";
import { motion } from "motion/react";
import { Led } from "@/components/Led";
import { PageHeader } from "@/components/PageHeader";
import { RfidTable } from "@/components/RfidTable";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { useTelemetry } from "@/lib/telemetry";
import { prettyUid, prettyVehicle } from "@/lib/telemetry-types";

export const Route = createFileRoute("/rfid")({
  head: () => ({
    meta: [
      { title: "RFID Gate Monitoring | Smart Truck Gate" },
      {
        name: "description",
        content:
          "Live RFID truck gate dashboard: UID reads, vehicle authorization, gate state and scan history over MQTT.",
      },
      { property: "og:title", content: "RFID Gate Monitoring | Smart Truck Gate" },
      {
        property: "og:description",
        content: "Live RFID reads, authorization decisions and gate state for every truck.",
      },
    ],
  }),
  component: RfidPage,
});

function RfidPage() {
  const { rfid, rfidHistory, loading } = useTelemetry();
  const open = rfid?.gate === "OPEN";

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Smart Truck Gate Monitoring" subtitle="ESP32 #1 · RFID gate node" />

      <div className="grid gap-4 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="RFID UID" icon={<ScanLine className="size-4" />} loading={loading}>
            <p className="font-mono text-2xl font-bold tracking-[0.2em]">
              {rfid ? prettyUid(rfid.uid) : "—"}
            </p>
          </StatCard>

          <StatCard label="Vehicle Number" icon={<Truck className="size-4" />} loading={loading} delay={0.05}>
            <p className="font-mono text-2xl font-bold">{rfid ? prettyVehicle(rfid.vehicle) : "—"}</p>
          </StatCard>

          <StatCard label="Authorization" icon={<ShieldCheck className="size-4" />} loading={loading} delay={0.1}>
            <Badge
              variant="outline"
              className={
                rfid?.authorized
                  ? "border-success/40 bg-success/15 px-4 py-1.5 text-sm text-success"
                  : "border-destructive/40 bg-destructive/15 px-4 py-1.5 text-sm text-destructive"
              }
            >
              {rfid?.authorized ? "Authorized" : "Unauthorized"}
            </Badge>
          </StatCard>

          <StatCard label="Gate Status" icon={<DoorOpen className="size-4" />} loading={loading} delay={0.15}>
            <div className="flex items-center gap-4">
              <p
                className={`font-display text-4xl font-bold ${open ? "text-success" : "text-destructive"}`}
              >
                {rfid?.gate ?? "—"}
              </p>
              <div className="relative h-12 w-20 overflow-hidden rounded-md border border-border bg-panel">
                <motion.div
                  className="absolute inset-x-0 top-0 bg-primary/60"
                  animate={{ height: open ? "12%" : "100%" }}
                  transition={{ type: "spring", stiffness: 90, damping: 16 }}
                />
                <div className="absolute inset-0 grid grid-rows-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="border-b border-background/40" />
                  ))}
                </div>
              </div>
            </div>
          </StatCard>

          <StatCard label="Gate Green LED" icon={<Lightbulb className="size-4" />} loading={loading} delay={0.2}>
            <Led on={!!rfid?.authorized} color="green" label={rfid?.authorized ? "ON" : "OFF"} />
          </StatCard>

          <StatCard label="Gate Red LED" icon={<CreditCard className="size-4" />} loading={loading} delay={0.25}>
            <Led on={rfid ? !rfid.authorized : false} color="red" label={rfid && !rfid.authorized ? "ON" : "OFF"} />
          </StatCard>
        </div>

        <RfidTable logs={rfidHistory} loading={loading} />
      </div>
    </div>
  );
}
