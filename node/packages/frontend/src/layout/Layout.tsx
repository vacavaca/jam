import { PropsWithChildren } from "react"
import { HeaderFooterLayout } from "./HeaderFooterLayout"

type Props = {} & PropsWithChildren

export function Layout({ children }: Props) {
    return <HeaderFooterLayout>{children}</HeaderFooterLayout>
}
