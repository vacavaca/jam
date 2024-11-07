import { getPgPool } from "../pg.ts"

export async function listCVs() {
    const pg = getPgPool()

    const result = await pg.query(`
select 
    r.id id, r.full_name "fullName", r.data->>'summary' summary,
    array_agg(m.text) positions
from resume r
    join meaning_pivot p on p.left_id=r.id and p.type='resume_desired_position'
    join meaning m on p.meaning_id=m.id
group by r.id
`)

    return result.rows
}
