"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { Maximize2, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMission } from "@/contexts/mission-context"

export function MapView() {
  const { missionMode, missionData, videoRef, seekToTime } = useMission()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const isSAR = missionMode === "sar"

  // Sync with video currentTime
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleDurationChange = () => setDuration(video.duration || 0)
    const handleLoadedMetadata = () => setDuration(video.duration || 0)

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("durationchange", handleDurationChange)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)

    // Initialize with current values
    setCurrentTime(video.currentTime)
    setDuration(video.duration || 0)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("durationchange", handleDurationChange)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [videoRef])

  // Calculate latitude bounds from mission data
  const { minLat, maxLat, latRange } = useMemo(() => {
    if (missionData.length === 0) {
      return { minLat: 0, maxLat: 1, latRange: 1 }
    }
    
    const lats = missionData.map(e => e.coordinates.lat)
    const min = Math.min(...lats)
    const max = Math.max(...lats)
    const range = max - min || 1 // Prevent division by zero
    
    // Add 10% padding to range
    const padding = range * 0.1
    return { 
      minLat: min - padding, 
      maxLat: max + padding, 
      latRange: range + padding * 2 
    }
  }, [missionData])

  // Handle event dot click - jump video to timestamp
  const handleEventClick = (timestampMs: number) => {
    seekToTime(timestampMs)
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate playhead position
  const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0

  // Generate Y-axis labels
  const yAxisLabels = useMemo(() => {
    const labels = []
    const steps = 4
    for (let i = 0; i <= steps; i++) {
      const lat = maxLat - (i / steps) * latRange
      labels.push(lat.toFixed(4))
    }
    return labels
  }, [maxLat, latRange])

  // Generate X-axis labels
  const xAxisLabels = useMemo(() => {
    const labels = []
    const steps = 5
    for (let i = 0; i <= steps; i++) {
      const time = (i / steps) * duration
      labels.push(formatTime(time))
    }
    return labels
  }, [duration])

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <Activity className={cn("h-4 w-4", isSAR ? "text-orange-400" : "text-primary")} />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
            Spatiotemporal Telemetry
          </span>
          <div className="h-4 w-px bg-border" />
          <span className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400" : "text-muted-foreground"
          )}>
            {missionData.length} Events | Duration: {formatTime(duration)}
          </span>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Scatter Plot Area */}
      <div className="relative flex-1 p-4">
        {/* Y-Axis Label */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
          <span className={cn(
            "font-mono text-[9px] uppercase tracking-widest whitespace-nowrap",
            isSAR ? "text-orange-400/60" : "text-muted-foreground/60"
          )}>
            Latitude →
          </span>
        </div>

        {/* X-Axis Label */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <span className={cn(
            "font-mono text-[9px] uppercase tracking-widest",
            isSAR ? "text-orange-400/60" : "text-muted-foreground/60"
          )}>
            Video Time →
          </span>
        </div>

        {/* Plot Container */}
        <div 
          ref={containerRef}
          className="relative ml-10 mr-4 mt-2 mb-6 h-[calc(100%-2rem)] border-l border-b border-border/50"
        >
          {/* Grid Lines - Horizontal */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <div
              key={`h-${pct}`}
              className={cn(
                "absolute left-0 right-0 border-t border-dashed",
                isSAR ? "border-orange-500/10" : "border-primary/10"
              )}
              style={{ top: `${pct}%` }}
            />
          ))}

          {/* Grid Lines - Vertical */}
          {[0, 20, 40, 60, 80, 100].map((pct) => (
            <div
              key={`v-${pct}`}
              className={cn(
                "absolute top-0 bottom-0 border-l border-dashed",
                isSAR ? "border-orange-500/10" : "border-primary/10"
              )}
              style={{ left: `${pct}%` }}
            />
          ))}

          {/* Y-Axis Labels */}
          <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between py-0">
            {yAxisLabels.map((label, i) => (
              <span
                key={i}
                className={cn(
                  "font-mono text-[8px] text-right w-9",
                  isSAR ? "text-orange-400/50" : "text-muted-foreground/50"
                )}
              >
                {label}°
              </span>
            ))}
          </div>

          {/* X-Axis Labels */}
          <div className="absolute -bottom-5 left-0 right-0 flex justify-between">
            {xAxisLabels.map((label, i) => (
              <span
                key={i}
                className={cn(
                  "font-mono text-[8px]",
                  isSAR ? "text-orange-400/50" : "text-muted-foreground/50"
                )}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Live Playhead / Scanner Line */}
          <div
            className={cn(
              "absolute top-0 bottom-0 w-px transition-all duration-100",
              isSAR 
                ? "bg-orange-500 shadow-[0_0_8px_2px] shadow-orange-500/50" 
                : "bg-cyan-400 shadow-[0_0_8px_2px] shadow-cyan-400/50"
            )}
            style={{ left: `${playheadPosition}%` }}
          >
            {/* Playhead indicator at top */}
            <div className={cn(
              "absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45",
              isSAR ? "bg-orange-500" : "bg-cyan-400"
            )} />
            {/* Current time label */}
            <div className={cn(
              "absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1 py-0.5 font-mono text-[8px] font-bold",
              isSAR ? "bg-orange-500 text-black" : "bg-cyan-400 text-black"
            )}>
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Event Data Points */}
          {missionData.map((event) => {
            if (!event.coordinates || duration === 0) return null

            // Calculate X position based on timestamp
            const xPct = (event.timestamp_ms / 1000 / duration) * 100
            
            // Calculate Y position based on latitude (inverted so higher lat = higher on screen)
            const yPct = 100 - ((event.coordinates.lat - minLat) / latRange) * 100

            const isHovered = hoveredEvent === event.id
            const isAtPlayhead = Math.abs((event.timestamp_ms / 1000) - currentTime) < 1.5

            // Determine color based on mode and threat/confidence
            const dotColor = isSAR
              ? (event.confidence && event.confidence > 0.8 
                  ? "bg-yellow-400" 
                  : "bg-orange-500")
              : (event.threat_level === "high" || event.threat_level === "critical"
                  ? "bg-red-500"
                  : "bg-cyan-400")

            const glowColor = isSAR
              ? (event.confidence && event.confidence > 0.8 
                  ? "shadow-yellow-400/60" 
                  : "shadow-orange-500/60")
              : (event.threat_level === "high" || event.threat_level === "critical"
                  ? "shadow-red-500/60"
                  : "shadow-cyan-400/60")

            return (
              <div
                key={event.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ 
                  left: `${xPct}%`, 
                  top: `${yPct}%`,
                }}
                onClick={() => handleEventClick(event.timestamp_ms)}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                {/* Outer glow ring */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-full transition-all duration-200",
                    isAtPlayhead && "animate-ping",
                    dotColor,
                    "opacity-30"
                  )}
                  style={{
                    width: isHovered ? 24 : isAtPlayhead ? 20 : 16,
                    height: isHovered ? 24 : isAtPlayhead ? 20 : 16,
                    marginLeft: isHovered ? -12 : isAtPlayhead ? -10 : -8,
                    marginTop: isHovered ? -12 : isAtPlayhead ? -10 : -8,
                  }}
                />
                
                {/* Main dot */}
                <div
                  className={cn(
                    "relative rounded-full border border-background transition-all duration-200",
                    dotColor,
                    (isHovered || isAtPlayhead) && "shadow-[0_0_10px_2px]",
                    (isHovered || isAtPlayhead) && glowColor
                  )}
                  style={{
                    width: isHovered ? 12 : isAtPlayhead ? 10 : 8,
                    height: isHovered ? 12 : isAtPlayhead ? 10 : 8,
                    marginLeft: isHovered ? -6 : isAtPlayhead ? -5 : -4,
                    marginTop: isHovered ? -6 : isAtPlayhead ? -5 : -4,
                  }}
                />

                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="whitespace-nowrap rounded bg-card px-2 py-1.5 font-mono text-[10px] shadow-lg border border-border min-w-[120px]">
                      <div className="font-semibold text-foreground">{event.title}</div>
                      <div className="text-muted-foreground mt-0.5">
                        {formatTime(event.timestamp_ms / 1000)}
                      </div>
                      <div className="text-muted-foreground">
                        {event.coordinates.lat.toFixed(4)}°, {event.coordinates.lon.toFixed(4)}°
                      </div>
                      {event.threat_level && (
                        <div className={cn(
                          "mt-1 uppercase text-[9px] font-bold",
                          event.threat_level === "high" || event.threat_level === "critical" 
                            ? "text-red-500" 
                            : "text-amber-500"
                        )}>
                          {event.threat_level} Threat
                        </div>
                      )}
                      {event.confidence !== undefined && (
                        <div className={cn(
                          "mt-1 text-[9px] font-bold",
                          event.confidence > 0.8 ? "text-green-500" : "text-orange-500"
                        )}>
                          {Math.round(event.confidence * 100)}% Confidence
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Empty state */}
          {missionData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-xs text-muted-foreground">
                Upload mission data to view telemetry
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Legend */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <div className="flex items-center gap-4">
          {isSAR ? (
            <>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="font-mono text-[10px] text-muted-foreground">
                  High Confidence (&gt;80%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-mono text-[10px] text-muted-foreground">
                  Low Confidence
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="font-mono text-[10px] text-muted-foreground">
                  High/Critical Threat
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="font-mono text-[10px] text-muted-foreground">
                  Medium/Low Threat
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-4 w-px",
            isSAR ? "bg-orange-500" : "bg-cyan-400"
          )} />
          <span className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400" : "text-muted-foreground"
          )}>
            Playhead ({formatTime(currentTime)})
          </span>
        </div>
      </div>
    </div>
  )
}
