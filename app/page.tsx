"use client"

import { useState } from "react"
import { DroneViewer } from "@/components/drone-viewer"
import { VehicleSelector } from "@/components/vehicle-selector"
import { Header } from "@/components/header"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type VehicleType = "quadcopter" | "fixed-wing" | "ugv" | "boat" | "sentry"

export default function Home() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("quadcopter")
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)

  const handleLogin = () => {
    if (password === "letmein") setAuthenticated(true)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col gap-4 p-6 border border-white/10 bg-white/5 rounded-xl shadow-xl">
          <h1 className="text-xl font-semibold tracking-tight">Access Required</h1>
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black text-white border-white/20"
          />
          <Button onClick={handleLogin} className="w-full bg-white/10 hover:bg-white/20 text-white">
            Enter
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-black relative">
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950/50 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Vehicle Selector - Below navbar, centered */}
      <div className="relative z-20 flex justify-center py-4 border-b border-white/5">
        <VehicleSelector selectedVehicle={selectedVehicle} onVehicleChange={setSelectedVehicle} />
      </div>

      {/* Main 3D Scene */}
      <div className="flex-1 relative z-10">
        <DroneViewer vehicleType={selectedVehicle} />
      </div>

      {/* Bottom USA Flag */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5">
          <Image src="/usa.svg" alt="USA" width={16} height={10} className="opacity-80" />
          <span className="text-xs text-white/60 font-medium">MADE IN USA</span>
        </div>
      </div>
    </div>
  )
}
