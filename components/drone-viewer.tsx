"use client"

import { Suspense, useRef, useState, useEffect, useLayoutEffect, useMemo } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  Grid,
  Html,
  ContactShadows,
  Float,
  Stars,
} from "@react-three/drei"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import type { VehicleType } from "@/app/page"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Maximize2, Zap, Box, FoldHorizontal, Plane } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface DroneViewerProps {
  vehicleType: VehicleType
}

type QuadcopterViewMode = "full" | "folded" | "box"

const quadcopterVariants: Record<QuadcopterViewMode, string> = {
  full: "/models/29-inch-final-v1.fbx",
  folded: "/models/29in-drone-v2-folded 1.fbx",
  box: "/models/29in-drone-in-box.fbx",
}

const modelPaths: Record<VehicleType, string> = {
  quadcopter: quadcopterVariants.full,
  "fixed-wing": "/models/m2d2-main-wing.fbx",
  ugv: "/models/UGV.fbx",
  boat: "/models/m2d2-main-boat.fbx",
  sentry: "/models/m2d2-main-sentry.fbx",
}

const vehicleSpecs: Record<
  VehicleType,
  { payload: string; endurance: string; classification: string }
> = {
  quadcopter: {
    payload: "2.5kg",
    endurance: "37min",
    classification: "VTOL-MC",
  },
  "fixed-wing": {
    payload: "1.5kg",
    endurance: "1.8hr",
    classification: "FIXED-WING",
  },
  ugv: {
    payload: "5kg",
    endurance: "2.16hrs",
    classification: "GROUND-VEH",
  },
  boat: {
    payload: "1kg",
    endurance: "1.44hrs",
    classification: "MARITIME",
  },
  sentry: {
    payload: "10kg",
    endurance: "21.6hrs",
    classification: "DEFENSE-SYS",
  },
}

function getRotation(vehicleType: VehicleType, mode?: QuadcopterViewMode): [number, number, number] {
  switch (vehicleType) {
    case "sentry":
      return [0, 0, Math.PI]
    case "ugv":
    case "boat":
      return [-Math.PI / 2, 0, 0]
    case "quadcopter":
      if (mode === "box") return [0, 0, 0]
      return [-Math.PI / 2, 0, 0]
    case "fixed-wing":
    default:
      return [-Math.PI / 2, 0, 0]
  }
}

function getScale(vehicleType: VehicleType, mode?: QuadcopterViewMode) {
  if (vehicleType === "quadcopter") {
    if (mode === "box") return 0.0085
    if (mode === "folded") return 0.01
    return 0.01
  }

  return 0.01
}

function getFloatSettings(vehicleType: VehicleType, mode?: QuadcopterViewMode) {
  const airborne = vehicleType === "quadcopter" || vehicleType === "fixed-wing"

  if (vehicleType === "quadcopter" && mode === "box") {
    return {
      speed: 0.8,
      rotationIntensity: 0.03,
      floatIntensity: 0.06,
      floatingRange: [0, 0.05] as [number, number],
    }
  }

  if (airborne) {
    return {
      speed: 1.2,
      rotationIntensity: 0.1,
      floatIntensity: 0.2,
      floatingRange: undefined,
    }
  }

  return {
    speed: 1.2,
    rotationIntensity: 0.1,
    floatIntensity: 0.2,
    floatingRange: [0, 0] as [number, number],
  }
}

function DroneModel({
  vehicleType,
  quadMode,
}: {
  vehicleType: VehicleType
  quadMode: QuadcopterViewMode
}) {
  const meshRef = useRef<THREE.Group>(null)

  const resolvedPath = useMemo(() => {
    if (vehicleType === "quadcopter") return quadcopterVariants[quadMode]
    return modelPaths[vehicleType]
  }, [vehicleType, quadMode])

  const fbx = useLoader(FBXLoader, resolvedPath)
  const [adjusted, setAdjusted] = useState(false)

  useEffect(() => {
    setAdjusted(false)
  }, [resolvedPath])

  useLayoutEffect(() => {
    if (!meshRef.current || adjusted) return

    const box = new THREE.Box3().setFromObject(meshRef.current)
    const heightOffset = box.min.y
    meshRef.current.position.y -= heightOffset
    setAdjusted(true)
  }, [fbx, adjusted])

  useFrame((state) => {
    if (!meshRef.current) return

    const isFlyingModel =
      vehicleType === "fixed-wing" ||
      (vehicleType === "quadcopter" && quadMode !== "box")

    if (isFlyingModel) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.03
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.4) * 0.005
    }

    if (vehicleType === "quadcopter" && quadMode === "box") {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.015
    }
  })

  const floatSettings = getFloatSettings(vehicleType, quadMode)

  return (
    <Float
      speed={floatSettings.speed}
      rotationIntensity={floatSettings.rotationIntensity}
      floatIntensity={floatSettings.floatIntensity}
      floatingRange={floatSettings.floatingRange}
    >
      <group ref={meshRef} rotation={getRotation(vehicleType, quadMode)}>
        <primitive object={fbx} scale={getScale(vehicleType, quadMode)} />
        <pointLight position={[0, 0, 0]} intensity={0.3} color="#ffffff" distance={5} />
      </group>
    </Float>
  )
}

