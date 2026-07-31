import { createFileRoute } from "@tanstack/react-router";
import { FileDown } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RfidTable } from "@/components/RfidTable";
import { WeightTable } from "@/components/WeightTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  exportPdf,
  rfidHeaders,
  rfidRows,
  weightHeaders,
  weightRows,
} from "@/lib/export";
import { useTelemetry } from "@/lib/telemetry";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Telemetry History | Smart Truck Gate" },
      {
        name: "description",
        content:
          "Search, filter and export historical RFID gate scans and truck weight logs as CSV or PDF reports.",
      },
      { property: "og:title", content: "Telemetry History | Smart Truck Gate" },
      {
        property: "og:description",
        content: "Historical gate and load records with date, vehicle and weight filters.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { rfidHistory, weightHistory, loading } = useTelemetry();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");

  const inRange = (time: string) => {
    const day = time.slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  };

  const rfidFiltered = useMemo(
    () =>
      rfidHistory.filter(
        (l) =>
          inRange(l.time) &&
          (vehicle ? l.vehicle.toLowerCase().includes(vehicle.trim().toLowerCase()) : true),
      ),
    [rfidHistory, from, to, vehicle],
  );

  const weightFiltered = useMemo(
    () =>
      weightHistory.filter(
        (l) =>
          inRange(l.time) &&
          (minWeight ? l.weight >= Number(minWeight) : true) &&
          (maxWeight ? l.weight <= Number(maxWeight) : true),
      ),
    [weightHistory, from, to, minWeight, maxWeight],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Historical Records" subtitle="SQLite archive · rfid_logs & weight_logs" />

      <div className="grid gap-4 p-4 sm:p-6">
        <Card className="card-industrial gap-4 rounded-2xl p-5">
          <h2 className="font-display text-base font-semibold">Filters</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">From date</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">To date</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Vehicle</Label>
              <Input
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="KA01AB1234"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Min weight (g)</Label>
              <Input
                type="number"
                value={minWeight}
                onChange={(e) => setMinWeight(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Max weight (g)</Label>
              <Input
                type="number"
                value={maxWeight}
                onChange={(e) => setMaxWeight(e.target.value)}
                placeholder="5000"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                void exportPdf(
                  "rfid_history.pdf",
                  "RFID Gate History",
                  rfidHeaders,
                  rfidRows(rfidFiltered),
                )
              }
            >
              <FileDown className="size-4" /> RFID PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                void exportPdf(
                  "weight_history.pdf",
                  "Truck Weight History",
                  weightHeaders,
                  weightRows(weightFiltered),
                )
              }
            >
              <FileDown className="size-4" /> Weight PDF
            </Button>
          </div>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <RfidTable logs={rfidFiltered} loading={loading} pageSize={7} title="RFID History" />
          <WeightTable logs={weightFiltered} loading={loading} pageSize={7} title="Weight History" />
        </div>
      </div>
    </div>
  );
}
