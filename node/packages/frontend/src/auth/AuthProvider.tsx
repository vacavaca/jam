import { useStore } from "@/util/store"
import { PropsWithChildren, useEffect } from "react"
import { authContext, AuthState } from "./context"
import { useRouter } from "@/router/state"

export function AuthProvider({ children }: PropsWithChildren) {
    const store = useStore<AuthState>({ isHiring: false, isApplying: false })

    const router = useRouter()

    useEffect(() => {
        if (!store.state.isHiring && !store.state.isApplying) {
            router.push("/?return=profile")
        }
    }, [store.state, router])

    return <authContext.Provider value={store}>{children}</authContext.Provider>
}
