// @deno-types="npm:@types/pg"
import pg from "npm:pg"
import type { Pool as TPool } from "npm:@types/pg"
const { Pool } = pg

let pool: TPool | null = null

export function getPgPool() {
    if (pool == null) {
        pool = new Pool({
            connectionString: Deno.env.get("POSTGRES_DSN")!,
        })
    }

    return pool
}
