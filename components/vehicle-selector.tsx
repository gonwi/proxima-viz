"use client"

import type React from "react"
import type { VehicleType } from "@/app/page"
import { Plane, Car, Ship, Shield, Zap } from "lucide-react"

interface VehicleSelectorProps {
  selectedVehicle: VehicleType
  onVehicleChange: (vehicle: VehicleType) => void
}

const vehicles: Array<{
  type: VehicleType
  label: string
  icon: React.ComponentType<{ className?: string }>
  code: string
}> = [
  { type: "quadcopter", label: "Quad", icon: Zap, code: "QC" },
  { type: "fixed-wing", label: "Wing", icon: Plane, code: "FW" },
  { type: "ugv", label: "UGV", icon: Car, code: "UV" },
  { type: "boat", label: "Boat", icon: Ship, code: "BT" },
  { type: "sentry", label: "Sentry", icon: Shield, code: "ST" },
]

export function VehicleSelector({ selectedVehicle, onVehicleChange }: VehicleSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
      {vehicles.map(({ type, label, icon: Icon, code }) => {
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
              className={`w-3 h-3 transition-transform duration-300 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}
            />
            <span className="text-xs font-medium">{label}</span>
            <span className={`text-[10px] font-mono ${isSelected ? "text-gray-600" : "text-gray-500"}`}>{code}</span>

            {isSelected && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 -z-10" />
            )}
          </button>
        )
      })}
    </div>
  )
}
