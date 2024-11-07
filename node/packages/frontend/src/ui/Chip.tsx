import clsx from "clsx"
import { ComponentType, PropsWithChildren } from "react"

type Props = {
    icon?: ComponentType<{ className?: string }>
    color?: 'primary' | 'white'
} & PropsWithChildren

export function Chip({ icon: Icon, children, color }: Props) {
    return (
        <div className={clsx("bg-indigo-50 inline-block text-indigo-500 rounded-2xl p-2 px-3", {
            'bg-indigo-50': color === 'primary',
            'bg-white': color === 'white',
        })}>
            {Icon && <Icon className="w-5 h-5 inline mr-1 relative -top-0.5" />}
            {children}
        </div>
    )
}
