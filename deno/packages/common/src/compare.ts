export type Comparator<T> = (a: T, b: T) => number

export function reversedComparator<T>(comparator: Comparator<T>): Comparator<T> {
    return (a, b) => comparator(b, a)
}

function composeTwoComporators<T>(first: Comparator<T>, second: Comparator<T>): Comparator<T> {
    return (a, b) => {
        const cmp = first(a, b)
        if (cmp !== 0) {
            return cmp
        }

        return second(a, b)
    }
}

export function composeComparators<T>(...args: Comparator<T>[]): Comparator<T> {
    if (args.length === 0) {
        throw new Error("no args provided")
    }

    if (args.length === 1) {
        return args[0]
    }

    let right = args[args.length - 1]
    for (let i = args.length - 2; i >= 0; i--) {
        const left = args[i]
        right = composeTwoComporators(left, right)
    }

    return right
}

