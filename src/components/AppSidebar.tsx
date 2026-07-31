import { Link, useRouterState } from "@tanstack/react-router";
import { Gauge, History, LayoutDashboard, Settings, Truck, Radio } from "lucide-react";
import { motion } from "motion/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTelemetry } from "@/lib/telemetry";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard Home", url: "/", icon: LayoutDashboard },
  { title: "RFID Gate", url: "/rfid", icon: Truck },
  { title: "Load Cell", url: "/load", icon: Gauge },
  { title: "History", url: "/history", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { connected, mode } = useTelemetry();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            animate={{ boxShadow: ["0 0 0px hsl(0 0% 0% / 0)", "0 0 18px var(--primary)", "0 0 0px hsl(0 0% 0% / 0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"
          >
            <Truck className="size-5" />
          </motion.div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold tracking-wide">
                SMART GATE
              </p>
              <p className="truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Load Control
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-2 py-2",
            collapsed && "justify-center",
          )}
        >
          <Radio
            className={cn("size-4 shrink-0", connected ? "text-success" : "text-destructive")}
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {connected ? "MQTT Connected" : "MQTT Disconnected"}
              </p>
              <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                {mode} feed
              </p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
