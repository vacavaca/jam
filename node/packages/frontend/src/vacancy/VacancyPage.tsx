import { useRouter } from "@/router/state"
import { useVacancy } from "./hooks"
import { H3 } from "@/ui/heading"
import { Salary } from "@/ui/Salary"
import { TimeIcon } from "@/icon/TimeIcon"
import { BuildingIcon } from "@/icon/BuildingIcon"
import { LocationIcon } from "@/icon/LocationIcon"
import { Chip } from "@/ui/Chip"
import { HeaderPortal } from "@/header/HeaderPortal"
import { FooterPortal } from "@/footer/FooterPortal"
import { Button } from "@/ui/Button"
import { SecondaryButton } from "@/ui/SecondaryButton"
import { CloseIcon } from "@/icon/CloseIcon"
import { EditIcon } from "@/icon/EditIcon"
import { SparkIcon } from "@/icon/SparkIcon"
import { Link } from "@/router/Link"
import { ShareIcon } from "@/icon/ShareIcon"
import { useAuth } from "@/auth/context"
import { ChatSmileIcon } from "@/icon/ChatSmileIcon"
import { CyanButton } from "@/ui/CyanButton"
import { formatNumberStringWithDelimiter } from "@/common/num"
import { BackIcon } from "@/icon/BackIcon"
import { BackLink } from "@/router/BackLink"
import { EarthIcon } from "@/icon/EarthIcon"

export type Props = {}

