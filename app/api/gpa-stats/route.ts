import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const program = searchParams.get("program")
    const term = searchParams.get("term")

    if (!program) {
      return NextResponse.json({ error: "Program is required" }, { status: 400 })
    }

    const supabase = await createClient()

    let query = supabase.from("student_submissions").select("gpa")

    query = query.eq("program", program)

    if (term && term !== "Overall") {
      query = query.eq("term", term)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        count: 0,
        avgGpa: 0,
        minGpa: 0,
        maxGpa: 0,
        avgPercentage: 0,
        minPercentage: 0,
        maxPercentage: 0,
      })
    }

    const gpas = data.map((d) => d.gpa)
    const avgGpa = gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length
    const minGpa = Math.min(...gpas)
    const maxGpa = Math.max(...gpas)

    const gpaToPercentage = (gpa: number) => Math.min(100, Math.round((gpa / 4.0) * 90 + 10))

    const percentages = gpas.map(gpaToPercentage)
    const avgPercentage = percentages.reduce((sum, pct) => sum + pct, 0) / percentages.length
    const minPercentage = Math.min(...percentages)
    const maxPercentage = Math.max(...percentages)

    return NextResponse.json({
      count: data.length,
      avgGpa: Number.parseFloat(avgGpa.toFixed(2)),
      minGpa: Number.parseFloat(minGpa.toFixed(2)),
      maxGpa: Number.parseFloat(maxGpa.toFixed(2)),
      avgPercentage: Math.round(avgPercentage),
      minPercentage: Math.round(minPercentage),
      maxPercentage: Math.round(maxPercentage),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
