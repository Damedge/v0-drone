'use client'

import dynamic from "next/dynamic"

const KestrelScene = dynamic(
  () => import("@/components/kestrel-scene").then((m) => m.KestrelScene),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-background" />,
  },
)

function KestrelMark() {
  return (
    <div className="flex items-center gap-3" aria-label="Kestrel Recon">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/8">
        <svg viewBox="0 0 32 32" className="h-5 w-5 text-primary" fill="none" aria-hidden="true">
          <path d="M4 18.8 14.7 7l-.9 8.1L28 12.2 17.9 24l.8-7.5L4 18.8Z" fill="currentColor" />
          <path d="m14.7 7 3.2 17" stroke="currentColor" strokeWidth="1.2" opacity=".45" />
        </svg>
      </span>
      <span className="text-sm font-semibold tracking-[0.2em] text-foreground/90">KESTREL RECON</span>
    </div>
  )
}

export function KestrelLanding() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-foreground">

      {/* Subtle scan grid */}
      <div className="scan-grid pointer-events-none absolute inset-0 z-10" aria-hidden="true" />

      {/* 3D scene fills the full background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <KestrelScene />
      </div>

      {/* Radial vignette to pull focus to center */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 0%, rgba(9,11,18,0.42) 52%, rgba(9,11,18,0.88) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Logo — top center */}
      <header className="absolute inset-x-0 top-0 z-30 flex justify-center px-6 py-7">
        <KestrelMark />
      </header>

      {/* Centered teaser copy */}
      <section className="fade-up relative z-20 flex flex-col items-center gap-6 px-6 text-center">

        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-primary/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/80">
            AI-native spatial intelligence
          </span>
          <span className="h-px w-8 bg-primary/60" />
        </div>

        <h1 className="text-balance text-5xl font-medium leading-[0.92] tracking-[-0.05em] text-foreground sm:text-6xl lg:text-7xl">
          See the world<br />before it changes.
        </h1>

        <p className="max-w-xs text-pretty text-sm leading-6 text-foreground/45 sm:max-w-sm sm:text-base sm:leading-7">
          Something significant is being built here.
        </p>

        <div className="mt-2 flex items-center gap-3">
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-primary"
            style={{ animationDuration: "2.4s" }}
            aria-hidden="true"
          />
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-foreground/35">
            Coming Soon
          </span>
        </div>

      </section>

      {/* Bottom coordinates mark */}
      <footer className="absolute bottom-0 inset-x-0 z-20 flex justify-center pb-6">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/20">
          kestrelrecon.com
        </span>
      </footer>

    </main>
  )
}
