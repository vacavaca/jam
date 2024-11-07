import { formatNumberStringWithDelimiter } from "@/common/num"
export type Props = {
    currency?: string
    amount: string | number
}

export function Salary({ currency, amount }: Props) {
    return (
        <>
            <p className="text-xl font-bold text-indigo-500 whitespace-nowrap my-0">
                {formatNumberStringWithDelimiter(`${amount}`)}{" "}
                <span className="opacity-50 text-normal uppercase">
                    {currency ? currency.at(0) : ""}
                </span>
            </p>
        </>
    )
}
