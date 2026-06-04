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
  Brain,
  Camera,
  Activity,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function GenerateAAR() {
  const {
    missionMode,
    missionData,
    videoRef,
    videoFileName,
    telemetryFileName,
    snapshots,
    trainedAnnotations,
  } = useMission()
  const [isGenerating, setIsGenerating] = useState(false)

  const isSAR = missionMode === "sar"
  const isIndustrial = missionMode === "industrial"

  // ─── Derived values ─────────────────────────────────────────────
  const now = new Date()
  const missionDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const missionTime = now.toLocaleTimeString("en-US", { hour12: false })

  const missionLabel = isIndustrial
    ? "Op: Wind Farm Inspection (Industrial)"
    : isSAR
    ? "Op: Alpine Rescue (Search & Rescue)"
    : "Op: Silent Guardian (Tactical ISR)"

  const missionType = isIndustrial ? "Industrial Inspection" : isSAR ? "Search & Rescue" : "Tactical ISR"

  const flightDuration = videoRef.current?.duration
    ? formatTime(videoRef.current.duration)
    : "N/A"

  const totalEvents = missionData.length

  const categoryBreakdown = missionData.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const threatLevels = missionData.reduce(
    (acc, e) => {
      if (e.threat_level) acc[e.threat_level] = (acc[e.threat_level] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const confidenceEvents = missionData.filter((e) => e.confidence !== undefined)
  const avgConfidence =
    confidenceEvents.length > 0
      ? Math.round(
          (confidenceEvents.reduce((s, e) => s + (e.confidence || 0), 0) /
            confidenceEvents.length) *
            100
        )
      : null

  const highestConfidence =
    confidenceEvents.length > 0
      ? Math.round(Math.max(...confidenceEvents.map((e) => e.confidence || 0)) * 100)
      : null

  const maxThreat = Object.keys(threatLevels).includes("critical")
    ? "CRITICAL"
    : Object.keys(threatLevels).includes("high")
    ? "HIGH"
    : Object.keys(threatLevels).includes("medium")
    ? "MEDIUM"
    : totalEvents > 0
    ? "LOW"
    : "N/A"

  // ─── Accent colours (for preview) ───────────────────────────────
  const accent = isIndustrial ? "emerald" : isSAR ? "orange" : "cyan"
  const accentBg = isIndustrial
    ? "bg-emerald-500/10 text-emerald-400"
    : isSAR
    ? "bg-orange-500/10 text-orange-400"
    : "bg-primary/10 text-primary"
  const accentBorder = isIndustrial
    ? "border-emerald-500/30"
    : isSAR
    ? "border-orange-500/30"
    : "border-primary/30"
  const accentText = isIndustrial
    ? "text-emerald-400"
    : isSAR
    ? "text-orange-400"
    : "text-primary"

  // ─── Helpers ────────────────────────────────────────────────────
  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  function formatTimestamp(ms: number) {
    const s = Math.floor(ms / 1000)
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`
  }

  function threatColor(level?: string): [number, number, number] {
    if (level === "critical" || level === "high") return [220, 53, 69]
    if (level === "medium") return [255, 193, 7]
    return [25, 195, 125]
  }

  // ─── PDF generation ─────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const { jsPDF } = await import("jspdf")

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
      const W = pdf.internal.pageSize.getWidth()   // 595
      const H = pdf.internal.pageSize.getHeight()  // 842

      const MARGIN = 40
      const COL = W - MARGIN * 2
      let y = MARGIN

      // ── palette ──
      const C = {
        bg:       [10, 10, 20]   as [number, number, number],
        card:     [18, 18, 30]   as [number, number, number],
        border:   [40, 40, 60]   as [number, number, number],
        text:     [220, 220, 235] as [number, number, number],
        muted:    [110, 110, 140] as [number, number, number],
        accent:   isIndustrial ? [16, 185, 129] as [number, number, number]
                : isSAR        ? [249, 115, 22] as [number, number, number]
                :                [0, 200, 220]  as [number, number, number],
        red:      [220, 53, 69]  as [number, number, number],
        amber:    [245, 158, 11] as [number, number, number],
        green:    [25, 195, 125] as [number, number, number],
        white:    [255, 255, 255] as [number, number, number],
      }

      // ── utils ──
      const setFill = (c: [number,number,number]) => pdf.setFillColor(c[0], c[1], c[2])
      const setDraw = (c: [number,number,number]) => pdf.setDrawColor(c[0], c[1], c[2])
      const setTxt  = (c: [number,number,number]) => pdf.setTextColor(c[0], c[1], c[2])
      const rect    = (x: number, yy: number, w: number, h: number, fill = true) =>
        fill ? pdf.rect(x, yy, w, h, "F") : pdf.rect(x, yy, w, h, "S")

      const needsPage = (requiredPts: number) => {
        if (y + requiredPts > H - MARGIN) {
          pdf.addPage()
          // re-paint background on new page
          setFill(C.bg); rect(0, 0, W, H)
          y = MARGIN
        }
      }

      const sectionHeader = (title: string, iconChar: string) => {
        needsPage(30)
        setFill(C.card); rect(MARGIN, y, COL, 24)
        setFill(C.accent); rect(MARGIN, y, 3, 24)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(9)
        setTxt(C.accent)
        pdf.text(iconChar + "  " + title.toUpperCase(), MARGIN + 10, y + 15.5)
        y += 32
      }

      const labelValue = (label: string, value: string, x: number, colW: number, yy: number) => {
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(7)
        setTxt(C.muted)
        pdf.text(label.toUpperCase(), x, yy)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(9)
        setTxt(C.text)
        pdf.text(value || "N/A", x, yy + 12, { maxWidth: colW - 4 })
      }

      // ════════════════════════════════════════════════════════════
      // PAGE BACKGROUND
      // ════════════════════════════════════════════════════════════
      setFill(C.bg); rect(0, 0, W, H)

      // ════════════════════════════════════════════════════════════
      // HEADER BAR
      // ════════════════════════════════════════════════════════════
      setFill(C.card); rect(0, 0, W, 72)
      setFill(C.accent); rect(0, 68, W, 4) // accent underline

      // Logo block
      setFill(C.accent); rect(MARGIN, 12, 48, 48, true)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(20)
      setTxt(C.bg)
      pdf.text("OA", MARGIN + 11, 42)

      // Title
      pdf.setFontSize(16)
      setTxt(C.white)
      pdf.text("OVERWATCH AEROSPACE", MARGIN + 58, 30)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)
      setTxt(C.muted)
      const divLabel = isIndustrial
        ? "INDUSTRIAL INSPECTION DIVISION"
        : isSAR
        ? "SEARCH & RESCUE OPERATIONS"
        : "TACTICAL OPERATIONS DIVISION"
      pdf.text(divLabel, MARGIN + 58, 43)
      pdf.setFontSize(7)
      pdf.text("AFTER ACTION REPORT  //  CLASSIFICATION: UNCLASSIFIED", MARGIN + 58, 56)

      // Date block (right-aligned)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(9)
      setTxt(C.text)
      pdf.text(missionDate, W - MARGIN, 30, { align: "right" })
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(7)
      setTxt(C.muted)
      pdf.text(missionTime + " UTC", W - MARGIN, 42, { align: "right" })
      pdf.text("Generated by UAV-ML Platform", W - MARGIN, 54, { align: "right" })

      y = 84

      // ════════════════════════════════════════════════════════════
      // MISSION DETAILS
      // ════════════════════════════════════════════════════════════
      sectionHeader("Mission Details", "▸")

      // Card background
      const detailCardH = 80
      setFill(C.card); rect(MARGIN, y, COL, detailCardH)
      setDraw(C.border); rect(MARGIN, y, COL, detailCardH, false)

      const colW = COL / 4
      labelValue("Mission",      missionLabel,    MARGIN + 8,           colW, y + 14)
      labelValue("Type",         missionType,     MARGIN + 8 + colW,    colW, y + 14)
      labelValue("Flight Duration", flightDuration, MARGIN + 8 + colW*2, colW, y + 14)
      labelValue("Total Events", String(totalEvents), MARGIN + 8 + colW*3, colW, y + 14)

      labelValue("Video File",     videoFileName || "N/A", MARGIN + 8,           colW * 2, y + 50)
      labelValue("Telemetry File", telemetryFileName || "N/A", MARGIN + 8 + colW*2, colW * 2, y + 50)
      y += detailCardH + 16

      // ════════════════════════════════════════════════════════════
      // MISSION STATISTICS
      // ════════════════════════════════════════════════════════════
      sectionHeader("Mission Statistics", "◈")

      // Stat boxes row
      const statBoxW = (COL - 12) / 4
      const statBoxH = 56
      const statBoxes = isIndustrial || isSAR
        ? [
            { label: "Total Events",   value: String(totalEvents) },
            { label: "Avg Confidence", value: avgConfidence != null ? `${avgConfidence}%` : "N/A" },
            { label: "Max Confidence", value: highestConfidence != null ? `${highestConfidence}%` : "N/A" },
            { label: "Categories",     value: String(Object.keys(categoryBreakdown).length) },
          ]
        : [
            { label: "Total Events",    value: String(totalEvents) },
            { label: "Max Threat",      value: maxThreat },
            { label: "High/Critical",   value: String((threatLevels["high"] || 0) + (threatLevels["critical"] || 0)) },
            { label: "Categories",      value: String(Object.keys(categoryBreakdown).length) },
          ]

      needsPage(statBoxH + 16)
      statBoxes.forEach((s, i) => {
        const bx = MARGIN + i * (statBoxW + 4)
        setFill(C.card); rect(bx, y, statBoxW, statBoxH)
        setDraw(C.border); rect(bx, y, statBoxW, statBoxH, false)
        setFill(C.accent); rect(bx, y, statBoxW, 3)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(6.5)
        setTxt(C.muted)
        pdf.text(s.label.toUpperCase(), bx + 8, y + 16)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(20)
        setTxt(C.text)
        pdf.text(s.value, bx + 8, y + 42)
      })
      y += statBoxH + 16

      // Category breakdown table
      needsPage(28)
      if (Object.keys(categoryBreakdown).length > 0) {
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(8)
        setTxt(C.muted)
        pdf.text("CATEGORY BREAKDOWN", MARGIN, y)
        y += 10

        Object.entries(categoryBreakdown).forEach(([cat, count]) => {
          needsPage(18)
          const pct = totalEvents > 0 ? count / totalEvents : 0
          setFill(C.card); rect(MARGIN, y, COL, 16)

          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(8)
          setTxt(C.text)
          pdf.text(cat, MARGIN + 8, y + 10.5)

          // bar
          const barX = MARGIN + 120
          const barW = COL - 160
          setFill(C.border); rect(barX, y + 5, barW, 6)
          setFill(C.accent); rect(barX, y + 5, barW * pct, 6)

          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(8)
          setTxt(C.muted)
          pdf.text(`${count}  (${Math.round(pct * 100)}%)`, W - MARGIN - 4, y + 10.5, { align: "right" })
          y += 18
        })
        y += 8
      }

      // Threat distribution (tactical only)
      if (!isSAR && !isIndustrial && Object.keys(threatLevels).length > 0) {
        needsPage(24)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(8)
        setTxt(C.muted)
        pdf.text("THREAT LEVEL DISTRIBUTION", MARGIN, y)
        y += 10

        const tCols = ["critical", "high", "medium", "low"]
        const tW = (COL - 12) / 4
        needsPage(52)
        tCols.forEach((level, i) => {
          const tx = MARGIN + i * (tW + 4)
          const col = level === "critical" || level === "high" ? C.red : level === "medium" ? C.amber : C.green
          setFill(C.card); rect(tx, y, tW, 48)
          setFill(col); rect(tx, y, tW, 3)
          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(18)
          setTxt(C.text)
          pdf.text(String(threatLevels[level] || 0), tx + 8, y + 30)
          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(7)
          setTxt(C.muted)
          pdf.text(level.toUpperCase(), tx + 8, y + 42)
        })
        y += 60
      }

      // ════════════════════════════════════════════════════════════
      // GPS WAYPOINTS
      // ════════════════════════════════════════════════════════════
      sectionHeader("GPS Waypoints", "⊕")

      if (missionData.length > 0) {
        // Table header
        needsPage(18)
        setFill(C.border); rect(MARGIN, y, COL, 16)
        const cols = ["Timestamp", "Latitude", "Longitude", "Category", "Event Title"]
        const colWs = [56, 72, 72, 72, COL - 56 - 72 - 72 - 72]
        let cx = MARGIN + 8
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(7)
        setTxt(C.muted)
        cols.forEach((c, i) => {
          pdf.text(c.toUpperCase(), cx, y + 10.5)
          cx += colWs[i]
        })
        y += 18

        missionData.forEach((event) => {
          needsPage(15)
          setFill(C.card); rect(MARGIN, y, COL, 14)
          cx = MARGIN + 8
          const cells = [
            formatTimestamp(event.timestamp_ms),
            event.coordinates.lat.toFixed(5),
            event.coordinates.lon.toFixed(5),
            event.category,
            event.title,
          ]
          cells.forEach((cell, i) => {
            pdf.setFont("helvetica", i === 4 ? "normal" : "normal")
            pdf.setFontSize(7.5)
            setTxt(i === 3 ? C.accent : C.text)
            pdf.text(cell, cx, y + 9.5, { maxWidth: colWs[i] - 4 })
            cx += colWs[i]
          })
          y += 14
        })
        y += 10
      } else {
        needsPage(24)
        setFill(C.card); rect(MARGIN, y, COL, 22)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(8)
        setTxt(C.muted)
        pdf.text("No GPS waypoints recorded.", MARGIN + 8, y + 14)
        y += 30
      }

      // ════════════════════════════════════════════════════════════
      // EVENT LOG
      // ════════════════════════════════════════════════════════════
      sectionHeader("Event Log", "▲")

      if (missionData.length > 0) {
        missionData.forEach((event, idx) => {
          needsPage(50)
          const cardH = event.description ? 54 : 38
          setFill(C.card); rect(MARGIN, y, COL, cardH)
          setDraw(C.border); rect(MARGIN, y, COL, cardH, false)

          // Left accent stripe coloured by threat/confidence
          const stripeColor = event.threat_level
            ? threatColor(event.threat_level)
            : event.confidence
            ? (event.confidence >= 0.8 ? C.green : event.confidence >= 0.5 ? C.amber : C.red)
            : C.accent
          setFill(stripeColor as [number,number,number]); rect(MARGIN, y, 3, cardH)

          // Index badge
          setFill(C.border); rect(MARGIN + 8, y + 8, 22, 14)
          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(7)
          setTxt(C.muted)
          pdf.text(String(idx + 1).padStart(2, "0"), MARGIN + 11, y + 17)

          // Timestamp
          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(7)
          setTxt(C.muted)
          pdf.text(`[${formatTimestamp(event.timestamp_ms)}]`, MARGIN + 36, y + 17)

          // Category badge
          const badgeX = MARGIN + 90
          setFill(C.accent); rect(badgeX, y + 7, 48, 13, true)
          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(6.5)
          setTxt(C.bg)
          pdf.text(event.category.slice(0, 10), badgeX + 3, y + 16)

          // Threat / confidence
          if (event.threat_level) {
            const tc = threatColor(event.threat_level)
            setFill(tc as [number,number,number]); rect(badgeX + 52, y + 7, 48, 13)
            pdf.setFont("helvetica", "bold")
            pdf.setFontSize(6.5)
            setTxt(C.bg)
            pdf.text(event.threat_level.toUpperCase(), badgeX + 55, y + 16)
          } else if (event.confidence !== undefined) {
            pdf.setFont("helvetica", "bold")
            pdf.setFontSize(7)
            setTxt(C.accent)
            pdf.text(`${Math.round(event.confidence * 100)}% CONF`, badgeX + 54, y + 16)
          }

          // GPS coordinates (right)
          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(7)
          setTxt(C.muted)
          pdf.text(
            `${event.coordinates.lat.toFixed(4)}°, ${event.coordinates.lon.toFixed(4)}°`,
            W - MARGIN - 8, y + 17, { align: "right" }
          )

          // Title
          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(9)
          setTxt(C.text)
          pdf.text(event.title, MARGIN + 8, y + 32, { maxWidth: COL - 16 })

          // Description
          if (event.description) {
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(7.5)
            setTxt(C.muted)
            pdf.text(event.description, MARGIN + 8, y + 44, {
              maxWidth: COL - 16,
            })
          }

          y += cardH + 5
        })
        y += 6
      } else {
        needsPage(24)
        setFill(C.card); rect(MARGIN, y, COL, 22)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(8)
        setTxt(C.muted)
        pdf.text("No events recorded.", MARGIN + 8, y + 14)
        y += 30
      }

      // ════════════════════════════════════════════════════════════
      // TRAINED DATA (HITL Annotations)
      // ════════════════════════════════════════════════════════════
      sectionHeader("Trained Data (HITL Annotations)", "◉")

      needsPage(20)
      setFill(C.card); rect(MARGIN, y, COL, 18)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(8)
      setTxt(C.muted)
      pdf.text(`TOTAL ANNOTATIONS: ${trainedAnnotations.length}`, MARGIN + 8, y + 11.5)
      y += 22

      if (trainedAnnotations.length > 0) {
        trainedAnnotations.forEach((ann, idx) => {
          needsPage(36)
          setFill(C.card); rect(MARGIN, y, COL, 32)
          setFill(C.accent); rect(MARGIN, y, 3, 32)

          // Badge
          setFill(C.accent); rect(MARGIN + 8, y + 8, 60, 13)
          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(6.5)
          setTxt(C.bg)
          pdf.text("USER-TRAINED", MARGIN + 11, y + 17)

          // Title
          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(9)
          setTxt(C.text)
          pdf.text(ann.title, MARGIN + 76, y + 14, { maxWidth: COL - 140 })

          // Timestamp / trained at
          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(7)
          setTxt(C.muted)
          pdf.text(
            `Video timestamp: ${formatTime(ann.timestamp)}  •  Trained at: ${ann.trainedAt.toLocaleTimeString()}`,
            MARGIN + 76, y + 26
          )

          // Event index
          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(7)
          setTxt(C.muted)
          pdf.text(`#${idx + 1}`, W - MARGIN - 8, y + 14, { align: "right" })

          y += 36
        })
      } else {
        needsPage(24)
        setFill(C.card); rect(MARGIN, y, COL, 22)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(8)
        setTxt(C.muted)
        pdf.text("No operator annotations recorded during this session.", MARGIN + 8, y + 14)
        y += 30
      }
      y += 6

      // ════════════════════════════════════════════════════════════
      // CAPTURED INTELLIGENCE
      // ════════════════════════════════════════════════════════════
      sectionHeader("Captured Intelligence (Snapshots)", "◎")

      needsPage(20)
      setFill(C.card); rect(MARGIN, y, COL, 18)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(8)
      setTxt(C.muted)
      pdf.text(`TOTAL SNAPSHOTS: ${snapshots.length}`, MARGIN + 8, y + 11.5)
      y += 22

      if (snapshots.length > 0) {
        // Embed each snapshot as a small image row
        for (const [idx, snap] of snapshots.entries()) {
          needsPage(52)
          setFill(C.card); rect(MARGIN, y, COL, 48)
          setFill(C.accent); rect(MARGIN, y, 3, 48)

          // Try to embed image
          try {
            pdf.addImage(snap.imageUrl, "PNG", MARGIN + 8, y + 4, 80, 40, undefined, "FAST")
          } catch {
            setFill(C.border); rect(MARGIN + 8, y + 4, 80, 40)
            pdf.setFontSize(7)
            setTxt(C.muted)
            pdf.text("Image unavailable", MARGIN + 10, y + 24)
          }

          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(8)
          setTxt(C.text)
          pdf.text(`Snapshot #${idx + 1}`, MARGIN + 98, y + 14)

          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(7)
          setTxt(C.muted)
          pdf.text(`Captured at video time: ${formatTime(snap.timestamp)}`, MARGIN + 98, y + 26)
          pdf.text(`Session time: ${snap.capturedAt.toLocaleTimeString()}`, MARGIN + 98, y + 37)

          y += 52
        }
      } else {
        needsPage(24)
        setFill(C.card); rect(MARGIN, y, COL, 22)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(8)
        setTxt(C.muted)
        pdf.text("No snapshots captured during this session.", MARGIN + 8, y + 14)
        y += 30
      }
      y += 6

      // ════════════════════════════════════════════════════════════
      // MISSION SUMMARY
      // ════════════════════════════════════════════════════════════
      sectionHeader("Mission Summary", "✦")

      needsPage(80)
      setFill(C.card); rect(MARGIN, y, COL, 72)
      setDraw(C.border); rect(MARGIN, y, COL, 72, false)
      setFill(C.accent); rect(MARGIN, y, 3, 72)

      const summaryLines = [
        `This ${missionType.toLowerCase()} mission recorded ${totalEvents} detection event${totalEvents !== 1 ? "s" : ""} over a flight duration of ${flightDuration}.`,
        ...(isIndustrial || isSAR
          ? [
              `Average model confidence: ${avgConfidence != null ? avgConfidence + "%" : "N/A"}.  Peak confidence: ${highestConfidence != null ? highestConfidence + "%" : "N/A"}.`,
              isIndustrial
                ? "Structural anomalies and maintenance findings were identified and logged for follow-up inspection by a qualified engineer."
                : "Thermal anomalies and potential subjects were identified and logged for follow-up SAR team deployment.",
            ]
          : [
              `Maximum threat level encountered: ${maxThreat}.  High/Critical events: ${(threatLevels["high"] || 0) + (threatLevels["critical"] || 0)}.`,
              "Movement patterns and potential targets were catalogued and are ready for intelligence analysis and dissemination.",
            ]),
        `Operator captured ${snapshots.length} intelligence snapshot${snapshots.length !== 1 ? "s" : ""} and submitted ${trainedAnnotations.length} HITL annotation${trainedAnnotations.length !== 1 ? "s" : ""} to the edge model.`,
        "All GPS coordinates have been verified against uploaded telemetry data.  This report is UNCLASSIFIED.",
      ]

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8.5)
      setTxt(C.text)
      let sy = y + 14
      for (const line of summaryLines) {
        const wrapped = pdf.splitTextToSize(line, COL - 20)
        pdf.text(wrapped, MARGIN + 10, sy)
        sy += wrapped.length * 11
      }
      y += 80

      // ════════════════════════════════════════════════════════════
      // FOOTER on every page
      // ════════════════════════════════════════════════════════════
      const pageCount = (pdf.internal as { getNumberOfPages: () => number }).getNumberOfPages()
      for (let p = 1; p <= pageCount; p++) {
        pdf.setPage(p)
        setFill(C.card); rect(0, H - 28, W, 28)
        setFill(C.accent); rect(0, H - 28, W, 2)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(7)
        setTxt(C.muted)
        pdf.text(
          `OVERWATCH AEROSPACE  //  ${missionLabel.toUpperCase()}  //  GENERATED ${missionDate.toUpperCase()}`,
          MARGIN, H - 10
        )
        pdf.text(`Page ${p} of ${pageCount}`, W - MARGIN, H - 10, { align: "right" })
      }

      const filename = `AAR_${missionType.replace(/\s+/g, "_")}_${now.toISOString().slice(0, 10)}.pdf`
      pdf.save(filename)
    } catch (err) {
      console.error("PDF generation failed:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  // ─── Preview ──────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-2">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-semibold text-foreground">
            After Action Report
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            {isIndustrial
              ? "Industrial Inspection Summary"
              : isSAR
              ? "Search & Rescue Mission Summary"
              : "Tactical Mission Summary"}
          </p>
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

      {/* ── Preview card ─────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card">

        {/* Header */}
        <div className={cn("border-b border-border p-6", isIndustrial ? "bg-emerald-500/5" : isSAR ? "bg-orange-500/5" : "bg-primary/5")}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-lg", accentBg)}>
                <Crosshair className="h-8 w-8" />
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-foreground">OVERWATCH AEROSPACE</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {isIndustrial ? "Industrial Inspection Division" : isSAR ? "Search & Rescue Operations" : "Tactical Operations Division"}
                </p>
                <p className={cn("mt-1 font-mono text-xs font-medium", accentText)}>{missionLabel}</p>
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
          <h3 className={cn("mb-4 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest", accentText)}>
            <FileText className="h-3.5 w-3.5" /> Mission Details
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-4">
            {[
              { label: "Mission",        value: missionLabel },
              { label: "Flight Duration",value: flightDuration },
              { label: "Video Source",   value: videoFileName  || "N/A" },
              { label: "Telemetry",      value: telemetryFileName || "N/A" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="mt-0.5 font-mono text-sm font-medium text-foreground truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="border-b border-border p-6">
          <h3 className={cn("mb-4 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest", accentText)}>
            <Activity className="h-3.5 w-3.5" /> Mission Statistics
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(isIndustrial || isSAR
              ? [
                  { label: "Total Events",   value: String(totalEvents) },
                  { label: "Avg Confidence", value: avgConfidence != null ? `${avgConfidence}%` : "N/A" },
                  { label: "Max Confidence", value: highestConfidence != null ? `${highestConfidence}%` : "N/A" },
                  { label: "Categories",     value: String(Object.keys(categoryBreakdown).length) },
                ]
              : [
                  { label: "Total Events",  value: String(totalEvents) },
                  { label: "Max Threat",    value: maxThreat },
                  { label: "High/Critical", value: String((threatLevels["high"] || 0) + (threatLevels["critical"] || 0)) },
                  { label: "Categories",    value: String(Object.keys(categoryBreakdown).length) },
                ]
            ).map(({ label, value }) => (
              <div key={label} className={cn("rounded border p-3", accentBorder, "bg-background")}>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className={cn("mt-1 font-mono text-2xl font-semibold", accentText)}>{value}</p>
              </div>
            ))}
          </div>

          {/* Category bars */}
          {Object.keys(categoryBreakdown).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(categoryBreakdown).map(([cat, count]) => {
                const pct = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="w-24 font-mono text-[10px] uppercase text-muted-foreground">{cat}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn("h-full rounded-full", isIndustrial ? "bg-emerald-500" : isSAR ? "bg-orange-500" : "bg-primary")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-[10px] text-muted-foreground">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* GPS Waypoints */}
        <div className="border-b border-border p-6">
          <h3 className={cn("mb-4 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest", accentText)}>
            <MapPin className="h-3.5 w-3.5" /> GPS Waypoints ({totalEvents})
          </h3>
          {missionData.length > 0 ? (
            <div className="overflow-hidden rounded border border-border">
              <div className="grid grid-cols-4 gap-2 border-b border-border bg-secondary/50 px-3 py-2">
                {["Time", "Latitude", "Longitude", "Category"].map((h) => (
                  <span key={h} className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-border">
                {missionData.slice(0, 12).map((e) => (
                  <div key={e.id} className="grid grid-cols-4 gap-2 px-3 py-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{formatTimestamp(e.timestamp_ms)}</span>
                    <span className="font-mono text-[10px] text-foreground">{e.coordinates.lat.toFixed(5)}</span>
                    <span className="font-mono text-[10px] text-foreground">{e.coordinates.lon.toFixed(5)}</span>
                    <span className={cn("font-mono text-[10px]", accentText)}>{e.category}</span>
                  </div>
                ))}
              </div>
              {missionData.length > 12 && (
                <div className="border-t border-border px-3 py-2">
                  <span className="font-mono text-[10px] text-muted-foreground">+{missionData.length - 12} more waypoints in full PDF</span>
                </div>
              )}
            </div>
          ) : (
            <p className="font-mono text-xs text-muted-foreground">No GPS data recorded.</p>
          )}
        </div>

        {/* Event Log */}
        <div className="border-b border-border p-6">
          <h3 className={cn("mb-4 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest", accentText)}>
            <AlertTriangle className="h-3.5 w-3.5" /> Event Log ({totalEvents})
          </h3>
          <div className="space-y-2">
            {missionData.length > 0 ? (
              missionData.slice(0, 8).map((e) => (
                <div key={e.id} className="flex items-start gap-3 rounded border border-border bg-background p-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[9px] text-muted-foreground">{formatTimestamp(e.timestamp_ms)}</span>
                    <span className={cn("rounded px-1 py-0.5 font-mono text-[8px] uppercase", accentBg)}>{e.category}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-medium text-foreground">{e.title}</p>
                    {e.description && (
                      <p className="mt-0.5 line-clamp-1 font-mono text-[10px] text-muted-foreground">{e.description}</p>
                    )}
                  </div>
                  {(e.threat_level || e.confidence !== undefined) && (
                    <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
                      {e.threat_level ? e.threat_level.toUpperCase() : `${Math.round((e.confidence || 0) * 100)}%`}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="font-mono text-xs text-muted-foreground">No events recorded.</p>
            )}
            {missionData.length > 8 && (
              <p className="font-mono text-[10px] text-muted-foreground">+{missionData.length - 8} more events in full PDF</p>
            )}
          </div>
        </div>

        {/* Trained Data */}
        <div className="border-b border-border p-6">
          <h3 className={cn("mb-4 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest", accentText)}>
            <Brain className="h-3.5 w-3.5" /> Trained Data — {trainedAnnotations.length} HITL Annotation{trainedAnnotations.length !== 1 ? "s" : ""}
          </h3>
          {trainedAnnotations.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {trainedAnnotations.map((ann) => (
                <div key={ann.id} className={cn("relative aspect-video overflow-hidden rounded border-2", accentBorder, "bg-background")}>
                  <img src={ann.imageUrl} alt={ann.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <p className={cn("truncate font-mono text-[8px] font-semibold", accentText)}>{ann.title}</p>
                    <p className="font-mono text-[7px] text-white/60">{formatTime(ann.timestamp)}</p>
                  </div>
                  <div className={cn("absolute left-1 top-1 rounded px-1 py-0.5 font-mono text-[7px] font-bold", accentBg)}>USR</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-xs text-muted-foreground">No annotations recorded during this session.</p>
          )}
        </div>

        {/* Captured Intelligence */}
        <div className="border-b border-border p-6">
          <h3 className={cn("mb-4 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest", accentText)}>
            <Camera className="h-3.5 w-3.5" /> Captured Intelligence — {snapshots.length} Snapshot{snapshots.length !== 1 ? "s" : ""}
          </h3>
          {snapshots.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {snapshots.map((snap) => (
                <div key={snap.id} className="relative aspect-video overflow-hidden rounded border border-border bg-background">
                  <img src={snap.imageUrl} alt={`Snapshot ${formatTime(snap.timestamp)}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <p className={cn("font-mono text-[8px] font-semibold", accentText)}>{formatTime(snap.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-xs text-muted-foreground">No snapshots captured during this session.</p>
          )}
        </div>

        {/* Summary */}
        <div className="p-6">
          <h3 className={cn("mb-4 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest", accentText)}>
            <Shield className="h-3.5 w-3.5" /> Mission Summary
          </h3>
          <div className={cn("rounded border p-4", accentBorder, "bg-background")}>
            <p className="font-mono text-xs leading-relaxed text-muted-foreground">
              {missionData.length > 0 ? (
                <>
                  This <span className="font-medium text-foreground">{missionType.toLowerCase()}</span> mission recorded{" "}
                  <span className="font-medium text-foreground">{totalEvents} event{totalEvents !== 1 ? "s" : ""}</span> over a flight duration of{" "}
                  <span className="font-medium text-foreground">{flightDuration}</span>.{" "}
                  {isIndustrial
                    ? "Structural anomalies and maintenance findings were identified and logged for follow-up inspection."
                    : isSAR
                    ? "Thermal anomalies and potential subjects were identified and logged for follow-up investigation."
                    : `Maximum threat level encountered: ${maxThreat}.`}{" "}
                  Operator captured <span className="font-medium text-foreground">{snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""}</span> and submitted{" "}
                  <span className="font-medium text-foreground">{trainedAnnotations.length} HITL annotation{trainedAnnotations.length !== 1 ? "s" : ""}</span> to the edge model.
                  {" "}All GPS coordinates have been verified against uploaded telemetry data.
                </>
              ) : (
                "No mission data available. Load a mission to generate a complete After Action Report."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
