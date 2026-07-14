'use client'

import dynamic from "next/dynamic"
import { useState } from "react"
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Database,
  Menu,
  Orbit,
  Radar,
  ShieldCheck,
  X,
} from "lucide-react"

const KestrelScene = dynamic(
  () => import("@/components/kestrel-scene").then((module) => module.KestrelScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="h-16 w-16 animate-pulse rounded-full border border-primary/30 bg-primary/10" />
      </div>
    ),
  },
)

const navItems = ["Platform", "Solutions", "Data", "Resources"]

const capabilities = [
  {
    icon: BrainCircuit,
    number: "01",
    title: "AI Analytics",
    description: "Detect patterns across every sensor, surface, and signal in real time.",
  },
  {
    icon: Database,
    number: "02",
    title: "Geospatial Data",
    description: "Unify imagery, terrain, telemetry, and open data in one spatial layer.",
  },
  {
    icon: Radar,
    number: "03",
    title: "Intelligence",
    description: "Turn global change into clear, operational decisions before it matters.",
  },
]

function KestrelMark() {
  return (
    <a href="#top" className="group flex items-center gap-3" aria-label="Kestrel Recon home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-primary/35 bg-primary/8">
        <svg viewBox="0 0 32 32" className="h-5 w-5 text-primary" fill="none" aria-hidden="true">
          <path d="M4 18.8 14.7 7l-.9 8.1L28 12.2 17.9 24l.8-7.5L4 18.8Z" fill="currentColor" />
          <path d="m14.7 7 3.2 17" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
        </svg>
        <span className="absolute inset-0 rounded-full border border-primary/0 transition group-hover:scale-125 group-hover:border-primary/20" />
      </span>
      <span className="text-sm font-semibold tracking-[0.18em] text-foreground">KESTREL RECON</span>
    </a>
  )
}

function TelemetryPanel() {
  return (
    <div className="glass-panel absolute right-[6%] top-[28%] hidden w-52 rounded-2xl p-4 xl:block">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/45">Orbital feed</span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Live
        </span>
      </div>
      <div className="mt-5 flex h-16 items-end gap-1.5" aria-hidden="true">
        {[31, 46, 38, 66, 54, 83, 63, 92, 72, 88, 77, 96].map((height, index) => (
          <span
            key={`${height}-${index}`}
            className="w-full rounded-t-sm bg-primary/35"
            style={{ height: `${height}%`, opacity: 0.45 + index * 0.035 }}
          />
        ))}
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase text-foreground/35">Objects indexed</p>
          <p className="mt-1 text-lg font-medium text-foreground">18.42M</p>
        </div>
        <span className="font-mono text-[10px] text-primary">+12.8%</span>
      </div>
    </div>
  )
}

function SignalPanel() {
  return (
    <div className="glass-panel absolute bottom-[29%] left-[7%] hidden w-48 rounded-2xl p-4 lg:block">
      <div className="flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 text-accent" />
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/50">Change signal</span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-medium text-foreground">0.93</span>
        <span className="font-mono text-[9px] text-accent">HIGH CONFIDENCE</span>
      </div>
      <div className="mt-3 h-px overflow-hidden bg-foreground/10">
        <div className="metric-line h-full w-[93%] bg-accent" />
      </div>
      <p className="mt-3 text-[10px] leading-4 text-foreground/42">Urban growth detected · Sector 07</p>
    </div>
  )
}

export function KestrelLanding() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main id="top" className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="scan-grid pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-foreground/10" />

      <header className="absolute inset-x-0 top-0 z-40 mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 md:px-8 lg:px-12">
        <KestrelMark />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs font-medium text-foreground/55 transition hover:text-foreground"
            >
              {item}
            </a>
          ))}
          <a
            href="#demo"
            className="flex items-center gap-2 rounded-full border border-primary/45 bg-primary/10 px-5 py-2.5 text-xs font-semibold text-foreground transition hover:bg-primary hover:text-background"
          >
            Request demo <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-card/60 text-foreground md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation overlay"
          />
          <nav
            className="glass-panel fixed inset-x-4 top-20 z-50 flex flex-col gap-1 rounded-2xl p-3 md:hidden"
            aria-label="Mobile navigation"
          >
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
            >
              {item}
            </a>
          ))}
          <a
            href="#demo"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-background"
          >
            Request demo <ArrowRight className="h-4 w-4" />
          </a>
          </nav>
        </>
      )}

      <section className="relative min-h-screen" aria-labelledby="hero-title">
        <div className="absolute inset-0 z-0">
          <KestrelScene />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_48%,transparent_0%,rgba(9,11,18,0.12)_42%,rgba(9,11,18,0.78)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(9,11,18,0.92)_0%,rgba(9,11,18,0.35)_34%,transparent_58%)]" />

        <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-8 pt-32 md:px-8 lg:px-12 lg:pt-40">
          <div className="max-w-xl">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                AI-native spatial intelligence
              </span>
            </div>
            <h1 id="hero-title" className="max-w-[650px] text-balance text-5xl font-medium leading-[0.95] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5.2rem]">
              See the world before it changes.
            </h1>
            <p className="mt-7 max-w-md text-pretty text-sm leading-6 text-foreground/55 sm:text-base sm:leading-7">
              Kestrel Recon fuses planetary-scale data with autonomous AI to detect change, model risk, and surface the intelligence that moves decisions forward.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#demo"
                className="group flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-background transition hover:brightness-110"
              >
                Explore the platform
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
              <a
                href="#platform"
                className="flex items-center gap-3 rounded-full border border-foreground/15 bg-card/35 px-6 py-3.5 text-sm font-medium text-foreground/75 backdrop-blur-md transition hover:border-foreground/30 hover:text-foreground"
              >
                <Orbit className="h-4 w-4 text-accent" />
                Watch overview
              </a>
            </div>
          </div>

          <TelemetryPanel />
          <SignalPanel />

          <div id="platform" className="mt-auto grid gap-3 pt-24 md:grid-cols-3 lg:gap-4">
            {capabilities.map((capability) => {
              const Icon = capability.icon
              return (
                <article
                  key={capability.title}
                  className="glass-panel group flex min-h-36 items-start gap-4 rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/25 lg:p-6"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-sm font-semibold tracking-tight text-foreground">{capability.title}</h2>
                      <span className="font-mono text-[9px] text-foreground/25">{capability.number}</span>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-foreground/45">{capability.description}</p>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-foreground/10 pt-5">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/35">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Intelligence layer operational
            </div>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/25 sm:block">
              37°46&apos;N · 122°25&apos;W
            </span>
          </div>
        </div>
      </section>

      <section id="demo" className="sr-only" aria-label="Request a Kestrel Recon demonstration">
        Contact Kestrel Recon to request a product demonstration.
      </section>
      <span id="solutions" className="sr-only" />
      <span id="data" className="sr-only" />
      <span id="resources" className="sr-only" />
    </main>
  )
}
