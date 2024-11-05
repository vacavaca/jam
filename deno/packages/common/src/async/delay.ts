import type { Context } from "./context.ts"

export const delay = (timeout: number) =>
    new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve()
        }, timeout)
    })

export const delayWithContext = (ctx: Context, timeout: number) =>
    new Promise<boolean>((resolve) => {
        let isReolved = false

        // deno-lint-ignore prefer-const
        let timer!: ReturnType<typeof setTimeout>

        function onCancel() {
            clearTimeout(timer)
            setResolve()
        }

        function setResolve() {
            if (isReolved) {
                return
            }

            ctx.events.cancel.off(onCancel)
            isReolved = true
            resolve(!ctx.isCanceled)
        }

        timer = setTimeout(setResolve, timeout)
        ctx.events.cancel.on(onCancel)
    })
