"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type MissionMode = "tactical" | "sar"

interface MissionContextType {
  missionMode: MissionMode
  setMissionMode: (mode: MissionMode) => void
}

const MissionContext = createContext<MissionContextType | undefined>(undefined)

export function MissionProvider({ children }: { children: ReactNode }) {
  const [missionMode, setMissionMode] = useState<MissionMode>("tactical")

  return (
    <MissionContext.Provider value={{ missionMode, setMissionMode }}>
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
