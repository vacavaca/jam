import { useState } from "react"
import { Button } from "../ui/Button"
import { FileInput } from "../ui/FileInput"
import { useAsyncRequest } from "../util/hooks"
import { request } from "../api/request"
import { ErrorMessage } from "../ui/ErrorMessage"
import { H1 } from "../ui/heading"

type Props = {
    onDone: (id: number) => unknown
}

export function UploadStep({ onDone }: Props) {
    const [file, setFile] = useState<File | null>(null)

    const {
        isLoading,
        isSuccess,
        error,
        onRequest: onUpload,
    } = useAsyncRequest(async () => {
        if (!file) {
            return
        }

        const formData = new FormData()
        formData.append("cv", file)

        const result = await request<{ id: number }>("/upload/cv", {
            method: "POST",
            body: formData,
        })

        setTimeout(() => {
            onDone(result.id)
        }, 500)
    }, [file, onDone])

    return (
        <>
            <H1 className="mb-8 text-center">Upload your CV</H1>
            <p className="text-lg mb-16 text-center text-neutral-800">
                To get the best matches for your skills
            </p>
            <FileInput
                disabled={isSuccess}
                onChangeFile={setFile}
                accept=".txt,.pdf,application/pdf,text/plain"
                name="cv"
            />
            <Button
                isLoading={isLoading}
                isSuccess={isSuccess}
                onClick={file ? onUpload : undefined}
            >
                Upload
            </Button>
            <ErrorMessage className="text-center" error={error} />
        </>
    )
}
