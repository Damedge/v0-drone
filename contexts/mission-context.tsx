"use client"

import { createContext, useContext, useState, useRef, ReactNode, RefObject } from "react"

export type MissionMode = "tactical" | "sar"

interface MissionContextType {
  missionMode: MissionMode
  setMissionMode: (mode: MissionMode) => void
  videoRef: RefObject<HTMLVideoElement | null>
  seekToTime: (timestampMs: number) => void
}

const MissionContext = createContext<MissionContextType | undefined>(undefined)

export function MissionProvider({ children }: { children: ReactNode }) {
  const [missionMode, setMissionMode] = useState<MissionMode>("tactical")
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const seekToTime = (timestampMs: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestampMs / 1000
      videoRef.current.play()
    }
  }

  return (
    <MissionContext.Provider value={{ missionMode, setMissionMode, videoRef, seekToTime }}>
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
