import { request } from "@/api/request";
import useSWR from "swr";

export function useResumes() {
    return useSWR('listResumes', () => request<ResponseListResume[]>(`/cv/list?v=${Date.now()}`))
}

type ResponseListResume = {
    "id": string,
    "fullName": string,
    "positions": string[]
}

export function useResume(id: string | number) {
    return useSWR(['getResume', id], () => request<ResponseResume | null>(`/cv/${id}?v=${Date.now()}`))
}

export interface ResponseResume {
  id: string;
  fullName: string;
  data: Data;
  location?: Location;
  positions?: (string)[] | null;
  skills?: (string)[] | null;
  specific_tools?: (string)[] | null;
  general_tools?: (string)[] | null;
  salary?: Salary;
  languages?: (LanguagesEntity)[] | null;
  position_experience?: (PositionExperienceEntity)[] | null;
  field_experience?: (FieldExperienceEntity)[] | null;
  education?: (EducationEntity)[] | null;
}
export interface Data {
  summary: string;
  achievements?: (string)[] | null;
  locationCountryName: string;
}
export interface Location {
  city: string;
  countryCode: string;
  countryName: string;
}
export interface Salary {
  currency: string;
  amount: number;
}
export interface LanguagesEntity {
  language: string;
  level: string;
}
export interface PositionExperienceEntity {
  years: number;
  data: Data1;
  position: string;
}
export interface Data1 {
  company: string;
  description: string;
}
export interface FieldExperienceEntity {
  years: number;
  data?: null;
  field: string;
}
export interface EducationEntity {
  year: number;
  data: Data2;
}
export interface Data2 {
  program: string;
  location: string;
  institution: string;
}

