import { useCallback, useState } from "react"
import { UploadStep } from "./UploadStep"
import { DecodeStep } from "./DecodeStep"
import { useRouter } from "../router/state"

type State =
    | {
          step: "upload"
      }
    | {
          step: "decode"
          id: number
      }

export function UploadJDPage() {
    const router = useRouter()
    const [state, setState] = useState<State>({ step: "upload" })

    const onJdUploaded = useCallback((id: number) => setState({ step: "decode", id }), [])

    const onJdDecoded = useCallback(() => {
        if (state.step !== "decode") {
            return
        }

        setTimeout(() => {
            router.push(`/jd/${state.id}`)
        }, 4000)
    }, [state, router])

    return (
        <>
            {state.step === "upload" && <UploadStep onDone={onJdUploaded} />}
            {state.step === "decode" && <DecodeStep id={state.id} onDone={onJdDecoded} />}
        </>
    )
}
