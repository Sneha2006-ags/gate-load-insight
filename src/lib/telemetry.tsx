import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  formatTime,
  WEIGHT_MAX,
  type LedMode,
  type RfidLog,
  type WeightLog,
} from "./telemetry-types";

const API_KEY_STORAGE = "stg.apiBase";

interface TelemetryValue {
  connected: boolean;
  loading: boolean;
  apiBase: string;
  setApiBase: (v: string) => void;
  mode: "simulated" | "live";
  rfid: RfidLog | null;
  rfidHistory: RfidLog[];
  weight: WeightLog | null;
  weightHistory: WeightLog[];
  chartData: { t: string; weight: number; limit: number }[];
  limit: number;
  buzzer: boolean;
  ledMode: LedMode;
  uptimeSeconds: number;
  publishLimit: (v: number) => void;
  publishBuzzer: (v: boolean) => void;
  publishLed: (v: LedMode) => void;
}

const TelemetryContext = createContext<TelemetryValue | null>(null);

const VEHICLES: { uid: string; vehicle: string; authorized: boolean }[] = [
  { uid: "04A8C392", vehicle: "KA01AB1234", authorized: true },
  { uid: "1B7F20D4", vehicle: "MH12XY8890", authorized: true },
  { uid: "9CE41A05", vehicle: "TN09QR4521", authorized: false },
  { uid: "72D3B8F1", vehicle: "KA05CD7788", authorized: true },
  { uid: "3F0A6C27", vehicle: "AP16ZZ1002", authorized: false },
  { uid: "58B1E9AA", vehicle: "GJ18KL3344", authorized: true },
];

function seedRfid(count: number): RfidLog[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const v = VEHICLES[(i * 3 + 1) % VEHICLES.length]!;
    return {
      id: now - i * 1000,
      uid: v.uid,
      vehicle: v.vehicle,
      authorized: v.authorized,
      gate: v.authorized ? ("OPEN" as const) : ("CLOSED" as const),
      time: formatTime(new Date(now - i * 1000 * 240)),
    };
  });
}

