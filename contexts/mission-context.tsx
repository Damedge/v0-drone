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

interface MissionContextType {
  missionMode: MissionMode
  setMissionMode: (mode: MissionMode) => void
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
  videoRef: RefObject<HTMLVideoElement | null>
  seekToTime: (timestampMs: number) => void
  missionData: MissionEvent[]
  setMissionData: (data: MissionEvent[]) => void
  isDataLoaded: boolean
  setIsDataLoaded: (loaded: boolean) => void
  videoFileName: string
  setVideoFileName: (name: string) => void
  telemetryFileName: string
  setTelemetryFileName: (name: string) => void
  snapshots: Snapshot[]
  addSnapshot: (snapshot: Snapshot) => void
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

  // Reset snapshots when mission mode changes
  useEffect(() => {
    setSnapshots([])
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
      isDataLoaded,
      setIsDataLoaded,
      videoFileName,
      setVideoFileName,
      telemetryFileName,
      setTelemetryFileName,
      snapshots,
      addSnapshot
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
