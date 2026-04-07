"use client"

import { type FormEvent, useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { DroneViewer, type DroneVersion, type DroneViewMode, type ViewerEnvironment } from "@/components/drone-viewer"
import { Header } from "@/components/header"
import { getAssetCount, preloadAssets } from "@/lib/asset-preload"
import { VehicleSelector, type DronePayload } from "@/components/vehicle-selector"
import { Input } from "@/components/ui/input"

const PASSWORD = "letmein"

export default function Home() {
  const [version, setVersion] = useState<DroneVersion>("v2")
  const [view, setView] = useState<DroneViewMode>("full")
  const [payload, setPayload] = useState<DronePayload>("none")
  const [tetherEnabled, setTetherEnabled] = useState(true)
  const [environment, setEnvironment] = useState<ViewerEnvironment>("studio")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [warmupLoaded, setWarmupLoaded] = useState(0)
  const [warmupReady, setWarmupReady] = useState(false)
  const warmupTotal = getAssetCount()

  useEffect(() => {
    let cancelled = false

    void preloadAssets(
      (loaded) => {
        if (!cancelled) {
          setWarmupLoaded(loaded)
        }
      },
      () => {
        if (!cancelled) {
          setWarmupReady(true)
        }
      }
    ).then(() => {
      if (!cancelled) {
        setWarmupLoaded(warmupTotal)
      }
    })

    return () => {
      cancelled = true
    }
  }, [warmupTotal])

  const handleLogin = (event?: FormEvent) => {
    event?.preventDefault()

    if (!warmupReady) {
      setLoginError("System is still preparing the review environment.")
      return
    }

    if (password === PASSWORD) {
      setAuthenticated(true)
      setLoginError("")
      return
    }

    setLoginError("Incorrect password.")
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (loginError) setLoginError("")
  }

  const handleVersionChange = (nextVersion: DroneVersion) => {
    setVersion(nextVersion)
  }

  if (!authenticated) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-6 text-white">
        <div className="absolute inset-0 bg-[#0b0b0b]" />
        <div className="atmo-grid absolute inset-0 opacity-[0.14]" />
        <div className="pointer-events-none absolute left-[12%] top-[16%] h-56 w-56 rounded-full bg-[#8d1818]/12 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[12%] right-[14%] h-64 w-64 rounded-full bg-[#8d1818]/8 blur-3xl" />

        <form
          onSubmit={handleLogin}
          className="ui-surface-premium noise-overlay relative z-10 flex w-full max-w-[26rem] flex-col gap-5 px-6 py-6 sm:px-7"
        >
          <div className="space-y-3">
            <div className="ui-kicker w-fit">Secure Access</div>
            <h1 className="font-display text-[2rem] font-semibold uppercase tracking-[-0.06em] text-white sm:text-[2.4rem]">
              Proxima 29
            </h1>
            <p className="max-w-sm text-sm leading-6 text-white/62">
              Internal review environment for aircraft configuration and payload visualization.
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/44">Password</label>
            <Input
              type="password"
              placeholder="Enter access credential"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="h-12 border-white/10 bg-white/[0.02] px-4 text-white placeholder:text-white/24"
            />
            <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.16em] text-white/34">
              <span>System warmup</span>
              <span>
                {warmupLoaded}/{warmupTotal}
              </span>
            </div>
            <div className="h-[2px] w-full overflow-hidden bg-white/6">
              <div
                className="h-full bg-[#a62121] transition-[width] duration-500"
                style={{ width: `${(warmupLoaded / warmupTotal) * 100}%` }}
              />
            </div>
            {loginError ? (
              <div className="flex items-center gap-2 border border-[#a62121]/30 bg-[#a62121]/10 px-3 py-2 text-[12px] text-[#ffb2b2]">
                <AlertCircle className="h-4 w-4" />
                {loginError}
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!warmupReady}
            className="ui-btn-primary h-12 w-full uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {warmupReady ? "Enter" : "Preparing"}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="compact-shell relative isolate overflow-hidden text-white">
      <div className="absolute inset-0 bg-[#0b0b0b]" />
      <div className="atmo-grid absolute inset-0 opacity-[0.1]" />
      <div className="radial-vignette absolute inset-0" />
      <div className="pointer-events-none absolute left-[-8rem] top-[8%] h-[24rem] w-[24rem] rounded-full bg-[#8d1818]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-[18%] h-[26rem] w-[26rem] rounded-full bg-[#8d1818]/8 blur-3xl" />

      <Header />

      <div className="relative z-20 h-full px-3 pb-3 pt-[4.5rem] sm:px-5 sm:pt-[4.8rem] lg:px-6 lg:pb-5 xl:px-8">
        <div className="grid h-full grid-cols-1 gap-3 lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[22.5rem_minmax(0,1fr)]">
          <aside className="ui-surface-premium noise-overlay flex min-h-0 flex-col px-4 py-4 sm:px-5">
            <div className="space-y-3">
              <h1 className="font-display text-[2rem] font-semibold uppercase tracking-[-0.06em] text-white sm:text-[2.4rem]">
                Proxima 29
              </h1>
              <p className="max-w-sm text-[13px] leading-5 text-white/60">
                Review airframe, payload, and environment.
              </p>
            </div>

            <div className="mt-4 flex-1">
              <VehicleSelector
                selectedVersion={version}
                selectedView={view}
                selectedPayload={payload}
                tetherEnabled={tetherEnabled}
                onVersionChange={handleVersionChange}
                onViewChange={setView}
                onPayloadChange={setPayload}
                onTetherChange={setTetherEnabled}
              />
            </div>

            <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Background</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "studio", label: "Studio" },
                  { key: "stadium", label: "Orlando" },
                ].map((option) => {
                  const active = environment === option.key
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setEnvironment(option.key as ViewerEnvironment)}
                      className={`ui-item border px-3 py-2 text-left text-[12px] uppercase tracking-[0.14em] ${
                        active
                          ? "border-[#a62121]/40 bg-[#a62121]/12 text-white"
                          : "border-white/10 bg-white/[0.02] text-white/58 hover:border-white/18 hover:text-white/86"
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          <section className="ui-surface-premium relative min-h-[400px] overflow-hidden lg:min-h-0">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.18))]" />

            <div className="absolute inset-0">
              <DroneViewer
                version={version}
                view={view}
                payload={payload}
                tetherEnabled={tetherEnabled}
                environment={environment}
              />
            </div>

            <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex items-end justify-start sm:inset-x-5">
              <div className="ui-surface px-3.5 py-2">
                <p className="text-xs text-white/76">Drag to orbit. Scroll to zoom.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
