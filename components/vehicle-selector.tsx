"use client"

import { Suspense, type ComponentType, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import { Box, FoldHorizontal, Layers3, Package2, Plane, PlugZap } from "lucide-react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export type DroneVersion = "v1" | "v2"
export type DroneViewMode = "full" | "folded" | "box"
export type DronePayload = "none" | "spectrum-500" | "spectrum-800" | "vio"

interface VehicleSelectorProps {
  selectedVersion: DroneVersion
  selectedView: DroneViewMode
  selectedPayload: DronePayload
  tetherEnabled: boolean
  onVersionChange: (version: DroneVersion) => void
  onViewChange: (view: DroneViewMode) => void
  onPayloadChange: (payload: DronePayload) => void
  onTetherChange: (enabled: boolean) => void
}

type SelectorIcon = ComponentType<{ className?: string }>

const versions: Array<{
  value: DroneVersion
  label: string
  code: string
}> = [
  { value: "v1", label: "Legacy V1", code: "DR-01" },
  { value: "v2", label: "Current V2", code: "DR-02" },
]

const views: Array<{
  value: DroneViewMode
  label: string
  code: string
  icon: SelectorIcon
}> = [
  { value: "full", label: "Flight", code: "FULL", icon: Plane },
  { value: "folded", label: "Folded", code: "FLD", icon: FoldHorizontal },
  { value: "box", label: "Ship", code: "BOX", icon: Box },
]

const payloads: Array<{
  value: DronePayload
  label: string
  code: string
}> = [
  { value: "none", label: "Clean", code: "STD" },
  { value: "spectrum-500", label: "Spectrum 500", code: "SP-500" },
  { value: "spectrum-800", label: "Spectrum 800", code: "SP-800" },
  { value: "vio", label: "VIO Camera", code: "VIO" },
]

function getPayloadAssets(payload: DronePayload) {
  if (payload === "spectrum-500") {
    return ["/models/29-inch-v2-no-payload.fbx", "/models/spectrum-500-payload.fbx"]
  }

  if (payload === "spectrum-800") {
    return ["/models/29-inch-v2-no-payload.fbx", "/models/spectrum-800-payload.fbx"]
  }

  if (payload === "vio") {
    return ["/models/29-inch-v2-no-payload.fbx", "/models/vio-camera-payload.fbx"]
  }

  return ["/models/29-inch-v2-no-payload.fbx"]
}

function PayloadModel({ payload }: { payload: DronePayload }) {
  const groupRef = useRef<THREE.Group>(null)
  const [adjusted, setAdjusted] = useState(false)
  const [modelScale, setModelScale] = useState(0.009)
  const assetPaths = useMemo(() => getPayloadAssets(payload), [payload])
  const signature = assetPaths.join("|")
  const loadedAssets = useLoader(FBXLoader, assetPaths) as THREE.Group[]

  useEffect(() => {
    setAdjusted(false)
  }, [signature])

  useLayoutEffect(() => {
    if (!groupRef.current || adjusted) return

    const box = new THREE.Box3().setFromObject(groupRef.current)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDimension = Math.max(size.x, size.y, size.z) || 1

    groupRef.current.position.x -= center.x
    groupRef.current.position.z -= center.z
    groupRef.current.position.y -= box.min.y + size.y * 0.015
    setModelScale(0.022 / maxDimension)
    setAdjusted(true)
  }, [adjusted, loadedAssets])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.35) * 0.07
  })

  return (
    <Float speed={1.15} rotationIntensity={0} floatIntensity={0.1}>
      <group ref={groupRef} rotation={[-Math.PI / 2, Math.PI / 4, 0]}>
        {loadedAssets.map((asset, index) => (
          <primitive key={`${assetPaths[index]}-${index}`} object={asset} scale={modelScale} />
        ))}
      </group>
    </Float>
  )
}

function PayloadPreview({ payload }: { payload: DronePayload }) {
  return (
    <div className="pointer-events-none relative h-24 w-full overflow-hidden rounded-md border border-white/6 bg-black/18">
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [5.6, 2.8, 5.6], fov: 28 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        className="bg-transparent"
      >
        <ambientLight intensity={0.45} />
        <spotLight position={[6, 7, 5]} angle={0.42} penumbra={0.9} intensity={2.2} />
        <pointLight position={[-5, 3, 3]} intensity={0.8} color="#d7dde7" />
        <pointLight position={[0, 3, -5]} intensity={0.65} color="#f0bcbc" />
        <Suspense fallback={null}>
          <PayloadModel payload={payload} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_28%,rgba(0,0,0,0.22)_100%)]" />
    </div>
  )
}

