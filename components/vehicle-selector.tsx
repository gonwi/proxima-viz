"use client"

import type React from "react"
import type { VehicleType } from "@/app/page"
import { Plane, Car, Ship, Shield, Zap, Box, FoldHorizontal } from "lucide-react"

interface VehicleSelectorProps {
  selectedVehicle: VehicleType
  selectedQuadMode?: "full" | "folded" | "box"
  onVehicleChange: (vehicle: VehicleType) => void
  onQuadModeChange?: (mode: "full" | "folded" | "box") => void
}

const baseVehicles: Array<{
  type: VehicleType
  label: string
  icon: React.ComponentType<{ className?: string }>
  code: string
}> = [
  { type: "fixed-wing", label: "Wing", icon: Plane, code: "FW" },
  { type: "ugv", label: "UGV", icon: Car, code: "UV" },
  { type: "boat", label: "Boat", icon: Ship, code: "BT" },
  { type: "sentry", label: "Sentry", icon: Shield, code: "ST" },
]

const quadModes = [
  { mode: "full", label: "Full", icon: Zap, code: "QC-F" },
  { mode: "folded", label: "Fold", icon: FoldHorizontal, code: "QC-D" },
  { mode: "box", label: "Box", icon: Box, code: "QC-B" },
] as const

export function VehicleSelector({
  selectedVehicle,
  selectedQuadMode = "full",
  onVehicleChange,
  onQuadModeChange,
}: VehicleSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
      
      {/* QUADCOPTER MODES */}
      {quadModes.map(({ mode, label, icon: Icon, code }) => {
        const isActive = selectedVehicle === "quadcopter" && selectedQuadMode === mode

        return (
          <button
            key={mode}
            onClick={() => {
              onVehicleChange("quadcopter")
              onQuadModeChange?.(mode)
            }}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
              isActive
                ? "bg-white text-black shadow-lg shadow-white/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon
              className={`w-3 h-3 transition-transform duration-300 ${
                isActive ? "scale-110" : "group-hover:scale-105"
              }`}
            />
            <span className="text-xs font-medium">{label}</span>
            <span className={`text-[10px] font-mono ${isActive ? "text-gray-600" : "text-gray-500"}`}>
              {code}
            </span>

            {isActive && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 -z-10" />
            )}
          </button>
        )
      })}

      {/* DIVIDER */}
      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* OTHER VEHICLES */}
      {baseVehicles.map(({ type, label, icon: Icon, code }) => {
        const isSelected = selectedVehicle === type

        return (
          <button
            key={type}
            onClick={() => onVehicleChange(type)}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
              isSelected
                ? "bg-white text-black shadow-lg shadow-white/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon
              className={`w-3 h-3 transition-transform duration-300 ${
                isSelected ? "scale-110" : "group-hover:scale-105"
              }`}
            />
            <span className="text-xs font-medium">{label}</span>
            <span className={`text-[10px] font-mono ${isSelected ? "text-gray-600" : "text-gray-500"}`}>
              {code}
            </span>

            {isSelected && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 -z-10" />
            )}
          </button>
        )
      })}
    </div>
  )
}