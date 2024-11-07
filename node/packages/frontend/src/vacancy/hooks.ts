import { request } from "@/api/request"
import useSWR from "swr"

export function useVacancies() {
    return useSWR("listVacancies", () => request<ResponseListVacancy[]>("/jd/list"))
}

export function useVacancy(id: string | number) {
    return useSWR(["getVacancy", id], () => request<ResponseVacancy | null>(`/jd/${id}`))
}

type ResponseListVacancy = {
    id: number
    companyName: string
    data: Record<string, any>
    positions: string[]
}

type ResponseVacancy = {
    id: string
    companyname: string
    data: {
        summary: string
        responsibilities: string[]
        locationCountryName: string
    }
    location?: {
        city: string
        countryCode: string
        countryName: string
    }
    terms: {
        isRemoteAllowed: boolean
        isOnSiteAllowed: boolean
        timeCondition: "full-time" | "part-time" | "project"
    }
    positions: string[]
    fields: string[]
    languages: {
        language: string
        level: "jd" | string
    }[]
    salary?: {
        currency: string
        amount: string
    }
    position_experience: {
        minimumYears: number
        isRequired: boolean
        data: {
            description: string
        }
        position: string
    }[]
    field_experience: {
        minimumYears: number
        isRequired: boolean
        data: {
            description: "Experience in relevant fields with significant responsibility and leadership in product development."
        }
        position: string
    }[]
    education: {
        isRequired: boolean
        requiredDegree: string
        study: string
    }[]
    skills: string[]
    specific_tools: string[]
    general_tools: string[]
}
