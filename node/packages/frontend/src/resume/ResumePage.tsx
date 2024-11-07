import { useRouter } from "@/router/state"
import { useResume } from "./hooks"
import { H4, H2, H5, H3 } from "@/ui/heading"
import { Salary } from "@/ui/Salary"
import { HeaderPortal } from "@/header/HeaderPortal"
import { SecondaryButton } from "@/ui/SecondaryButton"
import { ShareIcon } from "@/icon/ShareIcon"
import { Chip } from "@/ui/Chip"
import { LocationIcon } from "@/icon/LocationIcon"
import { FooterPortal } from "@/footer/FooterPortal"
import { CloseIcon } from "@/icon/CloseIcon"
import { EditIcon } from "@/icon/EditIcon"
import { Button } from "@/ui/Button"
import { SparkIcon } from "@/icon/SparkIcon"
import { Link } from "@/router/Link"
import { useAuth } from "@/auth/context"
import { ChatSmileIcon } from "@/icon/ChatSmileIcon"
import { EarthIcon } from "@/icon/EarthIcon"

export type Props = {}

export function ResumePage() {
    const router = useRouter()
    const cvId = router.params.id
    const { data: resume } = useResume(cvId)
    const auth = useAuth()

    const totalExperienceYears = (resume?.position_experience ?? []).reduce(
        (acc, v) => acc + v.years,
        0
    )

    if (!resume) {
        return null
    }

    return (
        <>
            <HeaderPortal>
                <div className="flex flex-row gap-2 items-center">
                    {auth?.state.isHiring && (
                        <SecondaryButton className="inline-block w-min font-semibold px-5">
                            <ShareIcon className="w-7 h-7" />
                        </SecondaryButton>
                    )}
                    {auth?.state.isApplying && (
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
                    <H2 className="my-0 grow">{resume.fullName} </H2>
                    {resume.salary && <Salary {...resume.salary} />}
                </div>
            </div>
            <div className="bg-white pb-40">
                <div className="mb-8">
                    <div className="bg-indigo-50 py-4 px-8 rounded-2xl mx-1">
                        <div className="flex flex-row items-center flex-wrap gap-x-2 gap-y-2 text-indigo-500 relative -ml-3">
                            {resume.positions && (
                                <div className="text-xl font-bold text-indigo-500 ml-2 mr-2 mb-2 mt-1">
                                    {resume.positions.join(", ")}
                                </div>
                            )}
                            {resume.location?.countryName && (
                                <Chip color="white" icon={LocationIcon}>
                                    {resume.location.city}
                                </Chip>
                            )}
                            {(resume.languages ?? []).map((v) => (
                                <Chip key={v.language} color="white" icon={EarthIcon}>
                                    {v.language.at(0)?.toUpperCase() + v.language.slice(1)}{" "}
                                    {!["jd", "cv"].includes(v.level) && (
                                        <span className="opacity-60">{v.level.at(0)?.toUpperCase() + v.level.slice(1)}</span>
                                    )}
                                </Chip>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-6">
                    <div className="flex flex-row gap-4 flex-wrap gap-y-2">
                        <a
                            className="text-indigo-500 underline decoration-dashed"
                            href="#achievements"
                        >
                            Achievements
                        </a>
                        <a
                            className="text-indigo-500 underline decoration-dashed"
                            href="#experience"
                        >
                            Experience
                        </a>
                        <a
                            className="text-indigo-500 underline decoration-dashed"
                            href="#education"
                        >
                            Education
                        </a>
                        <a
                            className="text-indigo-500 underline decoration-dashed w-min"
                            href="#skills"
                        >
                            Skills
                        </a>
                        <a className="text-indigo-500 underline decoration-dashed" href="#tools">
                            Tools
                        </a>
                        <a className="text-indigo-500 underline decoration-dashed" href="#stack">
                            Stack
                        </a>
                    </div>
                    <p>{resume.data.summary}</p>

                    {(resume.data.achievements?.length ?? 0) > 0 && (
                        <>
                            <H3 id="achievements">Achievements</H3>
                            <ul>
                                {resume.data.achievements!.map((v, i) => (
                                    <li key={i}>{v}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    {(resume.education?.length ?? 0) > 0 && (
                        <>
                            <H3 id="experience">
                                Experience
                                {totalExperienceYears > 0 && (
                                    <span className="opacity-60 font-normal">
                                        {" "}
                                        {formatYears(totalExperienceYears)}
                                    </span>
                                )}
                            </H3>

                            {(resume.position_experience ?? []).map((v, i) => (
                                <div key={i} className="mb-10">
                                    <div>
                                        <H3 className="text-indigo-500 inline-block my-0">
                                            {v.position}
                                        </H3>{" "}
                                        <span className="opacity-60">{formatYears(v.years)}</span>
                                    </div>

                                    <p className="font-bold mt-2">{v.data.company}</p>
                                    <p className="whitespace-pre-line">{v.data.description}</p>
                                </div>
                            ))}

                            <H4>Industries</H4>

                            <ul>
                                {resume.field_experience!.slice().map((v, i) => (
                                    <li key={i} className="leading-[1.45] mb-2">
                                        <span className="text-indigo-500 font-bold">
                                            {v.field}:
                                        </span>{" "}
                                        <span className="opacity-60">{formatYears(v.years)}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {(resume.education?.length ?? 0) > 0 && (
                        <>
                            <H3 id="education">Education</H3>
                            <ul>
                                {resume
                                    .education!.slice()
                                    .sort((a, b) => b.year - a.year)
                                    .map((v, i) => (
                                        <li key={i} className="leading-[1.45] mb-2">
                                            <span className="text-indigo-500 font-bold">
                                                {v.year}
                                            </span>
                                            <span className="font-bold mx-2">
                                                {v.data.institution}
                                                <span className="font-normal opacity-60">
                                                    {v.data.location ? `, ${v.data.location}` : ""}
                                                </span>
                                            </span>
                                            <br />
                                            {v.data.program}
                                        </li>
                                    ))}
                            </ul>
                        </>
                    )}

                    {(resume.skills?.length ?? 0) > 0 && (
                        <>
                            <H3 id="skills">Skills</H3>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {resume.skills!.map((v, i) => (
                                    <Chip key={i}>{v}</Chip>
                                ))}
                            </div>
                        </>
                    )}
                    {(resume.general_tools?.length ?? 0) > 0 && (
                        <>
                            <H3 id="tools">Tools</H3>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {resume.general_tools!.map((v, i) => (
                                    <Chip key={i}>{v}</Chip>
                                ))}
                            </div>
                        </>
                    )}
                    {(resume.specific_tools?.length ?? 0) > 0 && (
                        <>
                            <H3 id="stack">Stack</H3>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {resume.specific_tools!.map((v, i) => (
                                    <Chip key={i}>{v}</Chip>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <FooterPortal>
                <div className="flex flex-row items-center gap-4 w-full">
                    {auth?.state.isApplying && (
                        <Link className="grow font-semibold" to={`/search/by-cv/${cvId}`}>
                            <Button className="">
                                <SparkIcon className="w-7 h-7 inline relative -top-0.5 mr-2" />
                                Find a job
                            </Button>
                        </Link>
                    )}
                    {auth?.state.isHiring && (
                        <Link className="grow font-semibold" to={`/`}>
                            <Button className="">
                                <ChatSmileIcon className="w-7 h-7 inline relative -top-0.5 mr-2" />
                                Connect
                            </Button>
                        </Link>
                    )}
                </div>
            </FooterPortal>
        </>
    )
}

function formatYears(y: number) {
    if (y < 3 / 12) {
        return
    }

    if (y > 3) {
        return `${y.toFixed(0)} y.`
    }

    return `${(y * 12).toFixed(0)} mo.`
}
