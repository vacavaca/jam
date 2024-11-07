type NumFormattingOptions = {
    decimalDelimeter?: string
    groupDelimiter?: string
}

export function formatNumberStringWithDelimiter(num: string, opts?: NumFormattingOptions) {
    const split = num.split(".")
    const before = split[0].replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1${opts?.groupDelimiter ?? ','}`)
    const after = split[1] || ""

    return after.length > 0 ? `${before ?? "0"}${opts?.decimalDelimeter ?? '.'}${after}` : before
}


