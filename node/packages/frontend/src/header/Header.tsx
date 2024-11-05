import { Link } from "../router/Link"

type Props = {
    onContainer: (container: HTMLElement | null) => unknown
}

export function Header({ onContainer }: Props) {
    return (
        <>
            <div className="flex flex-row items-center gap-4 py-4 px-6 bg-white border border-bottom-1 border-x-0 border-indigo-800 border-opacity-10  absolute top-0 inset-x-0 h-20">
                <div className="hidden absolute inset-0 shadow-indigo-600 shadow-xl z-20 pointer-events-none opacity-[3%]" />
                <div className="basis-full" ref={onContainer} />

                <div className="">
                    <PersonalButton />
                </div>
            </div>
        </>
    )
}

function PersonalButton() {
    return (
        <Link
            to="/"
            className="block border-blue-100  rounded-2xl p-3 group hover:bg-indigo-100 transition-colors"
        >
            <svg
                className="w-6 h-6 text-blue-950 group-hover:text-indigo-500 transition-colors"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path d="M8 2V22H4V18H2V16H4V13H2V11H4V8H2V6H4V2H8ZM20.0049 2C21.1068 2 22 2.89821 22 3.9908V20.0092C22 21.1087 21.1074 22 20.0049 22H10V2H20.0049Z"></path>
            </svg>
        </Link>
    )
}
