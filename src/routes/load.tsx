import { createFileRoute } from "@tanstack/react-router";
import { Gauge, Lightbulb, Scale, SlidersHorizontal, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Led } from "@/components/Led";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { WeightGauge } from "@/components/WeightGauge";
import { WeightTable } from "@/components/WeightTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTelemetry } from "@/lib/telemetry";
import { WEIGHT_MAX, type LedMode } from "@/lib/telemetry-types";

export const Route = createFileRoute("/load")({
  head: () => ({
    meta: [
      { title: "Truck Load Monitoring | Smart Truck Gate" },
      {
        name: "description",
        content:
          "Live load cell dashboard with circular gauge, overload alerts, buzzer and LED control published over MQTT.",
      },
      { property: "og:title", content: "Truck Load Monitoring | Smart Truck Gate" },
      {
        property: "og:description",
        content: "Real-time truck weight, overload detection and remote buzzer/LED control.",
      },
    ],
  }),
  component: LoadPage,
});

const LED_MODES: LedMode[] = ["AUTO", "GREEN", "RED"];

function LoadPage() {
  const {
    weight,
    weightHistory,
    chartData,
    loading,
    limit,
    buzzer,
    ledMode,
    publishLimit,
    publishBuzzer,
    publishLed,
  } = useTelemetry();

  const current = weight?.weight ?? 0;
  const overload = current > limit;
  const greenOn = ledMode === "GREEN" || (ledMode === "AUTO" && !overload);
  const redOn = ledMode === "RED" || (ledMode === "AUTO" && overload);
  const buzzerOn = buzzer || overload;

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Truck Load Monitoring" subtitle="ESP32 #2 · HX711 load cell node" />

      <div className="grid gap-4 p-4 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Card className="card-industrial items-center gap-2 rounded-3xl p-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Current Weight
            </p>
            {loading ? (
              <Skeleton className="h-24 w-64" />
            ) : (
              <p className="font-mono text-6xl font-bold text-primary text-glow-primary sm:text-7xl">
                <AnimatedNumber value={current} />
                <span className="ml-2 text-2xl text-muted-foreground">g</span>
              </p>
            )}
            <motion.div
              key={overload ? "over" : "normal"}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-2"
            >
              <Badge
                variant="outline"
                className={
                  overload
                    ? "border-destructive/50 bg-destructive/15 px-6 py-2 text-base font-bold text-destructive"
                    : "border-success/50 bg-success/15 px-6 py-2 text-base font-bold text-success"
                }
              >
                {overload ? "OVERLOAD" : "NORMAL"}
              </Badge>
            </motion.div>
          </Card>

          <Card className="card-industrial gap-2 rounded-3xl p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Load Gauge · 0–{WEIGHT_MAX} g
            </p>
            <WeightGauge weight={current} limit={limit} />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Current Limit" icon={<Scale className="size-4" />} loading={loading}>
            <p className="font-mono text-3xl font-bold">{limit} g</p>
          </StatCard>

          <StatCard label="Buzzer Status" icon={<Volume2 className="size-4" />} loading={loading} delay={0.05}>
            <div className="flex items-center gap-3">
              <motion.span
                animate={buzzerOn ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                transition={{ duration: 0.7, repeat: buzzerOn ? Infinity : 0 }}
                className={`grid size-10 place-items-center rounded-xl ${buzzerOn ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"}`}
              >
                <Volume2 className="size-5" />
              </motion.span>
              <span className="font-display text-2xl font-bold">{buzzerOn ? "ON" : "OFF"}</span>
            </div>
          </StatCard>

          <StatCard label="Weight Green LED" icon={<Lightbulb className="size-4" />} loading={loading} delay={0.1}>
            <Led on={greenOn} color="green" label={greenOn ? "ON" : "OFF"} />
          </StatCard>

          <StatCard label="Weight Red LED" icon={<Lightbulb className="size-4" />} loading={loading} delay={0.15}>
            <Led on={redOn} color="red" label={redOn ? "ON" : "OFF"} />
          </StatCard>
        </div>

        <Card className="card-industrial gap-4 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Live Weight Chart</h2>
            <span className="text-xs text-muted-foreground">latest 100 readings</span>
          </div>
          <div className="h-72">
            {loading ? (
              <Skeleton className="size-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={10} minTickGap={40} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[0, WEIGHT_MAX]} width={48} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="limit"
                    stroke="var(--destructive)"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="card-industrial gap-6 rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <h2 className="font-display text-base font-semibold">Node Controls</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Weight Limit · truck/weight/limit
              </Label>
              <Slider
                value={[limit]}
                min={0}
                max={WEIGHT_MAX}
                step={10}
                onValueChange={(v) => publishLimit(v[0] ?? 0)}
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={WEIGHT_MAX}
                  value={limit}
                  onChange={(e) =>
                    publishLimit(Math.max(0, Math.min(WEIGHT_MAX, Number(e.target.value) || 0)))
                  }
                  className="font-mono"
                />
                <span className="text-sm text-muted-foreground">g</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Buzzer · truck/buzzer/control
              </Label>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-panel/50 px-4 py-3">
                <Switch checked={buzzer} onCheckedChange={publishBuzzer} />
                <span className="font-mono text-sm">{buzzer ? "ON" : "OFF"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                LED Mode · truck/weight/led
              </Label>
              <div className="flex flex-wrap gap-2">
                {LED_MODES.map((m) => (
                  <Button
                    key={m}
                    size="sm"
                    variant={ledMode === m ? "default" : "outline"}
                    onClick={() => publishLed(m)}
                  >
                    {m}
                  </Button>
                ))}
              </div>
              <div className="flex gap-6 pt-1">
                <Led on={greenOn} color="green" size="sm" label={`Green ${greenOn ? "ON" : "OFF"}`} />
                <Led on={redOn} color="red" size="sm" label={`Red ${redOn ? "ON" : "OFF"}`} />
              </div>
            </div>
          </div>
        </Card>

        <WeightTable logs={weightHistory} loading={loading} />

        <p className="flex items-center gap-2 pb-4 text-xs text-muted-foreground">
          <Gauge className="size-3.5" /> Readings update every 400 ms from the load cell node.
        </p>
      </div>
    </div>
  );
}
