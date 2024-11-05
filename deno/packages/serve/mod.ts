// @deno-types="npm:@types/express"
import express, {
    type NextFunction,
    type Request,
    RequestHandler,
    type Response,
    type Router,
} from "express"
import type { Logger, LogLevel } from "@jam/common/log"
import helmet from "helmet"
import bodyParser from "body-parser"
import type { z, ZodObject, ZodRawShape } from "zod"
import { ZodError } from "zod"
import { fromZodError } from "zod-validation-error"
import { parse } from "node:url"
import secureJsonParse from "secure-json-parse"

export function asyncRoute(
    handler: (req: Request, res: Response) => Promise<void>,
) {
    return (req: Request, res: Response, next: NextFunction) => {
        ;(async () => {
            try {
                await handler(req, res)
            } catch (error) {
                next(error)
            }
        })()
    }
}

export type PreparedRequest = Request & {
    originalQuery: string
    originalBody: string
}

export type Route = {
    (
        handler: (req: PreparedRequest, res: Response) => Promise<void> | void,
    ): (req: Request, res: Response, next: NextFunction) => void
    (): RouteBuilder<any, any>
}

export const route: Route = ((
    handler?: (
        req: ValidatedRequest<any, any>,
        res: Response,
    ) => Promise<void> | void,
) => {
    if (handler) return new RouteBuilder<any, any>().handle(handler)

    return new RouteBuilder<any, any>()
}) as Route

export class ErrorResponse extends Error {
    readonly code: string

    constructor(msg: string, code: string) {
        super(msg)
        this.code = code

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ErrorResponse)
        }
    }
}

export class ErrorInvalidRequest extends ErrorResponse {
    static CODE = "invalid_request"

    constructor(msg: string) {
        super(msg, ErrorInvalidRequest.CODE)

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ErrorInvalidRequest)
        }
    }
}

export class ErrorUnauthorizedRequest extends ErrorResponse {
    static CODE = "unauthorized_request"

    constructor() {
        super("request is unauthorized", ErrorUnauthorizedRequest.CODE)

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ErrorUnauthorizedRequest)
        }
    }
}

export type ValidatedRequest<
    Q extends ZodRawShape = any,
    B extends ZodRawShape = any,
> =
    & Omit<
        PreparedRequest,
        "body" | "query"
    >
    & { query: z.infer<ZodObject<Q>>; body: z.infer<ZodObject<B>> }

export class RouteBuilder<
    Q extends ZodRawShape = any,
    B extends ZodRawShape = any,
> {
    private queryShape: ZodObject<any> | null = null
    private bodyShape: ZodObject<any> | null = null

    query<QN extends ZodRawShape>(
        obj: ReturnType<typeof z.object<QN>>,
    ): RouteBuilder<QN, B> {
        if (this.queryShape != null) {
            throw new Error("query is already validated")
        }
        this.queryShape = obj
        return this as unknown as RouteBuilder<QN, B>
    }

    body<BN extends ZodRawShape>(
        obj: ReturnType<typeof z.object<BN>>,
    ): RouteBuilder<Q, BN> {
        if (this.bodyShape != null) throw new Error("body is already validated")
        this.bodyShape = obj
        return this as unknown as RouteBuilder<Q, BN>
    }

    handle(
        handler: (
            req: ValidatedRequest<Q, B>,
            res: Response,
        ) => Promise<void> | void,
    ) {
        return (req: Request, res: Response, next: NextFunction) => {
            ;(async () => {
                try {
                    this.log(res, "debug", "incoming request")

                    if (this.queryShape !== null) {
                        req.query = this.parse(
                            this.queryShape,
                            req.query,
                            "query",
                        )
                    }

                    if (this.bodyShape !== null) {
                        req.body = this.parse(this.bodyShape, req.body, "body")
                    }

                    const promise = handler(req as ValidatedRequest<Q, B>, res)
                    if (!promise) return
                    await promise
                } catch (error) {
                    next(error)
                }
            })()
        }
    }

    private parse<A extends ZodRawShape>(
        z: ZodObject<A>,
        params: any,
        key: "query" | "body",
    ) {
        try {
            return z.parse(params)
        } catch (error: any) {
            if (
                !(error instanceof ZodError) &&
                error.constructor.name !== "ZodError"
            ) {
                throw error
            }

            const validationError = fromZodError(error, {
                prefix: `${key} validation error`,
            })

            throw new ErrorInvalidRequest(validationError.message)
        }
    }

    private log(
        res: Response,
        level: LogLevel,
        msg: string,
        obj: Record<string, any> = {},
    ) {
        if (!("logger" in res.locals)) return

        const logger = res.locals.logger as Logger
        logger.log(level, msg, obj)
    }
}

