"use client"

import { useState } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Volume2,
  Camera,
  Crosshair,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMission } from "@/contexts/mission-context"

export function VideoPlayer() {
  const { missionMode } = useMission()
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(847) // seconds
  const duration = 1800 // 30 minutes in seconds

  const isSAR = missionMode === "sar"

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
      {/* Video Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                isSAR ? "bg-orange-500" : "bg-neon-red"
              )} />
              <span className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                isSAR ? "bg-orange-500" : "bg-neon-red"
              )} />
            </span>
            <span className={cn(
              "font-mono text-xs font-semibold uppercase tracking-widest",
              isSAR ? "text-orange-500" : "text-neon-red"
            )}>
              Live
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="font-mono text-xs text-muted-foreground">
            {isSAR ? "FLIR THERMAL ALPHA" : "EO/IR SENSOR ALPHA"}
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
            <span className="font-mono uppercase">Multi-View</span>
          </button>
          <button className={cn(
            "flex h-7 items-center gap-1.5 rounded border px-2 text-xs transition-colors",
            isSAR 
              ? "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" 
              : "border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
          )}>
            <Camera className="h-3 w-3" />
            <span className="font-mono uppercase">Snapshot</span>
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className="relative aspect-video bg-background">
        {/* Simulated thermal/IR video feed */}
        <div className={cn(
          "absolute inset-0",
          isSAR 
            ? "bg-gradient-to-br from-slate-950 via-orange-950/30 to-slate-900" 
            : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        )}>
          {/* Scan lines effect */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
            }}
          />

          {/* Crosshair overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Center crosshair */}
              <div className={cn(
                "h-40 w-40 rounded-full border",
                isSAR ? "border-orange-500/30" : "border-primary/30"
              )} />
              <div className={cn(
                "absolute left-1/2 top-0 h-8 w-px -translate-x-1/2",
                isSAR ? "bg-orange-500/50" : "bg-primary/50"
              )} />
              <div className={cn(
                "absolute bottom-0 left-1/2 h-8 w-px -translate-x-1/2",
                isSAR ? "bg-orange-500/50" : "bg-primary/50"
              )} />
              <div className={cn(
                "absolute left-0 top-1/2 h-px w-8 -translate-y-1/2",
                isSAR ? "bg-orange-500/50" : "bg-primary/50"
              )} />
              <div className={cn(
                "absolute right-0 top-1/2 h-px w-8 -translate-y-1/2",
                isSAR ? "bg-orange-500/50" : "bg-primary/50"
              )} />
              <div className={cn(
                "absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
                isSAR ? "bg-orange-500/50" : "bg-primary/50"
              )} />
            </div>
          </div>

          {/* Target boxes - dynamic based on mode */}
          {isSAR ? (
            <>
              {/* SAR targets */}
              <div className="absolute left-[20%] top-[30%]">
                <div className="h-16 w-24 border-2 border-yellow-400" style={{ boxShadow: "0 0 10px rgba(250, 204, 21, 0.5)" }}>
                  <div className="absolute -top-5 left-0 font-mono text-[10px] text-yellow-400">
                    THERMAL-01 | WARM
                  </div>
                </div>
              </div>
              <div className="absolute right-[25%] top-[45%]">
                <div className="h-12 w-12 border-2 border-orange-500 animate-pulse" style={{ boxShadow: "0 0 10px rgba(249, 115, 22, 0.5)" }}>
                  <div className="absolute -top-5 left-0 font-mono text-[10px] text-orange-500">
                    SUBJECT | CONFIRMED
                  </div>
                </div>
              </div>
              <div className="absolute bottom-[25%] left-[40%]">
                <div className="h-14 w-20 border-2 border-yellow-500" style={{ boxShadow: "0 0 10px rgba(234, 179, 8, 0.5)" }}>
                  <div className="absolute -top-5 left-0 font-mono text-[10px] text-yellow-500">
                    DEBRIS | INTEREST
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Tactical targets */}
              <div className="absolute left-[20%] top-[30%]">
                <div className="h-16 w-24 border-2 border-neon-cyan glow-cyan">
                  <div className="absolute -top-5 left-0 font-mono text-[10px] text-neon-cyan">
                    VEH-01 | TRACKED
                  </div>
                </div>
              </div>
              <div className="absolute right-[25%] top-[45%]">
                <div className="h-12 w-12 border-2 border-neon-amber glow-amber animate-pulse">
                  <div className="absolute -top-5 left-0 font-mono text-[10px] text-neon-amber">
                    POI-ALPHA | ANOMALY
                  </div>
                </div>
              </div>
              <div className="absolute bottom-[25%] left-[40%]">
                <div className="h-14 w-20 border-2 border-neon-red glow-red">
                  <div className="absolute -top-5 left-0 font-mono text-[10px] text-neon-red">
                    TGT-03 | PRIORITY
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* HUD Overlay - Top Left */}
        <div className="absolute left-4 top-4 space-y-1">
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            LAT: {isSAR ? "39.1261° N" : "34.0522° N"}
          </div>
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            LON: {isSAR ? "106.5701° W" : "118.2437° W"}
          </div>
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            ZOOM: {isSAR ? "8.0x" : "4.5x"}
          </div>
        </div>

        {/* HUD Overlay - Top Right */}
        <div className="absolute right-4 top-4 space-y-1 text-right">
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            HEADING: {isSAR ? "270°" : "045°"}
          </div>
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            SLANT: {isSAR ? "0.8 NM" : "12.4 NM"}
          </div>
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            FOV: {isSAR ? "15.0°" : "2.1°"}
          </div>
        </div>

        {/* HUD Overlay - Bottom Left */}
        <div className="absolute bottom-4 left-4">
          <div className="font-mono text-xs font-semibold text-foreground/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Zoom Controls - Right Side */}
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-1">
          <button className="flex h-8 w-8 items-center justify-center rounded bg-background/50 text-foreground/70 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded bg-background/50 text-foreground/70 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded bg-background/50 text-foreground/70 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded bg-background/50 text-foreground/70 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground">
            <Crosshair className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Video Controls */}
      <div className="flex items-center gap-4 border-t border-border px-4 py-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              isSAR 
                ? "bg-orange-500 text-white hover:bg-orange-600" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 translate-x-0.5" />
            )}
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-1 items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1">
            <div className="h-1.5 w-full rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full",
                  isSAR ? "bg-orange-500" : "bg-primary"
                )}
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            {/* Event markers on timeline */}
            {isSAR ? (
              <>
                <div
                  className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-sm bg-yellow-400"
                  style={{ left: "12%" }}
                />
                <div
                  className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-sm bg-orange-500"
                  style={{ left: "28%" }}
                />
                <div
                  className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-sm bg-yellow-500"
                  style={{ left: "55%" }}
                />
                <div
                  className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-sm bg-orange-400"
                  style={{ left: "82%" }}
                />
              </>
            ) : (
              <>
                <div
                  className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-sm bg-neon-amber"
                  style={{ left: "15%" }}
                />
                <div
                  className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-sm bg-neon-red"
                  style={{ left: "32%" }}
                />
                <div
                  className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-sm bg-neon-cyan"
                  style={{ left: "58%" }}
                />
                <div
                  className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-sm bg-neon-amber"
                  style={{ left: "75%" }}
                />
              </>
            )}
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume & Fullscreen */}
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Volume2 className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
