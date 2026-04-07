const CRITICAL_ASSETS = [
  "/models/29-inch-v2-no-payload.fbx",
  "/models/29-inch-v1-no-payload.fbx",
  "/models/29in-drone-v2-folded 2.fbx",
  "/models/29-inch-v2-in-a-box.fbx",
  "/flamingo_pan_4k.exr",
]

const BACKGROUND_ASSETS = [
  "/models/spectrum-500-payload.fbx",
  "/models/spectrum-800-payload.fbx",
  "/models/vio-camera-payload.fbx",
  "/models/29-inch-tether.fbx",
  "/orlando_stadium_4k.exr",
]

const ALL_ASSETS = [...CRITICAL_ASSETS, ...BACKGROUND_ASSETS]

const assetCache = new Map<string, Promise<void>>()

function warmAsset(url: string) {
  if (typeof window === "undefined") {
    return Promise.resolve()
  }

  const cached = assetCache.get(url)
  if (cached) {
    return cached
  }

  const request = fetch(url, { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to preload ${url}`)
      }

      return response.blob()
    })
    .then(() => undefined)
    .catch(() => undefined)

  assetCache.set(url, request)
  return request
}

export function getAssetCount() {
  return ALL_ASSETS.length
}

export async function preloadAssets(
  onProgress?: (loaded: number, total: number) => void,
  onCriticalReady?: () => void
) {
  let loaded = 0
  const total = ALL_ASSETS.length

  for (const asset of ALL_ASSETS) {
    await warmAsset(asset)
    loaded += 1
    onProgress?.(loaded, total)

    if (loaded === CRITICAL_ASSETS.length) {
      onCriticalReady?.()
    }
  }
}
