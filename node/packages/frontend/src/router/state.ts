import { createContext, useContext, useMemo } from "react"
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
        }),
        [ctx.store.state, ctx.push, paramsCtx]
    )
}
