"use client"

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { ContactShadows, Environment, Float, Grid, Html, OrbitControls, Stars } from "@react-three/drei"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Maximize2 } from "lucide-react"
import type { DronePayload } from "@/components/vehicle-selector"

export type DroneVersion = "v1" | "v2"
export type DroneViewMode = "full" | "folded" | "box"
export type ViewerEnvironment = "studio" | "stadium"

interface DroneViewerProps {
  version: DroneVersion
  view: DroneViewMode
  payload: DronePayload
  tetherEnabled: boolean
  environment: ViewerEnvironment
}

type DroneAsset = {
  path: string
}

function getDroneAssets(version: DroneVersion, view: DroneViewMode, payload: DronePayload, tetherEnabled: boolean): DroneAsset[] {
  if (view === "folded") {
    return [{ path: "/models/29in-drone-v2-folded 2.fbx" }]
  }

  if (view === "box") {
    return [{ path: "/models/29-inch-v2-in-a-box.fbx" }]
  }

  const basePath = version === "v1" ? "/models/29-inch-v1-no-payload.fbx" : "/models/29-inch-v2-no-payload.fbx"
  const assets: DroneAsset[] = [{ path: basePath }]

  if (payload === "spectrum-500") {
    assets.push({ path: "/models/spectrum-500-payload.fbx" })
  } else if (payload === "spectrum-800") {
    assets.push({ path: "/models/spectrum-800-payload.fbx" })
  } else if (payload === "vio") {
    assets.push({ path: "/models/vio-camera-payload.fbx" })
  }

  if (tetherEnabled) {
    assets.push({ path: "/models/29-inch-tether.fbx" })
  }

  return assets
}

function getRotation(view: DroneViewMode): [number, number, number] {
  if (view === "box") return [-Math.PI / 2, Math.PI / 2, 0]
  return [-Math.PI / 2, 0, 0]
}

function getScale(view: DroneViewMode) {
  if (view === "box") return 0.0085
  return 0.01
}

function getCameraSettings(view: DroneViewMode, tetherEnabled: boolean) {
  if (view === "box") {
    return { position: [11, 6.75, 11] as [number, number, number], fov: 42 }
  }

  if (view === "folded") {
    return { position: [8.6, 5.75, 8.9] as [number, number, number], fov: 47 }
  }

  if (tetherEnabled) {
    return { position: [9.4, 6.2, 9.4] as [number, number, number], fov: 48 }
  }

  return { position: [7.75, 5.25, 7.75] as [number, number, number], fov: 48 }
}

function getFloatSettings(view: DroneViewMode) {
  if (view === "box") {
    return {
      speed: 0.7,
      rotationIntensity: 0.02,
      floatIntensity: 0.04,
      floatingRange: [0, 0.035] as [number, number],
    }
  }

  return {
    speed: 1.05,
    rotationIntensity: 0.07,
    floatIntensity: 0.14,
    floatingRange: undefined,
  }
}

function DroneModel({
  version,
  view,
  payload,
  tetherEnabled,
}: {
  version: DroneVersion
  view: DroneViewMode
  payload: DronePayload
  tetherEnabled: boolean
}) {
  const meshRef = useRef<THREE.Group>(null)
  const [adjusted, setAdjusted] = useState(false)

  const resolvedAssets = useMemo(() => getDroneAssets(version, view, payload, tetherEnabled), [version, view, payload, tetherEnabled])
  const assetPaths = useMemo(() => resolvedAssets.map((asset) => asset.path), [resolvedAssets])
  const assetSignature = assetPaths.join("|")
  const loadedAssets = useLoader(FBXLoader, assetPaths) as THREE.Group[]

  useEffect(() => {
    setAdjusted(false)
  }, [assetSignature])

  useLayoutEffect(() => {
    if (!meshRef.current || adjusted) return

    const box = new THREE.Box3().setFromObject(meshRef.current)
    const baseBox = loadedAssets[0] ? new THREE.Box3().setFromObject(loadedAssets[0]) : box
    const center = baseBox.getCenter(new THREE.Vector3())
    const yBase = tetherEnabled && view === "full" ? box.min.y : baseBox.min.y

    meshRef.current.position.x -= center.x
    meshRef.current.position.z -= center.z
    meshRef.current.position.y -= yBase
    setAdjusted(true)
  }, [loadedAssets, adjusted, tetherEnabled, view])

  useFrame((state) => {
    if (!meshRef.current) return

    if (view !== "box") {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.025
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.32) * 0.004
    } else {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.01
    }
  })

  const floatSettings = getFloatSettings(view)

  return (
    <Float
      speed={floatSettings.speed}
      rotationIntensity={floatSettings.rotationIntensity}
      floatIntensity={floatSettings.floatIntensity}
      floatingRange={floatSettings.floatingRange}
    >
      <group ref={meshRef} rotation={getRotation(view)}>
        {loadedAssets.map((asset, index) => (
          <primitive key={`${assetPaths[index]}-${index}`} object={asset} scale={getScale(view)} />
        ))}
      </group>
    </Float>
  )
}

