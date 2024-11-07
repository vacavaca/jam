import { useAuth } from "@/auth/context"
import { ProfileVacancies } from "./ProfileVacancie"
import { ProfileResumes } from "./ProfileResumes"

export function ProfilePage() {
    const auth = useAuth()

    return (
        <div className="bg-white">
            {auth?.state.isHiring && <ProfileVacancies />}
            {auth?.state.isApplying && <ProfileResumes />}
        </div>
    )
}
