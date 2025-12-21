"use server"

import { createClient } from "@/lib/supabase/server"

export interface CourseData {
  code: string
  name: string
  grade: string
  gradePoint: number
  credits: number
  term: string
  program?: string
}

export interface GPASubmission {
  program: string
  term: string
  gpa: number
  totalCourses: number
  courses: CourseData[]
}

export async function saveGPAData(submission: GPASubmission) {
  try {
    const supabase = await createClient()

    const { data: submissionData, error: submissionError } = await supabase
      .from("student_submissions")
      .insert({
        program: submission.program,
        term: submission.term,
        gpa: submission.gpa,
        total_courses: submission.totalCourses,
      })
      .select("id")
      .single()

    if (submissionError) throw submissionError

    const coursesToInsert = submission.courses.map((course) => ({
      submission_id: submissionData.id,
      course_code: course.code,
      course_name: course.name,
      grade: course.grade,
      grade_point: course.gradePoint,
      credits: course.credits,
      term: course.term,
    }))

    const { error: coursesError } = await supabase.from("course_grades").insert(coursesToInsert)

    if (coursesError) throw coursesError

    return { success: true }
  } catch (error) {
    console.error("Error saving GPA data:", error)
    return { success: false, error: String(error) }
  }
}

export async function getFacultyAverages(program: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("student_submissions")
      .select("term, gpa")
      .eq("program", program)
      .order("term", { ascending: true })

    if (error) throw error

    // Group by term and calculate averages
    const termMap = new Map<string, number[]>()
    data.forEach((row) => {
      if (!termMap.has(row.term)) {
        termMap.set(row.term, [])
      }
      termMap.get(row.term)!.push(row.gpa)
    })

    const averages = Array.from(termMap.entries()).map(([term, gpas]) => ({
      term,
      avg_gpa: gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length,
      sample_size: gpas.length,
    }))

    return { success: true, data: averages }
  } catch (error) {
    console.error("Error fetching faculty averages:", error)
    return { success: false, data: [] }
  }
}

export async function getCourseAverages(courseCodes: string[]) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("course_grades")
      .select("course_code, grade_point")
      .in("course_code", courseCodes)

    if (error) throw error

    // Group by course_code and calculate averages
    const courseMap = new Map<string, number[]>()
    data.forEach((row) => {
      if (!courseMap.has(row.course_code)) {
        courseMap.set(row.course_code, [])
      }
      courseMap.get(row.course_code)!.push(row.grade_point)
    })

    const averages = Array.from(courseMap.entries()).map(([course_code, gradePoints]) => {
      const avg_gpa = gradePoints.reduce((sum, gp) => sum + gp, 0) / gradePoints.length
      return {
        course_code,
        avg_gpa,
        avg_percentage: Math.round((avg_gpa / 4.0) * 90 + 10),
        sample_size: gradePoints.length,
      }
    })

    return { success: true, data: averages }
  } catch (error) {
    console.error("Error fetching course averages:", error)
    return { success: false, data: [] }
  }
}
