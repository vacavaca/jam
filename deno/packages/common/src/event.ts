export type Handler<T extends any[]> = (...v: T) => void

export const once = <A extends any[], R>(fn: (...args: A) => R | void) => {
    let fired = false
    return (...args: A): R | void => {
        if (!fired) {
            fired = true
            return fn(...args)
        }
    }
}

export type ReadonlyEmitter<T extends any[]> = {
    readonly last: T | null

    readonly isFired: boolean

    readonly hasValue: boolean

    on(listener: Handler<T>): () => void

    off(listener: Handler<T>): void

    once(listener: Handler<T>): () => void
}

export type AsReadonlyEmitter<V extends Emitter<any>> =
    V extends Emitter<infer T> ? ReadonlyEmitter<T> : never

export type EmitterMap = Record<string, Emitter<any>>

export type AsReadonlyEmitterMap<T extends EmitterMap> = {
    [K in keyof T]: AsReadonlyEmitter<T[K]>
}

type HandlerWithMetadata<T extends any[]> = {
    listener: Handler<T>
    isOnce: boolean
    isFired: boolean
    unsubscribe: () => void
}

export class Emitter<T extends any[]> implements ReadonlyEmitter<T> {
    private listeners: HandlerWithMetadata<T>[] = []
    private currentListener: HandlerWithMetadata<T> | null = null

    private _last: T | null = null

    private _isFired = false
    private _hasValue = false

    get last() {
        return this._last
    }

    get isFired() {
        return this._isFired
    }

    get hasValue() {
        return this._hasValue
    }

    on = (listener: Handler<T>): (() => void) => {
        return this.onInternal(listener, false)
    }

    off = (listener: Handler<T>): void => {
        if (this.currentListener && this.currentListener.listener !== listener) {
            console.trace("disabling listener when event is firing, it might be already fired")
        }

        this.offInternal(listener)
    }

    once = (listener: Handler<T>): (() => void) => {
        return this.onInternal(listener, true)
        /*
        const onceListener = once(listener)
        let isProcessed = false
        const unsub = this.on((...args: T) => {
            if (isProcessed) {
                return
            }
            isProcessed = true
            onceListener(...args)
            setTimeout(unsub, 0)
        })

        return unsub
        */
    }

    setValue = (...event: T): void => {
        this._last = event
        this._hasValue = true
    }

    clear = () => {
        this._last = null
        this._hasValue = false
    }

    emit = (...event: T): void => {
        this._isFired = true
        this.setValue(...event)

        const listeners = this.listeners.slice()
        for (const listener of listeners) {
            if (listener.isOnce && listener.isFired) {
                continue
            }

            this.currentListener = listener
            try {
                listener.isFired = true
                if (listener.isOnce) {
                    this.offInternal(listener.listener)
                }

                listener.listener(...event)
            } catch (error) {
                throw error
            } finally {
                this.currentListener = null
            }
        }
    }

    private onInternal(listener: Handler<T>, isOnce: boolean) {
        const unsubscribe = once(() => this.off(listener))
        this.listeners.push({ listener, isOnce, isFired: false, unsubscribe })
        return unsubscribe
    }

    private offInternal(listener: Handler<T>) {
        const ndx = this.listeners.findIndex((l) => l.listener === listener)
        if (ndx === -1) {
            return
        }

        this.listeners.splice(ndx, 1)
    }
}

export class EventTrigger<T extends any[]> {
    private input: ReadonlyEmitter<T>
    private trigger: ReadonlyEmitter<any[]>
    private _event = new Emitter<T>()

    constructor(input: ReadonlyEmitter<T>, trigger: ReadonlyEmitter<any[]>) {
        this.input = input
        this.trigger = trigger
    }

    get event(): ReadonlyEmitter<T> {
        return this._event
    }

    run = () => {
        this.trigger.on(this.flush)
        this.flush()
    }

    stop = () => {
        this.trigger.off(this.flush)
    }

    private flush = () => {
        if (this.input.hasValue) {
            this._event.emit(...this.input.last!)
        }
    }
}

export type SumEventsFn<T, S> = (prev: S | null, next: T) => S

export class EventAggregator<T extends any[], S extends any[]> {
    private input: Emitter<T>
    private buffer: EventBuffer<T, S>

    readonly event = new Emitter<S>()

    constructor(input: Emitter<T>, sum: SumEventsFn<T, S>) {
        this.input = input
        this.buffer = new EventBuffer(sum)
    }

    connect = () => {
        if (this.input.hasValue) {
            this.aggregate(false, this.input.last!)
        }

        this.input.on(this.handle)
    }

    close = () => {
        this.input.off(this.handle)
        this.buffer.pop()
    }

    private handle = (...v: T) => {
        this.aggregate(true, v)
    }

    private aggregate(isEmit: boolean, v: T) {
        const buffered = this.buffer.push(v)
        if (isEmit) {
            this.event.emit(...buffered)
        } else {
            this.event.setValue(...buffered)
        }
    }
}

type EmptyBufferState = {
    isBuffered: false
    buffer: null
}

type FilledBufferState<T> = {
    isBuffered: true
    buffer: T
}

type BufferState<T> = EmptyBufferState | FilledBufferState<T>

class EventBuffer<T, S> {
    private sum: SumEventsFn<T, S>

    private state: BufferState<S> = {
        isBuffered: false,
        buffer: null,
    }

    constructor(sum: SumEventsFn<T, S>) {
        this.sum = sum
    }

    push(v: T) {
        if (this.state.isBuffered) {
            this.state.buffer = this.sum(this.state.buffer, v)
        } else {
            this.state = { isBuffered: true, buffer: this.sum(null, v) }
        }

        return this.state.buffer
    }

    pop() {
        if (!this.state.isBuffered) {
            return null
        }

        const buff = this.state.buffer
        this.state = { isBuffered: false, buffer: null }
        return buff
    }
}

