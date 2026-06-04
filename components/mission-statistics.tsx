"use client"

import { useMission } from "@/contexts/mission-context"
import { cn } from "@/lib/utils"
import {
  Clock,
  AlertTriangle,
  Activity,
  MapPin,
  Users,
  Truck,
  Eye,
  Zap,
} from "lucide-react"

export function MissionStatistics() {
  const { missionMode, missionData, videoRef } = useMission()
  const isSAR = missionMode === "sar"

  // Calculate stats from mission data
  const totalEvents = missionData.length
  
  const flightDuration = videoRef.current?.duration 
    ? formatTime(videoRef.current.duration)
    : "00:00"

  const categoryBreakdown = missionData.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const threatLevels = missionData.reduce((acc, event) => {
    if (event.threat_level) {
      acc[event.threat_level] = (acc[event.threat_level] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const avgConfidence = missionData.length > 0 && missionData[0].confidence !== undefined
    ? Math.round(missionData.reduce((sum, e) => sum + (e.confidence || 0), 0) / missionData.length)
    : null

  const maxThreat = Object.keys(threatLevels).includes("critical") 
    ? "CRITICAL" 
    : Object.keys(threatLevels).includes("high") 
    ? "HIGH" 
    : Object.keys(threatLevels).includes("medium") 
    ? "MEDIUM" 
    : "LOW"

  const highestConfidence = missionData.length > 0 
    ? Math.max(...missionData.map(e => e.confidence || 0))
    : 0

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case "MOVEMENT": return Truck
      case "PERSONNEL": return Users
      case "ANOMALY": return AlertTriangle
      case "VEHICLE": return Truck
      case "THERMAL": return Activity
      case "DEBRIS": return Eye
      default: return Eye
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toUpperCase()) {
      case "MOVEMENT": return "text-primary bg-primary/10 border-primary/30"
      case "PERSONNEL": return "text-neon-amber bg-neon-amber/10 border-neon-amber/30"
      case "ANOMALY": return "text-neon-red bg-neon-red/10 border-neon-red/30"
      case "VEHICLE": return "text-primary bg-primary/10 border-primary/30"
      case "THERMAL": return "text-orange-500 bg-orange-500/10 border-orange-500/30"
      case "DEBRIS": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30"
      default: return "text-muted-foreground bg-secondary border-border"
    }
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-2">
      {/* Header */}
      <div>
        <h1 className="font-mono text-xl font-semibold text-foreground">
          Mission Statistics
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          {isSAR ? "Search & Rescue Analysis" : "Tactical Analysis Summary"}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isSAR ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary"
            )}>
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Flight Duration
              </p>
              <p className="font-mono text-2xl font-semibold text-foreground">
                {flightDuration}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isSAR ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary"
            )}>
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {isSAR ? "Anomalies Detected" : "Events Detected"}
              </p>
              <p className="font-mono text-2xl font-semibold text-foreground">
                {totalEvents}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isSAR ? "bg-orange-500/10 text-orange-500" : threatLevels.high || threatLevels.critical ? "bg-neon-red/10 text-neon-red" : "bg-neon-amber/10 text-neon-amber"
            )}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {isSAR ? "Highest Confidence" : "Max Threat Level"}
              </p>
              <p className={cn(
                "font-mono text-2xl font-semibold",
                isSAR 
                  ? highestConfidence >= 80 ? "text-success" : highestConfidence >= 50 ? "text-neon-amber" : "text-neon-red"
                  : maxThreat === "CRITICAL" || maxThreat === "HIGH" ? "text-neon-red" : maxThreat === "MEDIUM" ? "text-neon-amber" : "text-success"
              )}>
                {isSAR ? `${highestConfidence}%` : maxThreat}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isSAR ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary"
            )}>
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {isSAR ? "Avg Confidence" : "Categories"}
              </p>
              <p className="font-mono text-2xl font-semibold text-foreground">
                {isSAR ? (avgConfidence ? `${avgConfidence}%` : "N/A") : Object.keys(categoryBreakdown).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-mono text-sm font-semibold text-foreground">
            Category Breakdown
          </h2>
        </div>
        <div className="divide-y divide-border">
          {Object.entries(categoryBreakdown).map(([category, count]) => {
            const Icon = getCategoryIcon(category)
            const colorClass = getCategoryColor(category)
            const percentage = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0
            
            return (
              <div key={category} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded border", colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wide text-foreground">
                    {category}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", isSAR ? "bg-orange-500" : "bg-primary")}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm font-medium text-foreground w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            )
          })}
          {Object.keys(categoryBreakdown).length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="font-mono text-xs text-muted-foreground">
                No data available. Upload a mission to view statistics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Threat/Confidence Distribution (Tactical only) */}
      {!isSAR && Object.keys(threatLevels).length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-mono text-sm font-semibold text-foreground">
              Threat Level Distribution
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-4 p-4">
            {["critical", "high", "medium", "low"].map((level) => (
              <div key={level} className="text-center">
                <div className={cn(
                  "mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full",
                  level === "critical" ? "bg-neon-red/20" :
                  level === "high" ? "bg-neon-red/10" :
                  level === "medium" ? "bg-neon-amber/10" :
                  "bg-success/10"
                )}>
                  <Zap className={cn(
                    "h-6 w-6",
                    level === "critical" ? "text-neon-red" :
                    level === "high" ? "text-neon-red" :
                    level === "medium" ? "text-neon-amber" :
                    "text-success"
                  )} />
                </div>
                <p className="font-mono text-2xl font-semibold text-foreground">
                  {threatLevels[level] || 0}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {level}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
