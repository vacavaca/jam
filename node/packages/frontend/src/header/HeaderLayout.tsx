import { PropsWithChildren, useState } from "react"
import { headerContainerContext } from "./state"
import { Header } from "./Header"

export function HeaderLayout({ children }: PropsWithChildren) {
    const [container, setContainer] = useState<HTMLElement | null>(null)

    return (
        <headerContainerContext.Provider value={container}>
            <div className="flex flex-col items-center justify-start h-full">
                <div className="w-full max-w-[34rem] relative h-full">
                    <Header onContainer={setContainer} />
                    <div className="overflow-y-auto mt-20 h-[calc(100%-5rem)] relative z-10">{children}</div>
                </div>
            </div>
        </headerContainerContext.Provider>
    )
}
