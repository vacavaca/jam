import clsx from "clsx"
import { HTMLProps } from "react"
import { ErrorAPIResponse } from "../api/request"

type Props = {
    error: any
} & HTMLProps<HTMLDivElement>

export function ErrorMessage({ error, ...rest }: Props) {
    if (!error) {
        return null
    }

    console.log(error)

    return (
        <div className={clsx("text-red-500 my-2", rest.className)}>
            {!!error && error instanceof ErrorAPIResponse && error.apiMessage
                ? error.apiMessage
                : "An error occurred, please try again"}
        </div>
    )
}
