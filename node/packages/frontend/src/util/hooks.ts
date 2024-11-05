// @deno-types="npm:@types/react"
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react"

export function useAsyncRequest<T = void, A extends any[] = []>(
    fn: (...args: A) => Promise<T>,
    deps: DependencyList
) {
    const isLoadingRef = useRef(false)
    const [state, setState] = useState<{
        isLoading: boolean
        isSuccess: boolean
        isError: boolean
        isDone: boolean
        error: any | null
        data: T | null
    }>({
        isLoading: false,
        isSuccess: false,
        isError: false,
        isDone: false,
        data: null as T | null,
        error: null as string | null,
    })

    const onRequest = useCallback(async (...args: A) => {
        if (isLoadingRef.current) {
            return
        }

        isLoadingRef.current = true

        try {
            setState({
                isLoading: true,
                isSuccess: false,
                isError: false,
                isDone: false,
                data: null,
                error: null,
            })

            const data = await fn(...args)
            setState({
                isLoading: false,
                isDone: true,
                data,
                error: null,
                isSuccess: true,
                isError: false,
            })
        } catch (error) {
            console.error(error)
            setState({
                isLoading: false,
                isDone: true,
                data: null,
                error,
                isSuccess: false,
                isError: true,
            })
        } finally {
            isLoadingRef.current = false
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, deps)

    return useMemo(
        () => ({
            ...state,
            state,
            onRequest,
        }),
        [state, onRequest]
    )
}

export function useInterval(fn: (() => unknown) | null | undefined | false, interval: number, deps: DependencyList) {
    useEffect(
        () => {
            if (fn && fn instanceof Function) {
                const timer = setInterval(fn, interval)
                return () => clearInterval(timer)
            }
        },
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
        ([interval] as DependencyList).concat(deps)
    )
}
