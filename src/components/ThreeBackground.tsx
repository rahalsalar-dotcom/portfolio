import { useEffect, useRef } from 'react'

export function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    let cleanup: (() => void) | null = null
    let cancelled = false

    if (!canvas) {
      return undefined
    }

    void import('../lib/createThreeScene').then(({ createThreeScene }) => {
      if (cancelled) {
        return
      }

      cleanup = createThreeScene(canvas)
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70" />
}