export function VacancyPage() {
    const router = useRouter()
    const jdId = router.params.id
    const { data: vacancy } = useVacancy(jdId)
    const auth = useAuth()

    if (!vacancy) {
        return null
    }

    return (
        <>
            <HeaderPortal>
                <div className="flex flex-row gap-2 items-center">
                    {auth?.state.isApplying && (
                        <>
                            <BackLink>
                                <SecondaryButton className="inline-block w-min font-semibold px-5">
                                    <BackIcon className="w-7 h-7" />
                                </SecondaryButton>
                            </BackLink>

                            <SecondaryButton className="inline-block w-min font-semibold px-5">
                                <ShareIcon className="w-7 h-7" />
                            </SecondaryButton>
                        </>
                    )}
                    {auth?.state.isHiring && (
                        <>
                            <SecondaryButton className="basis-0  px-5">
                                <CloseIcon className="w-7 h-7 inline mr-2" />
                                Delete
                            </SecondaryButton>
                            <SecondaryButton className="basis-0  px-5">
                                <EditIcon className="w-7 h-7 inline mr-2" />
                                Edit
                            </SecondaryButton>
                        </>
                    )}
                </div>
            </HeaderPortal>
            <div className="px-6 my-6">
                <div className="flex flex-row items-center gap-4 justify-between">
                    <H3 className="my-0 grow">{vacancy.positions.join(", ")} </H3>
                    {vacancy.salary && <Salary {...vacancy.salary} />}
                </div>
            </div>
            <div className="bg-white pb-40">
                <div className="mb-8">
                    <div className="bg-indigo-50 py-4 px-8 pr-2 rounded-2xl mx-1">
                        <div className="flex flex-row items-center flex-wrap gap-x-2 gap-y-2 text-indigo-500 relative -ml-3">
                            <div className="text-lg font-bold text-indigo-500 mr-2">
                                {vacancy.companyname}
                            </div>
                            <Chip color="white" icon={TimeIcon}>
                                {
                                    {
                                        "full-time": "Full-time",
                                        "part-time": "Part-time",
                                        project: "Project",
                                    }[vacancy.terms.timeCondition]
                                }
                            </Chip>
                            {(vacancy.terms.isRemoteAllowed || vacancy.terms.isOnSiteAllowed) && (
                                <Chip color="white" icon={BuildingIcon}>
                                    {vacancy.terms.isRemoteAllowed &&
                                        vacancy.terms.isOnSiteAllowed &&
                                        "Flexible"}
                                    {!vacancy.terms.isRemoteAllowed &&
                                        vacancy.terms.isOnSiteAllowed &&
                                        "Onsite"}
                                    {vacancy.terms.isRemoteAllowed &&
                                        !vacancy.terms.isOnSiteAllowed &&
                                        "Remote"}
                                </Chip>
                            )}
                            {vacancy.location?.countryName &&
                                !(
                                    vacancy.terms.isRemoteAllowed && !vacancy.terms.isOnSiteAllowed
                                ) && (
                                    <Chip color="white" icon={LocationIcon}>
                                        {vacancy.location.city}
                                    </Chip>
                                )}
                            {vacancy.languages.map(v => (
                                <Chip key={v.language} color="white" icon={EarthIcon}>
                                    {v.language.at(0)?.toUpperCase() + v.language.slice(1)} {!['jd', 'cv'].includes(v.level) && <span className="opacity-60">{v.level}</span>}
                                </Chip>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-6">
                    <p>{vacancy.data.summary}</p>

                    {(vacancy.data.responsibilities?.length ?? 0) > 0 && (
                        <>
                            <H3>Responsibilities</H3>
                            <ul>
                                {vacancy.data.responsibilities.map((v, i) => (
                                    <li key={i}>{v}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    {(vacancy.education?.length ?? 0) > 0 && (
                        <>
                            <H3>Education</H3>
                            <ul>
                                {vacancy.education.map((v, i) => (
                                    <li key={i}>
                                        {v.study}
                                        {v.isRequired && v.requiredDegree
                                            ? `, ${v.requiredDegree}`
                                            : ""}{" "}
                                        {!v.isRequired && (
                                            <span className="text-indigo-300">(optional)</span>
                                        )}
                                        {v.isRequired && <span className="">(required)</span>}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {(vacancy.skills?.length ?? 0) > 0 && (
                        <>
                            <H3>Skills</H3>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {vacancy.skills.map((v, i) => (
                                    <Chip key={i}>{v}</Chip>
                                ))}
                            </div>
                        </>
                    )}
                    {(vacancy.general_tools?.length ?? 0) > 0 && (
                        <>
                            <H3>Tools</H3>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {vacancy.general_tools.map((v, i) => (
                                    <Chip key={i}>{v}</Chip>
                                ))}
                            </div>
                        </>
                    )}
                    {(vacancy.specific_tools?.length ?? 0) > 0 && (
                        <>
                            <H3>Stack</H3>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {vacancy.specific_tools.map((v, i) => (
                                    <Chip key={i}>{v}</Chip>
                                ))}
                            </div>
                        </>
                    )}
                    {(vacancy.fields?.length ?? 0) > 0 && (
                        <>
                            <H3>Industry</H3>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {vacancy.fields.map((v, i) => (
                                    <Chip key={i}>{v}</Chip>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <FooterPortal>
                <div className="flex flex-row items-center gap-4 w-full">
                    {auth?.state.isHiring && (
                        <Link className="grow font-semibold" to={`/search/by-jd/${jdId}`}>
                            <Button className="">
                                <SparkIcon className="w-7 h-7 inline relative -top-0.5 mr-4" />
                                Find candidates
                            </Button>
                        </Link>
                    )}
                    {auth?.state.isApplying && (
                        <>
                            <Link className="grow font-semibolda basis-1/2" to={`/`}>
                                <CyanButton className="py-2">
                                    <div className="flex flex-row justify-center items-center">
                                        <ChatSmileIcon className="w-7 h-7 inline relative -top-0.5 mr-4" />
                                        <div>
                                            <div>Refer a friend</div>
                                            <div className="text-teal-800 -mt-1 font-normal group-hover:text-teal-600 transition">
                                                {formatNumberStringWithDelimiter(
                                                    `${((+vacancy.id % 4) * 100 + 200) / 5}`
                                                )}{" "}
                                                TON
                                            </div>
                                        </div>
                                    </div>
                                </CyanButton>
                            </Link>
                            <Link className="grow font-semibold basis-1/2" to={`/`}>
                                <Button className="">
                                    <ChatSmileIcon className="w-7 h-7 inline relative -top-0.5 mr-2" />
                                    Connect
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </FooterPortal>
        </>
    )
}
