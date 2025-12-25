export function regressionPrediction(gpas: number[]) {
    const n = gpas.length
    if (n < 2) return gpas[0]

    const x = Array.from({ length: n }, (_, i) => i + 1)
    const y = gpas

    const meanX = x.reduce((a, b) => a + b, 0) / n
    const meanY = y.reduce((a, b) => a + b, 0) / n

    let numerator = 0
    let denominator = 0

    for (let i = 0; i < n; i++) {
        numerator += (x[i] - meanX) * (y[i] - meanY)
        denominator += (x[i] - meanX) ** 2
    }
    
    const slope = numerator / denominator
    const intercept = meanY - slope * meanX

    return slope * (n + 1) + intercept
}