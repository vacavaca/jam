import { Emitter, type ReadonlyEmitter } from "./event.ts"
import { Context } from "./async/context.ts"

export type Subscribable = {
    subscribe: () => void
    unsubscribe: () => void
}

export type SubscribableWrapper = {
    readonly sub: Subscribable
}

export type SubscriptionHandlerWrapper = {
    readonly sub: SubscriptionHandler
}

export class SubscriptionHandler implements Subscribable {
    private unsubscribeTimer: ReturnType<typeof setTimeout> | null = null
    private _isSubscribed = false
    private _clients: number = 0
    private _context: Context

    private _events = {
        subscribe: new Emitter<[]>(),
        unsubscribe: new Emitter<[]>(),
    }

    constructor() {
        this._context = new Context()
        this.events.unsubscribe.on(this._context.cancel)
    }

    get clients() {
        return this._clients
    }

    get isSubscribed() {
        return this._isSubscribed
    }

    get events(): {
        subscribe: ReadonlyEmitter<[]>
        unsubscribe: ReadonlyEmitter<[]>
    } {
        return this._events
    }

    get context() {
        return this._context
    }

    static any(...subs: (SubscriptionHandler | SubscriptionHandlerWrapper)[]) {
        const one = new SubscriptionHandler()

        for (const obj of subs) {
            const sub = obj instanceof SubscriptionHandler ? obj : obj.sub
            sub.events.subscribe.on(one.subscribe)
            sub.events.unsubscribe.on(one.unsubscribe)
        }

        return one
    }

    handle(onSubscribe: () => void, onUnsubscribe?: () => void) {
        this.events.subscribe.on(onSubscribe)
        if (onUnsubscribe) {
            this.events.unsubscribe.on(onUnsubscribe)
        }
        return this
    }

    proxy(
        ...others: (SubscribableWrapper | Subscribable | null | undefined)[]
    ): this {
        others.forEach(this.proxyOne)
        return this
    }

    unproxy(
        ...others: (SubscribableWrapper | Subscribable | null | undefined)[]
    ): this {
        others.forEach(this.unproxyOne)
        return this
    }

    subscribe = () => {
        this._clients += 1

        if (this.unsubscribeTimer != null) {
            clearTimeout(this.unsubscribeTimer)
            this.unsubscribeTimer = null
        }

        if (this._isSubscribed) {
            return
        }

        this._isSubscribed = true
        this._events.subscribe.emit()
    }

    unsubscribe = (timeout?: number) => {
        this._clients -= 1
        if (this._clients < 0) {
            throw new Error("more clients unsubscribed than subscribed")
        }

        if (this.unsubscribeTimer != null) {
            clearTimeout(this.unsubscribeTimer)
        }

        if (timeout === 0 || timeout == null) {
            return this.deferredUnsubscribe()
        }

        this.unsubscribeTimer = setTimeout(this.deferredUnsubscribe, timeout)
    }

    run<T, A extends any[]>(
        fn: (ctx: Context, ...args: A) => Promise<T>,
        ...args: A
    ) {
        if (!this.isSubscribed) {
            throw new Error("not subscribed ")
        }

        const ctx = new Context()
        this.events.unsubscribe.on(ctx.cancel)

        ctx.run(fn, ...args)
    }

    private proxyOne = (other?: SubscribableWrapper | Subscribable | null) => {
        if (!other) {
            return
        }

        if ("sub" in other && isSubscribable(other.sub)) {
            this.proxyOne(other.sub)
            return
        }

        const sub = other as SubscriptionHandler

        this.events.subscribe.on(sub.subscribe)
        this.events.unsubscribe.on(sub.unsubscribe)

        if (this.isSubscribed) {
            sub.subscribe()
        }
    }

    private unproxyOne = (
        other?: SubscribableWrapper | Subscribable | null,
    ) => {
        if (!other) {
            return
        }

        if ("sub" in other && isSubscribable(other.sub)) {
            this.unproxyOne(other.sub)
            return
        }

        const sub = other as SubscriptionHandler

        this.events.subscribe.off(sub.subscribe)
        this.events.unsubscribe.off(sub.unsubscribe)

        if (this.isSubscribed) {
            sub.unsubscribe()
        }
    }

    private deferredUnsubscribe = () => {
        if (this._clients > 0) {
            return
        }

        this._isSubscribed = false
        this.unsubscribeTimer = null
        this._events.unsubscribe.emit()
    }
}

function isSubscribable(v: object) {
    return (
        v &&
        "subscribe" in v &&
        v.subscribe instanceof Function &&
        "unsubscribe" in v &&
        v.unsubscribe instanceof Function
    )
}
