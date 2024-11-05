import { Emitter } from "../event.ts"
import { CanceledError } from "./context.ts"
import { Context } from "./context.ts"
import { Future } from "./future.ts"

type Task = (ctx: Context) => Promise<unknown>

export class Queue {
    private ctx?: Context
    private concurrency: number
    private tasks: Task[] = []
    private promises: (Promise<void> | null)[]
    private isProcessing = false
    private events = {
        done: new Emitter(),
    }

    constructor(concurrency: number, ctx?: Context) {
        if (concurrency < 0) {
            throw new Error(`concurrency must not be negative`)
        }

        this.ctx = ctx
        this.concurrency = concurrency
        this.promises = new Array(concurrency).fill(null)
    }

    push(task: Task) {
        this.tasks.push(task)
        this.startProcessingTask()
    }

    async wait() {
        if (this.concurrency > 0) {
            await Promise.all(this.promises.filter((p) => p != null))
        } else if (this.isProcessing) {
            const future = new Future()
            this.events.done.once(future.resolve)
            await future.wait()
        }
    }

    private async process(index?: number) {
        if (this.ctx?.isCanceled || this.tasks.length === 0) {
            this.endProcessing(index)
            return
        }

        const ctx = this.ctx ?? new Context()
        while (this.tasks.length > 0 && !this.ctx?.isCanceled) {
            await this.runTask(ctx, this.tasks.splice(0, 1)[0]!)
        }

        this.endProcessing(index)
    }

    private startProcessingTask() {
        this.isProcessing = true

        if (this.concurrency > 0) {
            for (let i = 0; i < this.concurrency; i++) {
                if (this.promises[i] == null) {
                    this.promises[i] = this.process(i)
                }
            }
        } else {
            this.process()
        }
    }

    private endProcessing(index?: number) {
        if (index !== undefined) {
            this.promises[index] = null
        }

        this.isProcessing = false
        this.events.done.emit()
    }

    private async runTask(ctx: Context, task: Task) {
        try {
            await task(ctx)
        } catch (e) {
            if (e instanceof CanceledError) {
                return
            }

            throw e
        }
    }
}