function seedWeight(count: number, limit: number): WeightLog[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const weight = Math.round((650 + Math.sin(i / 6) * 180 + (i % 11) * 6) * 10) / 10;
    const over = weight > limit;
    return {
      id: now - i * 1000,
      weight,
      limit,
      status: over ? ("OVERLOAD" as const) : ("NORMAL" as const),
      buzzer: over,
      led: over ? ("RED" as const) : ("GREEN" as const),
      time: formatTime(new Date(now - i * 4000)),
    };
  }).reverse();
}

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [apiBase, setApiBaseState] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [limit, setLimit] = useState(800);
  const [buzzer, setBuzzer] = useState(false);
  const [ledMode, setLedMode] = useState<LedMode>("AUTO");
  const [rfid, setRfid] = useState<RfidLog | null>(null);
  const [rfidHistory, setRfidHistory] = useState<RfidLog[]>([]);
  const [weight, setWeight] = useState<WeightLog | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  const limitRef = useRef(limit);
  const buzzerRef = useRef(buzzer);
  const ledRef = useRef<LedMode>(ledMode);
  const overloadRef = useRef(false);
  const driftRef = useRef(700);
  limitRef.current = limit;
  buzzerRef.current = buzzer;
  ledRef.current = ledMode;

  const mode: "simulated" | "live" = apiBase ? "live" : "simulated";

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(API_KEY_STORAGE) : "";
    if (stored) setApiBaseState(stored);
  }, []);

  const setApiBase = useCallback((v: string) => {
    const clean = v.trim().replace(/\/$/, "");
    setApiBaseState(clean);
    window.localStorage.setItem(API_KEY_STORAGE, clean);
    toast.info(clean ? `Backend set to ${clean}` : "Switched to simulated telemetry");
  }, []);

  // Bootstrap data
  useEffect(() => {
    const seededRfid = seedRfid(24);
    const seededWeight = seedWeight(120, 800);
    const t = window.setTimeout(() => {
      setRfidHistory(seededRfid);
      setRfid(seededRfid[0] ?? null);
      setWeightHistory(seededWeight);
      setWeight(seededWeight[seededWeight.length - 1] ?? null);
      setLoading(false);
      setConnected(true);
      toast.success("MQTT Connected", { description: "Broker link established" });
    }, 700);
    return () => window.clearTimeout(t);
  }, []);

  // Uptime ticker
  useEffect(() => {
    const i = window.setInterval(() => setUptimeSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(i);
  }, []);

  // Weight stream
  useEffect(() => {
    if (loading) return;
    const i = window.setInterval(() => {
      driftRef.current += (Math.random() - 0.46) * 55;
      driftRef.current = Math.max(0, Math.min(WEIGHT_MAX, driftRef.current));
      const value = Math.round(driftRef.current * 10) / 10;
      const lim = limitRef.current;
      const over = value > lim;
      const led: WeightLog["led"] =
        ledRef.current === "AUTO" ? (over ? "RED" : "GREEN") : ledRef.current;
      const reading: WeightLog = {
        id: Date.now(),
        weight: value,
        limit: lim,
        status: over ? "OVERLOAD" : "NORMAL",
        buzzer: buzzerRef.current || over,
        led,
        time: formatTime(new Date()),
      };
      setWeight(reading);
      setWeightHistory((h) => [...h, reading].slice(-400));

      if (over && !overloadRef.current) {
        overloadRef.current = true;
        toast.error("Overload Detected", { description: `${value} g exceeds ${lim} g limit` });
      } else if (!over && overloadRef.current) {
        overloadRef.current = false;
        toast.success("Weight Returned to Normal", { description: `${value} g` });
      }
    }, 400);
    return () => window.clearInterval(i);
  }, [loading]);

  // RFID scan stream
  useEffect(() => {
    if (loading) return;
    const i = window.setInterval(() => {
      const v = VEHICLES[Math.floor(Math.random() * VEHICLES.length)]!;
      const scan: RfidLog = {
        id: Date.now(),
        uid: v.uid,
        vehicle: v.vehicle,
        authorized: v.authorized,
        gate: v.authorized ? "OPEN" : "CLOSED",
        time: formatTime(new Date()),
      };
      setRfid(scan);
      setRfidHistory((h) => [scan, ...h].slice(0, 250));
      if (v.authorized) {
        toast.success("Vehicle Authorized", { description: `${v.vehicle} — gate opening` });
      } else {
        toast.error("Vehicle Unauthorized", { description: `${v.vehicle} — gate locked` });
      }
    }, 9000);
    return () => window.clearInterval(i);
  }, [loading]);

  // Link flicker simulation
  useEffect(() => {
    if (loading) return;
    const i = window.setInterval(() => {
      if (Math.random() < 0.06) {
        setConnected(false);
        toast.warning("MQTT Disconnected", { description: "Reconnecting to broker…" });
        window.setTimeout(() => {
          setConnected(true);
          toast.success("MQTT Connected", { description: "Broker link restored" });
        }, 3000);
      }
    }, 25000);
    return () => window.clearInterval(i);
  }, [loading]);

  const post = useCallback(
    async (path: string, body: unknown, topic: string) => {
      toast.info(`Published ${topic}`, { description: JSON.stringify(body) });
      if (!apiBase) return;
      try {
        await fetch(`${apiBase}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch {
        toast.error("Backend unreachable", { description: `${apiBase}${path}` });
      }
    },
    [apiBase],
  );

  const publishLimit = useCallback(
    (v: number) => {
      setLimit(v);
      void post("/api/weight/limit", { limit: v }, "truck/weight/limit");
    },
    [post],
  );

  const publishBuzzer = useCallback(
    (v: boolean) => {
      setBuzzer(v);
      void post("/api/buzzer", { buzzer: v }, "truck/buzzer/control");
    },
    [post],
  );

  const publishLed = useCallback(
    (v: LedMode) => {
      setLedMode(v);
      void post("/api/led", { led: v }, "truck/weight/led");
    },
    [post],
  );

  const chartData = useMemo(
    () =>
      weightHistory.slice(-100).map((w) => ({
        t: w.time.slice(11),
        weight: w.weight,
        limit: w.limit,
      })),
    [weightHistory],
  );

  const value: TelemetryValue = {
    connected,
    loading,
    apiBase,
    setApiBase,
    mode,
    rfid,
    rfidHistory,
    weight,
    weightHistory,
    chartData,
    limit,
    buzzer,
    ledMode,
    uptimeSeconds,
    publishLimit,
    publishBuzzer,
    publishLed,
  };

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useTelemetry must be used inside TelemetryProvider");
  return ctx;
}
