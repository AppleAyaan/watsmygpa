import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const program = searchParams.get("program")

    if (!program) {
      return NextResponse.json({ error: "Program is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("student_submissions")
      .select("term, gpa")
      .eq("program", program)
      .order("term", { ascending: true })

    if (error) {
      return NextResponse.json({ averages: [] })
    }

    const termMap = new Map<string, number[]>()
    data?.forEach((row) => {
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

    return NextResponse.json({ averages: averages || [] })
  } catch (error) {
    return NextResponse.json({ averages: [] })
  }
}
