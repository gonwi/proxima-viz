"use client"

import Image from "next/image"

export function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between p-6 border-b border-white/5 bg-black/20 backdrop-blur-xl">
      {/* Left: Logo */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Image
            src="/proxima-logo.png"
            alt="ProximaVision"
            width={196}
            height={196}
            className="brightness-0 invert"
          />
        </div>
      </div>

      {/* Right: Air Ready + XL18T */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <Image
            src="/air-ready.svg"
            alt="Air Ready"
            width={120}
            height={40}
            className="object-contain"
          />
          <div className="text-xs text-gray-400 font-medium tracking-widest mt-1">
            XL18T
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          LIVE
        </div>
      </div>
    </header>
  )
}