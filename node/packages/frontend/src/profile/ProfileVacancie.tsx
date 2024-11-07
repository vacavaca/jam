import { useVacancies } from "@/vacancy/hooks"
import { VacancyCard } from "./VacancyCard"
import { Preloader } from "@/ui/Preloader"
import { useState } from "react"
import { HeaderPortal } from "@/header/HeaderPortal"
import { H2 } from "@/ui/heading"
import { Link } from "@/router/Link"
import { Button } from "@/ui/Button"
import { UploadIcon } from "@/icon/UploadIcon"
import { SecondaryButton } from "@/ui/SecondaryButton"

export function ProfileVacancies() {
    const { data: vacances } = useVacancies()
    const [open, setOpen] = useState<number | null>(null)

    if (!vacances) {
        return <Preloader className="mt-40" />
    }

    return (
        <>
            <HeaderPortal>
                <div className="h-full flex flex-row items-center justify-start gap-4">
                    <Link
                        className="grow font-semibold inline-block w-min basis-0 shrink"
                        to={`/onboard/upload/jd`}
                    >
                        <SecondaryButton className="p-4">
                            <UploadIcon className="w-7 h-7 inline relative -top-0.5" />
                        </SecondaryButton>
                    </Link>
                    <H2 className="my-0 text-indigo-500 grow basis-full">Vacancies</H2>
                </div>
            </HeaderPortal>
            {(vacances ?? []).map((v, i) => (
                <VacancyCard
                    isOpen={open === i}
                    onClick={() => setOpen((v) => (v !== i ? i : null))}
                    key={v.id}
                    {...v}
                />
            ))}
        </>
    )
}
