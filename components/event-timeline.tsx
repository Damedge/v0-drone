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
  ChevronUp,
  Filter,
  Thermometer,
  Heart,
  Navigation,
  Circle,
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
  title?: string
  category?: string
  frame_index: number
}

// Tactical event from JSON
interface TacticalEvent {
  timestamp_ms: number
  latitude: number
  longitude: number
  threat_level: "low" | "medium" | "high" | "critical"
  description: string
  title?: string
  category?: string
  frame_index: number
}

type EventType = "anomaly" | "detection" | "priority" | "movement" | "comms"

// Category colors
const categoryColors: Record<string, { bg: string; text: string }> = {
  MOVEMENT: { bg: "bg-blue-500/20", text: "text-blue-400" },
  PERSONNEL: { bg: "bg-purple-500/20", text: "text-purple-400" },
  ANOMALY: { bg: "bg-amber-500/20", text: "text-amber-400" },
  VEHICLE: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  THERMAL: { bg: "bg-orange-500/20", text: "text-orange-400" },
  SIGNAL: { bg: "bg-green-500/20", text: "text-green-400" },
  DEBRIS: { bg: "bg-gray-500/20", text: "text-gray-400" },
  SUBJECT: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
}

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

function getThreatColor(level: string): string {
  switch (level) {
    case "critical":
      return "text-red-500"
    case "high":
      return "text-red-400"
    case "medium":
      return "text-amber-400"
    default:
      return "text-green-400"
  }
}

function getThreatDotColor(level: string): string {
  switch (level) {
    case "critical":
      return "bg-red-500"
    case "high":
      return "bg-red-400"
    case "medium":
      return "bg-amber-400"
    default:
      return "bg-green-400"
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "text-green-400"
  if (confidence >= 0.5) return "text-orange-400"
  return "text-red-400"
}

export function EventTimeline() {
  const { missionMode, seekToTime, missionData, isDataLoaded } = useMission()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<EventType | "all">("all")

  const isSAR = missionMode === "sar"
  const eventConfig = isSAR ? sarEventConfig : tacticalEventConfig

  // Reset state when mission mode changes
  useEffect(() => {
    setSelectedIndex(null)
    setExpandedIndex(null)
  }, [missionMode])

  const handleEventClick = (timestampMs: number, index: number) => {
    setSelectedIndex(index)
    seekToTime(timestampMs)
  }

  const handleExpandToggle = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  // Build unified event list from context missionData
  const events = missionData.map((e, i) => ({
    index: i,
    timestampMs: e.timestamp_ms,
    timestamp: formatTimestamp(e.timestamp_ms),
    type: e.threat_level 
      ? getThreatEventType(e.threat_level) 
      : getConfidenceEventType(e.confidence || 0),
    title: e.title || (isSAR ? "Detection Event" : "Tactical Event"),
    category: e.category || (isSAR ? "THERMAL" : "MOVEMENT"),
    description: e.description,
    coordinates: `${e.coordinates.lat.toFixed(4)}°, ${e.coordinates.lon.toFixed(4)}°`,
    confidence: e.confidence,
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
        {!isDataLoaded ? (
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-xs text-muted-foreground">
              Upload mission data to view events
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
              const isExpanded = expandedIndex === event.index
              const catColors = categoryColors[event.category] || { bg: "bg-gray-500/20", text: "text-gray-400" }

              return (
                <div
                  key={event.index}
                  onClick={() => handleEventClick(event.timestampMs, event.index)}
                  className={cn(
                    "w-full rounded-md border p-3 text-left transition-all cursor-pointer",
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
                        "flex items-center gap-1 rounded px-2 py-1 shrink-0",
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
                      {/* Title Row with Category Badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-medium text-foreground">
                          {event.title}
                        </span>
                        <span className={cn(
                          "rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                          catColors.bg,
                          catColors.text
                        )}>
                          {event.category}
                        </span>
                      </div>

                      {/* Threat/Confidence Indicator */}
                      <div className="mt-1.5 flex items-center gap-2">
                        {!isSAR && event.threatLevel && (
                          <div className="flex items-center gap-1.5">
                            <Circle className={cn("h-2 w-2 fill-current", getThreatDotColor(event.threatLevel), getThreatColor(event.threatLevel))} />
                            <span className={cn("font-mono text-[10px] uppercase font-medium", getThreatColor(event.threatLevel))}>
                              {event.threatLevel} Threat
                            </span>
                          </div>
                        )}
                        {isSAR && event.confidence !== undefined && (
                          <span className={cn("font-mono text-[10px] font-medium", getConfidenceColor(event.confidence))}>
                            {Math.round(event.confidence * 100)}% Confidence
                          </span>
                        )}
                      </div>
                      
                      {/* Description with Expand/Collapse */}
                      <div className="mt-2">
                        <p className={cn(
                          "font-mono text-[11px] leading-relaxed text-muted-foreground transition-all duration-200",
                          isExpanded ? "" : "line-clamp-1"
                        )}>
                          {event.description}
                        </p>
                        <button
                          onClick={(e) => handleExpandToggle(e, event.index)}
                          className={cn(
                            "mt-1 flex items-center gap-0.5 font-mono text-[10px] transition-colors",
                            isSAR 
                              ? "text-orange-400 hover:text-orange-300" 
                              : "text-primary hover:text-primary/80"
                          )}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              <span>Hide Details</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              <span>Show Details</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Coordinates */}
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
                </div>
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
