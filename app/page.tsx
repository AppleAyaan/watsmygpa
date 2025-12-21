"use client"

import { useState } from "react"
import { OnboardingTooltip } from "@/components/onboarding-tooltip"
import { useRouter } from "next/navigation"
import { parseTranscript } from "@/lib/transcript-parser"
import { calculateGPA } from "@/lib/gpa-calculator"
import { saveGPAData } from "@/lib/local-storage"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern"
import { StudentCounter } from "@/components/student-counter"

export default function HomePage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)

    try {
      const courses = await parseTranscript(file)
      const gpaData = calculateGPA(courses)
      saveGPAData({
        gpa: gpaData.overallGPA,
        courses: gpaData.courses,
        timestamp: Date.now(),
      })
      router.push("/results")
    } catch (error) {
      console.error("Error processing transcript:", error)
      alert("Error processing transcript. Please make sure the file is a valid UW transcript.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-3 sm:p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-background -z-20" />

      <InteractiveGridPattern className="absolute inset-0 z-0" width={80} height={80} squares={[40, 40]} />

      <div className="flex-1 flex items-center justify-center relative z-10 pointer-events-none">
        <div className="text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pointer-events-auto">
          <div className="space-y-6">
            <div className="flex justify-center pt-2">
              <StudentCounter />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight text-balance animate-float">
              <span className="text-foreground">WATs My</span>{" "}
              <span className="relative inline-block text-primary font-bold">GPA?</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-balance mx-auto flex flex-wrap items-center justify-center gap-2 text-center">
              GPA calculator for{" "}&nbsp;
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#FFB800] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]">
              <img src="/uw_logo.svg" alt="UW Logo" className="w-5 h-5 sm:w-6 sm:h-6 inline-block" />
              University of Waterloo
              </span>
              &nbsp;students.
            </p>
          </div>

          <Link href="/upload">
            <Button
              size="lg"
              className="glass group relative shadow-[inset_0_3px_25px_rgba(0,0,0,0.15)] overflow-hidden text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-7 font-semibold border-primary/30 transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:border-primary/60 hover:shadow-[0_0_40px_rgba(255,199,0,0.4)] text-black dark:text-white cursor-pointer"
            >
              <span className="relative z1">Calculate GPA</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-1000 pt-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              100% local processing
            </span>
          </div>
        </div>
      </div>

      <footer className="relative z-10 w-full py-4 border-t border-border backdrop-blur-xl bg-card/5 rounded-lg pointer-events-auto">
        <div className="px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground w-full text-center sm:text-left">
            <p className="flex-1">© {new Date().getFullYear()} WATs my GPA. All rights reserved.</p>
            <p className="flex-1 text-center transition-transform duration-300 transform hover:scale-110">
                            Built with ❤️ by{" "}
              <a
                href="https://www.linkedin.com/in/ayaanfaisal18/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Ayaan Faisal
              </a>
            </p>
            <div className="flex-1 flex justify-center sm:justify-end gap-4">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {showTooltip && <OnboardingTooltip onClose={() => setShowTooltip(false)} />}
    </div>
  )
}
