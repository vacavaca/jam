import { getPgPool } from "../pg.ts"

export async function listJDs() {
    const pg = getPgPool()

    const result = await pg.query(`
select 
    v.id id, v.company_name company_name, v.data data,
    array_agg(m.text) positions
from vacancy v
    join meaning_pivot p on p.left_id=v.id and p.type='vacancy_job_position'
    join meaning m on p.meaning_id=m.id
group by v.id
`)

    return result.rows.map(v => ({
        id: v.id,
        companyName: v.company_name,
        data: v.data,
        positions: v.positions
    }))
}
