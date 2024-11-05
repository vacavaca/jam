import { type Comparator, reversedComparator } from "./compare.ts"

export function isApproxRound(num: number, step: number, e: number = 1e4) {
    const r = (num / step) % 1
    return r < step / e || Math.abs(r - 1) < step / e
}

export function isEqApprox(a: number, b: number, e: number = 1e4) {
    return Math.abs(a - b) < Math.min(Math.abs(a), Math.abs(b)) / e
}

export type BigNumLike = string | BigNum

const interned = new Map<string, BigNum>()

export type BigNumFormattingOptions = {
    decimalDelimeter?: string
    groupDelimiter?: string
}

type DerivedNumFormattingOptions = {
    decimalDelimeter: string
    groupDelimiter: string
}

export class BigNumFormatter {
    private opts: BigNumFormattingOptions

    constructor(opts: BigNumFormattingOptions) {
        this.opts = opts
    }

    format(num: null | undefined, scale?: number): null
    format(num: BigNumLike, scale?: number): string
    format(num: BigNumLike | null | undefined, scale?: number): string | null
    format(num: BigNumLike | null | undefined, scale?: number): string | null {
        if (num == null) {
            return null
        }

        const bn = BigNum.from(num)
        return bn.toFormattedString(scale ?? Number(bn.scale), this.opts)
    }

    formatToMaxPrecision(num: null, targetPrecision: bigint): null
    formatToMaxPrecision(num: BigNum, targetPrecision: bigint): string
    formatToMaxPrecision(
        num: BigNum | null,
        targetPrecision: bigint,
    ): string | null
    formatToMaxPrecision(
        num: BigNum | null,
        targetPrecision: bigint,
    ): string | null {
        if (num == null) {
            return null
        }

        if (num.isZero()) {
            return "0"
        }

        const precision = num.precision()

        if (precision - num.scale >= 6n) {
            return this.format(num, 0)
        }

        // if (num.scale - precision >= 6n) {
        //     return this.format(num)
        // }

        const initialScale = Number(num.scale)
        const scale = Math.min(
            initialScale,
            Math.max(0, initialScale - Number(precision - targetPrecision)),
        )

        return this.format(num, scale)
    }
}

const suffixes = [
    ["n", -9, 10 ** -9],
    ["μ", -6, 10 ** -6],
    ["m", -3, 10 ** -3],
    ["", 0, 1],
    ["K", 3, 10 ** 3],
    ["M", 6, 10 ** 6],
    ["B", 9, 10 ** 9],
    ["T", 12, 10 ** 12],
] as const

export class NumberFormatter {
    private locale: string
    private intlLocale: Intl.Locale

    constructor(locale: string) {
        this.locale = locale
        this.intlLocale = new Intl.Locale(locale)
    }

    getIntlNumberFormatter(scale?: number) {
        if (
            typeof Intl === "object" && !!Intl &&
            typeof Intl.NumberFormat === "function"
        ) {
            return Intl.NumberFormat(
                this.locale,
                scale != null
                    ? {
                        minimumFractionDigits: scale,
                        maximumFractionDigits: scale,
                    }
                    : {},
            )
        }

        return null
    }

    format(num: null | undefined, scale: number): null
    format(num: number, scale: number): string
    format(num: number | null | undefined, scale: number): string | null
    format(num: number | null | undefined, scale: number): string | null {
        if (num == null) {
            return null
        }

        if (this.locale === "en-US") {
            return formatNumberStringWithDelimiter(num.toFixed(scale), {
                groupDelimiter: ",",
                decimalDelimeter: ".",
            })
        } else if (this.locale === "ru-RU") {
            return formatNumberStringWithDelimiter(num.toFixed(scale), {
                groupDelimiter: " ",
                decimalDelimeter: ",",
            })
        } else {
            return num.toLocaleString(this.intlLocale, {
                minimumFractionDigits: scale,
                maximumFractionDigits: scale,
            })
        }
    }

