export function enumValueOf<T, E extends Record<string, T>>(enumType: E, value: T): T | null {
    for (const key in enumType) {
        if (enumType[key] === value) {
            return enumType[key]
        }
    }

    return null
}

type Enum<E> = {
    [key: string]: E
} & {
    [key: number]: string
}

export function enumValues<E>(e: Enum<E>): E[] {
    return Object.keys(e)
        .filter((key) => isNaN(Number(key)))
        .map((v) => e[v]) as unknown as E[]
}

export function hashCode(str: string) {
    let hash = 0,
        i,
        chr
    if (str.length === 0) {
        return hash
    }

    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0
    }

    return hash
}

export class MapFactory<A extends any[], T> {
    private _map = new Map<string, { value: T; args: A }>()
    private key: (...args: A) => string
    private create: (...args: A) => T

    constructor(create: (...args: A) => T, key: (...args: A) => string) {
        this.create = create
        this.key = key
    }

    static fromStringKey<S extends string, T>(create: (key: S) => T) {
        return new MapFactory<[S], T>(create, (key) => key)
    }

    static fromStringifyKeys<A extends any[], T>(create: (...args: A) => T) {
        return new MapFactory<A, T>(create, (...keys) => JSON.stringify(keys))
    }

    get(...args: A): T {
        const key = this.key(...args)
        if (!this._map.has(key)) {
            this._map.set(key, { value: this.create(...args), args })
        }

        return this._map.get(key)!.value
    }

    entries() {
        return Array.from(this._map.values())
    }
}

export type Update<A extends Record<string, any>, B extends Record<string, any>> = Omit<
    A,
    keyof B
> &
    B

export async function maybeAsync<T>(value: T | Promise<T>): Promise<T> {
    return value
}

export type SetFilter<T> = {
    include?: T[]
    exclude?: T[]
}

export function filterBy<T, A = T>(
    filter: SetFilter<T> | null | undefined,
    arr: A[],
    getter: (item: A) => T
): A[] {
    if (!filter) {
        return arr
    }

    return arr.filter((a) => {
        const value = getter(a)
        return isIncludedByFilter(filter, value)
    })
}

export function isIncludedByFilter<T>(filter: SetFilter<T> | null | undefined, value: T): boolean {
    if (!filter) {
        return true
    }

    if (filter.include && !filter.include.includes(value)) {
        return false
    }

    if (filter.exclude && filter.exclude.includes(value)) {
        return false
    }

    return true
}

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray

export type JSONArray = JSONValue[]

export interface JSONObject {
    [key: string]: JSONValue
}

type Fn<A, B> = (v: A) => B

interface Compose {
    <A, B>(a: Fn<A, B>): Fn<A, B>
    <A, B, C>(a: Fn<A, B>, b: Fn<B, C>): Fn<A, C>
    <A, B, C, D>(a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>): Fn<A, D>
    <A, B, C, D, E>(a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>, d: Fn<D, E>): Fn<A, E>
    <A, B, C, D, E, F>(a: Fn<A, B>, b: Fn<B, C>, c: Fn<C, D>, d: Fn<D, E>, e: Fn<E, F>): Fn<A, F>
    <A, B, C, D, E, F, G>(
        a: Fn<A, B>,
        b: Fn<B, C>,
        c: Fn<C, D>,
        d: Fn<D, E>,
        e: Fn<E, F>,
        f: Fn<F, G>
    ): Fn<A, G>
    <T, A>(a: Fn<A, any>, ...fns: Fn<any, any>[]): Fn<A, T>
}

export const compose: Compose = <T, A>(a: Fn<A, any>, ...fns: Fn<any, any>[]): Fn<A, T> => {
    return (v: A): T => {
        let result = a(v)
        for (const fn of fns) {
            result = fn(result)
        }

        return result
    }
}

export function lazy<A, B>(instance: A, fn: (this: A) => B) {
    let value: { state: B } | null = null
    return () => {
        if (!value) {
            value = { state: fn.call(instance) }
        }

        return value.state
    }
}

