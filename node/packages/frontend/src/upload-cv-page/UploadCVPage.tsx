import { useCallback, useState } from "react"
import { UploadStep } from "./UploadStep"
import { DecodeStep } from "./DecodeStep"
import { useRouter } from "@/router/state"

type State =
    | {
          step: "upload"
      }
    | {
          step: "decode"
          id: number
      }

export function UploadCVPage() {
    const router = useRouter()
    const [state, setState] = useState<State>({ step: "upload" })

    const onCvUploaded = useCallback((id: number) => setState({ step: "decode", id }), [])

    const onCvDecoded = useCallback(() => {
        if (state.step !== "decode") {
            return
        }

        setTimeout(() => {
            router.push(`/cv/${state.id}`)
        }, 4000)
    }, [state, router])

    return (
        <>
            {state.step === "upload" && <UploadStep onDone={onCvUploaded} />}
            {state.step === "decode" && <DecodeStep id={state.id} onDone={onCvDecoded} />}
        </>
    )
}
