import { useMemo, useState, SetStateAction } from "react"

export type Store<T> = {
    state: T
    set(this: undefined, v: SetStateAction<T>):void
}

export function useStore<T>(initialState: T) {
    const [state, setState] = useState(initialState)

    return useMemo(() => ({ state, set: setState }), [state])
}
