import { PropsWithChildren, useState } from "react"
import { headerContainerContext } from "./state"
import { Header } from "./Header"

export function HeaderLayout({ children }: PropsWithChildren) {
    const [headerContainer, setHeaderContainer] = useState<HTMLElement | null>(null)

    return (
        <headerContainerContext.Provider value={headerContainer}>
            <div className="w-full max-w-[34rem] relative h-screen flex flex-col justify-stretch items-stretch mx-auto">
                <Header onContainer={setHeaderContainer} />
                <div className="overflow-y-auto relative z-10">{children}</div>
            </div>
        </headerContainerContext.Provider>
    )
}
