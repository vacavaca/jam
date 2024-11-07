import clsx from "clsx"
import { twMerge } from 'tailwind-merge'
import { HTMLProps, createElement } from "react"

type HeadingProps = {
    rank?: 1 | 2 | 3 | 4 | 5 | 6
} & HTMLProps<HTMLHeadingElement>

export function H1({ rank, ...props }: HeadingProps) {
    return createElement(
        `h${rank ?? 1}`,
        {
            ...props,
            className: twMerge(clsx("font-black text-3xl ", props.className)),
        },
        props.children
    )
}

export function H2({ rank, ...props }: HeadingProps) {
    return createElement(
        `h${rank ?? 2}`,
        {
            ...props,
            className: twMerge(clsx("font-bold text-2xl ", props.className)),
        },
        props.children
    )
}

export function H3({ rank, ...props }: HeadingProps) {
    return createElement(
        `h${rank ?? 3}`,
        {
            ...props,
            className: twMerge(clsx("font-bold text-xl ", props.className)),
        },
        props.children
    )
}

export function H4({ rank, ...props }: HeadingProps) {
    return createElement(
        `h${rank ?? 4}`,
        {
            ...props,
            className: twMerge(clsx("font-bold text-lg ", props.className)),
        },
        props.children
    )
}

export function H5({ rank, ...props }: HeadingProps) {
    return createElement(
        `h${rank ?? 5}`,
        {
            ...props,
            className: twMerge(clsx("font-bold text-lg ", props.className)),
        },
        props.children
    )
}
