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
  Thermometer,
  Shirt,
  Heart,
  Navigation,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMission } from "@/contexts/mission-context"

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

// Tactical mission events
const tacticalEvents: TimelineEvent[] = [
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

// Search & Rescue mission events
const sarEvents: TimelineEvent[] = [
  {
    id: "sar-1",
    timestamp: "00:22",
    type: "detection",
    title: "Trail Marker Found",
    description: "Last known hiking trail identified, searching perimeter",
    confidence: 92,
    coordinates: "39.1234°N, 106.5678°W",
  },
  {
    id: "sar-2",
    timestamp: "02:34",
    type: "anomaly",
    title: "Thermal Anomaly",
    description: "Human heat signature detected near ravine edge",
    confidence: 84,
    coordinates: "39.1256°N, 106.5692°W",
  },
  {
    id: "sar-3",
    timestamp: "05:12",
    type: "priority",
    title: "High-Vis Color Detected",
    description: "Subject matched wearing orange jacket - priority verification",
    confidence: 91,
    coordinates: "39.1261°N, 106.5701°W",
  },
  {
    id: "sar-4",
    timestamp: "07:45",
    type: "movement",
    title: "Movement Detected",
    description: "Possible subject movement in tree line, waving pattern",
    confidence: 78,
    coordinates: "39.1265°N, 106.5698°W",
  },
  {
    id: "sar-5",
    timestamp: "10:18",
    type: "comms",
    title: "Emergency Signal",
    description: "PLB beacon ping detected, triangulating position",
    coordinates: "39.1268°N, 106.5695°W",
  },
  {
    id: "sar-6",
    timestamp: "13:42",
    type: "anomaly",
    title: "Debris Field",
    description: "Scattered camping equipment visible on ridge",
    confidence: 88,
    coordinates: "39.1270°N, 106.5690°W",
  },
  {
    id: "sar-7",
    timestamp: "16:55",
    type: "detection",
    title: "Life Signs Confirmed",
    description: "IR confirms conscious subject, responsive to aerial signals",
    confidence: 96,
    coordinates: "39.1272°N, 106.5688°W",
  },
  {
    id: "sar-8",
    timestamp: "19:30",
    type: "priority",
    title: "Extraction Point Set",
    description: "LZ marked for helicopter extraction, subject stable",
    confidence: 99,
    coordinates: "39.1275°N, 106.5685°W",
  },
]

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

export function EventTimeline() {
  const { missionMode } = useMission()
  const [selectedEvent, setSelectedEvent] = useState<string | null>(
    missionMode === "sar" ? "sar-3" : "3"
  )
  const [filter, setFilter] = useState<EventType | "all">("all")

  const isSAR = missionMode === "sar"
  const events = isSAR ? sarEvents : tacticalEvents
  const eventConfig = isSAR ? sarEventConfig : tacticalEventConfig

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
        {(["all", "priority", "anomaly", "detection", "movement", "comms"] as const).map(
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
                      {event.confidence && (
                        <span
                          className={cn(
                            "shrink-0 font-mono text-[10px]",
                            isSAR
                              ? event.confidence >= 90
                                ? "text-yellow-400"
                                : event.confidence >= 80
                                ? "text-orange-400"
                                : "text-orange-300"
                              : event.confidence >= 90
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
            <span className={cn(
              "h-2 w-2 rounded-full",
              isSAR ? "bg-orange-500" : "bg-neon-red"
            )} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {events.filter((e) => e.type === "priority").length} {isSAR ? "Critical" : "Priority"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={cn(
              "h-2 w-2 rounded-full",
              isSAR ? "bg-yellow-400" : "bg-neon-amber"
            )} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {events.filter((e) => e.type === "anomaly").length} {isSAR ? "Thermals" : "Anomalies"}
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
