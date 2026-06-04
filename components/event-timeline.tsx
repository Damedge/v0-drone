"use client"

import { useState, useEffect } from "react"
import {
  AlertTriangle,
  Eye,
  Target,
  Users,
  Radio,
  MapPin,
  ChevronDown,
  Filter,
  Thermometer,
  Heart,
  Navigation,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMission } from "@/contexts/mission-context"

// SAR event from JSON
interface SAREvent {
  timestamp_ms: number
  latitude: number
  longitude: number
  confidence: number
  description: string
  frame_index: number
}

// Tactical event from JSON
interface TacticalEvent {
  timestamp_ms: number
  latitude: number
  longitude: number
  threat_level: "low" | "medium" | "high" | "critical"
  description: string
  frame_index: number
}

type EventType = "anomaly" | "detection" | "priority" | "movement" | "comms"

// Tactical event config
const tacticalEventConfig: Record<
  EventType,
  { icon: typeof AlertTriangle; color: string; bgColor: string }
> = {
  anomaly: {
    icon: AlertTriangle,
    color: "text-neon-amber",
    bgColor: "bg-neon-amber/10",
  },
  detection: {
    icon: Eye,
    color: "text-neon-cyan",
    bgColor: "bg-neon-cyan/10",
  },
  priority: {
    icon: Target,
    color: "text-neon-red",
    bgColor: "bg-neon-red/10",
  },
  movement: {
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  comms: {
    icon: Radio,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
}

// SAR event config
const sarEventConfig: Record<
  EventType,
  { icon: typeof AlertTriangle; color: string; bgColor: string }
> = {
  anomaly: {
    icon: Thermometer,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  detection: {
    icon: Eye,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
  },
  priority: {
    icon: Heart,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  movement: {
    icon: Navigation,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  comms: {
    icon: Radio,
    color: "text-orange-300",
    bgColor: "bg-orange-300/10",
  },
}

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function getThreatEventType(level: string): EventType {
  switch (level) {
    case "critical":
    case "high":
      return "priority"
    case "medium":
      return "anomaly"
    default:
      return "detection"
  }
}

function getConfidenceEventType(confidence: number): EventType {
  if (confidence >= 0.8) return "priority"
  if (confidence >= 0.5) return "anomaly"
  return "detection"
}

export function EventTimeline() {
  const { missionMode, seekToTime } = useMission()
  const [sarEvents, setSarEvents] = useState<SAREvent[]>([])
  const [tacticalEvents, setTacticalEvents] = useState<TacticalEvent[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<EventType | "all">("all")
  const [loading, setLoading] = useState(true)

  const isSAR = missionMode === "sar"
  const eventConfig = isSAR ? sarEventConfig : tacticalEventConfig

  // Fetch data when mission mode changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setSelectedIndex(null)
      try {
        const dataPath = isSAR ? "/data/results_sar.json" : "/data/results_tactical.json"
        const response = await fetch(dataPath)
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        if (isSAR) {
          setSarEvents(data)
        } else {
          setTacticalEvents(data)
        }
      } catch (error) {
        console.error("Error fetching timeline data:", error)
        if (isSAR) {
          setSarEvents([])
        } else {
          setTacticalEvents([])
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isSAR])

  const handleEventClick = (timestampMs: number, index: number) => {
    setSelectedIndex(index)
    seekToTime(timestampMs)
  }

  // Build unified event list
  const events = isSAR
    ? sarEvents.map((e, i) => ({
        index: i,
        timestampMs: e.timestamp_ms,
        timestamp: formatTimestamp(e.timestamp_ms),
        type: getConfidenceEventType(e.confidence),
        title: `Confidence: ${Math.round(e.confidence * 100)}%`,
        description: e.description,
        coordinates: `${e.latitude.toFixed(4)}°, ${e.longitude.toFixed(4)}°`,
        confidence: e.confidence,
      }))
    : tacticalEvents.map((e, i) => ({
        index: i,
        timestampMs: e.timestamp_ms,
        timestamp: formatTimestamp(e.timestamp_ms),
        type: getThreatEventType(e.threat_level),
        title: `Threat: ${e.threat_level.charAt(0).toUpperCase() + e.threat_level.slice(1)}`,
        description: e.description,
        coordinates: `${e.latitude.toFixed(4)}°, ${e.longitude.toFixed(4)}°`,
        threatLevel: e.threat_level,
      }))

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.type === filter)

  const priorityCount = events.filter((e) => e.type === "priority").length
  const anomalyCount = events.filter((e) => e.type === "anomaly").length

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
            Event Timeline
          </span>
          <span className={cn(
            "rounded px-1.5 py-0.5 font-mono text-[10px]",
            isSAR ? "bg-orange-500/20 text-orange-400" : "bg-secondary text-muted-foreground"
          )}>
            {filteredEvents.length}
          </span>
        </div>
        <button className={cn(
          "flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors hover:text-foreground",
          isSAR 
            ? "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" 
            : "border-border bg-secondary text-muted-foreground hover:bg-accent"
        )}>
          <Filter className="h-3 w-3" />
          <span className="font-mono uppercase">Filter</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-1.5 border-b border-border p-2">
        {(["all", "priority", "anomaly", "detection"] as const).map(
          (type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors",
                filter === type
                  ? isSAR 
                    ? "bg-orange-500 text-white" 
                    : "bg-primary text-primary-foreground"
                  : isSAR
                    ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                    : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {type}
            </button>
          )
        )}
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-xs text-muted-foreground animate-pulse">
              Loading events...
            </span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-xs text-muted-foreground">
              No events found
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEvents.map((event) => {
              const config = eventConfig[event.type]
              const Icon = config.icon
              const isSelected = selectedIndex === event.index

              return (
                <button
                  key={event.index}
                  onClick={() => handleEventClick(event.timestampMs, event.index)}
                  className={cn(
                    "w-full rounded-md border p-3 text-left transition-all",
                    isSelected
                      ? isSAR 
                        ? "border-orange-500 bg-orange-500/5" 
                        : "border-primary bg-primary/5"
                      : "border-transparent bg-secondary/50 hover:border-border hover:bg-secondary"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Timestamp Pill */}
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded px-2 py-1",
                        config.bgColor
                      )}
                    >
                      <Icon className={cn("h-3 w-3", config.color)} />
                      <span className={cn("font-mono text-xs font-semibold", config.color)}>
                        [{event.timestamp}]
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-medium text-foreground truncate">
                          {event.title}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                      {event.coordinates && (
                        <div className="mt-2 flex items-center gap-1 text-muted-foreground/70">
                          <MapPin className="h-2.5 w-2.5" />
                          <span className="font-mono text-[10px]">
                            {event.coordinates}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className={cn(
              "h-2 w-2 rounded-full",
              isSAR ? "bg-orange-500" : "bg-neon-red"
            )} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {priorityCount} {isSAR ? "Critical" : "Priority"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={cn(
              "h-2 w-2 rounded-full",
              isSAR ? "bg-yellow-400" : "bg-neon-amber"
            )} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {anomalyCount} {isSAR ? "Thermals" : "Anomalies"}
            </span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          Click to sync video
        </span>
      </div>
    </div>
  )
}
