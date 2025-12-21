"use client"

import { useEffect, useState, useRef } from "react"

interface PeerComparisonProps {
  gpa: number
  program: string
  displayMode: "gpa" | "percentage"
  term?: string
}

interface PeerStats {
  count: number
  avgGpa: number
  minGpa: number
  maxGpa: number
  avgPercentage: number
  minPercentage: number
  maxPercentage: number
}

function AnimatedCounter({
  value,
  duration = 2000,
  decimals = 0,
}: { value: number; duration?: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    startTimeRef.current = null

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = easeOutQuart * value

      setDisplayValue(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value, duration])

  return <>{displayValue.toFixed(decimals)}</>
}

export function PeerComparison({ gpa, program, displayMode, term = "Overall" }: PeerComparisonProps) {
  const [stats, setStats] = useState<PeerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const params = new URLSearchParams({ program })
        if (term && term !== "Overall") {
          params.append("term", term)
        }
        const response = await fetch(`/api/gpa-stats?${params}`)

        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }

        const data = await response.json()
        setStats(data)
      } catch (error) {
        setStats({
          count: 0,
          avgGpa: 3.3,
          minGpa: 2.0,
          maxGpa: 4.0,
          avgPercentage: 75,
          minPercentage: 50,
          maxPercentage: 100,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [program, term])

  const gpaToPercentage = (gpaValue: number): number => {
    return Math.min(100, (gpaValue / 4.0) * 90 + 10)
  }

  if (loading || !stats) {
    return (
      <div className="bg-white/20 dark:bg-white/5 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-xl rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const minValue = displayMode === "gpa" ? stats.minGpa : stats.minPercentage
  const maxValue = displayMode === "gpa" ? stats.maxGpa : stats.maxPercentage
  const avgValue = displayMode === "gpa" ? stats.avgGpa : stats.avgPercentage
  const currentValue = displayMode === "gpa" ? gpa : gpaToPercentage(gpa)

  const percentile = Math.min(100, Math.max(0, ((currentValue - minValue) / (maxValue - minValue)) * 100))

  const getPerformanceLevel = (percentile: number) => {
    if (percentile >= 90) return { text: "Exceptional", color: "text-primary" }
    if (percentile >= 75) return { text: "Above Average", color: "text-green-500" }
    if (percentile >= 50) return { text: "Average", color: "text-blue-500" }
    if (percentile >= 25) return { text: "Below Average", color: "text-orange-500" }
    return { text: "Needs Improvement", color: "text-muted-foreground" }
  }

  const performance = getPerformanceLevel(percentile)

  const formatValue = (value: number) => {
    return displayMode === "gpa" ? value.toFixed(2) : value.toFixed(1) + "%"
  }

  const displayLabel = displayMode === "gpa" ? "Avg GPA" : "Avg %"

  if (stats.count === 0) {
    return (
      <div className="bg-white/20 dark:bg-white/5 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-xl rounded-3xl p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold">Peer Comparison</h2>
          <p className="text-sm text-muted-foreground">
            {program} · {term}
          </p>
        </div>
        <div className="py-8 md:py-12 text-center space-y-3">
          <div
            className="text-5xl md:text-6xl animate-in fade-in zoom-in duration-1000 ease-in-out delay-300"
            style={{ animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          >
            🎉
          </div>
          <p className="text-lg md:text-xl font-semibold px-4">You are the first to submit data for your program!</p>
          <p className="text-sm text-muted-foreground px-4">
            More comparisons will appear as other students submit their transcripts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/20 dark:bg-white/5 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-xl rounded-3xl p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-semibold">Peer Comparison</h2>
        <p className="text-sm text-muted-foreground">
          {program} · {term}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-sm font-medium">Your Position</span>
            <span className={`text-sm font-semibold ${performance.color}`}>{performance.text}</span>
          </div>
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-primary to-green-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${percentile}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full border-2 border-background shadow-lg transition-all duration-1000 ease-out"
              style={{ left: `calc(${percentile}% - 6px)` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatValue(minValue)}</span>
            <span className="hidden sm:inline">{formatValue(avgValue)} avg</span>
            <span>{formatValue(maxValue)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 pt-4">
          <div className="text-center space-y-1">
            <p className="text-xl md:text-2xl font-bold">
              <AnimatedCounter value={percentile} decimals={0} />%
            </p>
            <p className="text-xs text-muted-foreground">Percentile</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xl md:text-2xl font-bold">
              {displayMode === "gpa" ? (
                <>
                  <AnimatedCounter value={avgValue} decimals={2} />
                </>
              ) : (
                <>
                  <AnimatedCounter value={avgValue} decimals={1} />%
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{displayLabel}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xl md:text-2xl font-bold">
              <AnimatedCounter value={stats.count} decimals={0} />
            </p>
            <p className="text-xs text-muted-foreground">Students</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
        Comparison based on {stats.count} anonymized submissions · Updated in real-time
      </p>
    </div>
  )
}
