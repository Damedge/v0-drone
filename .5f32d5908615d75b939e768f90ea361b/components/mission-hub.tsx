"use client"

import { useState, useCallback } from "react"
import { Upload, FileVideo, FileJson, Play, AlertTriangle, Eye, Plane, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMission } from "@/contexts/mission-context"
import { cn } from "@/lib/utils"

type HubState = "entry" | "processing" | "triage"

interface DroneFlightResult {
  id: string
  name: string
  sector: string
  anomalies: number
  duration: string
  status: "critical" | "warning" | "clear"
}

const mockFleetResults: DroneFlightResult[] = [
  { id: "drone-3", name: "Drone 3", sector: "Sector Charlie", anomalies: 4, duration: "00:27:15", status: "critical" },
  { id: "drone-1", name: "Drone 1", sector: "Sector Alpha", anomalies: 1, duration: "00:33:42", status: "warning" },
  { id: "drone-2", name: "Drone 2", sector: "Sector Bravo", anomalies: 0, duration: "00:45:08", status: "clear" },
]

const processingSteps = [
  "Kestrel Recon AI initializing...",
  "Ingesting telemetry data...",
  "Analyzing video frames...",
  "Detecting anomalies...",
  "Generating threat assessment...",
]

export function MissionHub() {
  const { missionMode, setActiveView, setIsDataLoaded, setVideoFileName, setTelemetryFileName } = useMission()
  const [hubState, setHubState] = useState<HubState>("entry")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [telemetryFile, setTelemetryFile] = useState<File | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStep, setProcessingStep] = useState(0)
  const [isDraggingVideo, setIsDraggingVideo] = useState(false)
  const [isDraggingTelemetry, setIsDraggingTelemetry] = useState(false)

  const handleVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingVideo(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file)
    }
  }, [])

  const handleTelemetryDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingTelemetry(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith(".json")) {
      setTelemetryFile(file)
    }
  }, [])

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setVideoFile(file)
  }

  const handleTelemetryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setTelemetryFile(file)
  }

  const handleRunAnalysis = async () => {
    setHubState("processing")
    
    // Simulate processing with progress updates
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 60))
      setProcessingProgress(i)
      setProcessingStep(Math.min(Math.floor(i / 20), processingSteps.length - 1))
    }

    // Transition to triage state
    setHubState("triage")
  }

  const handleReviewIntelligence = async (droneId: string) => {
    // Set file names if available
    if (videoFile) setVideoFileName(videoFile.name)
    if (telemetryFile) setTelemetryFileName(telemetryFile.name)

    // Mission data is already loaded by the context's missionMode effect.
    // For industrial, the timeline stays empty until annotate+train completes.
    // Just mark as loaded and open the analysis desk.
    setIsDataLoaded(true)
    setActiveView("analysis")
  }

  const getStatusColor = (status: DroneFlightResult["status"]) => {
    switch (status) {
      case "critical": return "text-red-400"
      case "warning": return "text-amber-400"
      case "clear": return "text-green-400"
    }
  }

  const getStatusBg = (status: DroneFlightResult["status"]) => {
    switch (status) {
      case "critical": return "bg-red-500/10 border-red-500/30"
      case "warning": return "bg-amber-500/10 border-amber-500/30"
      case "clear": return "bg-green-500/10 border-green-500/30"
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      {/* Entry State - Upload Zone */}
      {hubState === "entry" && (
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
              Create New Mission
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Upload Fleet Videos & Telemetry to begin AI analysis
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Video Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true) }}
              onDragLeave={() => setIsDraggingVideo(false)}
              onDrop={handleVideoDrop}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all",
                isDraggingVideo 
                  ? "border-primary bg-primary/5" 
                  : videoFile 
                    ? "border-green-500/50 bg-green-500/5" 
                    : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
              )}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className={cn(
                "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                videoFile ? "bg-green-500/20" : "bg-primary/10"
              )}>
                {videoFile ? (
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                ) : (
                  <FileVideo className="h-8 w-8 text-primary" />
                )}
              </div>
              <span className="font-mono text-sm font-medium text-foreground">
                {videoFile ? videoFile.name : "Drop Video File"}
              </span>
              <span className="mt-1 font-mono text-xs text-muted-foreground">
                {videoFile ? "Video ready" : ".mp4, .mov, .avi"}
              </span>
            </div>

            {/* Telemetry Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingTelemetry(true) }}
              onDragLeave={() => setIsDraggingTelemetry(false)}
              onDrop={handleTelemetryDrop}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all",
                isDraggingTelemetry 
                  ? "border-primary bg-primary/5" 
                  : telemetryFile 
                    ? "border-green-500/50 bg-green-500/5" 
                    : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
              )}
            >
              <input
                type="file"
                accept=".json"
                onChange={handleTelemetryChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className={cn(
                "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                telemetryFile ? "bg-green-500/20" : "bg-primary/10"
              )}>
                {telemetryFile ? (
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                ) : (
                  <FileJson className="h-8 w-8 text-primary" />
                )}
              </div>
              <span className="font-mono text-sm font-medium text-foreground">
                {telemetryFile ? telemetryFile.name : "Drop Telemetry File"}
              </span>
              <span className="mt-1 font-mono text-xs text-muted-foreground">
                {telemetryFile ? "Telemetry ready" : ".json"}
              </span>
            </div>
          </div>

          {/* Run Analysis Button */}
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={handleRunAnalysis}
              disabled={!videoFile && !telemetryFile}
              className="gap-2 font-mono text-sm uppercase tracking-wide"
            >
              <Play className="h-4 w-4" />
              Run AI Analysis
            </Button>
          </div>

          {/* Demo Mode Link */}
          <div className="mt-4 text-center">
            <button
              onClick={handleRunAnalysis}
              className="font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Or run demo with sample data
            </button>
          </div>
        </div>
      )}

      {/* Processing State */}
      {hubState === "processing" && (
        <div className="w-full max-w-lg text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="absolute inset-2 animate-pulse rounded-full bg-primary/30" />
              <Upload className="relative h-10 w-10 text-primary" />
            </div>
          </div>

          <h2 className="mb-2 font-mono text-xl font-bold text-foreground">
            Processing Mission Data
          </h2>
          <p className="mb-8 font-mono text-sm text-primary">
            {processingSteps[processingStep]}
          </p>

          {/* Progress Bar */}
          <div className="mx-auto max-w-md">
            <div className="mb-2 flex justify-between font-mono text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{processingProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-100 ease-out"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>

          {/* Processing Details */}
          <div className="mt-8 flex justify-center gap-8 font-mono text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileVideo className="h-4 w-4" />
              <span>{videoFile?.name || "demo_video.mp4"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              <span>{telemetryFile?.name || "demo_telemetry.json"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Triage / Results State */}
      {hubState === "triage" && (
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
              Mission Fleet Summary
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              AI analysis complete. {mockFleetResults.reduce((sum, d) => sum + d.anomalies, 0)} total anomalies detected across {mockFleetResults.length} drone flights.
            </p>
          </div>

          {/* Fleet Results Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-secondary/50 px-4 py-3">
              <div className="col-span-1 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </div>
              <div className="col-span-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Asset
              </div>
              <div className="col-span-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sector
              </div>
              <div className="col-span-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Anomalies
              </div>
              <div className="col-span-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Duration
              </div>
              <div className="col-span-1 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </div>
            </div>

            {/* Table Rows */}
            {mockFleetResults
              .sort((a, b) => b.anomalies - a.anomalies)
              .map((drone, index) => (
                <div
                  key={drone.id}
                  className={cn(
                    "grid grid-cols-12 gap-4 items-center px-4 py-4 border-b border-border last:border-b-0 transition-colors",
                    drone.status === "critical" && "bg-red-500/5",
                    drone.status === "warning" && "bg-amber-500/5"
                  )}
                >
                  {/* Status Icon */}
                  <div className="col-span-1">
                    {drone.status === "critical" ? (
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    ) : drone.status === "warning" ? (
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    )}
                  </div>

                  {/* Asset Name */}
                  <div className="col-span-3 flex items-center gap-2">
                    <Plane className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium text-foreground">
                      {drone.name}
                    </span>
                  </div>

                  {/* Sector */}
                  <div className="col-span-3">
                    <span className="font-mono text-sm text-muted-foreground">
                      {drone.sector}
                    </span>
                  </div>

                  {/* Anomalies Count */}
                  <div className="col-span-2">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs font-semibold",
                      getStatusBg(drone.status),
                      getStatusColor(drone.status)
                    )}>
                      {drone.anomalies} Detected
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="col-span-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {drone.duration}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="col-span-1">
                    {index === 0 ? (
                      <Button
                        size="sm"
                        onClick={() => handleReviewIntelligence(drone.id)}
                        className="gap-1.5 font-mono text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Review
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReviewIntelligence(drone.id)}
                        className="gap-1.5 font-mono text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Summary Footer */}
          <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="font-mono text-xs text-muted-foreground">Critical Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="font-mono text-xs text-muted-foreground">Review Recommended</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="font-mono text-xs text-muted-foreground">Clear</span>
              </div>
            </div>
            <button
              onClick={() => setHubState("entry")}
              className="font-mono text-xs text-primary hover:underline underline-offset-4"
            >
              Upload More Data
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
