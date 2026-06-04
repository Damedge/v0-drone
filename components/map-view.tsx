"use client"

import {
  Maximize2,
  Layers,
  Navigation,
  Plus,
  Minus,
  Crosshair,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMission } from "@/contexts/mission-context"

interface MapMarker {
  id: string
  x: number
  y: number
  type: "vehicle" | "poi" | "waypoint" | "asset"
  label: string
}

// Tactical markers
const tacticalMarkers: MapMarker[] = [
  { id: "1", x: 25, y: 35, type: "vehicle", label: "VEH-01" },
  { id: "2", x: 45, y: 50, type: "poi", label: "POI-ALPHA" },
  { id: "3", x: 65, y: 40, type: "vehicle", label: "VEH-02" },
  { id: "4", x: 30, y: 65, type: "waypoint", label: "WP-BRAVO" },
  { id: "5", x: 75, y: 60, type: "asset", label: "RQ-180" },
]

// SAR markers
const sarMarkers: MapMarker[] = [
  { id: "s1", x: 20, y: 30, type: "waypoint", label: "LAST SEEN" },
  { id: "s2", x: 45, y: 45, type: "poi", label: "THERMAL HIT" },
  { id: "s3", x: 55, y: 55, type: "poi", label: "SUBJECT" },
  { id: "s4", x: 35, y: 70, type: "waypoint", label: "TRAIL HEAD" },
  { id: "s5", x: 70, y: 50, type: "asset", label: "RESCUE-1" },
  { id: "s6", x: 60, y: 65, type: "waypoint", label: "LZ-ALPHA" },
]

// Tactical marker styles
const tacticalMarkerStyles: Record<
  MapMarker["type"],
  { color: string; bgColor: string }
> = {
  vehicle: { color: "text-neon-cyan", bgColor: "bg-neon-cyan" },
  poi: { color: "text-neon-amber", bgColor: "bg-neon-amber" },
  waypoint: { color: "text-primary", bgColor: "bg-primary" },
  asset: { color: "text-success", bgColor: "bg-success" },
}

// SAR marker styles
const sarMarkerStyles: Record<
  MapMarker["type"],
  { color: string; bgColor: string }
> = {
  vehicle: { color: "text-yellow-400", bgColor: "bg-yellow-400" },
  poi: { color: "text-orange-500", bgColor: "bg-orange-500" },
  waypoint: { color: "text-yellow-500", bgColor: "bg-yellow-500" },
  asset: { color: "text-orange-400", bgColor: "bg-orange-400" },
}

