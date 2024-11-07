import { produce } from "immer"
import { useMemo, useState, SetStateAction } from "react"

export type Store<T> = {
    state: T
    set(this: undefined, v: SetStateAction<T>): void
}

export function useStore<T>(initialState: T) {
    const [state, setState] = useState(initialState)

    return useMemo(() => ({ state, set: setState }), [state])
}

export function updateAction<T extends Record<string, any>, S extends T = T>(value: Partial<T>) {
    return produce<S>((draft) => {
        Object.assign(draft, value)
    })
}
