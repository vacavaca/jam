import { PropsWithChildren, useMemo } from "react"
import { paramContext, useRouter } from "./state"

type Props = (
    | {
          starts: string
      }
    | { exact: string }
) & { isInvert?: boolean } & PropsWithChildren

export function Route({ children, ...props }: Props) {
    const router = useRouter()

    const params = useMemo(() => {
        const isExact = "exact" in props
        const path = isExact ? props.exact : props.starts
        return router.match(path, isExact)
    }, [props, router])

    const mergedParams = useMemo(
        () => ({
            ...router.params,
            ...params,
        }),
        [router.params, params]
    )

    if ((!params && !props.isInvert) || (params && props.isInvert)) {
        return null
    }

    return <paramContext.Provider value={mergedParams}>{children}</paramContext.Provider>
}
