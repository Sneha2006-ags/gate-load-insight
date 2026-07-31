import { motion } from "motion/react";
import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTelemetry } from "@/lib/telemetry";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  const { connected } = useTelemetry();

  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/70 bg-background/60 px-4 py-4 backdrop-blur sm:flex sm:flex-wrap sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="shrink-0" />
        <div className="min-w-0">
          <motion.h1
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="truncate font-display text-xl font-bold tracking-tight sm:text-2xl"
          >
            {title}
          </motion.h1>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {actions}
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
            connected
              ? "border-success/40 bg-success/10 text-success"
              : "border-destructive/40 bg-destructive/10 text-destructive",
          )}
        >
          <motion.span
            className="size-2 rounded-full"
            style={{ background: connected ? "var(--success)" : "var(--destructive)" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          {connected ? "MQTT Connected" : "MQTT Disconnected"}
        </span>
      </div>
    </header>
  );
}
