"use client"

import { useState, useCallback } from "react"
import { useMission, MissionEvent } from "@/contexts/mission-context"
import { cn } from "@/lib/utils"
import {
  Upload,
  Video,
  FileJson,
  X,
  CheckCircle2,
  Loader2,
  Crosshair,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadModalProps {
  onClose: () => void
}

type ProcessingStep = "idle" | "extracting" | "syncing" | "analyzing" | "complete"

export function UploadModal({ onClose }: UploadModalProps) {
  const { 
    setMissionMode, 
    setMissionData, 
    setIsDataLoaded,
    setVideoFileName,
    setTelemetryFileName 
  } = useMission()
  
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [telemetryFile, setTelemetryFile] = useState<File | null>(null)
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle")
  const [dragOverVideo, setDragOverVideo] = useState(false)
  const [dragOverTelemetry, setDragOverTelemetry] = useState(false)

  const handleVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOverVideo(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file)
    }
  }, [])

  const handleTelemetryDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOverTelemetry(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".csv") || file.name.endsWith(".srt"))) {
      setTelemetryFile(file)
    }
  }, [])

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setVideoFile(file)
  }

  const handleTelemetrySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setTelemetryFile(file)
  }

  const processMission = async () => {
    setProcessingStep("extracting")
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setProcessingStep("syncing")
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setProcessingStep("analyzing")
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Load sample data based on telemetry file name
    const isSAR = telemetryFile?.name.toLowerCase().includes("sar") || 
                  telemetryFile?.name.toLowerCase().includes("rescue") ||
                  telemetryFile?.name.toLowerCase().includes("search")
    const isIndustrial = telemetryFile?.name.toLowerCase().includes("industrial") ||
                         telemetryFile?.name.toLowerCase().includes("turbine") ||
                         telemetryFile?.name.toLowerCase().includes("wind")
    
    const dataUrl = isIndustrial 
      ? "/data/results_industrial.json" 
      : isSAR 
        ? "/data/results_sar.json" 
        : "/data/results_tactical.json"
    
    try {
      const response = await fetch(dataUrl)
      if (response.ok) {
        const rawData = await response.json()
        // Map incoming data to our MissionEvent format
        // Handle both latitude/longitude and coordinates.lat/coordinates.lon formats
        const mappedData: MissionEvent[] = rawData.map((item: Record<string, unknown>, index: number) => ({
          id: String(item.id || index),
          timestamp_ms: item.timestamp_ms as number,
          title: (item.title as string) || (isIndustrial ? "Anomaly Detected" : isSAR ? "Thermal Detection" : "Contact Detected"),
          category: (item.category as string) || (isIndustrial ? "INSPECTION" : isSAR ? "THERMAL" : "MOVEMENT"),
          description: item.description as string,
          threat_level: item.threat_level as string | undefined,
          confidence: item.confidence as number | undefined,
          coordinates: {
            lat: (item.latitude as number) ?? (item.coordinates as { lat: number })?.lat ?? 0,
            lon: (item.longitude as number) ?? (item.coordinates as { lon: number })?.lon ?? 0,
          },
          target_box: item.target_box as MissionEvent["target_box"] | undefined,
        }))
        setMissionData(mappedData)
      } else {
        // Fallback sample data
        setMissionData([
          {
            id: "1",
            timestamp_ms: 5000,
            title: "Initial Contact",
            category: "MOVEMENT",
            description: "Movement detected in sector alpha. Multiple heat signatures identified.",
            threat_level: "medium",
            coordinates: { lat: 34.0522, lon: -118.2437 }
          },
          {
            id: "2", 
            timestamp_ms: 15000,
            title: "Vehicle Convoy",
            category: "VEHICLE",
            description: "Three vehicles moving in formation along main road.",
            threat_level: "high",
            coordinates: { lat: 34.0525, lon: -118.2440 }
          }
        ])
      }
    } catch {
      // Fallback sample data on error
      setMissionData([
        {
          id: "1",
          timestamp_ms: 5000,
          title: "Initial Contact",
          category: "MOVEMENT",
          description: "Movement detected in sector alpha. Multiple heat signatures identified.",
          threat_level: "medium",
          coordinates: { lat: 34.0522, lon: -118.2437 }
        }
      ])
    }

    setMissionMode(isIndustrial ? "industrial" : isSAR ? "sar" : "tactical")
    setVideoFileName(videoFile?.name || "")
    setTelemetryFileName(telemetryFile?.name || "")
    setIsDataLoaded(true)
    
    setProcessingStep("complete")
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onClose()
  }

  const getProcessingText = () => {
    switch (processingStep) {
      case "extracting": return "Extracting frames..."
      case "syncing": return "Syncing telemetry..."
      case "analyzing": return "Running AI analysis..."
      case "complete": return "Complete!"
      default: return ""
    }
  }

  const isProcessing = processingStep !== "idle"
  const canProcess = videoFile && telemetryFile && !isProcessing

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Crosshair className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-mono text-lg font-semibold text-foreground">
                Upload New Mission
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                Import drone footage and telemetry for analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Video Upload */}
            <div
              onDrop={handleVideoDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOverVideo(true) }}
              onDragLeave={() => setDragOverVideo(false)}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                dragOverVideo 
                  ? "border-primary bg-primary/5" 
                  : videoFile 
                  ? "border-success bg-success/5" 
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={isProcessing}
              />
              {videoFile ? (
                <>
                  <CheckCircle2 className="mb-3 h-10 w-10 text-success" />
                  <p className="font-mono text-sm font-medium text-foreground text-center truncate max-w-full px-2">
                    {videoFile.name}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </>
              ) : (
                <>
                  <Video className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-mono text-sm font-medium text-foreground">
                    1. Upload Drone Video
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Drag & drop or click to select
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    Supported: .mp4, .mov, .avi
                  </p>
                </>
              )}
            </div>

            {/* Telemetry Upload */}
            <div
              onDrop={handleTelemetryDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOverTelemetry(true) }}
              onDragLeave={() => setDragOverTelemetry(false)}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                dragOverTelemetry 
                  ? "border-primary bg-primary/5" 
                  : telemetryFile 
                  ? "border-success bg-success/5" 
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <input
                type="file"
                accept=".json,.csv,.srt"
                onChange={handleTelemetrySelect}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={isProcessing}
              />
              {telemetryFile ? (
                <>
                  <CheckCircle2 className="mb-3 h-10 w-10 text-success" />
                  <p className="font-mono text-sm font-medium text-foreground text-center truncate max-w-full px-2">
                    {telemetryFile.name}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {(telemetryFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <FileJson className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-mono text-sm font-medium text-foreground">
                    2. Upload Telemetry Log
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Drag & drop or click to select
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    Supported: .json, .csv, .srt
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="mt-6 flex items-center justify-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="font-mono text-sm text-primary">
                {getProcessingText()}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="font-mono text-xs uppercase"
          >
            Cancel
          </Button>
          <Button
            onClick={processMission}
            disabled={!canProcess}
            className="gap-2 font-mono text-xs uppercase"
          >
            <Upload className="h-4 w-4" />
            Process Mission
          </Button>
        </div>
      </div>
    </div>
  )
}
