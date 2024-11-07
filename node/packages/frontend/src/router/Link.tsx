import { ForwardedRef, forwardRef, HTMLProps, MouseEventHandler, useCallback } from "react"
import { useRouter } from "./state"

type Props = {
    to?: string
} & HTMLProps<HTMLAnchorElement>

export const Link = forwardRef(function Link(
    { to, ...rest }: Props,
    ref: ForwardedRef<HTMLAnchorElement>
) {
    const router = useRouter()
    const onClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
        (e) => {
            e.preventDefault()
            if (to) {
                router.push(to)
            }
        },
        [router, to]
    )

    return (
        <a {...rest} ref={ref} href={to ?? rest.href} onClick={to ? onClick : undefined}>
            {rest.children}
        </a>
    )
})
