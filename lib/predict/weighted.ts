export function weightedPrediction(gpas: number[]) {
    if (gpas.length === 0) return 0
    
    const weights = gpas.map((_, i) => i + 1)

    const weightedSum = gpas.reduce(
        (sum, gpa, i) => sum + gpa * weights[i],
    )

    const weightTotal = weights.reduce((a, b) => a + b, 0)

    return weightedSum / weightTotal
}