    formatNumberShort(num: number, scale?: number): string
    formatNumberShort(num: null | undefined, scale?: number): null
    formatNumberShort(
        num: number | null | undefined,
        scale?: number,
    ): string | null
    formatNumberShort(
        num: number | null | undefined,
        scale?: number,
    ): string | null {
        if (num == null) {
            return null
        }

        if (num === 0) return "0"

        const sign = num < 0 ? "-" : ""
        num = Math.abs(num)

        const usedScale = scale !== undefined ? scale : 3

        const first = suffixes[0]
        if (num < first[2]) {
            const str = this.formatNumToApproxPrecision(
                sign,
                num / first[2],
                usedScale,
            )
            const result = `${str}${first[0]}`
            return result
        }

        for (let i = 0; i < suffixes.length; i++) {
            const current = suffixes[i]!
            const next = suffixes[i + 1] ?? null

            if (next && num >= next[2]) continue

            const str = this.formatNumToApproxPrecision(
                sign,
                num / current[2],
                usedScale,
            )
            const result = `${str}${current[0]}`
            return result
        }

        const last = suffixes[suffixes.length - 1]
        const str = this.formatNumToApproxPrecision(
            sign,
            num / last[2],
            usedScale,
        )
        const result = `${str}${last[0]}`
        return result
    }

    private formatNumToApproxPrecision(
        sign: string,
        num: number,
        prec: number,
    ) {
        for (let i = prec; i >= -prec; i--) {
            const check = 10 ** i
            if (num > check) {
                return `${sign}${
                    this.format(num, Math.max(0, Math.min(prec, prec - i - 1)))
                }`
            }
        }

        return `${sign === "-" ? ">" : "<"}${sign}${10 ** -prec}`
    }
}

export class BigNum {
    private _scale: bigint
    private _value: bigint
    private _repr: string | undefined
    private _num: number | null = null

    constructor(value: bigint, scale: bigint, repr?: string, num?: number) {
        if (scale < 0) throw new Error("scale must not be negative")

        this._value = value
        this._scale = scale
        this._repr = repr
        if (num != null) {
            this._num = num
        } else if (repr != null) {
            this._num = +repr
        }
    }

    static ZERO = BigNum.from("0")
    static ONE = BigNum.from("1")

    static from(value: BigNumLike): BigNum {
        if (value instanceof BigNum) return value
        if (interned.has(value)) {
            return interned.get(value)!
        }

        const norm = value.replace(/(\d+\.\d*[1-9]+)0+$/g, "$1").replace(
            /(\d)\.0+$/g,
            "$1",
        )

        const point = norm.indexOf(".")

        try {
            let num: BigNum
            if (point === -1) num = new BigNum(BigInt(norm), BigInt(0), norm)
            else {
                const intStr = norm.replace(".", "")
                num = new BigNum(
                    BigInt(intStr),
                    BigInt(norm.length - point - 1),
                    norm,
                ).norm()
            }

            interned.set(value, num)
            if (interned.size > 50e3) interned.clear()

            return num
        } catch (error) {
            if (error instanceof SyntaxError) {
                return BigNum.fromScientific(value)
            }

            throw error
        }
    }

    static fromScientific(str: string) {
        const lower = str.toLowerCase()
        const eIndex = lower.indexOf("e")
        if (eIndex < 0) {
            throw new Error(`the number "${str}" is not in scientific notation`)
        }

        const numPart = lower.slice(0, eIndex)
        const expPart = lower.slice(eIndex + 1)

        const num = BigNum.from(numPart)
        return num.shift(+expPart)
    }

    static fromNumber(value: number) {
        return BigNum.from(value.toFixed(15))
    }

    static fromInteger(value: number) {
        return BigNum.from(value.toFixed())
    }

    static powerOfTen(power: string | bigint) {
        return new BigNum(1n, BigInt(-power))
    }

