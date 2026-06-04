"use client"

import { useState, useEffect, useRef } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Volume2,
  Camera,
  Crosshair,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Move,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMission, Snapshot } from "@/contexts/mission-context"

// Marker interface for crosshair points
interface Marker {
  id: string
  x: number // percentage 0-100
  y: number // percentage 0-100
  timestampSec: number
  durationSec: number
}

// User-placed marker component
function UserMarker({ marker, isSAR }: { marker: Marker; isSAR: boolean }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${marker.x}%`,
        top: `${marker.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Outer pulse ring */}
      <div className={cn(
        "absolute inset-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping opacity-50",
        isSAR ? "bg-yellow-400/30" : "bg-cyan-400/30"
      )} />
      {/* Main crosshair */}
      <div className={cn(
        "relative h-8 w-8 -translate-x-1/2 -translate-y-1/2",
      )}>
        {/* Vertical line */}
        <div className={cn(
          "absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2",
          isSAR ? "bg-yellow-400" : "bg-cyan-400"
        )} />
        {/* Horizontal line */}
        <div className={cn(
          "absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2",
          isSAR ? "bg-yellow-400" : "bg-cyan-400"
        )} />
        {/* Center dot */}
        <div className={cn(
          "absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
          isSAR ? "bg-yellow-400" : "bg-cyan-400"
        )} />
      </div>
    </div>
  )
}