export function MapView() {
  const { missionMode } = useMission()
  const isSAR = missionMode === "sar"
  
  const markers = isSAR ? sarMarkers : tacticalMarkers
  const markerStyles = isSAR ? sarMarkerStyles : tacticalMarkerStyles

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
            {isSAR ? "Search Area" : "Tactical Map"}
          </span>
          <div className="h-4 w-px bg-border" />
          <span className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400" : "text-muted-foreground"
          )}>
            {isSAR ? "ALPINE ZONE | GRID REF: 39N 106W" : "SECTOR 7-ALPHA | GRID REF: 34N 118W"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className={cn(
            "flex h-7 items-center gap-1.5 rounded border px-2 text-xs transition-colors",
            isSAR 
              ? "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" 
              : "border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
          )}>
            <Layers className="h-3 w-3" />
            <span className="font-mono uppercase">Layers</span>
          </button>
          <button className={cn(
            "flex h-7 w-7 items-center justify-center rounded border transition-colors",
            isSAR 
              ? "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" 
              : "border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
          )}>
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative flex-1 bg-background">
        {/* Simulated map grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: isSAR
              ? `
                linear-gradient(to right, oklch(0.75 0.15 45 / 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, oklch(0.75 0.15 45 / 0.3) 1px, transparent 1px)
              `
              : `
                linear-gradient(to right, oklch(0.75 0.18 195 / 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, oklch(0.75 0.18 195 / 0.3) 1px, transparent 1px)
              `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Sector overlay */}
        <div className={cn(
          "absolute inset-4 rounded border border-dashed",
          isSAR ? "border-orange-500/20" : "border-primary/20"
        )}>
          {/* Quadrant lines */}
          <div className={cn(
            "absolute left-1/2 top-0 h-full w-px",
            isSAR ? "bg-orange-500/10" : "bg-primary/10"
          )} />
          <div className={cn(
            "absolute left-0 top-1/2 h-px w-full",
            isSAR ? "bg-orange-500/10" : "bg-primary/10"
          )} />

          {/* Quadrant labels */}
          <span className={cn(
            "absolute left-2 top-2 font-mono text-[10px]",
            isSAR ? "text-orange-500/40" : "text-primary/40"
          )}>
            {isSAR ? "NW" : "A1"}
          </span>
          <span className={cn(
            "absolute right-2 top-2 font-mono text-[10px]",
            isSAR ? "text-orange-500/40" : "text-primary/40"
          )}>
            {isSAR ? "NE" : "A2"}
          </span>
          <span className={cn(
            "absolute bottom-2 left-2 font-mono text-[10px]",
            isSAR ? "text-orange-500/40" : "text-primary/40"
          )}>
            {isSAR ? "SW" : "B1"}
          </span>
          <span className={cn(
            "absolute bottom-2 right-2 font-mono text-[10px]",
            isSAR ? "text-orange-500/40" : "text-primary/40"
          )}>
            {isSAR ? "SE" : "B2"}
          </span>
        </div>

        {/* Flight path */}
        <svg className="absolute inset-0 h-full w-full">
          <path
            d={isSAR 
              ? "M 70% 50% Q 55% 55%, 45% 45% Q 35% 35%, 20% 30%"
              : "M 75% 60% Q 60% 45%, 45% 50% Q 35% 55%, 25% 35%"
            }
            fill="none"
            stroke={isSAR ? "oklch(0.75 0.15 45)" : "oklch(0.75 0.2 145)"}
            strokeWidth="2"
            strokeDasharray="8 4"
            opacity="0.5"
          />
        </svg>

        {/* Map markers */}
        {markers.map((marker) => {
          const style = markerStyles[marker.type]
          return (
            <div
              key={marker.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            >
              <div className="relative">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full border-2 border-background",
                    style.bgColor
                  )}
                />
                <div
                  className={cn(
                    "absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full opacity-30",
                    style.bgColor
                  )}
                />
                {/* Label on hover */}
                <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="whitespace-nowrap rounded bg-card px-2 py-1 font-mono text-[10px] text-foreground shadow-lg border border-border">
                    {marker.label}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <button className="flex h-8 w-8 items-center justify-center rounded bg-card/80 text-foreground/70 backdrop-blur border border-border transition-colors hover:bg-card hover:text-foreground">
            <Plus className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded bg-card/80 text-foreground/70 backdrop-blur border border-border transition-colors hover:bg-card hover:text-foreground">
            <Minus className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded bg-card/80 text-foreground/70 backdrop-blur border border-border transition-colors hover:bg-card hover:text-foreground">
            <Navigation className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded bg-card/80 text-foreground/70 backdrop-blur border border-border transition-colors hover:bg-card hover:text-foreground">
            <Crosshair className="h-4 w-4" />
          </button>
        </div>

        {/* Scale indicator */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-px w-16 bg-foreground/50" />
            <div className="h-2 w-px bg-foreground/50" />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {isSAR ? "200m" : "500m"}
          </span>
        </div>

        {/* Compass */}
        <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur border border-border">
          <div className="relative h-6 w-6">
            <div className={cn(
              "absolute left-1/2 top-0 h-3 w-0.5 -translate-x-1/2 rounded-full",
              isSAR ? "bg-orange-500" : "bg-neon-red"
            )} />
            <div className="absolute bottom-0 left-1/2 h-3 w-0.5 -translate-x-1/2 bg-foreground/30 rounded-full" />
            <span className={cn(
              "absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold",
              isSAR ? "text-orange-500" : "text-neon-red"
            )}>
              N
            </span>
          </div>
        </div>
      </div>

      {/* Footer - Legend */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <div className="flex items-center gap-4">
          {Object.entries(markerStyles).map(([type, style]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn("h-2 w-2 rounded-full", style.bgColor)} />
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                {isSAR && type === "poi" ? "thermal" : type}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className={cn(
            "h-3 w-3",
            isSAR ? "text-orange-400" : "text-muted-foreground"
          )} />
          <span className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400" : "text-muted-foreground"
          )}>
            {markers.length} {isSAR ? "Search Points" : "Active Tracks"}
          </span>
        </div>
      </div>
    </div>
  )
}
