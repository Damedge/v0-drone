"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Eye,
  Target,
  Truck,
  Users,
  Radio,
  MapPin,
  ChevronDown,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

type EventType = "anomaly" | "detection" | "priority" | "movement" | "comms"

interface TimelineEvent {
  id: string
  timestamp: string
  type: EventType
  title: string
  description: string
  confidence?: number
  coordinates?: string
}

const events: TimelineEvent[] = [
  {
    id: "1",
    timestamp: "00:15",
    type: "detection",
    title: "Vehicle Detected",
    description: "Convoy of 3 vehicles entering sector 7-Alpha",
    confidence: 94,
    coordinates: "34.0522°N, 118.2437°W",
  },
  {
    id: "2",
    timestamp: "02:34",
    type: "anomaly",
    title: "Thermal Anomaly",
    description: "Unusual heat signature detected near structure B-12",
    confidence: 78,
    coordinates: "34.0515°N, 118.2445°W",
  },
  {
    id: "3",
    timestamp: "05:12",
    type: "priority",
    title: "High Priority Target",
    description: "POI-ALPHA confirmed at location. Requesting verification.",
    confidence: 87,
    coordinates: "34.0528°N, 118.2421°W",
  },
  {
    id: "4",
    timestamp: "08:45",
    type: "movement",
    title: "Personnel Movement",
    description: "Group of 6 individuals moving east toward checkpoint",
    confidence: 91,
    coordinates: "34.0519°N, 118.2430°W",
  },
  {
    id: "5",
    timestamp: "11:23",
    type: "comms",
    title: "Signal Intercept",
    description: "Radio transmission detected on monitored frequency",
    coordinates: "34.0525°N, 118.2440°W",
  },
  {
    id: "6",
    timestamp: "14:07",
    type: "anomaly",
    title: "Object Displacement",
    description: "Change detection: New structure in grid reference 4-Charlie",
    confidence: 82,
    coordinates: "34.0530°N, 118.2428°W",
  },
  {
    id: "7",
    timestamp: "17:52",
    type: "detection",
    title: "Vehicle Stationary",
    description: "VEH-01 stopped at identified location for 12+ minutes",
    confidence: 96,
    coordinates: "34.0522°N, 118.2437°W",
  },
  {
    id: "8",
    timestamp: "21:15",
    type: "priority",
    title: "Activity Cluster",
    description: "Multiple entities converging at waypoint BRAVO",
    confidence: 89,
    coordinates: "34.0518°N, 118.2442°W",
  },
]

const eventConfig: Record<
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

export function EventTimeline() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>("3")
  const [filter, setFilter] = useState<EventType | "all">("all")

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.type === filter)

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
            Event Timeline
          </span>
          <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {filteredEvents.length}
          </span>
        </div>
        <button className="flex items-center gap-1 rounded border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Filter className="h-3 w-3" />
          <span className="font-mono uppercase">Filter</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-1.5 border-b border-border p-2">
        {(["all", "priority", "anomaly", "detection", "movement", "comms"] as const).map(
          (type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors",
                filter === type
                  ? "bg-primary text-primary-foreground"
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
        <div className="space-y-2">
          {filteredEvents.map((event) => {
            const config = eventConfig[event.type]
            const Icon = config.icon
            const isSelected = selectedEvent === event.id

            return (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event.id)}
                className={cn(
                  "w-full rounded-md border p-3 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
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
                      {event.confidence && (
                        <span
                          className={cn(
                            "shrink-0 font-mono text-[10px]",
                            event.confidence >= 90
                              ? "text-success"
                              : event.confidence >= 80
                              ? "text-neon-amber"
                              : "text-muted-foreground"
                          )}
                        >
                          {event.confidence}%
                        </span>
                      )}
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
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-neon-red" />
            <span className="font-mono text-[10px] text-muted-foreground">
              {events.filter((e) => e.type === "priority").length} Priority
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-neon-amber" />
            <span className="font-mono text-[10px] text-muted-foreground">
              {events.filter((e) => e.type === "anomaly").length} Anomalies
            </span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          Auto-refresh: 5s
        </span>
      </div>
    </div>
  )
}
