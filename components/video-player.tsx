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
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMission } from "@/contexts/mission-context"

export function VideoPlayer() {
  const { missionMode, videoRef } = useMission()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const playPromiseRef = useRef<Promise<void> | null>(null)

  const isSAR = missionMode === "sar"
  const videoSrc = isSAR ? "/videos/searchForPeople.mp4" : "/videos/battlefield.mp4"

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleDurationChange = () => setDuration(video.duration || 0)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("durationchange", handleDurationChange)
    video.addEventListener("loadedmetadata", handleDurationChange)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("durationchange", handleDurationChange)
      video.removeEventListener("loadedmetadata", handleDurationChange)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [videoRef])

  // Reset video when mode changes
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      playPromiseRef.current = null
      video.load()
      setCurrentTime(0)
      setIsPlaying(false)
    }
  }, [missionMode, videoRef])

  const safePlay = async () => {
    const video = videoRef.current
    if (!video) return

    // Wait for any pending play promise to resolve before playing again
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
      // Ignore AbortError - happens when play is interrupted
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

    // Wait for any pending play promise before pausing
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

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
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
          <button className={cn(
            "flex h-7 items-center gap-1.5 rounded border px-2 text-xs transition-colors",
            isSAR 
              ? "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" 
              : "border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
          )}>
            <Layers className="h-3 w-3" />
            <span className="font-mono uppercase">Multi-View</span>
          </button>
          <button className={cn(
            "flex h-7 items-center gap-1.5 rounded border px-2 text-xs transition-colors",
            isSAR 
              ? "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" 
              : "border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
          )}>
            <Camera className="h-3 w-3" />
            <span className="font-mono uppercase">Snapshot</span>
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className="relative aspect-video bg-background overflow-hidden">
        {/* Real Video Element */}
        <video
          ref={videoRef}
          key={videoSrc}
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          muted
          playsInline
        />

        {/* HUD Overlay - Top Left */}
        <div className="absolute left-4 top-4 space-y-1 pointer-events-none">
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
            ZOOM: {isSAR ? "8.0x" : "4.5x"}
          </div>
        </div>

        {/* HUD Overlay - Top Right */}
        <div className="absolute right-4 top-4 space-y-1 text-right pointer-events-none">
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
            FOV: {isSAR ? "15.0°" : "2.1°"}
          </div>
        </div>

        {/* HUD Overlay - Bottom Left */}
        <div className="absolute bottom-4 left-4 pointer-events-none">
          <div className="font-mono text-xs font-semibold text-foreground/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Zoom Controls - Right Side */}
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-1">
          <button className="flex h-8 w-8 items-center justify-center rounded bg-background/50 text-foreground/70 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded bg-background/50 text-foreground/70 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded bg-background/50 text-foreground/70 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded bg-background/50 text-foreground/70 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground">
            <Crosshair className="h-4 w-4" />
          </button>
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
          <button className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