function rowButtonClass(active: boolean) {
  return cn(
    "ui-item flex min-h-[3.25rem] items-center justify-between gap-3 rounded-[1rem] border px-3 py-2 text-left",
    active
      ? "border-[#a62121]/38 bg-[#a62121]/14 text-white shadow-[0_18px_40px_rgba(166,33,33,0.12)]"
      : "border-white/10 bg-white/[0.03] text-white/62 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
  )
}

function tileButtonClass(active: boolean) {
  return cn(
    "ui-item flex min-h-[4.35rem] flex-col items-start justify-between rounded-[1rem] border px-3 py-2.5 text-left",
    active
      ? "border-[#a62121]/35 bg-[#180d0d] text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
      : "border-white/10 bg-white/[0.03] text-white/62 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
  )
}

export function VehicleSelector({
  selectedVersion,
  selectedView,
  selectedPayload,
  tetherEnabled,
  onVersionChange,
  onViewChange,
  onPayloadChange,
  onTetherChange,
}: VehicleSelectorProps) {
  const isV2 = selectedVersion === "v2"
  const payloadPreviewReady = selectedView === "full"

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Airframe</p>

        <div className="grid grid-cols-2 gap-2">
          {versions.map(({ value, label, code }) => {
            const active = selectedVersion === value

            return (
              <button key={value} type="button" onClick={() => onVersionChange(value)} className={rowButtonClass(active)}>
                <div className="flex items-center gap-2.5">
                  <Layers3 className={cn("h-4 w-4", active ? "text-[#ffb3b3]" : "text-white/45")} />
                  <div className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">{label}</span>
                    <span className={cn("text-[10px] uppercase tracking-[0.22em]", active ? "text-white/52" : "text-white/28")}>
                      Airframe
                    </span>
                  </div>
                </div>
                <span className={cn("text-[10px] uppercase tracking-[0.22em]", active ? "text-white/52" : "text-white/28")}>{code}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">View</p>

        {isV2 ? (
          <div className="grid grid-cols-3 gap-2">
            {views.map(({ value, label, code, icon: Icon }) => {
              const active = selectedView === value

              return (
                <button key={value} type="button" onClick={() => onViewChange(value)} className={tileButtonClass(active)}>
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("h-4 w-4", active ? "text-[#ffb3b3]" : "text-white/42")} />
                    <span className="text-[13px] font-medium">{label}</span>
                  </div>
                  <span className={cn("text-[10px] uppercase tracking-[0.22em]", active ? "text-white/46" : "text-white/28")}>{code}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="ui-surface flex min-h-[4.35rem] items-center gap-2 rounded-[1rem] px-3 py-2.5 text-white/68">
            <Plane className="h-4 w-4 text-[#a62121]" />
            <div>
              <p className="text-[13px] font-medium text-white/82">Flight view only</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/32">Legacy configuration</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Payload</p>

        <div className="grid gap-2">
          {!payloadPreviewReady && (
            <div className="ui-surface flex items-center gap-2 rounded-[1rem] px-3 py-2 text-[12px] text-white/58">
              <Package2 className="h-4 w-4 text-[#a62121]" />
              Payload and tether preview are shown in flight mode.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {payloads.map(({ value, label, code }) => {
              const active = selectedPayload === value

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onPayloadChange(value)}
                  className={cn(tileButtonClass(active), "gap-2")}
                >
                  <PayloadPreview payload={value} />
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-[12px] font-medium">{label}</span>
                    <span className={cn("text-[10px] uppercase tracking-[0.18em]", active ? "text-white/46" : "text-white/28")}>{code}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <button type="button" onClick={() => onTetherChange(!tetherEnabled)} className={rowButtonClass(tetherEnabled)}>
            <div className="flex items-center gap-2.5">
              <PlugZap className={cn("h-4 w-4", tetherEnabled ? "text-[#ffb3b3]" : "text-white/42")} />
              <div className="min-w-0">
                <span className="block truncate text-[13px] font-medium">Tether</span>
                <span className={cn("text-[10px] uppercase tracking-[0.22em]", tetherEnabled ? "text-white/52" : "text-white/28")}>
                  Power link
                </span>
              </div>
            </div>
            <span className={cn("text-[10px] uppercase tracking-[0.18em]", tetherEnabled ? "text-white/52" : "text-white/28")}>
              {tetherEnabled ? "On" : "Off"}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