    static max(...args: BigNumLike[]) {
        if (args.length === 0) throw new Error("no arguments provided")

        let max = null
        for (const arg of args) {
            const num = BigNum.from(arg)
            max = max === null || num.gt(max) ? num : max
        }

        return max as BigNum
    }

    static min(...args: BigNumLike[]) {
        if (args.length === 0) throw new Error("no arguments provided")

        let min = null
        for (const arg of args) {
            const num = BigNum.from(arg)
            min = min === null || num.lt(min) ? num : min
        }

        return min as BigNum
    }

    static cmp(a: BigNum, b: BigNum) {
        return a.gt(b) ? 1 : a.lt(b) ? -1 : 0
    }

    static getComparator(reverse: boolean): Comparator<BigNum> {
        if (reverse) {
            return reversedComparator(BigNum.cmp)
        }

        return BigNum.cmp
    }

    static eq(one: BigNumLike | null, other: BigNumLike | null) {
        if (one === null && other === null) {
            return true
        }

        if ((one === null) !== (other === null)) {
            return false
        }

        return BigNum.from(one!).eq(other!)
    }

    get scale() {
        return this._scale
    }

    get key() {
        return this.toString()
    }

    isZero() {
        return this._value === 0n
    }

    isPositive() {
        return this._value > 0n
    }

    isNegative() {
        return this._value < 0n
    }

    sign(): -1 | 0 | 1 {
        if (this._value === 0n) {
            return 0
        } else if (this._value < 0n) {
            return -1
        } else if (this._value > 0n) {
            return 1
        } else {
            throw new Error("unreacchable")
        }
    }

    gt(arg: BigNumLike) {
        const other = BigNum.from(arg)

        if (this._scale === other._scale) return this._value > other._value

        if (this._scale > other._scale) {
            return this._value > other.toScale(this._scale)._value
        } else return this.toScale(other._scale)._value > other._value
    }

    lt(arg: BigNumLike) {
        const other = BigNum.from(arg)

        if (this._scale === other._scale) return this._value < other._value

        if (this._scale > other._scale) {
            return this._value < other.toScale(this._scale)._value
        } else return this.toScale(other._scale)._value < other._value
    }

    eq(arg: BigNumLike) {
        const other = BigNum.from(arg)
        return this._value === other._value && this._scale === other._scale
    }

    lte(arg: BigNumLike) {
        return !this.gt(arg)
    }

    gte(arg: BigNumLike) {
        return !this.lt(arg)
    }

    add(arg: BigNumLike) {
        const other = BigNum.from(arg)
        if (this._scale === other._scale) {
            return new BigNum(this._value + other._value, this._scale).norm()
        }

        const smallest = this._scale < other._scale ? this._value : other._value
        const largest = this._scale < other._scale ? other._value : this._value

        const maxScale = this._scale > other._scale ? this._scale : other._scale
        const minScale = this._scale > other._scale ? other._scale : this._scale

        const increase = maxScale - minScale
        const value = largest + smallest * 10n ** increase
        return new BigNum(value, maxScale).norm()
    }

    neg() {
        return new BigNum(-this._value, this._scale)
    }

    abs() {
        return this._value < 0n
            ? this.neg()
            : new BigNum(this._value, this._scale)
    }

    sub(arg: BigNumLike) {
        return this.add(BigNum.from(arg).neg())
    }

    mul(arg: BigNumLike) {
        const other = BigNum.from(arg)
        return new BigNum(
            this._value * other._value,
            this._scale + other._scale,
        ).norm()
    }

    shift(n: number | bigint) {
        if (n < 0) {
            return new BigNum(this._value, this._scale - BigInt(n)).norm()
        }
        if (n === 0) return new BigNum(this._value, this._scale)
        return new BigNum(this._value * 10n ** BigInt(n), this._scale).norm()
    }

