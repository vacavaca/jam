import { PropsWithChildren, useCallback, useEffect, useMemo } from "react"
import { useStore } from "../util/store"
import { context, State, updatePath } from "./state"

export function RouterProvider({ children }: PropsWithChildren) {
    const onBack = useCallback(() => {
        history.back()
    }, [])

    const store = useStore<State>({ path: window.location.pathname, back: onBack })

    const onPush = useCallback(
        (path: string) => {

            let resolved = path
            if (!path.startsWith("/")) {
                resolved = window.location.pathname
                if (resolved.at(-1) === "/") {
                    resolved = resolved.slice(0, -1)
                }
                resolved += `/${path}`
            }

            let routerPath = resolved.replace(/\?.+$/, '')
            routerPath = routerPath.replace(/#.+$/, '')

            history.pushState({}, "", resolved)
            store.set.call(undefined, updatePath(routerPath))
        },
        [store.set]
    )

    useEffect(() => {
        store.set.call(undefined, updatePath(window.location.pathname))
        history.replaceState({}, "")
        window.addEventListener("popstate", () => {
            store.set.call(undefined, updatePath(window.location.pathname))
        })
    }, [store.set])

    const ctx = useMemo(
        () => ({
            store,
            push: onPush,
        }),
        [store, onPush]
    )

    console.log(store.state)

    return <context.Provider value={ctx}>{children}</context.Provider>
}
