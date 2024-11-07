import clsx from "clsx"
import { ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { calculateScoreScale } from "./calc"

export type Props = {
    percent?: number
    className?: string
    isHighlighted?: boolean
    label?: ReactNode
}

export function Score({ label, percent: percentArg, isHighlighted, className }: Props) {
    if (percentArg === undefined) {
        return null
    }

    const scale = calculateScoreScale(percentArg)
    const percent = scale * 100

    return (
        <div className={clsx("relative inline-block select-none", className)}>
            <div
                className={twMerge(
                    clsx(
                        " rounded-3xl absolute h-[130%] -z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                        {
                            "bg-green-200 bg-opacity-30 saturate-[40%]": scale > 0,
                            "bg-cyan-200 bg-opacity-50 saturate-[50%] ": scale > 0.25,
                            "bg-blue-500 bg-opacity-[20%] saturate-[150%]": scale > 0.5,
                            "bg-indigo-400 bg-opacity-50 saturate-[150%]":
                                scale > 0.75,
                            "w-[145%]": !label,
                            "w-[120%]": !!label,
                            'shadow-indigo-50 shadow-lg': isHighlighted
                        }
                    )
                )}
            />
            <span
                className={twMerge(
                    clsx("relative z-1", {
                         // "text-black": scale <= 1.75,
                        "text-green-700 text-opacity-50": scale > 0,
                        "text-cyan-800 text-opacity-60": scale > 0.25,
                        "text-blue-700 text-opacity-80": scale > 0.5,
                        "text-indigo-700 text-opacity-100": scale > 0.75,
                    })
                )}
            >
                <span
                    className={twMerge(
                        clsx("", {
                            "text-emerald-500 saturate-[50%]": scale > 0,
                            "text-cyan-500 saturate-[50%]": scale > 0.25,
                            "text-blue-500 saturate-[80%]": scale > 0.5,
                            "text-indigo-600 saturate-[80%]": scale > 0.75,
                        })
                    )}
                >
                    {label && <span className="mr-2">{label}</span>}
                </span>
                <span className="font-bold">{percent.toFixed(0)}%</span>
            </span>
        </div>
    )
}
