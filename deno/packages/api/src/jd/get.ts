import { getPgPool } from "../pg.ts"

export async function getJd(jdId: string | number) {
    const pg = getPgPool()

    const result = await pg.query(`
with fields as (
    select array_agg(m.text) fields from vacancy v
        join meaning_pivot p on p.left_id=v.id and p.type='vacancy_job_field'
        join meaning m on m.id=p.meaning_id
    where v.id=$1
    group by v.id
),
skills as (
    select array_agg(m.text) skills from vacancy v
        join meaning_pivot p on p.left_id=v.id and p.type='vacancy_skill'
        join meaning m on m.id=p.meaning_id
    where v.id=$1
    group by v.id
),
specific_tools as (
    select array_agg(m.text) specific_tools from vacancy v
        join meaning_pivot p on p.left_id=v.id and p.type='vacancy_specific_tool'
        join meaning m on m.id=p.meaning_id
    where v.id=$1
    group by v.id
),
general_tools as (
    select array_agg(m.text) general_tools from vacancy v
        join meaning_pivot p on p.left_id=v.id and p.type='vacancy_general_tool'
        join meaning m on m.id=p.meaning_id
    where v.id=$1
    group by v.id
),
positions as (
    select array_agg(m.text) positions from vacancy v
        join meaning_pivot p on p.left_id=v.id and p.type='vacancy_job_position'
        join meaning m on m.id=p.meaning_id
    where v.id=$1
    group by v.id
),
languages as (
    select array_agg(json_build_object(
        'language', l.language,
        'level', l.level
    )) languages from vacancy_language l
    where l.vacancy_id=$1
    group by l.vacancy_id
),
salary as (
    select json_build_object(
        'currency', s.currency,
        'amount', s.amount
    ) salary from vacancy_salary s
    where s.vacancy_id=$1
),
position_experience as (
    select array_agg(json_build_object(
        'minimumYears', e.minimum_years,
        'isRequired', e.is_required,
        'data', e.data,
        'position', m.text
    )) position_experience
        from vacancy_experience e
        join meaning_pivot p on p.left_id=e.id and p.type='vacancy_experience_job_position'
        join meaning m on m.id=p.meaning_id
    where e.vacancy_id=$1 and e.type='job_position'
    group by e.vacancy_id
),
field_experience as (
    select array_agg(json_build_object(
        'minimumYears', e.minimum_years,
        'isRequired', e.is_required,
        'data', e.data,
        'position', m.text
    )) field_experience
        from vacancy_experience e
        join meaning_pivot p on p.left_id=e.id and p.type='vacancy_experience_field'
        join meaning m on m.id=p.meaning_id
    where e.vacancy_id=$1 and e.type='field'
    group by e.vacancy_id
),
education as (
    select array_agg(json_build_object(
        'isRequired', e.is_required,
        'requiredDegree', e.required_degree,
        'study', m.text
    )) education
        from vacancy_education e
        join meaning_pivot p on p.left_id=e.id and p.type='vacancy_study'
        join meaning m on m.id=p.meaning_id
    where e.vacancy_id=$1
    group by e.vacancy_id
),
details as (
    select
        v.id id, v.company_name companyName, v.data data,
        json_build_object(
            'city', v.location_city,
            'countryCode', v.location_country_code,
            'countryName', v.data->>'locationCountryName'
        ) location,
        json_build_object(
            'isRemoteAllowed', v.is_remote_allowed,
            'isOnSiteAllowed', v.is_onsite_allowed,
            'timeCondition', v.time_condition
        ) terms
    from vacancy v
    where v.id=$1
) select * from details
    left join positions on true
    left join fields on true
    left join languages on true
    left join salary on true
    left join position_experience on true
    left join field_experience on true
    left join education on true
    left join skills on true
    left join specific_tools on true
    left join general_tools on true
`, [jdId])

    return result.rows.at(0) ?? null
}
