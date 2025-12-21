import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const codes = searchParams.get("codes")

    if (!codes) {
      return NextResponse.json({ error: "Course codes are required" }, { status: 400 })
    }

    const courseCodes = codes.split(",").map((c) => c.trim())

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("course_grades")
      .select("course_code, grade_point")
      .in("course_code", courseCodes)

    if (error) {
      return NextResponse.json({ averages: {} })
    }

    const courseMap = new Map<string, number[]>()
    data?.forEach((row) => {
      if (!courseMap.has(row.course_code)) {
        courseMap.set(row.course_code, [])
      }
      courseMap.get(row.course_code)!.push(row.grade_point)
    })

    const averagesMap = Array.from(courseMap.entries()).reduce(
      (acc, [course_code, gradePoints]) => {
        const avg_gpa = gradePoints.reduce((sum, gp) => sum + gp, 0) / gradePoints.length
        acc[course_code] = {
          avgGpa: avg_gpa,
          avgPercentage: Math.round((avg_gpa / 4.0) * 90 + 10),
          sampleSize: gradePoints.length,
        }
        return acc
      },
      {} as Record<string, any>,
    )

    return NextResponse.json({ averages: averagesMap })
  } catch (error) {
    return NextResponse.json({ averages: {} })
  }
}
