import { weightedPrediction } from "./weighted"
import { regressionPrediction } from "./regression"
import { condfidenceRange } from "./confidence"

export function predictGPA(gpas: number[]) {
    if (gpas.length === 0) return null

    const weighted = weightedPrediction(gpas)
    const regression = regressionPrediction(gpas)

    const rawPrediction =
        0.5 * weighted + 
        0.3 * regression +
        0.2 * (weighted + 0.05)

    const prediction = Math.min(4.0, Math.max(0, rawPrediction))

    const { low, high } = condfidenceRange(gpas, prediction)

    const explanation = 
        regression > weighted
            ? "Your GPA trend is improving, so the prediction leans higher."
            : "Recent terms are weighted more to keep the estimate realistic."


    return {
        predictGPA: Number(prediction.toFixed(2)),
        low: Number(low.toFixed(2)),
        high: Number(high.toFixed(2)),
        explanation,
    }
}