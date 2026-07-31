import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Gauge, ShieldCheck, Truck } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Led } from "@/components/Led";
import { PageHeader } from "@/components/PageHeader";
import { RfidTable } from "@/components/RfidTable";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTelemetry } from "@/lib/telemetry";
import { prettyVehicle } from "@/lib/telemetry-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Truck Gate & Load Monitoring Dashboard" },
      {
        name: "description",
        content:
          "Real-time industrial control room for RFID truck gate access and load cell weight monitoring over MQTT.",
      },
      { property: "og:title", content: "Smart Truck Gate & Load Monitoring Dashboard" },
      {
        property: "og:description",
        content: "Live RFID gate access and truck load telemetry in one industrial dashboard.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { rfid, weight, limit, loading, chartData, rfidHistory, connected } = useTelemetry();
  const overload = (weight?.weight ?? 0) > limit;

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Control Room Overview" subtitle="Gate access and load telemetry at a glance" />

      <div className="grid gap-4 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Last Vehicle" icon={<Truck className="size-4" />} loading={loading} delay={0}>
            <p className="font-mono text-xl font-semibold">
              {rfid ? prettyVehicle(rfid.vehicle) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">{rfid?.time}</p>
          </StatCard>

          <StatCard label="Gate Status" icon={<ShieldCheck className="size-4" />} loading={loading} delay={0.05}>
            <p
              className={`font-display text-3xl font-bold ${rfid?.gate === "OPEN" ? "text-success" : "text-destructive"}`}
            >
              {rfid?.gate ?? "—"}
            </p>
          </StatCard>

          <StatCard label="Current Weight" icon={<Gauge className="size-4" />} loading={loading} delay={0.1}>
            <p className="font-mono text-3xl font-bold text-primary text-glow-primary">
              <AnimatedNumber value={weight?.weight ?? 0} /> g
            </p>
            <p className="text-xs text-muted-foreground">Limit {limit} g</p>
          </StatCard>

          <StatCard label="Load Status" icon={<Activity className="size-4" />} loading={loading} delay={0.15}>
            <Badge
              variant="outline"
              className={
                overload
                  ? "border-destructive/40 bg-destructive/15 text-destructive"
                  : "border-success/40 bg-success/15 text-success"
              }
            >
              {overload ? "OVERLOAD" : "NORMAL"}
            </Badge>
            <div className="mt-3 flex gap-4">
              <Led on={!overload} color="green" size="sm" label="G" />
              <Led on={overload} color="red" size="sm" label="R" />
            </div>
          </StatCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <Card className="card-industrial gap-3 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Live Load Trend</h2>
              <span className="text-xs text-muted-foreground">
                {connected ? "streaming" : "link down"}
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" hide />
                  <YAxis width={40} stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#loadFill)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <Link to="/load" className="text-xs text-primary underline-offset-4 hover:underline">
              Open load cell dashboard →
            </Link>
          </Card>

          <RfidTable logs={rfidHistory} loading={loading} pageSize={5} title="Recent Scans" />
        </div>
      </div>
    </div>
  );
}
