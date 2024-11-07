import { useState } from "react"
import { useRouter } from "../router/state"
import { useVacanciesSearch } from "./hooks"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/Select"
import { VacancySearchCard } from "./SearchCard"
import { Preloader } from "@/ui/Preloader"
import { HeaderPortal } from "@/header/HeaderPortal"
import { useResumes } from "@/resume/hooks"

export function SearchByCVPage() {
    const router = useRouter()
    const [cvId, setCvId] = useState(router.params.id!)
    const { data } = useVacanciesSearch(cvId)
    const [open, setOpen] = useState<number | null>(null)

    const { data: resumes } = useResumes()

    return (
        <div className="bg-white">
            <HeaderPortal>
                <div className="h-full flex flex-col justify-center">
                    <Select onValueChange={setCvId} value={cvId}>
                        <SelectTrigger className="w-full h-[3rem]">
                            <SelectValue placeholder="Vacancy" />
                        </SelectTrigger>
                        <SelectContent>
                            {(resumes ?? []).map((v) => (
                                <SelectItem key={v.id} value={`${v.id}`}>
                                    {v.positions.at(0)} {v.fullName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </HeaderPortal>
            {!data && <Preloader className="mt-40" />}
            {data?.map((v, i) => (
                <VacancySearchCard
                    isOpen={open === i}
                    onClick={() => setOpen((v) => (v !== i ? i : null))}
                    key={v.vacancyId}
                    {...v}
                    isBestMatch={v.totalScore > 40 && i === 0}
                />
            ))}
        </div>
    )
}
