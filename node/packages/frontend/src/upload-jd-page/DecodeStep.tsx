import { useState } from "react"
import { useInterval } from "../util/hooks"
import supabase from "../util/supabase"
import { H2 } from "../ui/heading"
import { Preloader } from "../ui/Preloader"

type Props = {
    id: number
    onDone?: () => void
}

export function DecodeStep({ id, onDone }: Props) {
    const [isReady, setReady] = useState(false)

    useInterval(
        !isReady &&
            (async () => {
                try {
                    const result = await supabase
                        .from("vacancy")
                        .select("status")
                        .eq("id", id)
                        .throwOnError()

                    if (result.data![0].status !== "processed") {
                        return
                    }

                    setReady(true)
                    if (onDone) {
                        onDone()
                    }
                } catch (error) {
                    console.log(error)
                }
            }),
        1000,
        [id, isReady, onDone]
    )

    return (
        <div className="flex flex-col items-center">
            <H2 rank={1} className="text-center mb-6">
                Doing the <br />
                <span className="text-indigo-500 font-black text-4xl">magic</span>
            </H2>
            <Preloader className="mt-12 mb-8" />
            <p className="text-lg mb-16 text-center text-indigo-500 animate-pulse min-[36px]:w-3/4 min-[400px]:w-2/3">
                We processing your JD to find you the best matches we can find
            </p>
        </div>
    )
}
