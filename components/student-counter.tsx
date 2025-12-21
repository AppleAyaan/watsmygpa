"use client"

import { useEffect, useState } from "react"

export function StudentCounter() {
  const [count, setCount] = useState(0)
  const [displayCount, setDisplayCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch("/api/stats/count")
        const data = await response.json()
        setCount(data.count || 0)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching student count:", error)
        setIsLoading(false)
      }
    }

    fetchCount()
    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Animate count from 0 to target
  useEffect(() => {
    if (isLoading || count === 0) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = count / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayCount(count)
        clearInterval(timer)
      } else {
        setDisplayCount(Math.floor(increment * currentStep))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [count, isLoading])

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-2 px-6 py-0.5 rounded-full 
          backdrop-blur-md 
          bg-white/40 dark:bg-gray-600/10 
          border border-black/10 dark:border-gray-700/30 
          shadow-inner shadow-white/40 shadow-[0_2px_25px_rgba(0,0,0,0.15)]">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <p className="text-sm font-medium text-foreground">
          Used by{" "}
          <span className="text-primary font-bold text-lg tabular-nums">
            {isLoading ? "..." : displayCount.toLocaleString()}+
          </span>{" "}
          UW Students
        </p>
      </div>
    </div>
  )
}
