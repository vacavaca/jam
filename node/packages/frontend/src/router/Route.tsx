import { PropsWithChildren, useMemo } from "react"
import { paramContext, useRouter } from "./state"

type Props = (
    | {
          starts: string
      }
    | { exact: string }
) &
    PropsWithChildren

export function Route({ children, ...props }: Props) {
    const router = useRouter()

    const params = useMemo(() => {
        const isExact = "exact" in props
        const route = parseRoute(isExact ? props.exact : props.starts)
        return matchRoute(router.path, route, isExact)
    }, [props, router.path])

    const mergedParams = useMemo(() => ({
        ...router.params,
        ...params
    }), [router.params, params])

    if (!params) {
        return null
    }

    return (
        <paramContext.Provider value={mergedParams}>
            {children}
        </paramContext.Provider>
    )
}

function parseRoute(path: string) {
    const parts = path.split("/")
    for (const part of parts) {
        if (part.startsWith(":") && part.length === 1) {
            throw new Error("empty param segment is not allowed")
        }
    }

    return parts
}

function matchRoute(path: string, route: string[], isExact?: boolean) {
    const params: Record<string, string> = {}
    const parts = path.split("/")

    if (isExact && parts.length !== route.length) {
        return null
    }

    for (let i = 0; i < route.length; i++) {
        const segment = route[i]
        if (segment.startsWith(":")) {
            params[segment.slice(1)] = parts[i]
        } else if (segment !== parts[i]) {
            return null
        }
    }

    return params
}
