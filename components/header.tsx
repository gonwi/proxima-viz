"use client"

import Image from "next/image"

export function Header() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 py-3 sm:px-5 lg:px-6 xl:px-8">
      <div className="flex items-center justify-start">
        <div className="pointer-events-auto">
          <div className="ui-surface flex items-center px-3 py-2 sm:px-4">
            <Image
              src="/proxima-logo.png"
              alt="ProximaVision"
              width={196}
              height={196}
              className="h-auto w-[118px] brightness-0 invert sm:w-[132px]"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
