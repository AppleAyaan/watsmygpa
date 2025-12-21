import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase.from("student_submissions").select("*", { count: "exact", head: true })

    if (error) {
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    return NextResponse.json({ count: 0 })
  }
}
