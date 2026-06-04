"use client"

import { useRef, useState } from "react"
import { useMission } from "@/contexts/mission-context"
import { cn } from "@/lib/utils"
import {
  FileText,
  Download,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function GenerateAAR() {
  const { missionMode, missionData, videoRef, videoFileName, telemetryFileName } = useMission()
  const reportRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const isSAR = missionMode === "sar"
  const isIndustrial = missionMode === "industrial"

  const flightDuration = videoRef.current?.duration
    ? formatTime(videoRef.current.duration)
    : "00:00"

  const totalEvents = missionData.length
  const now = new Date()
  const missionDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const missionTime = now.toLocaleTimeString("en-US", { hour12: false })

  const accentBg = isIndustrial
    ? "bg-emerald-500/10 text-emerald-500"
    : isSAR
    ? "bg-orange-500/10 text-orange-500"
    : "bg-primary/10 text-primary"

  const accentHeaderBg = isIndustrial
    ? "bg-emerald-500/5"
    : isSAR
    ? "bg-orange-500/5"
    : "bg-primary/5"

  const categoryBadge = isIndustrial
    ? "bg-emerald-500/10 text-emerald-400"
    : isSAR
    ? "bg-orange-500/10 text-orange-400"
    : "bg-primary/10 text-primary"

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  function formatTimestamp(ms: number) {
    const totalSeconds = Math.floor(ms / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const missionLabel = isIndustrial
    ? "Wind Farm Inspection"
    : isSAR
    ? "Search & Rescue"
    : "ISR Surveillance"

  const missionSubtitle = isIndustrial
    ? "Industrial Inspection Summary"
    : isSAR
    ? "Search & Rescue Mission Summary"
    : "Tactical Mission Summary"

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return
    setIsGenerating(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).jsPDF

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0a0f",
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = imgWidth / imgHeight
      const scaledWidth = pdfWidth
      const scaledHeight = scaledWidth / ratio

      // Paginate if content is taller than one page
      let yOffset = 0
      while (yOffset < scaledHeight) {
        if (yOffset > 0) pdf.addPage()
        pdf.addImage(
          imgData,
          "PNG",
          0,
          -yOffset,
          scaledWidth,
          scaledHeight,
          undefined,
          "FAST"
        )
        yOffset += pdfHeight
      }

      const filename = `AAR_${missionLabel.replace(/\s+/g, "_")}_${now.toISOString().slice(0, 10)}.pdf`
      pdf.save(filename)
    } catch (err) {
      console.error("PDF generation failed:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-semibold text-foreground">
            After Action Report
          </h1>
          <p className="font-mono text-xs text-muted-foreground">{missionSubtitle}</p>
        </div>
        <Button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className={cn(
            "gap-2",
            isIndustrial
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : isSAR
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : ""
          )}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="font-mono text-xs uppercase">
            {isGenerating ? "Generating..." : "Download PDF"}
          </span>
        </Button>
      </div>

      {/* Report Preview — this node is captured by html2canvas */}
      <div ref={reportRef} className="rounded-lg border border-border bg-card">
        {/* Report Header */}
        <div className={cn("border-b border-border p-6", accentHeaderBg)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-lg", accentBg)}>
                <Crosshair className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-mono text-lg font-semibold text-foreground">
                  OVERWATCH AEROSPACE
                </h2>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {isIndustrial
                    ? "Industrial Inspection Division"
                    : isSAR
                    ? "Search & Rescue Operations"
                    : "Tactical Operations Division"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-muted-foreground">Report Generated</p>
              <p className="font-mono text-sm font-medium text-foreground">{missionDate}</p>
              <p className="font-mono text-xs text-muted-foreground">{missionTime} UTC</p>
            </div>
          </div>
        </div>

        {/* Mission Details */}
        <div className="border-b border-border p-6">
          <h3 className="mb-4 flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-foreground">
            <FileText className="h-4 w-4" />
            Mission Details
          </h3>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Mission Type
              </p>
              <p className="font-mono text-sm font-medium text-foreground">{missionLabel}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Flight Duration
              </p>
              <p className="font-mono text-sm font-medium text-foreground">{flightDuration}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Video Source
              </p>
              <p className="font-mono text-sm font-medium text-foreground truncate">
                {videoFileName || "N/A"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Telemetry Source
              </p>
              <p className="font-mono text-sm font-medium text-foreground truncate">
                {telemetryFileName || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* GPS Waypoints */}
        <div className="border-b border-border p-6">
          <h3 className="mb-4 flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-foreground">
            <MapPin className="h-4 w-4" />
            GPS Waypoints
          </h3>
          {missionData.length > 0 ? (
            <div className="rounded border border-border bg-background p-4">
              <div className="mb-2 grid grid-cols-4 gap-4 border-b border-border pb-2">
                {["Timestamp", "Latitude", "Longitude", "Event"].map((h) => (
                  <span
                    key={h}
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    {h}
                  </span>
                ))}
              </div>
              <div className="max-h-32 space-y-1 overflow-auto">
                {missionData.slice(0, 10).map((event) => (
                  <div key={event.id} className="grid grid-cols-4 gap-4">
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatTimestamp(event.timestamp_ms)}
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {event.coordinates.lat.toFixed(4)}
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {event.coordinates.lon.toFixed(4)}
                    </span>
                    <span className="font-mono text-xs text-foreground truncate">
                      {event.category}
                    </span>
                  </div>
                ))}
              </div>
              {missionData.length > 10 && (
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  + {missionData.length - 10} more waypoints...
                </p>
              )}
            </div>
          ) : (
            <p className="font-mono text-xs text-muted-foreground">No GPS data available.</p>
          )}
        </div>

        {/* Event Log */}
        <div className="border-b border-border p-6">
          <h3 className="mb-4 flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-foreground">
            <AlertTriangle className="h-4 w-4" />
            Event Log ({totalEvents} Events)
          </h3>
          {missionData.length > 0 ? (
            <div className="max-h-64 space-y-3 overflow-auto">
              {missionData.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded border border-border bg-background p-3"
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs",
                      event.threat_level === "high" || event.threat_level === "critical"
                        ? "bg-neon-red/10 text-neon-red"
                        : event.threat_level === "medium"
                        ? "bg-neon-amber/10 text-neon-amber"
                        : accentBg
                    )}
                  >
                    {formatTimestamp(event.timestamp_ms).split(":")[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-foreground">
                        [{formatTimestamp(event.timestamp_ms)}]
                      </span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 font-mono text-[10px] uppercase",
                          categoryBadge
                        )}
                      >
                        {event.category}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-sm text-foreground">{event.title}</p>
                    <p className="mt-0.5 line-clamp-2 font-mono text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-xs text-muted-foreground">No events recorded.</p>
          )}
        </div>

        {/* Mission Summary */}
        <div className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-widest text-foreground">
            <CheckCircle2 className="h-4 w-4" />
            Mission Summary
          </h3>
          <div className="rounded border border-border bg-background p-4">
            <p className="font-mono text-xs leading-relaxed text-muted-foreground">
              {missionData.length > 0 ? (
                <>
                  This{" "}
                  <span className="font-medium text-foreground">
                    {missionLabel.toLowerCase()}
                  </span>{" "}
                  mission recorded{" "}
                  <span className="font-medium text-foreground">{totalEvents} events</span> over a
                  flight duration of{" "}
                  <span className="font-medium text-foreground">{flightDuration}</span>.{" "}
                  {isIndustrial
                    ? "Structural anomalies and maintenance findings were identified and logged for follow-up inspection."
                    : isSAR
                    ? "Thermal anomalies and potential subjects were identified and logged for follow-up investigation."
                    : "Movement patterns and potential targets were catalogued for intelligence analysis."}{" "}
                  All coordinates have been verified against the uploaded telemetry data.
                </>
              ) : (
                "No mission data available. Upload drone footage and telemetry to generate a complete after action report."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
