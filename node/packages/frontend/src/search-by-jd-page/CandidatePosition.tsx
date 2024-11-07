import { useMemo } from "react"

type Props = {
    position?: string
    experience?: { position: string; yearLeft?: number }[]
}

export function CandidatePosition({ position, experience }: Props) {
    const prev = useMemo(() => {
        return experience
            ?.slice()
            .slice()
            .sort((a, b) => (b.yearLeft ?? 3000) - (a.yearLeft ?? 3000))
            .slice(0, 2)
            .map((v) => v.position)
    }, [experience])

    console.log(prev, experience)

    if (!position) {
        return null
    }

    return (
        <p className="my-2">
            <span className="text-xl font-semibold">{position}</span>
            {prev && prev.length > 0 && (
                <>
                    {", "}
                    <span className="italic opacity-60">prev.{" "}</span>
                </>
            )}
            {prev?.slice(0, 2).join(", ")}
        </p>
    )
}
