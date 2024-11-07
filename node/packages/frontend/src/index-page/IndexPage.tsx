import { MouseEventHandler, PropsWithChildren, useCallback, useMemo } from "react"
import { H2 } from "../ui/heading"
import clsx from "clsx"
import { useRouter } from "@/router/state"
import { AuthState, useAuth } from "@/auth/context"
import { updateAction } from "@/util/store"
import { Logo } from "@/icon/Logo"

export function IndexPage() {
    const router = useRouter()
    const auth = useAuth()

    const returnTo = useMemo(() => {
        const param = new URLSearchParams(window.location.search).get("return")
        return param as "profile" | string
    }, [])

    const handleApplyButton = useCallback(() => {
        auth?.set.call(undefined, updateAction<AuthState>({ isApplying: true, isHiring: false }))
        if (returnTo === "profile") {
            router.push("/profile")
        } else {
            router.push("/onboard/upload/cv")
        }
    }, [router, auth?.set, returnTo])

    const handleHireButton = useCallback(() => {
        auth?.set.call(undefined, updateAction<AuthState>({ isHiring: true, isApplying: false }))
        if (returnTo === "profile") {
            router.push("/profile")
        } else {
            router.push("/onboard/upload/jd")
        }
    }, [router, auth?.set, returnTo])

    return (
        <>
            <div className="text-center w-full">
                <Logo className="w-20 h-20 inline-block" />
            </div>
            <H2 rank={1} className="mb-8 mt-4 text-center">
                Welcome to <br />
                <span className="font-black text-4xl">OnBoard</span>
            </H2>
            <p className="text-lg mb-16 text-center text-neutral-800">
                A place where the best <span className="text-indigo-500 font-black">match</span>{" "}
                happens
            </p>

            <Option
                onClick={handleApplyButton}
                className="border-indigo-500 text-indigo-600 bg-indigo-100 "
            >
                I am looking for a job
            </Option>

            <Option
                onClick={handleHireButton}
                className="border-cyan-500 text-cyan-600 bg-cyan-200 bg-opacity-[30%] hover:bg-opacity-60"
            >
                I am hiring
            </Option>
        </>
    )
}

function Option({
    onClick,
    className,
    children,
}: { onClick: MouseEventHandler; className?: string } & PropsWithChildren) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "block p-6 py-6 cursor-pointer rounded-3xl border-2 border-opacity-5 mb-4 bg-opacity-50 transition-colors duration-300 hover:bg-opacity-100",
                className
            )}
        >
            {children}
        </div>
    )
}