    floor(n: number | bigint) {
        return this.shift(n).divFloor("1").shift(-n)
    }

    divFloor(arg: BigNumLike) {
        const other = BigNum.from(arg)
        const value = this._value * 10n ** other._scale
        const div = value / other._value / 10n ** this._scale
        return new BigNum(div, BigInt(0))
    }

    divCeil(arg: BigNumLike) {
        const d = this.divFloor(arg)
        const r = this.sub(d.mul(arg))
        if (r.isZero()) return d
        return d.add("1")
    }

    isRound(arg: BigNumLike) {
        const d = this.divFloor(arg)
        return this.eq(d.mul(arg))
    }

    precision() {
        let prec = 0n
        let rem = this._value

        while (rem !== 0n) {
            prec += 1n
            rem /= 10n
        }

        return prec
    }

    toString() {
        if (this._repr) return this._repr

        const abs = this._value < 0n ? -this._value : this._value
        const isNegative = this._value < 0n

        if (this._scale === 0n) {
            const str = this._value.toString()
            this._repr = str
            return str
        }

        let str = abs.toString()
        const point = str.length - Number(this._scale)
        if (point === str.length) str = (isNegative ? "-" : "") + str
        else {
            str = (isNegative ? "-" : "") +
                (point <= 0 ? "0" : "") +
                str.slice(0, Math.max(0, point)) +
                "." +
                "0".repeat(Math.max(0, -point)) +
                str.slice(Math.max(0, point))
        }

        this._repr = str
        return str
    }

    toFormattedString(scale: number, optsArg?: BigNumFormattingOptions) {
        const opts: DerivedNumFormattingOptions = {
            groupDelimiter: optsArg?.groupDelimiter ?? "",
            decimalDelimeter: optsArg?.decimalDelimeter ?? ".",
        }

        if (opts.groupDelimiter === opts.decimalDelimeter) {
            throw new Error(
                `group delimiter "${opts.groupDelimiter}" can not equal to decimal delimiter "${opts.decimalDelimeter}"`,
            )
        }

        if (
            "-0123456789".includes(opts.decimalDelimeter) ||
            opts.decimalDelimeter === ""
        ) {
            throw new Error(
                `decimal delimiter "${opts.decimalDelimeter}" is invalid, use non-empty and non-digit value`,
            )
        }

        const result = formatNumberStringWithDelimiter(this.toString(), opts)
        scale = Math.max(scale, 0)
        const point = result.indexOf(opts.decimalDelimeter)

        if (point !== -1) {
            const resultScale = result.length - point - 1

            if (resultScale === scale) {
                return result
            }

            if (resultScale > scale) {
                let sliced = result.slice(
                    0,
                    result.length - resultScale + scale,
                )
                if (sliced[sliced.length - 1] === ".") {
                    sliced = sliced.slice(0, sliced.length - 1)
                }

                return sliced
            }
            return result + "0".repeat(scale - resultScale)
        }

        return result +
            (scale > 0 ? opts.decimalDelimeter + "0".repeat(scale) : "")
    }

    toNumber() {
        if (this._num !== null) return this._num

        // this._num = Number(this._value) / Math.pow(10, Number(this._scale))
        this._num = Number(this.toString())
        return this._num
    }

    toJSON() {
        return this.toString()
    }

    private norm() {
        while (this._value % 10n === 0n && this._scale > 0n) {
            this._value /= 10n
            this._scale -= 1n
        }
        return this
    }

    private toScale(arg: number | string | bigint) {
        const scale = BigInt(arg)
        if (scale < this._scale) throw new Error("cannot downscale")
        if (scale === this._scale) return new BigNum(this._value, this._scale)
        return new BigNum(this._value * 10n ** (scale - this._scale), scale)
    }
}

