import { useRouter } from "../router/state"
import { useCandidatesSearch } from "./hooks"
import { CandidateSearchCard } from "./SearchCard"

export function SearchByJDPage() {
    const router = useRouter()
    const { data } = useCandidatesSearch(router.params.jd!)

    return (
        <>
            {data?.map((v, i) => (
                <CandidateSearchCard
                    key={v.resumeId}
                    {...v}
                    isBestMatch={v.totalScore > 40 && i === 0}
                />
            ))}
        </>
    )
}
