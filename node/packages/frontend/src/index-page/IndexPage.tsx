import { PropsWithChildren } from "react"
import { H2 } from "../ui/heading"
import { Link } from "../router/Link"
import clsx from "clsx"

export function IndexPage() {
    return (
        <>
            <H2 rank={1} className="mb-8 text-center">
                Welcome to <br />
                <span className="font-black text-4xl">OnBoard</span>
            </H2>
            <p className="text-lg mb-16 text-center text-neutral-800">
                A place where the best <span className="text-indigo-500 font-black">match</span>{" "}
                happens
            </p>

            <Option
                to="/upload/cv/new"
                className="border-indigo-500 text-indigo-600 bg-indigo-100 "
            >
                I am looking for a job
            </Option>

            <Option to="/upload/jd/new" className="border-cyan-500 text-cyan-600 bg-cyan-200 bg-opacity-[30%] hover:bg-opacity-60">
                I am hiring
            </Option>
        </>
    )
}

function Option({
    to,
    className,
    children,
}: { to: string; className?: string } & PropsWithChildren) {
    return (
        <Link
            to={to}
            className={clsx(
                "block p-6 py-6 rounded-3xl border-2 border-opacity-5 mb-4 bg-opacity-50 transition-colors duration-300 hover:bg-opacity-100",
                className
            )}
        >
            {children}
        </Link>
    )
}
