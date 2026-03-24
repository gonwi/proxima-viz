"use client"

import { Suspense, useRef, useState, useEffect, useLayoutEffect } from "react"
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
import { Maximize2, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface DroneViewerProps {
  vehicleType: VehicleType
}

const modelPaths: Record<VehicleType, string> = {
  quadcopter: "/models/29in-drone-v2.fbx",
  "fixed-wing": "/models/m2d2-main-wing.fbx",
  ugv: "/models/UGV.fbx",
  boat: "/models/m2d2-main-boat.fbx",
  sentry: "/models/m2d2-main-sentry.fbx",
}

const vehicleSpecs: Record<VehicleType, { range: string; payload: string; endurance: string; classification: string }> = {
quadcopter: { range: "15.4km", payload: "2.5kg", endurance: "37min", classification: "VTOL-MC" },
"fixed-wing": { range: "144km", payload: "1.5kg", endurance: "1.8hr", classification: "FIXED-WING" },
ugv: { range: "21.6km", payload: "5kg", endurance: "2.16hrs", classification: "GROUND-VEH" },
boat: { range: "43.2km", payload: "1kg", endurance: "1.44hrs", classification: "MARITIME" },
sentry: { range: "10.8km", payload: "10kg", endurance: "21.6hrs", classification: "DEFENSE-SYS" },
}
function getRotation(vehicleType: VehicleType): [number, number, number] {
  switch (vehicleType) {
    case "sentry":
      return [0, 0, Math.PI] // 180 deg Z
    case "ugv":
    case "boat":
      return [-Math.PI / 2, 0, 0] // flip forward to ground
    case "quadcopter":
    case "fixed-wing":
    default:
      return [-Math.PI / 2, 0, 0] // aircraft orientation
  }
}

function DroneModel({ vehicleType }: { vehicleType: VehicleType }) {
  const meshRef = useRef<THREE.Group>(null)
  const fbx = useLoader(FBXLoader, modelPaths[vehicleType])
  const [adjusted, setAdjusted] = useState(false)

  useLayoutEffect(() => {
    if (meshRef.current && !adjusted) {
      const box = new THREE.Box3().setFromObject(meshRef.current)
      const heightOffset = box.min.y
      meshRef.current.position.y -= heightOffset
      setAdjusted(true)
    }
  }, [fbx, adjusted])

  useFrame((state) => {
    if (meshRef.current && (vehicleType === "quadcopter" || vehicleType === "fixed-wing")) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.03
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.4) * 0.05 * 0.1
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={vehicleType === "quadcopter" || vehicleType === "fixed-wing" ? undefined : [0, 0]}>
      <group ref={meshRef} rotation={getRotation(vehicleType)}>
        <primitive object={fbx} scale={0.01} />
        <pointLight position={[0, 0, 0]} intensity={0.3} color="#ffffff" distance={5} />
      </group>
    </Float>
  )
}

function Scene({ vehicleType, useHDRI }: { vehicleType: VehicleType; useHDRI: boolean }) {
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
      <spotLight position={[0, 15, 0]} angle={0.4} penumbra={1} intensity={1.2} castShadow color="#ffffff" distance={30} />

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
      <ContactShadows position={[0, -1.99, 0]} opacity={0.6} scale={15} blur={2.5} far={6} resolution={512} color="#000000" />
      <Suspense fallback={null}>
        <DroneModel vehicleType={vehicleType} />
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
          <div className="w-12 h-12 border-2 border-white/10 rounded-full" />
          <div className="absolute top-0 left-0 w-12 h-12 border-2 border-t-white border-r-white/50 rounded-full animate-spin" />
        </div>
        <div className="text-white/80 text-sm font-medium tracking-wide">LOADING SYSTEM</div>
        <div className="text-white/40 text-xs font-mono">INITIALIZING 3D MODEL...</div>
      </div>
    </Html>
  )
}

export function DroneViewer({ vehicleType }: DroneViewerProps) {
  const [, setIsFullscreen] = useState(false)
  const [useHDRI, setUseHDRI] = useState(true)
  const specs = vehicleSpecs[vehicleType]

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
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [6, 4, 6], fov: 50 }}
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
          <Scene vehicleType={vehicleType} useHDRI={useHDRI} />
        </Suspense>
      </Canvas>

      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-3">
        <Switch checked={useHDRI} onCheckedChange={setUseHDRI} />
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-black/30 border-white/20 text-white backdrop-blur-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 shadow-lg"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute top-6 left-6">
        <Badge className="bg-blue-500/20 border-blue-500/30 text-blue-300 backdrop-blur-xl font-mono text-xs">
          <Zap className="w-3 h-3 mr-1" />
          {specs.classification}
        </Badge>
      </div>

      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-black/30 border-white/20 text-white backdrop-blur-xl text-xs">
            RANGE: {specs.range}
          </Badge>
          <Badge variant="outline" className="bg-black/30 border-white/20 text-white backdrop-blur-xl text-xs">
            PAYLOAD: {specs.payload}
          </Badge>
        </div>
        <Badge variant="outline" className="bg-black/30 border-white/20 text-white backdrop-blur-xl text-xs">
          ENDURANCE: {specs.endurance}
        </Badge>
      </div>

      <div className="absolute bottom-6 right-6">
        <Badge className="bg-green-500/20 border-green-500/30 text-green-300 backdrop-blur-xl font-mono">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
          SYSTEM ONLINE
        </Badge>
      </div>
    </div>
  )
} 