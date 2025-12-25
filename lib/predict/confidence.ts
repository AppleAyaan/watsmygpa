export function condfidenceRange(
    gpas: number[],
    prediction: number
){
    const mean = gpas.reduce((a, b) => a + b, 0) / gpas.length

    const variance = 
    gpas.reduce((sum, g) => sum + (g - mean) ** 2, 0) / gpas.length

    const stdDev = Math.sqrt(variance)

    const range = stdDev * 0.5

    return {
        low: Math.max(0, prediction - range),
        high: Math.min(4.0, prediction + range),
    }
}