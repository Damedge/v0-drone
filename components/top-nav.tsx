"use client"

import { useState, useEffect } from "react"
import { Search, FileDown, Bell, Wifi, Battery, Signal, ChevronDown, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMission, MissionMode } from "@/contexts/mission-context"
import { cn } from "@/lib/utils"

const missions = [
  { id: "tactical", label: "Op: Silent Guardian", mode: "tactical" as MissionMode, subtitle: "Tactical" },
  { id: "sar", label: "Op: Alpine Rescue", mode: "sar" as MissionMode, subtitle: "Search & Rescue" },
  { id: "industrial", label: "Op: Wind Farm Inspection", mode: "industrial" as MissionMode, subtitle: "Industrial" },
]

interface TopNavProps {
  onUploadClick?: () => void
}

export function TopNav({ onUploadClick }: TopNavProps) {
  const [currentTime, setCurrentTime] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { missionMode, setMissionMode } = useMission()

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const currentMission = missions.find((m) => m.mode === missionMode) || missions[0]
  const isSAR = missionMode === "sar"
  const isIndustrial = missionMode === "industrial"
  const accentColor = isIndustrial ? "text-emerald-400" : isSAR ? "text-orange-400" : "text-foreground"

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      {/* Left Section - Mission Info */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Active Mission
          </span>
          {/* Mission Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "flex items-center gap-2 font-mono text-sm font-semibold tracking-tight transition-colors",
                accentColor
              )}
            >
              {currentMission.label}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen && "rotate-180")} />
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-56 rounded-md border border-border bg-card shadow-lg">
                {missions.map((mission) => (
                  <button
                    key={mission.id}
                    onClick={() => {
                      setMissionMode(mission.mode)
                      setDropdownOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left font-mono text-sm transition-colors hover:bg-accent",
                      missionMode === mission.mode && "bg-primary/10"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      mission.mode === "industrial" ? "text-emerald-400" :
                      mission.mode === "sar" ? "text-orange-400" : "text-foreground"
                    )}>
                      {mission.label}
                    </span>
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] uppercase",
                      mission.mode === "industrial" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : mission.mode === "sar" 
                          ? "bg-orange-500/20 text-orange-400" 
                          : "bg-primary/20 text-primary"
                    )}>
                      {mission.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-mono uppercase text-muted-foreground">Asset:</span>
            <span className={cn(
              "font-mono font-medium",
              accentColor
            )}>
              {isIndustrial ? "INDUSTRIAL-UAV INS-1" : isSAR ? "SAR-HELO RESCUE-1" : "RQ-180 DELTA-7"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono uppercase text-muted-foreground">Alt:</span>
            <span className="font-mono font-medium text-foreground">
              {isIndustrial ? "450 ft" : isSAR ? "8,500 ft" : "45,000 ft"}
            </span>
          </div>
        </div>
      </div>

      {/* Center Section - Semantic Search */}
      <div className="flex flex-1 max-w-xl items-center justify-center px-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={isIndustrial
              ? "Semantic Search — e.g., 'blade damage on turbine 7'" 
              : isSAR 
                ? "Semantic Search — e.g., 'thermal signature near ravine'" 
                : "Semantic Search — e.g., 'vehicle convoy near checkpoint'"
            }
            className={cn(
              "h-9 w-full rounded-md border bg-input pl-9 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1",
              isIndustrial
                ? "border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500"
                : isSAR 
                  ? "border-orange-500/30 focus:border-orange-500 focus:ring-orange-500" 
                  : "border-border focus:border-primary focus:ring-primary"
            )}
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
          <span className={cn(
            "absolute right-1 top-1 h-2 w-2 rounded-full",
            isIndustrial ? "bg-emerald-500" : isSAR ? "bg-orange-500" : "bg-neon-red"
          )} />
        </button>

        {/* Upload Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onUploadClick}
          className="h-8 gap-2 font-mono text-xs uppercase tracking-wide"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </Button>

        {/* Export Button */}
        <Button
          size="sm"
          className={cn(
            "h-8 gap-2 font-mono text-xs uppercase tracking-wide",
            isIndustrial 
              ? "bg-emerald-500 text-white hover:bg-emerald-600" 
              : isSAR 
                ? "bg-orange-500 text-white hover:bg-orange-600" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
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
