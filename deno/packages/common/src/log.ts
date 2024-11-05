import { Emitter } from "./event.ts"

function quoteMessage<T>(msg?: string | T): string | T | undefined {
    if (!msg || typeof msg !== "string") {
        return msg
    }

    return JSON.stringify(msg)
}

function flattenKeys(object: any, initialPathPrefix = ""): Record<string, any> {
    if (!object || typeof object !== "object") {
        return { [initialPathPrefix]: object }
    }

    if (
        object.toString &&
        object.toString instanceof Function &&
        object.toString !== Object.prototype.toString
    ) {
        return { [initialPathPrefix]: object.toString() }
    }

    const prefix = initialPathPrefix
        ? Array.isArray(object) ? initialPathPrefix : `${initialPathPrefix}.`
        : ""

    return Object.keys(object)
        .flatMap((key) =>
            flattenKeys(
                object[key],
                Array.isArray(object) ? `${prefix}[${key}]` : `${prefix}${key}`,
            )
        )
        .reduce((acc, path) => ({ ...acc, ...path }), {})
}

export type LogLevel = "debug" | "info" | "warning" | "error"

type LogLevelAlias = "warn"

const levels: LogLevel[] = ["debug", "info", "warning", "error"]

const aliases: Record<LogLevelAlias, LogLevel> = {
    warn: "warning",
}

function normLevel(level: string): LogLevel {
    level = level.toLowerCase()
    for (const alias in aliases) {
        if (alias === level) {
            level = aliases[alias as LogLevelAlias]
            break
        }
    }

    if (!levels.includes(level as LogLevel)) {
        throw new Error(`invalid log level "${level}"`)
    }
    return level as LogLevel
}

function cmpLevels(a: LogLevel, b: LogLevel): number {
    return levels.indexOf(a) - levels.indexOf(b)
}

class BaseLogger {
    readonly event = new Emitter<[LogLevel, [string] | [any] | [string, any]]>()
    private level: LogLevel
    private values: object

    constructor(level: string, values?: object) {
        this.level = normLevel(level)
        this.values = values ?? {}
    }

    child(obj: Record<string, any> | string): Logger {
        if (typeof obj === "string") {
            return this.child({ name: obj })
        }

        const logger = createRootLogger(this.level, { ...this.values, ...obj })
        logger.event.on(this.event.emit)
        return logger
    }

    log(level: LogLevel, ...args: [string] | [any] | [string, any]) {
        if (cmpLevels(level, this.level) < 0) return

        this.event.emit(level, args)

        let message: string | null = null
        let info: Record<string, any> = {}
        if (args.length === 1) {
            if (typeof args[0] === "string") {
                message = args[0]
            } else {
                info = args[0]
            }
        } else {
            ;[message, info] = args
        }

        let values: Record<string, any> = {}
        if (message) {
            values.message = message
        }

        if (info instanceof Error) {
            const infoWithoutErrorFields: Record<string, any> = {}

            for (let key in info) {
                if (!["message", "stack"].includes(key)) {
                    infoWithoutErrorFields[key] =
                        (info as Record<string, any>)[key]
                }
            }

            values = {
                ...values,
                type: info.constructor.name,
                message: `${values.message ? `${values.message}: ` : ""}` +
                    info.message,
                stack: info.stack,
            }
        } else {
            values = { ...values, ...flattenKeys(info) }
        }

        const timestamp = new Date().toISOString()
        const fullInfo = Object.assign(
            { timestamp, level },
            flattenKeys(this.values),
            values,
        )

        if (typeof Deno !== "undefined" && typeof Deno.stdout !== "undefined") {
            const encoder = new TextEncoder()
            const data = encoder.encode(this.formatLogfmt(fullInfo) + "\n")
            Deno.stdout.write(data)
        } else {
            console.log(this.formatLogfmt(fullInfo))
        }
    }

    private formatLogfmt(info: Record<string, any>) {
        const processed: { [key: string]: boolean } = {}
        const parts = []

        for (const key of ["timestamp"]) {
            if (!(key in info)) {
                continue
            }

            parts.push(`${key}=${quoteMessage(info[key])}`)
            processed[key] = true
        }

        if ("name" in this.values) {
            const name = (this.values as { name: string }).name
            parts.push(`name=${quoteMessage(name)}`)

            if (name === info["name"]) processed["name"] = true
        }

        for (const key of ["level", "message"]) {
            if (!(key in info)) {
                continue
            }

            parts.push(`${key}=${quoteMessage(info[key])}`)
            processed[key] = true
        }

        for (const key of Object.keys(info)) {
            if (key in processed) {
                continue
            }

            const str = formatObject(info[key])
            if (str.includes("\n")) continue

            parts.push(`${key}=${quoteMessage(str)}`)
            processed[key] = true
        }

        for (const key of Object.keys(info)) {
            if (key in processed) {
                continue
            }

            parts.push(`${key}=${quoteMessage(formatObject(info[key]))}`)
        }

        return parts.join(" ")
    }
}

function formatObject(obj: any) {
    if (obj instanceof Date) {
        return obj.toISOString()
    } else {
        return `${obj}`
    }
}

export type Logger =
    & BaseLogger
    & Record<
        LogLevel | LogLevelAlias,
        (...args: [string] | [object] | [string, object]) => void
    >

function createRootLogger(level: string, values?: object): Logger {
    const logger = new BaseLogger(level, values) as Partial<Logger>
    for (const level of levels) {
        logger[level] = (...args) => {
            logger.log!(level, ...args)
        }
    }

    for (const alias in aliases) {
        const level = aliases[alias as LogLevelAlias]
        logger[alias as LogLevelAlias] = (...args) => {
            logger.log!(level, ...args)
        }
    }

    return logger as Logger
}

export const root = createRootLogger(
    (typeof Deno !== "undefined" ? Deno.env.get("LOG_LEVEL") : undefined) ??
        "info",
)

export function createLogger(nameOrOptions: Record<string, any> | string) {
    return root.child(nameOrOptions)
}
