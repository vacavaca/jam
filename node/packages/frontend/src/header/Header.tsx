import { SecondaryButton } from "@/ui/SecondaryButton"
import { BookIcon } from "@/icon/BookIcon"
import { Link } from "@/router/Link"
import { Route } from "@/router/Route"
import { RestartIcon } from "@/icon/RestartIcon"
import { Logo } from "@/icon/Logo"
import { OnBoardIcon } from "@/icon/OnBoardIcon"

type Props = {
    onContainer: (container: HTMLElement | null) => unknown
}

export function Header({ onContainer }: Props) {
    return (
        <>
            {/*
            <div className="text-indigo-600 py-3 text-center">
                <span className="font-black">OnBoard</span>
            </div>
            */}
            <div className="flex flex-row items-start gap-4 py-4 px-6 ">
                <div className="hidden absolute inset-0 shadow-indigo-600 shadow-xl z-20 pointer-events-none opacity-[3%]" />
                <div className="basis-full h-full" ref={onContainer} />

                <div className="">
                    <Route exact="/profile">
                        <Link to="/?return=profile">
                            <SecondaryButton className="px-4">
                                <OnBoardIcon className="w-6 h-6" />
                            </SecondaryButton>
                        </Link>
                    </Route>
                    <Route exact="/profile" isInvert>
                        <Link to="/profile">
                            <SecondaryButton className="px-4">
                                <BookIcon className="w-7 h-6" />
                            </SecondaryButton>
                        </Link>
                    </Route>
                </div>
            </div>
        </>
    )
}
