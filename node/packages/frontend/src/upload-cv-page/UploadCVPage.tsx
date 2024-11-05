import { useCallback, useState } from "react"
import { UploadStep } from "./UploadStep"
import { DecodeStep } from "./DecodeStep"

type State =
    | {
          step: "upload"
      }
    | {
          step: "decode"
          id: number
      }

export function UploadCVPage() {
    const [state, setState] = useState<State>({ step: "upload" })

    const onCvUploaded = useCallback((id: number) => setState({ step: "decode", id }), [])

    return (
        <>
            {state.step === "upload" && <UploadStep onDone={onCvUploaded} />}
            {state.step === "decode" && <DecodeStep id={state.id} />}
        </>
    )
}
