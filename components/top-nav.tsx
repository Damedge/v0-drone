"use client"

import { useState, useEffect } from "react"
import { Search, FileDown, Bell, Wifi, Battery, Signal } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopNav() {
  const [currentTime, setCurrentTime] = useState<string | null>(null)

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      {/* Left Section - Mission Info */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Active Mission
          </span>
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
            OP SILENT GUARDIAN
          </span>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-mono uppercase text-muted-foreground">Asset:</span>
            <span className="font-mono font-medium text-foreground">RQ-180 DELTA-7</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono uppercase text-muted-foreground">Alt:</span>
            <span className="font-mono font-medium text-foreground">45,000 ft</span>
          </div>
        </div>
      </div>

      {/* Center Section - Semantic Search */}
      <div className="flex flex-1 max-w-xl items-center justify-center px-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Semantic Search — e.g., 'vehicle convoy near checkpoint'"
            className="h-9 w-full rounded-md border border-border bg-input pl-9 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right Section - Actions & Status */}
      <div className="flex items-center gap-4">
        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Signal className="h-3.5 w-3.5 text-success" />
            <span className="font-mono text-[10px]">5G</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="h-3.5 w-3.5 text-success" />
            <span className="font-mono text-[10px]">SAT</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery className="h-3.5 w-3.5 text-warning" />
            <span className="font-mono text-[10px]">78%</span>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-neon-red" />
        </button>

        {/* Export Button */}
        <Button
          size="sm"
          className="h-8 gap-2 bg-primary font-mono text-xs uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
        >
          <FileDown className="h-3.5 w-3.5" />
          Export PDF AAR
        </Button>

        {/* Time */}
        <div className="flex flex-col items-end">
          <span className="font-mono text-xs font-medium text-foreground">
            {currentTime ?? "--:--:--"}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            ZULU
          </span>
        </div>
      </div>
    </header>
  )
}
