import { createContext, useCallback, useContext, useMemo } from "react"
import { Store } from "../util/store"
import { produce } from "immer"

export type State = {
    path: string
    back: () => void
}

export type PushFn = (path: string) => void

export const context = createContext<{
    store: Store<State>
    push: PushFn
} | null>(null)

export const paramContext = createContext<Record<string, string> | null>(null)

export function updatePath(path: string) {
    return produce<State>((draft) => {
        if (path !== draft.path) {
            draft.path = path
        }
    })
}

type Router = {
    path: string
    params: Record<string, string>
    push: (path: string) => void
    back: () => void
    match: (path: string, isExact: boolean) => Record<string, string> | null
}

export function useRouter(): Router {
    const ctx = useContext(context)
    if (!ctx) {
        throw new Error("no routing context")
    }

    const paramsCtx = useContext(paramContext)

    return useMemo(
        () => ({
            ...ctx.store.state,
            params: paramsCtx ?? {},
            push: ctx.push,
            match: (path: string, isExact: boolean) => {
                const route = parseRoute(path)
                return matchRoute(ctx.store.state.path, route, isExact)
            },
        }),
        [ctx.store.state, ctx.push, paramsCtx]
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
