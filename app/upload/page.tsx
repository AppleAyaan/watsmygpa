"use client"

import { useState } from "react"
import { UploadCard } from "@/components/upload-card"
import { OnboardingTooltip } from "@/components/onboarding-tooltip"
import { useRouter } from "next/navigation"
import { calculateGPA } from "@/lib/gpa-calculator"
import { saveGPAData } from "@/lib/local-storage"
import { processTranscript } from "@/lib/actions/process-transcript"
import { useTheme } from "next-themes"
import * as pdfjsLib from "pdfjs-dist"

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@5.4.394/build/pdf.worker.min.mjs`

export default function UploadPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)

  const extractTextFromPDF = async (file: File): Promise<string> => {
    let pdf: pdfjsLib.PDFDocumentProxy | null = null

    try {
      const arrayBuffer = await file.arrayBuffer()
      pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      const allLines: string[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()

        const lineMap = new Map<number, string[]>()

        textContent.items.forEach((item: any) => {
          if ("str" in item && "transform" in item) {
            const y = Math.round(item.transform[5]) // Y position
            const text = item.str.trim()

            if (text) {
              if (!lineMap.has(y)) {
                lineMap.set(y, [])
              }
              lineMap.get(y)!.push(text)
            }
          }
        })

        // Sort by Y position (top to bottom) and join text on same line
        const sortedLines = Array.from(lineMap.entries())
          .sort((a, b) => b[0] - a[0]) // Higher Y = top of page
          .map(([_, texts]) => texts.join(" "))

        allLines.push(...sortedLines)
      }

      const fullText = allLines.join("\n")

      return fullText
    } catch (error) {
      throw new Error("Failed to extract text from PDF. Please ensure the PDF is not corrupted.")
    } finally {
      if (pdf) {
        try {
          await pdf.cleanup()
          await pdf.destroy()
        } catch (cleanupError) {
          // Silent cleanup error handling
        }
      }
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)

    try {
      let transcriptText = ""

      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        transcriptText = await extractTextFromPDF(file)
      } else {
        throw new Error("Please upload a PDF file")
      }

      const result = await processTranscript(transcriptText)

      if (!result.success || !result.courses) {
        throw new Error(result.error || "Failed to parse transcript")
      }

      const courses = result.courses

      const gpaData = calculateGPA(courses)

      saveGPAData({
        gpa: gpaData.overallGPA,
        courses: courses,
        timestamp: Date.now(),
      })

      router.push("/results")
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Failed to process transcript. Please try again."}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const { theme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      <div
        className="fixed top-4 left-4 text-2xl cursor-pointer z-50"
        onClick={() => router.push("/")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") router.push("/")
        }}
      >
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
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted -z-10" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">
            Calculate Your <span className="text-primary">GPA</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-xl mx-auto">
            Upload your <b className="text-yellow-300 drop-shadow-[0_0_15px_rgb(253,224,71)]">unofficial transcript</b>{" "}
            and instantly see your GPA, course breakdown, and peer comparison
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <UploadCard onFileUpload={handleFileUpload} isProcessing={isProcessing} />
        </div>

        <div className="text-center text-sm text-muted-foreground animate-in fade-in duration-700 delay-300">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="green" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              We never store or retain your transcript.
            </span>
          </div>
        </div>
      </div>

      {showTooltip && <OnboardingTooltip onClose={() => setShowTooltip(false)} />}
    </div>
  )
}
