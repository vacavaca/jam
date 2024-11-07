import { H3 } from "../ui/heading"
import { Score } from "../score/Score"
import clsx from "clsx"
import { CandidatePosition } from "./CandidatePosition"
import { Button } from "../ui/Button"
import { MouseEventHandler, useCallback, useRef } from "react"
import { Link } from "../router/Link"

type Props = {
    isBestMatch?: boolean
    resumeId: number
    fullName: string
    summary?: string
    experience?: { position: string; yearLeft?: number }[]
    position?: string
    totalScore: number
    skillScore?: number
    generalToolScore?: number
    specificToolScore?: number
    onClick?: () => unknown
    isOpen?: boolean
}

export function CandidateSearchCard({
    isBestMatch,
    resumeId,
    fullName,
    summary,
    position,
    totalScore,
    skillScore,
    experience,
    generalToolScore,
    specificToolScore,
    isOpen,
    onClick,
}: Props) {
    const linkRef = useRef<HTMLAnchorElement | null>(null)

    const handleClick: MouseEventHandler<any> = useCallback(
        (e) => {
            if (e.target === linkRef.current) {
                return
            }

            if (onClick) {
                onClick()
            }
        },
        [onClick]
    )

    return (
        <div
            className={clsx(
                "py-5 cursor-pointer group px-7  relative z-1 transition-all duration-300 rounded-[2rem]",
                {
                    "mb-0 pt-3": isBestMatch,
                    "my-0 bg-white hover:bg-indigo-50 hover:bg-opacity-50": !isOpen,
                    "mt-4 first:mt-0 mb-8 bg-indigo-50 bg-opacity-80": isOpen,
                }
            )}
            onClick={handleClick}
        >
            <div className="flex flex-row items-start leading-[1.5]">
                <div className="basis-full">
                    <div className="flex flex-row items-center">
                        <H3
                            className={clsx("font-bold text-[1.5rem] my-0", {
                                "text-indigo-500": isBestMatch,
                            })}
                        >
                            {isBestMatch ? <HighDemandIcon /> : null}
                            {fullName}{" "}
                        </H3>
                        <Score
                            className="ml-6 text-xl"
                            percent={totalScore}
                            isHighlighted={isBestMatch}
                        />
                    </div>
                    <CandidatePosition experience={experience} position={position} />
                </div>
            </div>
            <div
                className={clsx("transition-all duration-[300ms] overflow-y-hidden w-full", {
                    "max-h-0": !isOpen,
                    "max-h-[30rem]": isOpen,
                })}
            >
                <div className="flex flex-row items-center gap-8 mt-4 ml-[0.6rem]">
                    <Score key="skill" percent={skillScore} label="Skills" />
                    <Score key="general" percent={generalToolScore} label="Tools" />
                    <Score key="spec" percent={specificToolScore} label="Stack" />
                </div>
                <div className="max-h-[20rem] overflow-y-hidden relative">
                    <p>{summary}</p>
                    <div className="bg-gradient-to-t from-[#f6f8ff] via-[#f6f8ff] absolute left-0 right-0 -bottom-1/2 top-1/2 z-20 pointer-events-none" />
                </div>
                <Link ref={linkRef} className="w-full -mt-1" to={`/cv/${resumeId}`}>
                    <Button className="font-semibold">Full CV</Button>
                </Link>
            </div>
        </div>
    )
}

function HighDemandIcon() {
    return (
        <svg
            className="w-6 h-6 text-indigo-500 inline relative -top-0.5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M13 10H20L11 23V14H4L13 1V10Z"></path>
        </svg>
    )
}