function formatNumberStringWithDelimiter(
    num: string,
    opts: DerivedNumFormattingOptions,
) {
    const split = num.split(".")
    const before = split[0].replace(
        /(\d)(?=(\d\d\d)+([^\d]|$))/g,
        `$1${opts.groupDelimiter}`,
    )
    const after = split[1] || ""

    return after.length > 0
        ? `${before ?? "0"}${opts.decimalDelimeter}${after}`
        : before
}

export function formatNumberToScaleThreshold(
    num: number,
    scale: number,
    addPadding: boolean = false,
) {
    const threshold = 10 ** scale
    const prec = Math.max(0, -scale)

    if (num === 0) {
        return `${addPadding ? " " : ""}${num.toFixed(prec)}`
    }

    if (num < threshold) {
        return `<${threshold.toFixed(prec)}`
    }

    return `${addPadding ? " " : ""}${num.toFixed(prec)}`
}

export type CalculateMax = {
    <A extends BigNum | number>(
        array: (A | null | undefined)[],
    ): [A | null, undefined]
    <A, B extends BigNum | number>(
        array: (A | null | undefined)[],
        mapper: (value: A) => B | null,
    ): [B | null, A | null]
}

export const calculateMax: CalculateMax = <A, B extends BigNum | number>(
    array: (A | null | undefined)[],
    mapper?: (value: A) => B,
): [B | null, A | null] => {
    let max: B | null = null
    let maxValue: A | null = null
    for (const item of array) {
        if (item === null || item === undefined) {
            continue
        }

        const mapped = (mapper ? mapper(item) : item) as B | null
        if (mapped == null) {
            continue
        }

        if (max !== null) {
            if (typeof mapped === "number") {
                if (mapped > (max as number)) {
                    max = mapped
                    maxValue = item
                }
            } else {
                if (BigNum.cmp(mapped, max as BigNum) > 0) {
                    max = mapped
                    maxValue = item
                }
            }
        } else {
            max = mapped
            maxValue = item
        }
    }

    return [max, maxValue]
}

export type CalculateMin = CalculateMax

export const calculateMin: CalculateMin = <A, B extends BigNum | number>(
    array: (A | null | undefined)[],
    mapper?: (value: A) => B,
): [B | null, A | null] => {
    const [value, item] = calculateMax<A, B>(array, (value) => {
        const mapped = (mapper ? mapper(value) : value) as B | null
        if (mapped == null) {
            return null
        }

        return (typeof mapped === "number" ? -mapped : mapped.neg()) as B
    })

    if (value === null) {
        return [null, null]
    }

    if (value instanceof BigNum) {
        return [value.neg() as B, item]
    }

    return [-value as B, item]
}

export type WithBigNumSerialized<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends BigNum ? { bn: string }
        : T[K] extends BigNum | null ? { bn: string } | null
        : T[K] extends BigNum | undefined ? { bn: string } | undefined
        : T[K] extends BigNum | null | undefined
            ? { bn: string } | null | undefined
        : T[K]
}

export function autoSerializeWithBigNum<T extends Record<string, any>>(
    obj: T,
): WithBigNumSerialized<T> {
    const result: Record<string, any> = {}
    for (const key in obj) {
        const value = obj[key]
        if (
            value && typeof value === "object" &&
            (value as object) instanceof BigNum
        ) {
            result[key] = { bn: value.toString() }
        } else {
            result[key] = value
        }
    }

    return result as WithBigNumSerialized<T>
}

export function autoDeserializeWithBigNum<T extends Record<string, any>>(
    obj: WithBigNumSerialized<T>,
): T {
    const result: Record<string, any> = {}
    for (const key in obj) {
        const value = obj[key]
        if (value && typeof value === "object" && "bn" in value) {
            result[key] = BigNum.from(value.bn as string)
        } else {
            result[key] = value
        }
    }

    return result as T
}

export function approxEqual(a: number, b: number, e: number = 1e-7) {
    return Math.abs(a - b) < Math.max(e, (e * (a + b)) / 2)
}
