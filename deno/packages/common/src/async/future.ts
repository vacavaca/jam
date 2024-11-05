export class Future<T> {
    private _isStarted = false
    private _isDone = false
    private _resolve!: (v: T) => void
    private _reject!: (e: any) => void

    readonly promise!: Promise<T>

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve
            this._reject = reject
        })
    }

    get isStarted() {
        return this._isStarted
    }

    get isDone() {
        return this._isDone
    }

    run(fn: () => Promise<T> | T) {
        if (this._isDone) {
            throw new Error("future is already done")
        }

        if (this._isStarted) {
            throw new Error("future is already started")
        }

        this._isStarted = true

        const start = async () => {
            try {
                const result = fn()
                if (result instanceof Promise) {
                    this.resolve(await result)
                } else {
                    this.resolve(result)
                }
            } catch (e) {
                this.reject(e)
            }
        }

        start()

        return this
    }

    resolveIfNotDone = (v: T) => {
        if (this._isDone) {
            return
        }

        this.resolve(v)
    }

    resolve = (v: T) => {
        if (this._isDone) {
            throw new Error("future is already done")
        }

        this._isDone = true
        this._resolve(v)
    }

    reject = (e: any) => {
        if (this._isDone) {
            throw new Error("future is already done")
        }

        this._isDone = true
        this._reject(e)
    }

    wait() {
        return this.promise
    }
}

