import clsx from "clsx"
import { ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { calculateScoreScale } from "./calc"

export type Props = {
    percent?: number
    label?: ReactNode
}

export function TextScore({ label, percent: percentArg }: Props) {
    if (!percentArg) {
        return null
    }

    const scale = calculateScoreScale(percentArg)
    const percent = scale * 100

    return (
        <div className="relative inline-block">
            <div
                className={twMerge(
                    clsx(
                        " rounded-3xl absolute h-[140%] -z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                        {
                            "bg-green-200 bg-opacity-0 saturate-[40%]": scale > 0,
                            "bg-cyan-200 bg-opacity-0 saturate-[50%] ": scale > 0.25,
                            "bg-blue-200 bg-opacity-0 saturate-[100%]": scale > 0.5,
                            "bg-indigo-200 bg-opacity-10 saturate-[100%]": scale > 0.75,
                            "w-[150%]": !label,
                            "w-[120%]": !!label,
                        }
                    )
                )}
            />
            <span
                className={twMerge(
                    clsx("relative z-1", {
                        'text-emerald-300 saturate-[30%]': scale > 0,
                        'text-cyan-200 saturate-[40%]': scale > 0.25,
                        'text-blue-500 saturate-[80%]': scale > 0.5,
                        'text-indigo-700 saturate-[100%]': scale > 0.75,
                    })
                )}
            >
                {label && <span className="mr-2">{label}</span>}
                <span className="font-bold">{percent.toFixed(0)}%</span>
            </span>
        </div>
    )
}