export function VideoPlayer() {
  const { missionMode, videoRef, missionData, addSnapshot } = useMission()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showFlash, setShowFlash] = useState(false)
  const playPromiseRef = useRef<Promise<void> | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Zoom/Rotate/Marker state
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [markMode, setMarkMode] = useState(false)
  const [markerDuration, setMarkerDuration] = useState(3) // seconds
  const [markers, setMarkers] = useState<Marker[]>([])

  // Pan state for drag-to-pan when zoomed
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  const isSAR = missionMode === "sar"
  const videoSrc = isSAR ? "/videos/searchForPeople.mp4" : "/videos/battlefield.mp4"

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Filter markers to show only those within their display window
  const visibleMarkers = markers.filter((marker) => {
    return currentTime >= marker.timestampSec && currentTime <= marker.timestampSec + marker.durationSec
  })

  // Reset video when mode changes
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      playPromiseRef.current = null
      video.load()
      setCurrentTime(0)
      setIsPlaying(false)
      setZoomLevel(1)
      setRotation(0)
      setMarkers([])
      setPanOffset({ x: 0, y: 0 })
    }
  }, [missionMode, videoRef])

  // Reset pan offset when zoom level returns to 1
  useEffect(() => {
    if (zoomLevel === 1) {
      setPanOffset({ x: 0, y: 0 })
    }
  }, [zoomLevel])

  const safePlay = async () => {
    const video = videoRef.current
    if (!video) return

    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current
      } catch {
        // Ignore AbortError from previous play
      }
    }

    try {
      playPromiseRef.current = video.play()
      await playPromiseRef.current
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Video play error:", error)
      }
    } finally {
      playPromiseRef.current = null
    }
  }

  const safePause = async () => {
    const video = videoRef.current
    if (!video) return

    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current
      } catch {
        // Ignore AbortError
      }
      playPromiseRef.current = null
    }

    video.pause()
  }

  const togglePlayPause = async () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      await safePlay()
    } else {
      await safePause()
    }
  }

  const handleSeek = async (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    video.currentTime = percent * duration
  }

  const skipBackward = () => {
    const video = videoRef.current
    if (video) video.currentTime = Math.max(0, video.currentTime - 10)
  }

  const skipForward = () => {
    const video = videoRef.current
    if (video) video.currentTime = Math.min(duration, video.currentTime + 10)
  }

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 1))
  }

  // Rotate control (90 degree increments)
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Toggle mark mode
  const toggleMarkMode = () => {
    setMarkMode((prev) => !prev)
  }

  // Handle snapshot capture
  const handleSnapshot = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current frame to canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64 image URL
    const imageUrl = canvas.toDataURL("image/jpeg", 0.9)

    // Create snapshot object
    const snapshot: Snapshot = {
      id: `snapshot-${Date.now()}`,
      imageUrl,
      timestamp: currentTime,
      capturedAt: new Date(),
    }

    // Add to context
    addSnapshot(snapshot)

    // Show flash effect
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 150)
  }

  // Handle fullscreen (target container, not video)
  const handleFullscreen = async () => {
    const container = videoContainerRef.current
    if (!container) return
    
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await container.requestFullscreen()
      }
    } catch (error) {
      // Fullscreen may be blocked by permissions policy in iframes
      console.log("[v0] Fullscreen not available:", error)
    }
  }

  // Pan handlers for drag-to-pan when zoomed
  const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1 || markMode) return
    e.preventDefault()
    setIsPanning(true)
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
  }

  const handlePanMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || zoomLevel <= 1) return
    e.preventDefault()
    
    const container = videoContainerRef.current
    if (!container) return

    // Calculate max pan based on zoom level and container size
    const containerRect = container.getBoundingClientRect()
    const maxPanX = (containerRect.width * (zoomLevel - 1)) / 2
    const maxPanY = (containerRect.height * (zoomLevel - 1)) / 2

    const newX = e.clientX - panStart.x
    const newY = e.clientY - panStart.y

    // Clamp pan offset to prevent panning too far
    setPanOffset({
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
    })
  }

  const handlePanEnd = () => {
    setIsPanning(false)
  }

  // Handle video area click for placing markers (only if not panning)
  const handleVideoAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) return
    if (!markMode) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const newMarker: Marker = {
      id: `marker-${Date.now()}`,
      x,
      y,
      timestampSec: currentTime,
      durationSec: markerDuration,
    }

    setMarkers((prev) => [...prev, newMarker])
    setMarkMode(false) // Exit mark mode after placing
  }

  // Determine cursor style
  const getCursorStyle = () => {
    if (markMode) return "cursor-crosshair"
    if (zoomLevel > 1) return isPanning ? "cursor-grabbing" : "cursor-grab"
    return ""
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card overflow-hidden">
      {/* Video Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                isSAR ? "bg-orange-500" : "bg-muted-foreground"
              )} />
            </span>
            <span className={cn(
              "font-mono text-xs font-semibold uppercase tracking-widest",
              isSAR ? "text-orange-500" : "text-muted-foreground"
            )}>
              Archived
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="font-mono text-xs text-muted-foreground">
            {isSAR ? "FLIR THERMAL ALPHA" : "EO/IR SENSOR ALPHA"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Pan indicator */}
          {zoomLevel > 1 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Move className="h-3 w-3" />
              Drag to Pan
            </span>
          )}
          {/* Zoom indicator */}
          {zoomLevel !== 1 && (
            <span className="font-mono text-[10px] text-muted-foreground">
              {zoomLevel.toFixed(2)}x
            </span>
          )}
          {/* Rotation indicator */}
          {rotation !== 0 && (
            <span className="font-mono text-[10px] text-muted-foreground">
              {rotation}°
            </span>
          )}
          <button 
            onClick={handleSnapshot}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded border px-2 text-xs transition-colors",
              isSAR 
                ? "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" 
                : "border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Camera className="h-3 w-3" />
            <span className="font-mono uppercase">Snapshot</span>
          </button>
        </div>
      </div>

      {/* Video Area with Pan/Zoom Support - flex-1 to fill remaining space, but constrained */}
      <div 
        ref={videoContainerRef}
        className={cn(
          "relative flex-1 min-h-0 bg-background overflow-hidden select-none",
          getCursorStyle()
        )}
        onClick={handleVideoAreaClick}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
      >
        {/* Hidden canvas for snapshot capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Flash effect for snapshot */}
        {showFlash && (
          <div className="absolute inset-0 z-50 bg-white pointer-events-none" />
        )}

        {/* Real Video Element with zoom, rotation, and pan transforms */}
        <video
          ref={videoRef}
          key={videoSrc}
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-300 pointer-events-none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
          }}
          src={videoSrc}
          muted
          playsInline
          crossOrigin="anonymous"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Overlays - move with pan */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
          }}
        >
          {/* User-placed markers */}
          {visibleMarkers.map((marker) => (
            <UserMarker key={marker.id} marker={marker} isSAR={isSAR} />
          ))}
        </div>

        {/* Mark mode indicator - fixed position */}
        {markMode && (
          <div className="absolute inset-0 z-30 pointer-events-none border-4 border-dashed border-cyan-400/50 animate-pulse" />
        )}

        {/* HUD Overlay - Top Left (fixed position) */}
        <div className="absolute left-4 top-4 space-y-1 pointer-events-none z-10">
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            LAT: {isSAR ? "-37.8109° S" : "-17.8132° N"}
          </div>
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            LON: {isSAR ? "144.9672° E" : "74.9637° E"}
          </div>
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            ZOOM: {zoomLevel.toFixed(1)}x
          </div>
        </div>

        {/* HUD Overlay - Top Right (fixed position) */}
        <div className="absolute right-4 top-4 space-y-1 text-right pointer-events-none z-10">
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            HEADING: {isSAR ? "270°" : "045°"}
          </div>
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            SLANT: {isSAR ? "0.8 NM" : "12.4 NM"}
          </div>
          <div className={cn(
            "font-mono text-[10px]",
            isSAR ? "text-orange-400/80" : "text-primary/80"
          )}>
            ROT: {rotation}°
          </div>
        </div>

        {/* Timecode (fixed position) */}
        <div className="absolute bottom-4 left-4 pointer-events-none z-10">
          <div className="font-mono text-xs font-semibold text-foreground/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Zoom/Rotate/Mark Controls - Right Side (fixed position, always interactive) */}
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-1 z-30">
          <button 
            onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded backdrop-blur transition-colors",
              zoomLevel >= 3 
                ? "bg-background/30 text-foreground/30 cursor-not-allowed" 
                : "bg-background/50 text-foreground/70 hover:bg-background/70 hover:text-foreground"
            )}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded backdrop-blur transition-colors",
              zoomLevel <= 1 
                ? "bg-background/30 text-foreground/30 cursor-not-allowed" 
                : "bg-background/50 text-foreground/70 hover:bg-background/70 hover:text-foreground"
            )}
            disabled={zoomLevel <= 1}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleRotate(); }}
            className="flex h-8 w-8 items-center justify-center rounded bg-background/50 text-foreground/70 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <div className="h-px w-full bg-foreground/20 my-1" />
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMarkMode(); }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded backdrop-blur transition-colors",
              markMode 
                ? isSAR 
                  ? "bg-yellow-400 text-black" 
                  : "bg-cyan-400 text-black"
                : "bg-background/50 text-foreground/70 hover:bg-background/70 hover:text-foreground"
            )}
          >
            {markMode ? <X className="h-4 w-4" /> : <Crosshair className="h-4 w-4" />}
          </button>
          {/* Marker duration selector - only show when mark mode is active */}
          {markMode && (
            <div className="flex flex-col items-center gap-1 mt-1 bg-background/70 rounded p-1 backdrop-blur">
              <span className="font-mono text-[8px] text-foreground/70 uppercase">Dur</span>
              <select
                value={markerDuration}
                onChange={(e) => setMarkerDuration(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-6 text-[10px] font-mono bg-background border border-border rounded text-center text-foreground cursor-pointer"
              >
                <option value={1}>1s</option>
                <option value={3}>3s</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Video Controls */}
      <div className="flex items-center gap-4 border-t border-border px-4 py-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={skipBackward}
            className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={togglePlayPause}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              isSAR 
                ? "bg-orange-500 text-white hover:bg-orange-600" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 translate-x-0.5" />
            )}
          </button>
          <button 
            onClick={skipForward}
            className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-1 items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {formatTime(currentTime)}
          </span>
          <div 
            className="relative flex-1 cursor-pointer"
            onClick={handleSeek}
          >
            <div className="h-1.5 w-full rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isSAR ? "bg-orange-500" : "bg-primary"
                )}
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
              />
            </div>
            {/* Event markers on timeline */}
            {missionData.filter(e => e.target_box).map((event) => (
              <div
                key={event.id}
                className={cn(
                  "absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-sm",
                  isSAR ? "bg-yellow-400/70" : "bg-red-500/70"
                )}
                style={{
                  left: duration ? `${(event.timestamp_ms / 1000 / duration) * 100}%` : "0%"
                }}
                title={event.title}
              />
            ))}
            {/* User marker indicators on timeline */}
            {markers.map((marker) => (
              <div
                key={marker.id}
                className={cn(
                  "absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full",
                  isSAR ? "bg-yellow-400" : "bg-cyan-400"
                )}
                style={{
                  left: duration ? `${(marker.timestampSec / duration) * 100}%` : "0%"
                }}
                title={`Marker at ${formatTime(marker.timestampSec)}`}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume & Fullscreen */}
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Volume2 className="h-4 w-4" />
          </button>
          <button 
            onClick={handleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
