"use server"

import { parseTranscriptText } from "@/lib/transcript-parser"
import type { Course } from "@/lib/transcript-parser"

export async function processTranscript(
  text: string,
): Promise<{ success: boolean; courses?: Course[]; error?: string }> {
  try {
    if (!text || text.length < 100) {
      return {
        success: false,
        error: "Transcript text is too short. Please ensure you uploaded a complete transcript.",
      }
    }

    const courses = parseTranscriptText(text)

    if (courses.length === 0) {
      return {
        success: false,
        error:
          "No courses found in the transcript. Please make sure you uploaded your complete UW unofficial transcript.",
      }
    }

    return {
      success: true,
      courses,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse transcript",
    }
  }
}
