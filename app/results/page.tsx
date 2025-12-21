"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getGPAData, updateUserInfo } from "@/lib/local-storage"
import { CourseBreakdown } from "@/components/course-breakdown"
import { PeerComparison } from "@/components/peer-comparison"
import { GPAProgressGraph } from "@/components/gpa-progress-graph"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateGPA } from "@/lib/gpa-calculator"
import { getUniqueTerms } from "@/lib/transcript-parser"
import { saveGPAData } from "@/lib/actions/save-to-supabase"
import Image from "next/image"

const PROGRAMS = [
  "Computer Science",
  "Business Administration (WLU) and Computer Science (UW)",
  "Business Administration (WLU) and Mathematics (UW)",
  "Software Engineering",
  "Computer Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biomedical Engineering",
  "Systems Design Engineering",
  "Mathematics",
  "Business Administration",
  "Accounting and Financial Management",
  "Economics",
  "Physics",
  "Chemistry",
  "Biology",
  "Other",
]

export default function ResultsPage() {
  const router = useRouter()
  const [gpaData, setGpaData] = useState<any>(null)
  const [program, setProgram] = useState("")
  const [showComparison, setShowComparison] = useState(false)
  const [displayMode, setDisplayMode] = useState<"gpa" | "percentage">("gpa")
  const [submitting, setSubmitting] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState<string>("Overall")
  const [availableTerms, setAvailableTerms] = useState<string[]>([])
  const [currentGPA, setCurrentGPA] = useState<any>(null)
  const [transcriptProgram, setTranscriptProgram] = useState<string>("")
  const [dataSubmitted, setDataSubmitted] = useState(false)

  useEffect(() => {
    const data = getGPAData()

    if (!data || !data.courses || data.courses.length === 0) {
      router.push("/")
      return
    }

    const terms = getUniqueTerms(data.courses || [])
    setAvailableTerms(terms)
    setGpaData(data)

    const gpaResult = calculateGPA(data.courses || [], "Overall")
    setCurrentGPA(gpaResult)

    if (data.courses.length > 0 && data.courses[0].program) {
      setTranscriptProgram(data.courses[0].program)
    }

    if (data.program) {
      setProgram(data.program)
      setShowComparison(true)
    }
  }, [router])

  useEffect(() => {
    if (gpaData?.courses && gpaData.courses.length > 0) {
      const gpaResult = calculateGPA(gpaData.courses, selectedTerm)
      setCurrentGPA(gpaResult)
    }
  }, [selectedTerm, gpaData])

  const handleUpdateInfo = async () => {
    if (program && transcriptProgram) {
      const isProgramMatch =
        program.toLowerCase().includes(transcriptProgram.toLowerCase()) ||
        transcriptProgram.toLowerCase().includes(program.toLowerCase()) ||
        program === "Other"

      if (!isProgramMatch) {
        const confirmMismatch = confirm(
          `The program you selected (${program}) doesn't match your transcript program (${transcriptProgram}). Continue anyway?`,
        )
        if (!confirmMismatch) return
      }
    }

    if (program) {
      setSubmitting(true)
      updateUserInfo(program, "")

      // Submit all data to Supabase (term by term)
      try {
        if (currentGPA?.termGPAs) {
          for (const termData of currentGPA.termGPAs) {
            const termCourses = gpaData.courses.filter((c: any) => c.term === termData.term && c.grade !== "IP")

            await saveGPAData({
              program,
              term: termData.term,
              gpa: termData.gpa,
              totalCourses: termCourses.length,
              courses: termCourses.map((c: any) => ({
                code: c.code,
                name: c.name,
                grade: c.grade,
                gradePoint: c.gradePoint,
                credits: c.credits,
                term: c.term,
                program: c.program,
              })),
            })
          }
          setDataSubmitted(true)
        }
      } catch (error) {
        console.error("[v0] Error submitting data:", error)
      }

      setShowComparison(true)
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (confirm("This will clear all your data. Are you sure?")) {
      localStorage.removeItem("uw-gpa-data")
      router.push("/")
    }
  }

  const gpaToPercentage = (gpa: number): number => {
    if (gpa >= 4.0) return 90
    if (gpa >= 3.9) return 87
    if (gpa >= 3.7) return 82
    if (gpa >= 3.3) return 78
    if (gpa >= 3.0) return 75
    if (gpa >= 2.7) return 72
    if (gpa >= 2.3) return 68
    if (gpa >= 2.0) return 65
    if (gpa >= 1.7) return 62
    if (gpa >= 1.0) return 55
    return 50
  }

  const displayedValue =
    displayMode === "gpa" ? currentGPA?.overallGPA.toFixed(2) : gpaToPercentage(currentGPA?.overallGPA).toFixed(0) + "%"

  if (!gpaData || !currentGPA || !currentGPA.courses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <Button variant="ghost" onClick={() => router.push("/")} className="gap-2 self-start sm:self-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Button>
          <img
          src="/watsmygpa_logo_long_light.png"
          className="block dark:hidden w-auto h-10 sm:h-12 md:h-14 lg:h-16"
          alt="WATsMyGPA logo"
        />
        <img
          src="/watsmygpa_logo_long_dark.png"
          className="hidden dark:block w-auto h-10 sm:h-12 md:h-14 lg:h-16"
          alt="WATsMyGPA logo"
        />
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-muted-foreground hover:text-destructive self-end sm:self-auto"
          >
            Clear Data
          </Button>
        </div>

        {availableTerms.length > 0 && (
          <div className="bg-background/40 dark:bg-background/20 backdrop-blur-xl border border-border/50 dark:border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
            <Label htmlFor="term-select" className="text-sm font-medium">
              View Term:
            </Label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger id="term-select" className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Overall">Overall</SelectItem>
                {availableTerms.map((term) => (
                  <SelectItem key={term} value={term}>
                    {term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="relative bg-background/40 dark:bg-background/20 backdrop-blur-xl border border-border/50 dark:border-primary/20 rounded-3xl p-6 md:p-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {selectedTerm === "Overall" ? "Your Cumulative GPA" : `${selectedTerm} GPA`}
              </p>
              <div className="bg-muted/50 backdrop-blur-sm rounded-full p-1 flex items-center gap-1">
                <button
                  onClick={() => setDisplayMode("gpa")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    displayMode === "gpa"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  GPA
                </button>
                <button
                  onClick={() => setDisplayMode("percentage")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    displayMode === "percentage"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  %
                </button>
              </div>
            </div>
            <div className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-br from-primary via-primary to-primary/70 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              {displayedValue}
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              Based on {currentGPA.courses?.length || 0} courses
            </p>
          </div>
        </div>

        {!showComparison && (
          <div className="bg-background/40 dark:bg-background/20 backdrop-blur-xl border border-border/50 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold">Compare with Peers</h2>
              <p className="text-sm text-muted-foreground">Enter your program to see how you compare (optional)</p>
              {transcriptProgram && (
                <p className="text-xs text-muted-foreground italic">Detected from transcript: {transcriptProgram}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select value={program} onValueChange={setProgram}>
                <SelectTrigger id="program">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdateInfo} disabled={!program || submitting} className="w-full" size="lg">
              {submitting ? "Submitting..." : "Show Comparison"}
            </Button>
          </div>
        )}

        {showComparison && program && selectedTerm === "Overall" && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Tabs defaultValue="graph" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/40 dark:bg-background/20 backdrop-blur-xl border border-border/50 dark:border-white/10">
                <TabsTrigger value="graph">GPA Progress</TabsTrigger>
                <TabsTrigger value="comparison">Peer Comparison</TabsTrigger>
              </TabsList>
              <TabsContent value="graph" className="space-y-6">
                <GPAProgressGraph termGPAs={currentGPA.termGPAs || []} program={program} displayMode={displayMode} />
              </TabsContent>
              <TabsContent value="comparison" className="space-y-6">
                <PeerComparison
                  gpa={currentGPA.overallGPA}
                  program={program}
                  displayMode={displayMode}
                  term={selectedTerm}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          <CourseBreakdown courses={currentGPA.courses || []} displayMode={displayMode} />
        </div>
      </div>
    </div>
  )
}
