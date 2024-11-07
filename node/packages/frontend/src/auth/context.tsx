import { Store } from "@/util/store"
import { createContext, useContext } from "react"

export type AuthState = {
    isHiring: boolean
    isApplying: boolean
}

export const authContext = createContext<Store<AuthState> | null>(null)

export function useAuth() {
    return useContext(authContext)
}

