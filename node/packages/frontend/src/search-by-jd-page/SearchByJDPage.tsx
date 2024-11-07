import { useState } from "react"
import { useRouter } from "../router/state"
import { useCandidatesSearch } from "./hooks"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/Select"
import { CandidateSearchCard } from "./SearchCard"
import { useVacancies } from "@/vacancy/hooks"
import { Preloader } from "@/ui/Preloader"
import { HeaderPortal } from "@/header/HeaderPortal"

export function SearchByJDPage() {
    const router = useRouter()
    const [JDID, setJDID] = useState(router.params.id!)
    const { data } = useCandidatesSearch(JDID)
    const [open, setOpen] = useState<number | null>(null)

    const { data: vacancies } = useVacancies()

    return (
        <div className="bg-white">
            <HeaderPortal>
                <div className="h-full flex flex-col justify-center">
                    <Select onValueChange={setJDID} value={JDID}>
                        <SelectTrigger className="w-full h-[3rem]">
                            <SelectValue placeholder="Vacancy" />
                        </SelectTrigger>
                        <SelectContent>
                            {(vacancies ?? []).map((v) => (
                                <SelectItem key={v.id} value={`${v.id}`}>
                                    {v.positions.at(0)} {v.companyName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </HeaderPortal>
            {!data && <Preloader className="mt-40" />}
            {data?.map((v, i) => (
                <CandidateSearchCard
                    isOpen={open === i}
                    onClick={() => setOpen((v) => (v !== i ? i : null))}
                    key={v.resumeId}
                    {...v}
                    isBestMatch={v.totalScore > 40 && i === 0}
                />
            ))}
        </div>
    )
}
