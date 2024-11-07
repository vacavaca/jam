import clsx from "clsx"
import { PropsWithChildren, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
    isDisabled?: boolean
    isLoading?: boolean
    isSuccess?: boolean
    success?: ReactNode
    className?: string
    onClick?: () => unknown
} & PropsWithChildren

export function SecondaryButton({
    isLoading,
    isSuccess,
    success,
    onClick,
    isDisabled,
    children,
    className,
}: Props) {
    return (
        <button
            className={twMerge(
                clsx(
                    "rounded-3xl relative p-5 w-full block px-4 text-black transition-colors whitespace-nowrap group",
                    {
                        "bg-neutral-200 bg-opacity-50 hover:bg-neutral-300 active:bg-indigo-400":
                            !isLoading && !isSuccess && !isDisabled,
                        "bg-neutral-200 cursor-default": isLoading && !isDisabled,
                        "bg-green-400 hover:bg-green-400 cursor-default":
                            !isLoading && isSuccess && !isDisabled,
                        "bg-neutral-400 cursor-default": isDisabled,
                    },
                    className
                )
            )}
            onClick={!isLoading && !isSuccess && !isDisabled ? onClick : undefined}
        >
            <span
                className={clsx("transition-opacity duration-500", {
                    "opacity-100": !isLoading,
                    "opacity-0": isLoading,
                })}
            >
                {!isSuccess ? children : null}
                {isSuccess ? (success ?? <Success />) : null}
            </span>
            <div
                className={clsx(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500",
                    {
                        "opacity-0": !isLoading,
                        "opacity-1000": isLoading,
                    }
                )}
            >
                <div className="loader-black opacity-50" />
            </div>
        </button>
    )
}

function Success() {
    return (
        <>
            &nbsp;
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path>
            </svg>
        </>
    )
}
