import { PropsWithChildren } from "react"
import { useRouter } from "../router/state"
import { CenterContainer } from "../ui/CenterContainer"
import { HeaderLayout } from "../header/HeaderLayout"
import { HeaderFooterLayout } from "./HeaderFooterLayout"

type Props = {} & PropsWithChildren

export function Layout({ children }: Props) {
    const router = useRouter()

    if (router.match("/", true)) {
        return <CenterContainer>{children}</CenterContainer>
    }

    if (router.match("/search", false)) {
        return <HeaderLayout>{children}</HeaderLayout>
    }

    return <HeaderFooterLayout>{children}</HeaderFooterLayout>
}
