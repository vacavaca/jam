import { useRef, useState } from "react"
import { Button } from "../ui/Button"
import { FileInput } from "../ui/FileInput"
import { useAsyncRequest } from "../util/hooks"
import { request } from "../api/request"
import { ErrorMessage } from "../ui/ErrorMessage"
import { H1 } from "../ui/heading"
import { SecondaryButton } from "@/ui/SecondaryButton"

type Props = {
    onDone: (id: number) => unknown
}

export function UploadStep({ onDone }: Props) {
    const [mode, setMode] = useState<"pdf" | "text">("pdf")
    const [file, setFile] = useState<File | null>(null)
    const textRef = useRef<HTMLTextAreaElement | null>(null)

    const {
        isLoading,
        isSuccess,
        error,
        onRequest: onUpload,
    } = useAsyncRequest(async () => {
        console.log(textRef)
        let result: { id: number }
        if (mode === "pdf") {
            if (!file) {
                return
            }

            const formData = new FormData()
            formData.append("jd", file)

            result = await request<{ id: number }>("/upload/jd", {
                method: "POST",
                body: formData,
            })
        } else {
            if (!textRef.current?.value) {
                return
            }

            result = await request<{ id: number }>("/paste/jd", {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify({
                    text: textRef.current?.value,
                }),
            })
        }

        setTimeout(() => {
            onDone(result.id)
        }, 500)
    }, [file, onDone, mode])

    return (
        <>
            <H1 className="mb-8 text-center">Upload your Job Description</H1>
            <p className="text-lg mb-16 text-center">To get the best matches for your position</p>
            {mode === "pdf" && (
                <>
                    <FileInput
                        disabled={isSuccess}
                        onChangeFile={setFile}
                        accept=".txt,.pdf,application/pdf,text/plain"
                        name="jd"
                    />
                    <Button
                        isLoading={isLoading}
                        isSuccess={isSuccess}
                        onClick={file ? onUpload : undefined}
                    >
                        Upload
                    </Button>
                    <ErrorMessage className="text-center" error={error} />
                    <SecondaryButton onClick={() => setMode("text")} className="mt-4">
                        Create from text
                    </SecondaryButton>
                </>
            )}
            {mode === "text" && (
                <>
                    <textarea
                        ref={textRef}
                        className="w-full border border-indigo-300 h-40 mb-4 rounded-2xl focus:outline-none focus:border-indigo-400 p-4"
                    ></textarea>
                    <Button
                        isLoading={isLoading}
                        isSuccess={isSuccess}
                        onClick={onUpload}
                    >
                        Upload
                    </Button>
                    <ErrorMessage className="text-center" error={error} />
                    <SecondaryButton onClick={() => setMode("pdf")} className="mt-4">
                        Switch to PDF
                    </SecondaryButton>
                </>
            )}
        </>
    )
}
