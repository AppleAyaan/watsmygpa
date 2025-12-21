"use client"

import { useEffect, useState, useRef } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface GPAProgressGraphProps {
  termGPAs: { term: string; gpa: number; credits: number }[]
  program: string
  displayMode: "gpa" | "percentage"
}

interface FacultyAverage {
  term: string
  avg_gpa: number
  sample_size: number
}

export function GPAProgressGraph({ termGPAs, program, displayMode }: GPAProgressGraphProps) {
  const [facultyAverages, setFacultyAverages] = useState<FacultyAverage[]>([])
  const [loading, setLoading] = useState(true)
  const [animationProgress, setAnimationProgress] = useState(0)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchFacultyAverages() {
      try {
        const response = await fetch(`/api/faculty-averages?program=${encodeURIComponent(program)}`)
        if (response.ok) {
          const data = await response.json()
          setFacultyAverages(data.averages || [])
        }
      } catch (error) {
        // Silent fail - just won't show faculty averages
      } finally {
        setLoading(false)
      }
    }

    fetchFacultyAverages()
  }, [program])

  // Animate line drawing
  useEffect(() => {
    if (loading) return

    const duration = 2000 // 2 seconds
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimationProgress(eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [loading])

  const gpaToPercentage = (gpa: number): number => {
    return Math.min(100, Math.round((gpa / 4.0) * 90 + 10))
  }

  // Sort terms chronologically
  const sortedTerms = [...termGPAs].sort((a, b) => {
    const [seasonA, yearA] = a.term.split(" ")
    const [seasonB, yearB] = b.term.split(" ")

    const getAcademicYear = (season: string, year: string) => {
      const yearNum = Number.parseInt(year)
      if (season === "Fall") return yearNum
      return yearNum - 1
    }

    const academicYearA = getAcademicYear(seasonA, yearA)
    const academicYearB = getAcademicYear(seasonB, yearB)

    if (academicYearA !== academicYearB) {
      return academicYearA - academicYearB
    }

    const seasonOrder = { Fall: 0, Winter: 1, Spring: 2 }
    return (
      (seasonOrder[seasonA as keyof typeof seasonOrder] ?? 999) -
      (seasonOrder[seasonB as keyof typeof seasonOrder] ?? 999)
    )
  })

  // Merge user data with faculty averages
  const chartData = sortedTerms.map((termData) => {
    const facultyData = facultyAverages.find((fa) => fa.term === termData.term)

    const userValue = displayMode === "gpa" ? termData.gpa : gpaToPercentage(termData.gpa)
    const facultyValue = facultyData
      ? displayMode === "gpa"
        ? facultyData.avg_gpa
        : gpaToPercentage(facultyData.avg_gpa)
      : null

    return {
      term: termData.term,
      yourGPA: userValue,
      facultyAvg: facultyValue,
    }
  })

  // Apply animation progress
  const animatedData = chartData.map((point, index) => {
    const pointProgress = Math.max(0, Math.min(1, (animationProgress * chartData.length - index) / 1))
    return {
      ...point,
      yourGPA: point.yourGPA * pointProgress,
      facultyAvg: point.facultyAvg ? point.facultyAvg * pointProgress : null,
    }
  })

  const hasFacultyData = facultyAverages.length > 0

  const calculateYAxisDomain = () => {
    if (displayMode === "percentage") {
      return [0, 100]
    }

    // Find min and max GPAs from both user and faculty data
    const allGPAs = [
      ...chartData.map((d) => d.yourGPA),
      ...chartData.map((d) => d.facultyAvg).filter((v): v is number => v !== null),
    ]

    if (allGPAs.length === 0) return [0, 4.0]

    const minGPA = Math.min(...allGPAs)
    const maxGPA = Math.max(...allGPAs)

    // Add padding (10% on each side)
    const range = maxGPA - minGPA
    const padding = range * 0.1

    const min = Math.max(0, Math.floor((minGPA - padding) * 2) / 2) // Round down to nearest 0.5
    const max = Math.min(4.0, Math.ceil((maxGPA + padding) * 2) / 2) // Round up to nearest 0.5

    return [min, max]
  }

  const yAxisDomain = calculateYAxisDomain()

  const generateYAxisTicks = () => {
    if (displayMode === "percentage") {
      return [0, 25, 50, 75, 100]
    }

    const [min, max] = yAxisDomain
    const range = max - min

    if (range <= 1) {
      // If range is small, use 0.2 increments
      const ticks = []
      for (let i = min; i <= max; i += 0.2) {
        ticks.push(Math.round(i * 10) / 10)
      }
      return ticks
    } else if (range <= 2) {
      // If range is medium, use 0.5 increments
      const ticks = []
      for (let i = min; i <= max; i += 0.5) {
        ticks.push(Math.round(i * 10) / 10)
      }
      return ticks
    } else {
      // If range is large, use 1.0 increments
      const ticks = []
      for (let i = Math.floor(min); i <= Math.ceil(max); i += 1) {
        ticks.push(i)
      }
      return ticks
    }
  }

  const yAxisTicks = generateYAxisTicks()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {displayMode === "gpa" ? entry.value.toFixed(2) : `${entry.value.toFixed(1)}%`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white/20 dark:bg-white/5 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-xl rounded-3xl p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-semibold">GPA Progress</h2>
        <p className="text-sm text-muted-foreground">Your academic performance over time</p>
      </div>

      <div ref={chartRef} className="w-full h-[300px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={animatedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorYourGPA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorFacultyAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="term"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={yAxisDomain}
              ticks={yAxisTicks}
              tickFormatter={(value) => (displayMode === "gpa" ? value.toFixed(1) : `${value}%`)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="line" wrapperStyle={{ paddingBottom: "10px" }} />
            <Area
              type="monotone"
              dataKey="yourGPA"
              stroke="#3b82f6"
              strokeWidth={4}
              fill="url(#colorYourGPA)"
              dot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#ffffff" }}
              activeDot={{ r: 8, strokeWidth: 2 }}
              name="Your GPA"
              animationDuration={0}
            />
            {hasFacultyData && (
              <Area
                type="monotone"
                dataKey="facultyAvg"
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="5 5"
                fill="url(#colorFacultyAvg)"
                dot={{ r: 5, fill: "#f59e0b", strokeWidth: 2, stroke: "#ffffff" }}
                name="Faculty Average"
                animationDuration={0}
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {hasFacultyData && (
        <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          Faculty average based on {program} students · Updated in real-time
        </p>
      )}
    </div>
  )
}
