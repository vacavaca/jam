import useSWR from "swr"
import { request } from "../api/request"

export function useCandidatesSearch(jdId: string | number) {
    return useSWR(["candidateSearch", jdId], async () =>
        request<ResponseCandidate[]>(`/search/by-jd/${jdId}`)
    )
}

type ResponseCandidate = {
    resumeId: number
    fullName: string
    summary: string
    position?: string
    totalScore: number
    skillScore?: number
    generalToolScore?: number
    specificToolScore?: number
}
