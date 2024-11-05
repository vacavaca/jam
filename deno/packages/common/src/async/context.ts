import { type AsReadonlyEmitterMap, Emitter } from "../event.ts"
import { Future } from "./future.ts"

export class CanceledError extends Error {
    constructor() {
        super("canceled")
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CanceledError)
        }
    }
}

export class Context {
    readonly _events = {
        cancel: new Emitter<[]>(),
        dispose: new Emitter<[]>(),
    }

    private _isDisposed = false
    private _isCanceled = false

    constructor() {}

    checkCanceled() {
        if (this.isCanceled) {
            throw new CanceledError()
        }
    }

    get isCanceled() {
        return this._isCanceled
    }

    get isDisposed() {
        return this._isDisposed || this._isCanceled
    }

    get events(): AsReadonlyEmitterMap<Context["_events"]> {
        return this._events
    }

    wait<T>(promise: Promise<T>): Promise<T> {
        if (this.isCanceled) {
            return Promise.reject(new CanceledError())
        }

        const future = new Future<T>()

        const unsub = this._events.cancel.on(() => future.reject(new CanceledError()))
        promise
            .then((v) => {
                if (this.isCanceled) {
                    return
                }
                unsub()
                future.resolve(v)
            })
            .catch((err) => {
                if (this.isCanceled) {
                    return
                }
                unsub()
                future.reject(err)
            })

        return future.promise
    }

    run<A extends any[]>(fn: (ctx: Context, ...args: A) => Promise<any>, ...args: A) {
        ;(async () => {
            try {
                await fn(this, ...args)
            } catch (e: any) {
                if (e instanceof CanceledError) {
                    return
                }

                throw e
            }
        })()
    }

    cancel = () => {
        if (this.isCanceled) return
        this._isCanceled = true

        this._events.cancel.emit()
    }

    child() {
        if (this.isCanceled) {
            throw new Error("context is already canceled")
        }

        const child = new Context()
        const unsub = this.events.cancel.on(child.cancel)

        const disposalError = new Error("child context is never disposed")
        const timer = setTimeout(
            () => {
                console.warn(disposalError)
            },
            3 * 60 * 1e3
        )

        function dispose() {
            // to not trigger the current listener disabling warning, that is ok here
            setTimeout(unsub, 0)
            clearTimeout(timer)
        }

        // cancel from the parent and from the child
        child.events.cancel.on(dispose)

        child.events.dispose.on(dispose)

        return child
    }

    dispose() {
        if (this.isDisposed) {
            return
        }

        this._isDisposed = true
        this._events.dispose.emit()
    }
}

