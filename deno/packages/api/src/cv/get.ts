import { getPgPool } from "../pg.ts"
import { shortenName } from "../util.ts"

export async function getCv(id: string | number) {
    const pg = getPgPool()

    const result = await pg.query(`
with
positions as (
    select array_agg(m.text) positions from resume v
        join meaning_pivot p on p.left_id=v.id and p.type='resume_desired_position'
        join meaning m on m.id=p.meaning_id
    where v.id=$1
    group by v.id
),
details as (
    select
        id, full_name "fullName", data,
        json_build_object(
            'city', location_city,
            'countryCode', location_country_code,
            'countryName', data->>'locationCountryName'
        ) location
    from resume where id=$1
),
salary as (
    select json_build_object(
        'currency', s.currency,
        'amount', s.mean
    ) salary from resume_salary s
    where s.resume_id=$1
),
position_experience as (
    select array_agg(json_build_object(
        'years', e.years,
        'data', e.data,
        'position', m.text
    ) order by e.index) position_experience
        from resume_experience e
        join meaning_pivot p on p.left_id=e.id and p.type='resume_experience_job_position'
        join meaning m on m.id=p.meaning_id
    where e.resume_id=$1 and e.type='job_position'
    group by e.resume_id
),
field_experience as (
    select array_agg(json_build_object(
        'years', e.years,
        'data', e.data,
        'field', m.text
    ) order by e.index) field_experience
        from resume_experience e
        join meaning_pivot p on p.left_id=e.id and p.type='resume_experience_field'
        join meaning m on m.id=p.meaning_id
    where e.resume_id=$1 and e.type='field'
),
education as (
    select array_agg(json_build_object(
        'year', e.year,
        'data', e.data
    )) education
        from resume_education e
    where e.resume_id=$1
    group by e.resume_id
),
skills as (
    select array_agg(m.text) skills from resume v
        join meaning_pivot p on p.left_id=v.id and p.type='resume_skill'
        join meaning m on m.id=p.meaning_id
    where v.id=$1
    group by v.id
),
language as (
    select array_agg(json_build_object(
        'language', l.language,
        'level', l.level
    )) languages from resume_language l
    where l.resume_id=$1
    group by l.resume_id
),
specific_tools as (
    select array_agg(m.text) specific_tools from resume v
        join meaning_pivot p on p.left_id=v.id and p.type='resume_specific_tool'
        join meaning m on m.id=p.meaning_id
    where v.id=$1
    group by v.id
),
general_tools as (
    select array_agg(m.text) general_tools from resume v
        join meaning_pivot p on p.left_id=v.id and p.type='resume_general_tool'
        join meaning m on m.id=p.meaning_id
    where v.id=$1
    group by v.id
)
select * from details
    left join positions on true
    left join skills on true
    left join specific_tools on true
    left join general_tools on true
    left join salary on true
    left join language on true
    left join position_experience on true
    left join field_experience on true
    left join education on true
`, [id])

    const resume = result.rows.at(0) ?? null
    if (!resume) {
        return null
    }

    return {
        ...resume,
        fullName: shortenName(resume.fullName)
    }
}
