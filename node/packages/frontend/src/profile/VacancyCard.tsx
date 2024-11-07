import { H3 } from "../ui/heading"
import clsx from "clsx"
import { Button } from "../ui/Button"
import { MouseEventHandler, useCallback, useRef } from "react"
import { Link } from "../router/Link"

type Props = {
    id: number
    companyName: string
    data: {
        summary?: string
    }
    positions?: string[]
    onClick?: () => unknown
    isOpen?: boolean
}

export function VacancyCard({
    id,
    companyName,
    data,
    positions,
    isOpen,
    onClick,
}: Props) {
    const linkRef = useRef<HTMLAnchorElement | null>(null)

    const handleClick: MouseEventHandler<any> = useCallback(
        (e) => {
            if (e.target === linkRef.current) {
                return
            }

            if (onClick) {
                onClick()
            }
        },
        [onClick]
    )

    return (
        <div
            className={clsx(
                "py-5 cursor-pointer group px-7  relative z-1 transition-all duration-300 rounded-[2rem]",
                {
                    "my-0 bg-white hover:bg-indigo-50 hover:bg-opacity-50": !isOpen,
                    "mt-4 first:mt-0 mb-8 bg-indigo-50 bg-opacity-80": isOpen,
                }
            )}
            onClick={handleClick}
        >
            <div className="flex flex-row items-start leading-[1.5]">
                <div className="basis-full">
                    <div className="flex flex-row items-center">
                        <H3
                            className={clsx("font-bold text-[1.5rem] my-0")}
                        >
                            {companyName}{" "}
                        </H3>
                    </div>
                    <p className="my-2">
                        <span className="text-xl font-semibold">{positions?.at(0)}</span>
                    </p>
                </div>
            </div>
            <div
                className={clsx("transition-all duration-[300ms] overflow-y-hidden w-full", {
                    "max-h-0": !isOpen,
                    "max-h-[30rem]": isOpen,
                })}
            >
                <div className="max-h-[20rem] overflow-y-hidden relative">
                    <p>{data?.summary}</p>
                    <div className="bg-gradient-to-t from-[#f6f8ff] via-[#f6f8ff] absolute left-0 right-0 -bottom-1/2 top-1/2 z-20 pointer-events-none" />
                </div>
                <Link ref={linkRef} className="w-full" to={`/jd/${id}`}>
                    <Button className="font-semibold">Full description</Button>
                </Link>
            </div>
        </div>
    )
}