function Scene({
  version,
  view,
  payload,
  tetherEnabled,
  environment,
}: {
  version: DroneVersion
  view: DroneViewMode
  payload: DronePayload
  tetherEnabled: boolean
  environment: ViewerEnvironment
}) {
  return (
    <>
      <ambientLight intensity={0.35} />

      <directionalLight
        position={[10, 10, 5]}
        intensity={2}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.8} />
      <pointLight position={[10, -5, 10]} intensity={0.6} />
      <spotLight position={[0, 15, 0]} angle={0.4} penumbra={1} intensity={1.2} castShadow distance={30} />
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

      {environment === "stadium" ? (
        <Environment files="/orlando_stadium_4k.exr" background />
      ) : (
        <>
          <Environment files="/flamingo_pan_4k.exr" background />
          <Grid
            renderOrder={-1}
            position={[0, -2, 0]}
            infiniteGrid
            cellSize={1.5}
            cellThickness={0.8}
            sectionSize={15}
            sectionThickness={1.2}
            sectionColor="#531818"
            fadeDistance={60}
            fadeStrength={1}
          />
        </>
      )}

      <fog attach="fog" args={["#050403", 10, 70]} />

      <ContactShadows
        position={[0, -1.99, 0]}
        opacity={0.55}
        scale={15}
        blur={2.8}
        far={6}
        resolution={512}
        color="#000000"
      />

      <Suspense fallback={null}>
        <DroneModel version={version} view={view} payload={payload} tetherEnabled={tetherEnabled} />
      </Suspense>

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={1}
        maxDistance={100}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
        autoRotate={false}
        dampingFactor={0.03}
        enableDamping
        panSpeed={1.6}
        rotateSpeed={1.15}
        zoomSpeed={1.2}
        screenSpacePanning
        keyPanSpeed={10}
        keys={{ LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }}
      />
    </>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="ui-surface-premium flex flex-col items-center justify-center gap-3 px-5 py-4">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-white/10" />
          <div className="absolute left-0 top-0 h-10 w-10 animate-spin rounded-full border-2 border-r-[#a62121]/60 border-t-[#f3d8d8]" />
        </div>
        <div className="text-xs font-medium tracking-[0.24em] text-white/80">LOADING SYSTEM</div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Initializing 3D model</div>
      </div>
    </Html>
  )
}

export function DroneViewer({ version, view, payload, tetherEnabled, environment }: DroneViewerProps) {
  const [, setIsFullscreen] = useState(false)
  const camera = getCameraSettings(view, tetherEnabled)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{
          position: camera.position,
          fov: camera.fov,
        }}
        shadows
        className="bg-transparent"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene version={version} view={view} payload={payload} tetherEnabled={tetherEnabled} environment={environment} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_22%,rgba(0,0,0,0.3)_100%)]" />

      <div className="absolute right-4 top-4 flex flex-col gap-2.5 sm:right-5 sm:top-5">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="ui-btn-secondary pointer-events-auto size-10 border-white/12 bg-black/25 p-0 text-white transition-all duration-300 hover:border-[#a62121]/40 hover:bg-white/10"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
