import useSWR from "swr"
import { request } from "../api/request"

export function useVacanciesSearch(cvId: string | number) {
    return useSWR(["vacancySearch", cvId], async () =>
        request<ResponseCandidate[]>(`/search/by-cv/${cvId}?v=${Date.now()}`)
    )
}

type ResponseCandidate = {
    vacancyId: number
    companyName: string
    data: {
        summary: string
    }
    position?: string
    totalScore: number
    skillScore?: number
    generalToolScore?: number
    specificToolScore?: number
}
