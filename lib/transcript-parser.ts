export interface Course {
  code: string
  name: string
  grade: string
  gradePoint: number
  credits: number
  term: string
  level?: string
  isEnrolled?: boolean
  program?: string
}

function gradeToPoint(grade: string): number {
  const gradeMap: { [key: string]: number } = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0.0,
    WD: 0.0,
    WF: 0.0,
    CR: 0.0,
    IP: 0.0,
  }

  const upperGrade = grade.trim().toUpperCase()

  if (/^\d+$/.test(upperGrade)) {
    const percentage = Number.parseInt(upperGrade)
    if (percentage >= 90) return 4.0
    if (percentage >= 85) return 3.9
    if (percentage >= 80) return 3.7
    if (percentage >= 77) return 3.3
    if (percentage >= 73) return 3.0
    if (percentage >= 70) return 2.7
    if (percentage >= 67) return 2.3
    if (percentage >= 63) return 2.0
    if (percentage >= 60) return 1.7
    if (percentage >= 50) return 1.0
    return 0.0
  }

  return gradeMap[upperGrade] ?? 0.0
}

export function parseTranscriptText(text: string): Course[] {
  const lines = text.split(/\n+/).filter((line) => line.trim().length > 0)

  const courses: Course[] = []

  let currentTerm = ""
  let currentLevel = ""
  let inWorkTerm = false
  let currentProgram = ""
  let inCourseSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) continue

    // Check for end marker
    if (line.includes("End of Undergraduate Unofficial Transcript")) {
      break
    }

    // Check for term
    const termMatch = line.match(/(Fall|Winter|Spring)\s+(20\d{2}|19\d{2})/)
    if (termMatch) {
      currentTerm = `${termMatch[1]} ${termMatch[2]}`
      inCourseSection = false
      continue
    }

    // Check for program
    if (line.includes("Program:")) {
      const programMatch = line.match(/Program:\s*(.+)/)
      if (programMatch) {
        currentProgram = programMatch[1].trim()
      }
      continue
    }

    // Check for level
    if (line.includes("Level:")) {
      const levelMatch = line.match(/Level:\s*([0-9][A-B])/)
      if (levelMatch) {
        currentLevel = levelMatch[1]
      }
      continue
    }

    // Check if entering work term section
    if (line.includes("Form Of Study: Co-op Work Term")) {
      inWorkTerm = true
      inCourseSection = false
      continue
    }

    // Check if entering enrollment section
    if (line.includes("Form Of Study: Enrolment")) {
      inWorkTerm = false
      continue
    }

    // Check for course section header
    if (line.includes("Course") && line.includes("Description") && line.includes("Grade")) {
      inCourseSection = true
      continue
    }

    // Skip if we're in a work term or not in course section
    if (inWorkTerm || !inCourseSection) {
      continue
    }

    // Try to parse course from this line
    const courseMatch = line.match(
      /^([A-Z]{2,6})\s+(\d{1,3}[A-Z]?W?)\s+(.+?)\s+(0\.\d{2})\s+(0\.\d{2})\s+(A\+|A-|A|B\+|B-|B|C\+|C-|C|D\+|D-|D|F|CR|IP|WD|WF|\d{2,3})\s*$/,
    )

    if (courseMatch) {
      const [, dept, num, description, attempted, earned, grade] = courseMatch

      const code = `${dept} ${num}`.trim()
      const name = description.trim()
      const credits = Number.parseFloat(earned)
      const gradeValue = grade.trim()

      // Skip non-graded courses
      if (
        gradeValue === "CR" ||
        gradeValue === "IP" ||
        code.includes("COOP") ||
        code.includes("PD") ||
        code.includes("WKRPT")
      ) {
        continue
      }

      courses.push({
        code,
        name,
        grade: gradeValue,
        gradePoint: gradeToPoint(gradeValue),
        credits,
        term: currentTerm,
        level: currentLevel,
        isEnrolled: false,
        program: currentProgram,
      })
    }
  }

  if (courses.length === 0) {
    throw new Error(
      "No courses found in transcript. Please ensure you uploaded your complete UW unofficial transcript PDF.",
    )
  }

  return courses
}

export async function parseTranscript(file: File): Promise<Course[]> {
  const text = await file.text()
  return parseTranscriptText(text)
}

export function getUniqueTerms(courses: Course[]): string[] {
  const terms = new Set(courses.map((c) => c.term))
  return Array.from(terms)
    .filter((t) => t)
    .sort((a, b) => {
      const [seasonA, yearA] = a.split(" ")
      const [seasonB, yearB] = b.split(" ")

      if (yearA !== yearB) {
        return Number.parseInt(yearA) - Number.parseInt(yearB)
      }

      const seasonOrder = { Fall: 1, Winter: 2, Spring: 3 }
      return (
        (seasonOrder[seasonA as keyof typeof seasonOrder] || 0) -
        (seasonOrder[seasonB as keyof typeof seasonOrder] || 0)
      )
    })
}
