import { PropsWithChildren } from "react"

export function CenterContainer({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-col items-center">
            <div className="h-[25vh]" />
            <div className="w-full max-w-[34rem] px-6 relative">
                {children}
            </div>
        </div>
    )
}
