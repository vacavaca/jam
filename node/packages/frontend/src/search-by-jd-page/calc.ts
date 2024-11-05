export function calculateScoreScale(score?: number) {
    if (!score) {
        return undefined
    }

    return (1 - Math.exp(-score / 35))
}
