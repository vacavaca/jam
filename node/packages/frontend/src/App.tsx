import { RouterProvider } from "./router/RouterProvider"
import { Route } from "./router/Route"
import { UploadJDPage } from "./upload-jd-page/UploadJDPage"
import { IndexPage } from "./index-page/IndexPage"
import { UploadCVPage } from "./upload-cv-page/UploadCVPage"
import { CenterContainer } from "./ui/CenterContainer"
import { SearchByJDPage } from "./search-by-jd-page/SearchByJDPage"
import { SWRConfig } from "swr"
import { HeaderLayout } from "./header/HeaderLayout"

function App() {
    return (
        <SWRConfig>
            <RouterProvider>
                <Route exact="/">
                    <CenterContainer>
                        <IndexPage />
                    </CenterContainer>
                </Route>
                <Route exact="/upload/jd/new">
                    <CenterContainer>
                        <UploadJDPage />
                    </CenterContainer>
                </Route>
                <Route exact="/upload/cv/new">
                    <CenterContainer>
                        <UploadCVPage />
                    </CenterContainer>
                </Route>
                <Route exact="/cv/:id">
                    <CenterContainer>CV</CenterContainer>
                </Route>
                <Route exact="/jd/:id">
                    <CenterContainer>CV</CenterContainer>
                </Route>
                <Route exact="/search/by-jd/:jd">
                    <HeaderLayout>
                        <SearchByJDPage />
                    </HeaderLayout>
                </Route>
            </RouterProvider>
        </SWRConfig>
    )
}

export default App
