
export function shortenName(name: string) {
    if (name === '') {
        return name
    }

    const parts = name.split(' ')
    if (parts.length === 1) {
        return name   
    }

    return `${capitalize(parts[0])} ${capitalize(parts.at(-1)!.slice(0, 1))}.`
}

export function capitalize(str: string) {
    if (str === '') {
        return str
    }

    return str[0].toUpperCase() + str.slice(1)
}

