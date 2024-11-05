import { PropsWithChildren } from "react"

export function CenterContainer({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-col items-center">
            <div className="h-[25vh]" />
            <div className="w-full max-w-[34rem] px-6 relative">
                {false && (
                    <div className="scale-y-[180%] scale-x-[110%] absolute inset-0 -z-1 pointer-events-none animate-pulse">
                        <div className="absolute inset-0 scale-[100%] opacity-50 border border-indigo-200 rounded-3xl" />
                        <div className="absolute inset-0 scale-[95%] opacity-30 border border-indigo-200 rounded-3xl" />
                        <div className="absolute inset-0 scale-[90%] opacity-20 border border-indigo-200 rounded-3xl" />
                        <div className="absolute inset-0 scale-[85%] opacity-10 border border-indigo-200 rounded-3xl" />
                        <div className="absolute inset-0 scale-[80%] opacity-5 border border-indigo-200 rounded-3xl" />
                    </div>
                )}
                {children}
            </div>
        </div>
    )
}