function Scene({
  vehicleType,
  useHDRI,
  quadMode,
}: {
  vehicleType: VehicleType
  useHDRI: boolean
  quadMode: QuadcopterViewMode
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
        color="#ffffff"
      />
      <pointLight position={[-10, -10, -5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[10, -5, 10]} intensity={0.6} color="#ffffff" />
      <spotLight
        position={[0, 15, 0]}
        angle={0.4}
        penumbra={1}
        intensity={1.2}
        castShadow
        color="#ffffff"
        distance={30}
      />

      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      {useHDRI ? (
        <Environment files="/flamingo_pan_4k.exr" background />
      ) : (
        <Grid
          renderOrder={-1}
          position={[0, -2, 0]}
          infiniteGrid
          cellSize={1.5}
          cellThickness={0.8}
          sectionSize={15}
          sectionThickness={1.2}
          sectionColor="#262740"
          fadeDistance={60}
          fadeStrength={1}
        />
      )}
      <fog attach="fog" args={["#000000", 8, 60]} />
      <ContactShadows
        position={[0, -1.99, 0]}
        opacity={0.6}
        scale={15}
        blur={2.5}
        far={6}
        resolution={512}
        color="#000000"
      />

      <Suspense fallback={null}>
        <DroneModel vehicleType={vehicleType} quadMode={quadMode} />
      </Suspense>

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={0.5}
        maxDistance={100}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
        autoRotate={false}
        autoRotateSpeed={0.3}
        dampingFactor={0.03}
        enableDamping
        panSpeed={2}
        rotateSpeed={1.5}
        zoomSpeed={1.5}
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
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-white/10" />
          <div className="absolute left-0 top-0 h-12 w-12 animate-spin rounded-full border-2 border-t-white border-r-white/50" />
        </div>
        <div className="text-sm font-medium tracking-wide text-white/80">LOADING SYSTEM</div>
        <div className="font-mono text-xs text-white/40">INITIALIZING 3D MODEL...</div>
      </div>
    </Html>
  )
}

export function DroneViewer({ vehicleType }: DroneViewerProps) {
  const [, setIsFullscreen] = useState(false)
  const [useHDRI, setUseHDRI] = useState(true)
  const [quadMode, setQuadMode] = useState<QuadcopterViewMode>("full")

  const specs = vehicleSpecs[vehicleType]

  useEffect(() => {
    if (vehicleType !== "quadcopter") {
      setQuadMode("full")
    }
  }, [vehicleType])

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
          position: quadMode === "box" ? [7, 4.5, 7] : [6, 4, 6],
          fov: quadMode === "box" ? 45 : 50,
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
          <Scene vehicleType={vehicleType} useHDRI={useHDRI} quadMode={quadMode} />
        </Suspense>
      </Canvas>

      <div className="absolute left-6 top-6 flex flex-col gap-3">
        <Badge className="border-blue-500/30 bg-blue-500/20 font-mono text-xs text-blue-300 backdrop-blur-xl">
          <Zap className="mr-1 h-3 w-3" />
          {specs.classification}
        </Badge>

        {vehicleType === "quadcopter" && (
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-1 backdrop-blur-xl">
            <Button
              type="button"
              size="sm"
              variant={quadMode === "full" ? "default" : "ghost"}
              onClick={() => setQuadMode("full")}
              className={
                quadMode === "full"
                  ? "bg-white text-black hover:bg-white/90"
                  : "text-white hover:bg-white/10"
              }
            >
              <Plane className="mr-2 h-4 w-4" />
              Full
            </Button>

            <Button
              type="button"
              size="sm"
              variant={quadMode === "folded" ? "default" : "ghost"}
              onClick={() => setQuadMode("folded")}
              className={
                quadMode === "folded"
                  ? "bg-white text-black hover:bg-white/90"
                  : "text-white hover:bg-white/10"
              }
            >
              <FoldHorizontal className="mr-2 h-4 w-4" />
              Folded
            </Button>

            <Button
              type="button"
              size="sm"
              variant={quadMode === "box" ? "default" : "ghost"}
              onClick={() => setQuadMode("box")}
              className={
                quadMode === "box"
                  ? "bg-white text-black hover:bg-white/90"
                  : "text-white hover:bg-white/10"
              }
            >
              <Box className="mr-2 h-4 w-4" />
              Box
            </Button>
          </div>
        )}
      </div>

      <div className="absolute right-6 top-6 flex flex-col gap-3">
        <div className="flex items-center justify-end gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/80 backdrop-blur-xl">
          <span>HDRI</span>
          <Switch checked={useHDRI} onCheckedChange={setUseHDRI} />
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="border-white/20 bg-black/30 text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-white/10"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
        <div className="flex gap-2">
          <Badge variant="outline" className="border-white/20 bg-black/30 text-xs text-white backdrop-blur-xl">
            PAYLOAD: {specs.payload}
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-black/30 text-xs text-white backdrop-blur-xl">
            ENDURANCE: {specs.endurance}
          </Badge>
        </div>

        {vehicleType === "quadcopter" && (
          <Badge
            variant="outline"
            className="border-white/20 bg-black/30 text-xs uppercase text-white backdrop-blur-xl"
          >
            VIEW: {quadMode}
          </Badge>
        )}
      </div>

      <div className="absolute bottom-6 right-6">
        <Badge className="border-green-500/30 bg-green-500/20 font-mono text-green-300 backdrop-blur-xl">
          <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-400" />
          SYSTEM ONLINE
        </Badge>
      </div>
    </div>
  )
}