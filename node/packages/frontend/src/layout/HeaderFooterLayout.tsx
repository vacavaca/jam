
import { PropsWithChildren, useState } from "react"
import { headerContainerContext } from "@/header/state"
import { Header } from "@/header/Header"
import { footerContainerContext } from "@/footer/state"
import { Footer } from "@/footer/Footer"

export function HeaderFooterLayout({ children }: PropsWithChildren) {
    const [headerContainer, setHeaderContainer] = useState<HTMLElement | null>(null)
    const [footerContainer, setFooterContainer] = useState<HTMLElement | null>(null)

    return (
        <headerContainerContext.Provider value={headerContainer}>
            <footerContainerContext.Provider value={footerContainer}>
                <div className="w-full max-w-[34rem] relative h-screen flex flex-col justify-stretch items-stretch mx-auto">
                    <Header onContainer={setHeaderContainer} />
                    <div className="overflow-y-auto relative z-10">{children}</div>
                </div>
                <Footer onContainer={setFooterContainer} />
            </footerContainerContext.Provider>
        </headerContainerContext.Provider>
    )
}
