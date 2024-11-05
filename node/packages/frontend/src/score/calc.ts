export function calculateScoreScale(score: number) {
    return 1 - Math.exp(-score / 30)
}
