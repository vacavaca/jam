import clsx from "clsx"
import { ChangeEvent, HTMLProps, useCallback } from "react"

type Props = {
    onChangeFile?: (file: File | null) => unknown
} & Omit<HTMLProps<HTMLInputElement>, "type">

export function FileInput({ onChangeFile, ...rest }: Props) {
    const onChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (onChangeFile) {
                onChangeFile(e.target.files ? (e.target.files[0] ?? null) : null)
            }
        },
        [onChangeFile]
    )
    return (
        <input
            onChange={onChange}
            className={clsx(
                "file:outline-none block mb-6 file:border-none file:bg-indigo-100 file:p-5 file:px-4 file:rounded-3xl file:cursor-pointer text-indigo-900 text-opacity-50 focus-within:text-opacity-100 bg-indigo-50 file:mr-4 w-full rounded-3xl file:hover:bg-indigo-200 file:transition-colors",
                rest.className
            )}
            type="file"
            {...rest}
        />
    )
}
