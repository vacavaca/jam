import { RouterProvider } from "./router/RouterProvider"
import { Route } from "./router/Route"
import { UploadJDPage } from "./upload-jd-page/UploadJDPage"
import { IndexPage } from "./index-page/IndexPage"
import { UploadCVPage } from "./upload-cv-page/UploadCVPage"
import { SearchByJDPage } from "./search-by-jd-page/SearchByJDPage"
import { SWRConfig } from "swr"
import { Layout } from "./layout/Layout"
import { VacancyPage } from "./vacancy/VacancyPage"
import { ResumePage } from "./resume/ResumePage"
import { SearchByCVPage } from "./search-by-cv-page/SearchByCVPage"
import { AuthProvider } from "./auth/AuthProvider"
import { ProfilePage } from "./profile/ProfilePage"

function App() {
    return (
        <SWRConfig>
            <RouterProvider>
                <AuthProvider>
                    <Layout>
                        <Route exact="/">
                            <IndexPage />
                        </Route>
                        <Route exact="/jam">
                            <IndexPage />
                        </Route>
                        <Route exact="/profile">
                            <ProfilePage />
                        </Route>
                        <Route exact="/onboard/upload/jd">
                            <UploadJDPage />
                        </Route>
                        <Route exact="/onboard/upload/cv">
                            <UploadCVPage />
                        </Route>
                        <Route exact="/cv/:id">
                            <ResumePage />
                        </Route>
                        <Route exact="/jd/:id">
                            <VacancyPage />
                        </Route>
                        <Route starts="/search/by-jd/:id">
                            <SearchByJDPage />
                        </Route>
                        <Route starts="/search/by-cv/:id">
                            <SearchByCVPage />
                        </Route>
                    </Layout>
                </AuthProvider>
            </RouterProvider>
        </SWRConfig>
    )
}

export default App
