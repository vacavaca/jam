import { useStore } from "@/util/store"
import { PropsWithChildren, useEffect } from "react"
import { authContext, AuthState } from "./context"
import { useRouter } from "@/router/state"

export function AuthProvider({ children }: PropsWithChildren) {
    const store = useStore<AuthState>(loadStateFromLocalStorage() ?? { isHiring: false, isApplying: false })

    const router = useRouter()

    useEffect(() => {
        if (!store.state.isHiring && !store.state.isApplying) {
            router.push("/?return=profile")
        }
    }, [store.state, router])

    useEffect(() => {
        saveStateToLocalStorage(store.state)
    }, [store.state])

    return <authContext.Provider value={store}>{children}</authContext.Provider>
}

function loadStateFromLocalStorage() {
    const data  =localStorage.getItem('auth.v0')

    if (!data) {
        return null
    }

    return JSON.parse(data) as AuthState
}

function saveStateToLocalStorage(state: AuthState) {
    localStorage.setItem('auth.v0', JSON.stringify(state))
}
