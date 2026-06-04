"use client"

import { useState } from "react"
import {
  Crosshair,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMission, ActiveView } from "@/contexts/mission-context"

const navItems: { icon: typeof LayoutDashboard; label: string; view: ActiveView }[] = [
  { icon: LayoutDashboard, label: "Analysis Desk", view: "analysis" },
  { icon: BarChart3, label: "Mission Statistics", view: "statistics" },
  { icon: FileText, label: "Generate AAR", view: "aar" },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { activeView, setActiveView } = useMission()

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Crosshair className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
              OVERWATCH
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Aerospace
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveView(item.view)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              activeView === item.view
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <span className="font-mono text-xs uppercase tracking-wide">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  )
}
