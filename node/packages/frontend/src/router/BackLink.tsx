import { ForwardedRef, forwardRef, HTMLProps, MouseEventHandler, useCallback } from "react"
import { useRouter } from "./state"

type Props = HTMLProps<HTMLAnchorElement>

export const BackLink = forwardRef(function Link(
    { ...rest }: Props,
    ref: ForwardedRef<HTMLAnchorElement>
) {
    const router = useRouter()
    const onClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
        (e) => {
            e.preventDefault()
            router.back()
        },
        [router]
    )

    return (
        <a {...rest} ref={ref} onClick={onClick}>
            {rest.children}
        </a>
    )
})
