"use client"

import { useState, useEffect } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

interface Course {
  code: string
  name: string
  grade: string
  gradePoint: number
  credits: number
  term: string
  level?: string
  isEnrolled?: boolean
}

interface CourseBreakdownProps {
  courses: Course[]
  displayMode?: "gpa" | "percentage"
}

export function CourseBreakdown({ courses, displayMode = "gpa" }: CourseBreakdownProps) {
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set())
  const [courseAverages, setCourseAverages] = useState<Record<string, any>>({})
  const [loadingAverages, setLoadingAverages] = useState(true)

  const completedCourses = courses.filter((c) => !c.isEnrolled)
  const enrolledCourses = courses.filter((c) => c.isEnrolled)

  const coursesByTerm = completedCourses.reduce(
    (acc, course) => {
      const termKey = course.term || "Unknown"
      if (!acc[termKey]) {
        acc[termKey] = []
      }
      acc[termKey].push(course)
      return acc
    },
    {} as Record<string, Course[]>,
  )

  const sortedTerms = Object.keys(coursesByTerm).sort((a, b) => {
    if (a === "Unknown") return 1
    if (b === "Unknown") return -1

    const [seasonA, yearA] = a.split(" ")
    const [seasonB, yearB] = b.split(" ")

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

  const toggleTerm = (term: string) => {
    setExpandedTerms((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(term)) {
        newSet.delete(term)
      } else {
        newSet.add(term)
      }
      return newSet
    })
  }

  const isNumericGrade = (grade: string): boolean => {
    return /^\d+$/.test(grade.trim())
  }

  const getGradeColor = (gradePoint: number) => {
    if (gradePoint >= 3.5) return "bg-green-400/30 border-green-500/20" // Good: 80%+
    if (gradePoint >= 2.7) return "bg-yellow-400/30 border-yellow-500/20" // Average: 70-79%
    return "bg-red-400/30 border-red-500/20" // Below average: <70%
  }

  useEffect(() => {
    async function fetchCourseAverages() {
      const courseCodes = courses.map((c) => c.code).join(",")
      if (!courseCodes) {
        setLoadingAverages(false)
        return
      }

      try {
        const response = await fetch(`/api/course-averages?codes=${encodeURIComponent(courseCodes)}`)
        if (response.ok) {
          const data = await response.json()
          setCourseAverages(data.averages || {})
        }
      } catch (error) {
        // Silent fail
      } finally {
        setLoadingAverages(false)
      }
    }

    fetchCourseAverages()
  }, [courses])

  const getDisplayValues = (course: Course) => {
    const isNumeric = isNumericGrade(course.grade)
    const courseAvg = courseAverages[course.code]

    if (displayMode === "gpa") {
      const studentGPA = course.gradePoint.toFixed(1)
      const avgGPA = courseAvg?.avgGpa ? courseAvg.avgGpa.toFixed(1) : null
      return {
        square: studentGPA,
        average: avgGPA,
      }
    } else {
      const studentPercentage = isNumeric
        ? course.grade
        : Math.min(100, Math.round((course.gradePoint / 4.0) * 90 + 10)).toString()
      const avgPercentage = courseAvg?.avgPercentage ? courseAvg.avgPercentage.toString() + "%" : null
      return {
        square: studentPercentage + "%",
        average: avgPercentage,
      }
    }
  }

  return (
    <div className="bg-white/20 dark:bg-white/5 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-xl rounded-3xl p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-semibold">Course Breakdown</h2>
        <p className="text-sm text-muted-foreground">
          {displayMode === "gpa"
            ? "Individual course performance by term"
            : "Showing actual percentages and GPA equivalents"}
        </p>
      </div>

      {enrolledCourses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base md:text-lg font-medium text-muted-foreground">Currently Enrolled In</h3>
          {enrolledCourses.map((course, index) => (
            <div
              key={`enrolled-${index}`}
              className="bg-white/30 dark:bg-white/10 backdrop-blur-lg border border-white/40 dark:border-white/10 shadow-md hover:shadow-lg transition-shadow rounded-2xl p-4 space-y-3 group border-2 border-primary/20"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0 w-full">
                  <p className="font-medium truncate">{course.code}</p>
                  <p className="text-sm text-muted-foreground truncate">{course.name}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="text-right">
                    <p className="font-semibold text-lg text-primary">In Progress</p>
                    <p className="text-xs text-muted-foreground">No grade yet</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {completedCourses.length > 0 && (
        <div className="space-y-4">
          {enrolledCourses.length > 0 && (
            <h3 className="text-base md:text-lg font-medium text-muted-foreground">Completed Courses</h3>
          )}

          {sortedTerms.map((term) => {
            const termCourses = coursesByTerm[term]
            const isExpanded = expandedTerms.has(term)
            const termLevel = termCourses[0]?.level

            return (
              <Collapsible key={term} open={isExpanded} onOpenChange={() => toggleTerm(term)}>
                <CollapsibleTrigger className="w-full">
                  <div className="bg-white/30 dark:bg-white/10 backdrop-blur-lg border border-white/40 dark:border-white/10 shadow-md hover:shadow-lg transition-all rounded-xl p-4 flex items-center justify-between hover:bg-muted/50">
                    <div className="text-left">
                      <p className="font-semibold text-base md:text-lg">{term}</p>
                      {termLevel && <p className="text-sm text-muted-foreground">Level {termLevel}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-muted-foreground">{termCourses.length} courses</p>
                      <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  {termCourses.map((course, index) => {
                    const displayValues = getDisplayValues(course)
                    const gradeColor = getGradeColor(course.gradePoint)

                    return (
                      <div
                        key={index}
                        className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-md hover:shadow-lg transition-shadow rounded-2xl p-4 group ml-0 sm:ml-4"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0 w-full">
                            <p className="font-medium truncate">{course.code}</p>
                            <p className="text-sm text-muted-foreground truncate">{course.name}</p>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-left sm:text-right">
                              <p className="text-xs text-muted-foreground/60 italic">Course Average:</p>
                              {displayValues.average ? (
                                <p className="text-sm font-medium text-muted-foreground">{displayValues.average}</p>
                              ) : (
                                <p className="text-sm text-muted-foreground/60">Coming soon</p>
                              )}
                            </div>
                            <div
                              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl ${gradeColor} border-2 flex items-center justify-center shadow-sm flex-shrink-0`}
                            >
                              <span className="text-xl sm:text-2xl font-bold text-black leading-none">
                                {displayValues.square}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      )}
    </div>
  )
}
