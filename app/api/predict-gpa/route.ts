import { NextResponse } from "next/server"
import { predictGPA } from "@/lib/predict"

export async function POST(req: Request) {
    const { gpas } = await req.json()

    if (!Array.isArray(gpas) || gpas.length === 0) {
        return NextResponse.json(
            { error: "invalid gpa input!" },
            { status: 400 }
        )
    }

    const result = predictGPA(gpas)

    // LOG TESTING PURPOSES
    console.log("gpa input: ", gpas)
    console.log("gpa prediction: ", result)

    return NextResponse.json(result)
}
