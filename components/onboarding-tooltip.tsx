"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface OnboardingTooltipProps {
  onClose: () => void
}

export function OnboardingTooltip({ onClose }: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen the tooltip before
    const hasSeenTooltip = localStorage.getItem("uw-gpa-tooltip-seen")
    if (hasSeenTooltip) {
      onClose()
      return
    }

    // Show tooltip after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [onClose])

  const handleClose = () => {
    localStorage.setItem("uw-gpa-tooltip-seen", "true")
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass rounded-3xl p-8 max-w-md space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-semibold">Your Privacy Matters</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All transcript processing happens directly in your browser. Your data never leaves your device, and
              nothing is uploaded to any server. We only store your GPA and anonymized stats locally.
            </p>
          </div>
        </div>
        <Button onClick={handleClose} className="w-full" size="lg">
          Got it
        </Button>
      </div>
    </div>
  )
}
