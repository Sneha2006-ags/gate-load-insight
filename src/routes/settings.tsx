import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Database, Radio, Server, Timer, Wifi } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTelemetry } from "@/lib/telemetry";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "System Settings | Smart Truck Gate" },
      {
        name: "description",
        content:
          "Configure the Flask backend endpoint and inspect MQTT broker, WiFi, database and ESP32 node health.",
      },
      { property: "og:title", content: "System Settings | Smart Truck Gate" },
      {
        property: "og:description",
        content: "Backend endpoint configuration and live system health for the truck gate rig.",
      },
    ],
  }),
  component: SettingsPage,
});

function uptimeLabel(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m ${s % 60}s`;
}

function SettingsPage() {
  const { connected, apiBase, setApiBase, mode, uptimeSeconds } = useTelemetry();
  const [draft, setDraft] = useState(apiBase);

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="System Settings" subtitle="Raspberry Pi broker · Flask API · SQLite" />

      <div className="grid gap-4 p-4 sm:p-6">
        <Card className="card-industrial gap-4 rounded-2xl p-5">
          <div>
            <h2 className="font-display text-base font-semibold">Backend Endpoint</h2>
            <p className="text-xs text-muted-foreground">
              Leave empty to run on simulated telemetry. Point it at your Pi (e.g.
              http://192.168.1.42:5000) to use the live Flask API.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Flask API base URL</Label>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="http://raspberrypi.local:5000"
                className="font-mono"
              />
            </div>
            <Button className="self-end" onClick={() => setApiBase(draft)}>
              Save
            </Button>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Active source: {mode.toUpperCase()} {apiBase && `· ${apiBase}`}
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="MQTT Status" icon={<Radio className="size-4" />}>
            <p className={`font-display text-2xl font-bold ${connected ? "text-success" : "text-destructive"}`}>
              {connected ? "CONNECTED" : "DISCONNECTED"}
            </p>
          </StatCard>
          <StatCard label="Broker IP" icon={<Server className="size-4" />} delay={0.05}>
            <p className="font-mono text-2xl font-bold">192.168.1.42:1883</p>
            <p className="text-xs text-muted-foreground">Mosquitto on Raspberry Pi</p>
          </StatCard>
          <StatCard label="WiFi Status" icon={<Wifi className="size-4" />} delay={0.1}>
            <p className="font-display text-2xl font-bold text-success">STRONG</p>
            <p className="text-xs text-muted-foreground">SSID: FACTORY_IOT · -52 dBm</p>
          </StatCard>
          <StatCard label="Database Status" icon={<Database className="size-4" />} delay={0.15}>
            <p className="font-display text-2xl font-bold text-success">ONLINE</p>
            <p className="text-xs text-muted-foreground">SQLite · truck_gate.db</p>
          </StatCard>
          <StatCard label="ESP32 Status" icon={<Cpu className="size-4" />} delay={0.2}>
            <p className="font-mono text-sm">
              <span className="text-success">●</span> Gate node #1 online
            </p>
            <p className="font-mono text-sm">
              <span className="text-success">●</span> Load node #2 online
            </p>
          </StatCard>
          <StatCard label="System Uptime" icon={<Timer className="size-4" />} delay={0.25}>
            <p className="font-mono text-2xl font-bold">{uptimeLabel(uptimeSeconds)}</p>
          </StatCard>
        </div>

        <Card className="card-industrial gap-2 rounded-2xl p-5">
          <h2 className="font-display text-base font-semibold">MQTT Topics</h2>
          <div className="grid gap-2 font-mono text-xs text-muted-foreground sm:grid-cols-2">
            <p>SUB truck/scan</p>
            <p>PUB truck/buzzer/control</p>
            <p>SUB truck/scan/result</p>
            <p>PUB truck/weight/limit</p>
            <p>SUB truck/weight</p>
            <p>PUB truck/weight/led</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
