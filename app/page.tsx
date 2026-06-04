"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { VideoPlayer } from "@/components/video-player"
import { EventTimeline } from "@/components/event-timeline"
import { MapView } from "@/components/map-view"
import { MissionStatistics } from "@/components/mission-statistics"
import { GenerateAAR } from "@/components/generate-aar"
import { UploadModal } from "@/components/upload-modal"
import { MissionProvider, useMission } from "@/contexts/mission-context"
import { cn } from "@/lib/utils"

function DashboardContent() {
  const { activeView, isDataLoaded } = useMission()
  const [showUploadModal, setShowUploadModal] = useState(!isDataLoaded)

  const handleCloseModal = () => {
    setShowUploadModal(false)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav onUploadClick={() => setShowUploadModal(true)} />

        {/* Dashboard Content */}
        <main className={cn(
          "flex-1 overflow-auto p-4 transition-all",
          showUploadModal && "blur-sm pointer-events-none"
        )}>
          {activeView === "analysis" && (
            <div className="flex h-full flex-col gap-4">
              {/* Top Section - Video Player + Event Timeline */}
              <div className="flex flex-1 gap-4 min-h-0">
                {/* Video Player - Takes most of the width */}
                <div className="flex-[2]">
                  <VideoPlayer />
                </div>

                {/* Event Timeline - Fixed width on the right */}
                <div className="w-80 min-w-80">
                  <EventTimeline />
                </div>
              </div>

              {/* Bottom Section - Map View */}
              <div className="h-64 min-h-64">
                <MapView />
              </div>
            </div>
          )}

          {activeView === "statistics" && <MissionStatistics />}
          
          {activeView === "aar" && <GenerateAAR />}
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={handleCloseModal} />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <MissionProvider>
      <DashboardContent />
    </MissionProvider>
  )
}
