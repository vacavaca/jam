export class ErrorAPIResponse extends Error {
    readonly code: string | null
    readonly status: number
    readonly apiMessage: string | null

    constructor(status: number, msg: string, apiMsg: string | null, code: string | null) {
        super(`api error response [${status}]: ${msg}`)
        this.code = code
        this.status = status
        this.apiMessage = apiMsg

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ErrorAPIResponse)
        }
    }

    static fromText(status: number, msg: string) {
        return new ErrorAPIResponse(status, msg, null, null)
    }

    static fromResponse(status: number, data: any) {
        const msg = data && typeof data === "object" ? (data.msg ?? "") : ""
        const code = data && typeof data === "object" ? (data.code ?? null) : null

        return new ErrorAPIResponse(status, msg, msg, code)
    }
}

export async function request<T>(path: string, init?: RequestInit) {
    const url = new URL(path, import.meta.env.VITE_API_URL)

    const response = await fetch(url, init)
    const contentType = response.headers.get("content-type")
    const isJson = contentType?.startsWith("application/json")

    if (response.status !== 200) {
        if (isJson) {
            const data = await response.json()
            throw ErrorAPIResponse.fromResponse(response.status, data)
        }

        throw ErrorAPIResponse.fromText(response.status, await response.text())
    }

    if (!isJson) {
        throw ErrorAPIResponse.fromText(response.status, "expeted a json response")
    }

    const data: T = await response.json()

    return data
}
