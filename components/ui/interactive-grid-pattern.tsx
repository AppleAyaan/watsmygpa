"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface InteractiveGridPatternProps {
  className?: string
  width?: number
  height?: number
  squares?: [number, number]
  squaresClassName?: string
}

interface TrailSquare {
  index: number
  opacity: number
  timestamp: number
}

export function InteractiveGridPattern({
  className,
  width = 20,
  height = 20,
  squares = [80, 80],
  squaresClassName,
}: InteractiveGridPatternProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [trailSquares, setTrailSquares] = useState<TrailSquare[]>([])
  const [horizontal, vertical] = squares
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fadeInterval = setInterval(() => {
      setTrailSquares((prev) => {
        const now = Date.now()
        return prev
          .map((square) => ({
            ...square,
            opacity: Math.max(0, square.opacity - 0.05),
          }))
          .filter((square) => square.opacity > 0)
      })
    }, 50)

    return () => clearInterval(fadeInterval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        const col = Math.floor(x / width)
        const row = Math.floor(y / height)
        const index = row * horizontal + col

        if (index >= 0 && index < horizontal * vertical) {
          setTrailSquares((prev) => {
            const existing = prev.find((s) => s.index === index)
            if (existing) {
              return prev.map((s) => (s.index === index ? { ...s, opacity: 0.5, timestamp: Date.now() } : s))
            }
            return [...prev, { index, opacity: 0.5, timestamp: Date.now() }]
          })
        }
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [width, height, horizontal, vertical])

  const gridLineColor = mounted && theme === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"
  const squareColor = mounted && theme === "light" ? "0, 0, 0" : "255, 199, 0"

  return (
    <svg ref={svgRef} className={cn("absolute inset-0 h-full w-full", className)} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-pattern" width={width} height={height} patternUnits="userSpaceOnUse">
          <path d={`M ${width} 0 L 0 0 0 ${height}`} fill="none" stroke={gridLineColor} strokeWidth="0" />
        </pattern>
        <radialGradient id="spotlight">
          <stop offset="0%" stopColor="rgba(255, 199, 0, 0.6)" />
          <stop offset="50%" stopColor="rgba(255, 199, 0, 0.3)" />
          <stop offset="100%" stopColor="rgba(255, 199, 0, 0)" />
        </radialGradient>
      </defs>

      <rect width="100%" height="100%" fill="url(#grid-pattern)" />

      <g className="blur-xl">
        {Array.from({ length: horizontal * vertical }).map((_, index) => {
          const x = (index % horizontal) * width
          const y = Math.floor(index / horizontal) * height
          const trailSquare = trailSquares.find((s) => s.index === index)
          const opacity = trailSquare ? trailSquare.opacity : 0

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={width}
              height={height}
              fill={`rgba(${squareColor}, ${opacity})`}
              stroke="transparent"
              strokeWidth="0"
              className={cn("transition-opacity duration-100", squaresClassName)}
            />
          )
        })}
      </g>
    </svg>
  )
}
