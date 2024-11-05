import { H3 } from "../ui/heading"
import { Score } from "../score/Score"
import clsx from "clsx"

type Props = {
    isBestMatch?: boolean
    resumeId: number
    fullName: string
    position?: string
    totalScore: number
    skillScore?: number
    generalToolScore?: number
    specificToolScore?: number
}

export function CandidateSearchCard({
    isBestMatch,
    fullName,
    position,
    totalScore,
    skillScore,
    generalToolScore,
    specificToolScore
}: Props) {
    return (
        <div className={clsx("py-8 bg-opacity-80 px-7 shadow-slate-100 relative z-1 shadow-xl", {
            'bg-indigo-50 border border-indigo-300 rounded-3xl mb-4 mx-1 pt-3 mt-4': isBestMatch,
            'bg-white': !isBestMatch,
        })}>
            {isBestMatch && (
                <div className="text-indigo-400 text-opacity-80 mb-2 font-semibold italic">
                    Best match!
                </div>
            )}
            <div className="flex flex-row items-start mb-6">
                <div className="basis-full">
                    <H3 className={clsx("font-bold text-[1.5rem] mb-1 mt-1", {
                        'text-indigo-600': isBestMatch
                    })}>
                        {totalScore > 40 ? <HighDemandIcon /> : null}{fullName}{" "}
                    </H3>
                    <p className="">
                        {/* (
                        <span className="text-xl">{position}</span>
                        ) */}
                            <>
                                <span className="text-xl">Chief Technology Officer</span>,{" "}
                                <span className="text-blue-900 text-opacity-60 text-[1rem]">
                                    <span className="italic opacity-60">prev.</span> Co-Founder,
                                    Head of Web Development
                                </span>
                            </>
                    </p>
                </div>
                <div className="ml-6 relative top-1 -left-id">
                    <div className="text-xl">
                        <Score percent={totalScore} isHighlighted={isBestMatch} />
                    </div>
                    {false && (
                        <div className="text-indigo-500 opacity-60 absolute left-1/2 -translate-x-1/2 italic -top-8 font-semibold text-[0.9rem] whitespace-nowrap">Best match!</div>
                    )}
                </div>
            </div>
            <div className="flex flex-row items-center gap-8">
                <Score key="skill" percent={skillScore} label="Skills" />
                <Score key="general" percent={generalToolScore} label="Tools" />
                <Score key="spec" percent={specificToolScore} label="Specifics" />
            </div>
        </div>
    )
}

function HighDemandIcon() {
    return (
        <svg
            className="w-6 h-6 text-indigo-600 inline relative -top-0.5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M13 10H20L11 23V14H4L13 1V10Z"></path>
        </svg>
    )
}
