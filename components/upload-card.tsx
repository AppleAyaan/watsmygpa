"use client"

import { useCallback, useState } from "react"
import { useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation';

interface UploadCardProps {
  onFileUpload: (file: File) => void
  isProcessing: boolean
}

export function UploadCard({ onFileUpload, isProcessing }: UploadCardProps) {
  const router = useRouter();
  const [isDragActive, setIsDragActive] = useState(false)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0])
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"]
    },
    maxFiles: 1,
    disabled: isProcessing,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  if (!mounted) return null;

  return (
    <div
      {...getRootProps()}
      className={cn(
        "glass glass-hover rounded-3xl p-12 cursor-pointer transition-all duration-300",
        "border-2 border-dashed",
        isDragActive && "border-primary bg-primary/5 scale-[1.02]",
        isProcessing && "opacity-50 cursor-not-allowed",
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center text-center space-y-6">
        {isProcessing ? (
          <>
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-medium">Processing your transcript</p>
              <p className="text-sm text-muted-foreground">Calculating your GPA...</p>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-medium">{isDragActive ? "Drop your transcript here!" : "Upload Transcript"}</p>
              <p className="text-sm text-muted-foreground">💡 Download from Quest --{'>'} Academics </p>
              <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports PDF only.</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
