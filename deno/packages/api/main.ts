import { asyncRoute, ErrorInvalidRequest, serve, withCORS } from "@jam/serve"
import { createLogger } from "@jam/common/log"
// @deno-types="npm:@types/express"
import { Router } from "npm:express"
// @deno-types="npm:@types/express-fileupload"
import fileUpload from "npm:express-fileupload"
import type { UploadedFile } from "npm:express-fileupload"
import { join } from "node:path"
import { supabase } from "./src/supabase.ts"
import { prepareSearchPageForJob } from "./src/search.ts"

const logger = createLogger("api-server")

const port = Deno.env.get("PORT") ?? 9000

logger.info("starting server", { port })

serve(
    logger,
    Router()
        .use(
            withCORS({
                allowedOrigins: [],
                isUnknownOriginsAllowed: Deno.env.get("NODE_ENV") === "development",
                isAllowLocalhost: Deno.env.get("NODE_ENV") === "development",
            }),
        )
        .use(fileUpload({
            limits: {
                fileSize: 50 * 1024 * 1024,
                files: 1,
            },
        }))
        .post(
            "/upload/jd",
            asyncRoute(async (req, res) => {
                const file: UploadedFile | UploadedFile[] | undefined = req
                    .files
                    ?.jd

                if (!file) {
                    throw new ErrorInvalidRequest("missing jd file")
                }

                if (Array.isArray(file)) {
                    throw new ErrorInvalidRequest("expected a single JD file")
                }

                const inputPDFDir = Deno.env.get("INPUT_JD_PDF_DIR")!
                const inputTextDir = Deno.env.get("INPUT_JD_TXT_DIR")!

                const isPdf = file.mimetype === "application/pdf"

                const result = await supabase.from("vacancy")
                    .insert({ created_at: new Date() })
                    .select('id')
                    .throwOnError()

                const id = result.data![0].id

                const dstName = `${id}.${isPdf ? "pdf" : "txt"}`

                const dstPath = join(
                    isPdf ? inputPDFDir : inputTextDir,
                    dstName,
                )

                await Deno.writeFile(dstPath, file.data)

                res.status(200).json({ id })
            }),
        )
        .post(
            "/upload/cv",
            asyncRoute(async (req, res) => {
                const file: UploadedFile | UploadedFile[] | undefined = req
                    .files
                    ?.cv

                if (!file) {
                    throw new ErrorInvalidRequest("missing cv file")
                }

                if (Array.isArray(file)) {
                    throw new ErrorInvalidRequest("expected a single CV file")
                }

                const inputPDFDir = Deno.env.get("INPUT_CV_PDF_DIR")!
                const inputTextDir = Deno.env.get("INPUT_CV_TXT_DIR")!

                const isPdf = file.mimetype === "application/pdf"

                const result = await supabase.from("resume")
                    .insert({ created_at: new Date() })
                    .select('id')
                    .throwOnError()

                const id = result.data![0].id

                const dstName = `${id}.${isPdf ? "pdf" : "txt"}`

                const dstPath = join(
                    isPdf ? inputPDFDir : inputTextDir,
                    dstName,
                )

                await Deno.writeFile(dstPath, file.data)

                res.status(200).json({ id })
            }),
        )
        .get("/search/by-jd/:jd", asyncRoute(async (req, res) => {
            const jdId = +req.params.jd
            if (isNaN(jdId)) {
                throw new ErrorInvalidRequest("jd id is required")
            }

            const data  =await prepareSearchPageForJob(jdId)

            res.status(200).json(data)
        }))
    ,
).listen(port)
