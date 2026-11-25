export const getScoreLevel = (score) => {
    if (score >= 80) return { level: "high", label: "Strong match for this role" }
    if (score >= 60) return { level: "mid", label: "Good match, with a few gaps" }
    return { level: "low", label: "Significant gaps to work on" }
}
