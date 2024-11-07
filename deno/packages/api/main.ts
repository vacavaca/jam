import {
    asyncRoute,
    ErrorInvalidRequest,
    route,
    serve,
    withCORS,
} from "@jam/serve"
import { createLogger } from "@jam/common/log"
// @deno-types="npm:@types/express"
import { Router } from "npm:express"
// @deno-types="npm:@types/express-fileupload"
import fileUpload from "npm:express-fileupload"
import type { UploadedFile } from "npm:express-fileupload"
import { join } from "node:path"
import { supabase } from "./src/supabase.ts"
import {
    prepareSearchPageForJob,
    prepareSearchPageForResume,
} from "./src/search.ts"
import { listJDs } from "./src/jd/list.ts"
import { listCVs } from "./src/cv/list.ts"
import { getJd } from "./src/jd/get.ts"
import { getCv } from "./src/cv/get.ts"
import { z } from "zod"

const logger = createLogger("api-server")

const port = Deno.env.get("PORT") ?? 9000

logger.info("starting server", { port })

serve(
    logger,
    Router()
        .use(
            withCORS({
                allowedOrigins: [],
                allowedHeaders: ['Content-Type'],
                allowedMethods: ['POST', 'GET', 'DELETE', 'PUT', 'OPTIONS'],
                isUnknownOriginsAllowed:
                    Deno.env.get("NODE_ENV") === "development",
                isAllowLocalhost: Deno.env.get("NODE_ENV") === "development",
            }),
        )
        .use(fileUpload({
            limits: {
                fileSize: 50 * 1024 * 1024,
                files: 1,
            },
        }))
        .get(
            "/jd/list",
            asyncRoute(async (_, res) => {
                const jds = await listJDs()
                res.status(200).json(jds)
            }),
        )
        .get(
            "/cv/list",
            asyncRoute(async (_, res) => {
                const jds = await listCVs()
                res.status(200).json(jds)
            }),
        )
        .get(
            "/jd/:jd",
            asyncRoute(async (req, res) => {
                const jd = await getJd(req.params.jd)
                res.status(200).json(jd)
            }),
        )
        .get(
            "/cv/:jd",
            asyncRoute(async (req, res) => {
                const jd = await getCv(req.params.jd)
                res.status(200).json(jd)
            }),
        )
        .post(
            "/paste/jd",
            route()
                .body(z.object({ text: z.string().min(1) }))
                .handle(async (req, res) => {
                    const inputTextDir = Deno.env.get("INPUT_JD_TXT_DIR")!

                    const result = await supabase.from("vacancy")
                        .insert({ created_at: new Date() })
                        .select("id")
                        .throwOnError()

                    const id = result.data![0].id

                    const dstName = `${id}.txt`

                    const dstPath = join(
                        inputTextDir,
                        dstName,
                    )

                    await Deno.writeTextFile(dstPath, req.body.text)

                    res.status(200).json({ id })
                }),
        )
        .post(
            "/paste/cv",
            route()
                .body(z.object({ text: z.string().min(1) }))
                .handle(async (req, res) => {
                    const inputTextDir = Deno.env.get("INPUT_CV_TXT_DIR")!

                    const result = await supabase.from("resume")
                        .insert({ created_at: new Date() })
                        .select("id")
                        .throwOnError()

                    const id = result.data![0].id

                    const dstName = `${id}.txt`

                    const dstPath = join(
                        inputTextDir,
                        dstName,
                    )

                    await Deno.writeTextFile(dstPath, req.body.text)

                    res.status(200).json({ id })
                }),
        )
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
                    .select("id")
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
                    .select("id")
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
        .get(
            "/search/by-jd/:jd",
            asyncRoute(async (req, res) => {
                const jdId = +req.params.jd
                if (isNaN(jdId)) {
                    throw new ErrorInvalidRequest("jd id is required")
                }

                const data = await prepareSearchPageForJob(jdId)

                res.status(200).json(data)
            }),
        )
        .get(
            "/search/by-cv/:cv",
            asyncRoute(async (req, res) => {
                const cvId = +req.params.cv
                if (isNaN(cvId)) {
                    throw new ErrorInvalidRequest("cv id is required")
                }

                const data = await prepareSearchPageForResume(cvId)

                res.status(200).json(data)
            }),
        ),
).listen(port)