export function serve(logger: Logger, router: Router) {
    const app = express()
        .use(helmet())
        .use(
            bodyParser.text({
                type: ["application/json", "application/x-www-form-urlencoded"],
            }),
        )
        .use((req, _, next) => {
            const contentType = req.headers["content-type"]
            const info: Record<string, string> = {
                method: req.method,
                url: req.url,
            }
            if (contentType) {
                info.contentType = contentType
            }
            logger.debug("incomming request", info)

            let body: Record<string, any> = {}
            let isBodyParsed = false
            if (contentType?.includes("application/json")) {
                body = secureJsonParse(req.body)
                isBodyParsed = true
            } else if (
                contentType?.includes("application/x-www-form-urlencoded")
            ) {
                const params = new URLSearchParams(req.body).entries()
                for (const [key, value] of params) {
                    body[key] = value
                }
                isBodyParsed = true
            }

            const prepared = req as PreparedRequest

            prepared.originalQuery = parse(req.url).query ?? ""
            prepared.originalBody = isBodyParsed ? req.body : ""

            req.body = body

            next()
        })
        .use((req: Request, res: Response, next: NextFunction) => {
            res.locals.logger = res.app.locals.logger.child({
                method: req.method,
                url: req.url,
            })
            next()
        })
        .use(router)
        .use((error: any, _: any, res: any, _2: any) => {
            if (
                error instanceof SyntaxError && "status" in error &&
                (error as { status: number }).status === 400
            ) {
                res.locals.logger.debug(
                    "malformed JSON in the request body",
                    error,
                )

                let msg = "malformed JSON in the request body"
                if ("body" in error) {
                    msg += `, received "${(error as { body: string }).body}"`
                }

                return res.status(400).end(msg)
            }

            if (error instanceof ErrorUnauthorizedRequest) {
                logger.log("debug", error)
                return res.status(401).json({
                    message: error.message,
                    code: error.code,
                })
            }

            if (error instanceof ErrorResponse) {
                logger.log("debug", error)
                return res.status(400).json({
                    message: error.message,
                    code: error.code,
                })
            }

            logger.error(error as any)
            res.status(500).end("internal error")
        })

    app.locals.logger = logger
    return app
}

export type CORSOptions = {
    isAllowLocalhost: boolean
    isAllowCredentials: boolean
    isUnknownOriginsAllowed: boolean
    allowedOrigins: string[]
    allowedHeaders: string[]
    allowedMethods: string[]
}

const defaultCORSOptions: Omit<CORSOptions, "allowedOrigins"> = {
    isAllowLocalhost: true,
    isAllowCredentials: true,
    isUnknownOriginsAllowed: false,
    allowedHeaders: [
        "Content-Type",
        "Cookie",
        "X-CSRF-Token",
        "baggage",
        "sentry-trace",
    ],
    allowedMethods: ["GET", "POST", "PUT", "DELETE"],
}

export function withCORS(
    opts: { allowedOrigins: string[] } & Partial<CORSOptions>,
): RequestHandler {
    const allOpts: CORSOptions = { ...defaultCORSOptions, ...opts }

    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.headers.origin) {
            if (!allOpts.isUnknownOriginsAllowed) {
                res.status(403).end("Forbidden")
                return
            }

            next()
            return
        }

        let originURL: URL | null = null
        try {
            originURL = new URL(req.headers.origin)
        } catch (_) {
            // ignore
        }

        let resolvedAllowedOrigin = null
        const isOriginLocalhost =
            /^(https?:\/\/)?((127.0.0.1)|(localhost))(:\d+)?/.test(
                originURL?.hostname ?? "",
            )

        if (opts.isAllowLocalhost && isOriginLocalhost) {
            resolvedAllowedOrigin = originURL!.origin
        } else if (opts.allowedOrigins.includes(originURL!.origin)) {
            resolvedAllowedOrigin = originURL!.origin
        }

        if (!resolvedAllowedOrigin) {
            if (!allOpts.isUnknownOriginsAllowed) {
                res.status(403).end("Forbidden")
                return
            }

            next()
            return
        }

        res.setHeader("Access-Control-Allow-Origin", resolvedAllowedOrigin)
        res.setHeader(
            "Access-Control-Allow-Methods",
            allOpts.allowedMethods.join(", "),
        )
        res.setHeader(
            "Access-Control-Allow-Headers",
            allOpts.allowedHeaders.join(", "),
        )
        if (allOpts.isAllowCredentials) {
            res.setHeader("Access-Control-Allow-Credentials", "true")
        }

        if (req.method.toLowerCase() === "options") {
            res.status(204).end()
            return
        }

        next()
    }
}
