import type { Course } from "./transcript-parser"

export interface GPAResult {
  overallGPA: number
  totalCredits: number
  courses: Course[]
  termGPAs?: { term: string; gpa: number; credits: number }[] // Added term-by-term GPAs
}

export function calculateGPA(courses: Course[], selectedTerm?: string): GPAResult {
  const filteredCourses =
    selectedTerm && selectedTerm !== "Overall"
      ? courses.filter((c) => c.term === selectedTerm && c.grade !== "IP")
      : courses.filter((c) => c.grade !== "IP")

  let totalPoints = 0
  let totalCredits = 0

  for (const course of filteredCourses) {
    totalPoints += course.gradePoint * course.credits
    totalCredits += course.credits
  }

  const overallGPA = totalCredits > 0 ? totalPoints / totalCredits : 0

  const termGPAs: { term: string; gpa: number; credits: number }[] = []
  const terms = new Set(courses.map((c) => c.term))

  for (const term of terms) {
    const termCourses = courses.filter((c) => c.term === term && c.grade !== "IP")
    let termPoints = 0
    let termCredits = 0

    for (const course of termCourses) {
      termPoints += course.gradePoint * course.credits
      termCredits += course.credits
    }

    if (termCredits > 0) {
      termGPAs.push({
        term,
        gpa: termPoints / termCredits,
        credits: termCredits,
      })
    }
  }

  return {
    overallGPA,
    totalCredits,
    courses: filteredCourses,
    termGPAs,
  }
}

export function gpaToPercentage(gpa: number): number {
  // UW uses 4.0 scale, convert proportionally
  // Assuming 4.0 = 90%, scaling proportionally
  return Math.min(100, (gpa / 4.0) * 90 + 10)
}
