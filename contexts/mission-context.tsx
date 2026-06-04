"use client"

import { createContext, useContext, useState, useRef, useEffect, ReactNode, RefObject } from "react"

export type MissionMode = "tactical" | "sar"
export type ActiveView = "hub" | "analysis" | "statistics" | "aar"

export interface TargetBox {
  x_pct: number
  y_pct: number
  width_pct: number
  height_pct: number
}

export interface MissionEvent {
  id: string
  timestamp_ms: number
  title: string
  category: string
  description: string
  threat_level?: string
  confidence?: number
  coordinates: { lat: number; lon: number }
  target_box?: TargetBox
}

export interface Snapshot {
  id: string
  imageUrl: string
  timestamp: number
  capturedAt: Date
}

export interface TrainedAnnotation {
  id: string
  title: string
  imageUrl: string
  timestamp: number
  trainedAt: Date
  category: string
}

interface MissionContextType {
  missionMode: MissionMode
  setMissionMode: (mode: MissionMode) => void
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
  videoRef: RefObject<HTMLVideoElement | null>
  seekToTime: (timestampMs: number) => void
  missionData: MissionEvent[]
  setMissionData: (data: MissionEvent[]) => void
  addMissionEvent: (event: MissionEvent) => void
  isDataLoaded: boolean
  setIsDataLoaded: (loaded: boolean) => void
  videoFileName: string
  setVideoFileName: (name: string) => void
  telemetryFileName: string
  setTelemetryFileName: (name: string) => void
  snapshots: Snapshot[]
  addSnapshot: (snapshot: Snapshot) => void
  trainedAnnotations: TrainedAnnotation[]
  addTrainedAnnotation: (annotation: TrainedAnnotation) => void
}

const MissionContext = createContext<MissionContextType | undefined>(undefined)

export function MissionProvider({ children }: { children: ReactNode }) {
  const [missionMode, setMissionMode] = useState<MissionMode>("tactical")
  const [activeView, setActiveView] = useState<ActiveView>("hub")
  const [missionData, setMissionData] = useState<MissionEvent[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [videoFileName, setVideoFileName] = useState("")
  const [telemetryFileName, setTelemetryFileName] = useState("")
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [trainedAnnotations, setTrainedAnnotations] = useState<TrainedAnnotation[]>([])
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const seekToTime = (timestampMs: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestampMs / 1000
      videoRef.current.pause()
    }
  }

  const addSnapshot = (snapshot: Snapshot) => {
    setSnapshots((prev) => [...prev, snapshot])
  }

  const addMissionEvent = (event: MissionEvent) => {
    setMissionData((prev) => [...prev, event].sort((a, b) => a.timestamp_ms - b.timestamp_ms))
  }

  const addTrainedAnnotation = (annotation: TrainedAnnotation) => {
    setTrainedAnnotations((prev) => [...prev, annotation])
  }

  // Reset snapshots and trained annotations when mission mode changes
  useEffect(() => {
    setSnapshots([])
    setTrainedAnnotations([])
  }, [missionMode])

  return (
    <MissionContext.Provider value={{ 
      missionMode, 
      setMissionMode, 
      activeView, 
      setActiveView, 
      videoRef, 
      seekToTime,
      missionData,
      setMissionData,
      addMissionEvent,
      isDataLoaded,
      setIsDataLoaded,
      videoFileName,
      setVideoFileName,
      telemetryFileName,
      setTelemetryFileName,
      snapshots,
      addSnapshot,
      trainedAnnotations,
      addTrainedAnnotation
    }}>
      {children}
    </MissionContext.Provider>
  )
}

export function useMission() {
  const context = useContext(MissionContext)
  if (context === undefined) {
    throw new Error("useMission must be used within a MissionProvider")
  }
  return context
}
