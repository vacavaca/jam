import { getPgPool } from "./pg.ts"
import { shortenName } from "./util.ts"

export async function prepareSearchPageForJob(jobId: number, limit: number = 10, offset: number = 0) {
    const pg = getPgPool()

    const result = await pg.query(
        `
with
  position_score as (select
      v.id v, r.id r,
      case when count(mv.id) > 0 then count(mr.id)::float / count(mv.id)::float else 1.0 end score,
      count(mr.id) rcount,  count(mv.id) vcount
    from vacancy v
      left join resume r on true
      left join meaning_pivot pv on pv.type='vacancy_job_position' and pv.left_id=v.id
      left join meaning mv on mv.id=pv.meaning_id
      left join meaning mr on mr.id=(
        select mr.id from meaning mr
          join meaning_pivot pr on pr.type='resume_desired_position' and pr.meaning_id=mr.id
          where pr.left_id=r.id and (mr.id=mv.id or mr.embedding <=> mv.embedding < 0.2)
          limit 1
      )
      group by v.id, r.id
      order by v.id, r.id asc
  ),
  skill_score as (select
      v.id v, r.id r,
      case when count(mv.id) > 0 then count(mr.id)::float / count(mv.id)::float else 1.0 end score,
      count(mr.id) rcount,  count(mv.id) vcount
    from vacancy v
      left join resume r on true
      left join meaning_pivot pv on pv.type='vacancy_skill' and pv.left_id=v.id
      left join meaning mv on mv.id=pv.meaning_id
      left join meaning mr on mr.id=(
        select mr.id from meaning mr
          join meaning_pivot pr on pr.type='resume_skill' and pr.meaning_id=mr.id
          where pr.left_id=r.id and (mr.id=mv.id or mr.embedding <=> mv.embedding < 0.4)
          limit 1
      )
      group by v.id, r.id
      order by v.id, r.id asc
  ),
  general_tool_score as (select
      v.id v, r.id r,
      case when count(mv.id) > 0 then count(mr.id)::float / count(mv.id)::float else 1.0 end score,
      count(mr.id) rcount,  count(mv.id) vcount
    from vacancy v
      left join resume r on true
      left join meaning_pivot pv on pv.type='vacancy_general_tool' and pv.left_id=v.id
      left join meaning mv on mv.id=pv.meaning_id
      left join meaning mr on mr.id=(
        select mr.id from meaning mr
          join meaning_pivot pr on pr.type='resume_general_tool' and pr.meaning_id=mr.id
          where pr.left_id=r.id and (mr.id=mv.id or mr.embedding <=> mv.embedding < 0.2)
          limit 1
      )
      group by v.id, r.id
      order by v.id, r.id asc
  ),
  specific_tool_score as (select
      v.id v, r.id r,
      case when count(mv.id) > 0 then count(mr.id)::float / count(mv.id)::float else 1.0 end score,
      count(mr.id) rcount,  count(mv.id) vcount
    from vacancy v
      left join resume r on true
      left join meaning_pivot pv on pv.type='vacancy_specific_tool' and pv.left_id=v.id
      left join meaning mv on mv.id=pv.meaning_id
      left join meaning mr on mr.id=(
        select mr.id from meaning mr
          join meaning_pivot pr on pr.type='resume_specific_tool' and pr.meaning_id=mr.id
          where pr.left_id=r.id and (mr.id=mv.id or mr.embedding <=> mv.embedding < 0.2)
          limit 1
      )
      group by v.id, r.id
      order by v.id, r.id asc
  ),
  experience as (
    select e.resume_id rid, array_agg(json_build_object(
        'position', m.text,
        'yearLeft', e.year_left
    )) experience
    from resume_experience e
    join meaning_pivot p on p.left_id=e.id and p.type='resume_experience_job_position'
    join meaning m on m.id=p.meaning_id
    where e.type='job_position'
    group by e.resume_id
)
select ps.v, ps.r, r.full_name full_name, vl.language vl, rl.language rl,
        ps.score pos_score, sk.score skill_score, gt.score gen_tool_score, st.score spec_tool_score,
        (sk.score + gt.score + st.score) / 3 total_score, e.experience,
        mr.text position, r.data data
  from position_score ps
  join skill_score sk on sk.v=ps.v and sk.r=ps.r
  join general_tool_score gt on gt.v=ps.v and gt.r=ps.r
  join specific_tool_score st on st.v=ps.v and st.r=ps.r
  join resume r on r.id=ps.r
  left join experience e on e.rid=r.id
  join meaning mr on mr.id=(
    select mr.id from meaning_pivot pr join meaning mr on mr.id=pr.meaning_id where  pr.type='resume_desired_position' and pr.left_id=r.id limit 1
  )
  join vacancy v on v.id=ps.v
  join resume_language rl on rl.resume_id=r.id and rl.level in ('cv', 'native', 'fluent', 'c1', 'c2')
  join vacancy_language vl on vl.vacancy_id=v.id and vl.level in ('jd', 'native', 'fluent', 'c1', 'c2') and vl.language=rl.language
  where
    ps.v=$1::int8
    and ps.score >= 0.5
    and (
        v.is_remote_allowed
        or (
            (
                v.location_country_code is NULL or r.location_country_code is NULL
                or v.location_country_code=r.location_country_code
            ) and (
                v.location_country_code is NULL or r.location_country_code is NULL
                or v.location_city is NULL or r.location_city is NULL
                or v.location_city=r.location_city
            )
        )
    )
    order by (sk.score + gt.score + st.score) desc limit $2 offset $3
`,
        [jobId, limit, offset],
    )

    return result.rows.map(v => ({
        resumeId: v.r,
        fullName: shortenName(v.full_name),
        experience: v.experience,
        position: v.position,
        summary: v.data?.summary,
        positionScore: v.pos_score * 100,
        skillScore: v.skill_score * 100,
        generalToolScore: v.gen_tool_score * 100,
        specificToolScore: v.spec_tool_score * 100,
        totalScore: v.total_score * 100
    }))
}


export async function prepareSearchPageForResume(cvId: number, limit: number = 10, offset: number = 0) {
    const pg = getPgPool()

    const result = await pg.query(
        `
with
  position_score as (select
      v.id v, r.id r,
      case when count(mv.id) > 0 then count(mr.id)::float / count(mv.id)::float else 1.0 end score,
      count(mr.id) rcount,  count(mv.id) vcount
    from vacancy v
      left join resume r on true
      left join meaning_pivot pv on pv.type='vacancy_job_position' and pv.left_id=v.id
      left join meaning mv on mv.id=pv.meaning_id
      left join meaning mr on mr.id=(
        select mr.id from meaning mr
          join meaning_pivot pr on pr.type='resume_desired_position' and pr.meaning_id=mr.id
          where pr.left_id=r.id and (mr.id=mv.id or mr.embedding <=> mv.embedding < 0.2)
          limit 1
      )
      group by v.id, r.id
      order by v.id, r.id asc
  ),
  skill_score as (select
      v.id v, r.id r,
      case when count(mv.id) > 0 then count(mr.id)::float / count(mv.id)::float else 1.0 end score,
      count(mr.id) rcount,  count(mv.id) vcount
    from vacancy v
      left join resume r on true
      left join meaning_pivot pv on pv.type='vacancy_skill' and pv.left_id=v.id
      left join meaning mv on mv.id=pv.meaning_id
      left join meaning mr on mr.id=(
        select mr.id from meaning mr
          join meaning_pivot pr on pr.type='resume_skill' and pr.meaning_id=mr.id
          where pr.left_id=r.id and (mr.id=mv.id or mr.embedding <=> mv.embedding < 0.4)
          limit 1
      )
      group by v.id, r.id
      order by v.id, r.id asc
  ),
  general_tool_score as (select
      v.id v, r.id r,
      case when count(mv.id) > 0 then count(mr.id)::float / count(mv.id)::float else 1.0 end score,
      count(mr.id) rcount,  count(mv.id) vcount
    from vacancy v
      left join resume r on true
      left join meaning_pivot pv on pv.type='vacancy_general_tool' and pv.left_id=v.id
      left join meaning mv on mv.id=pv.meaning_id
      left join meaning mr on mr.id=(
        select mr.id from meaning mr
          join meaning_pivot pr on pr.type='resume_general_tool' and pr.meaning_id=mr.id
          where pr.left_id=r.id and (mr.id=mv.id or mr.embedding <=> mv.embedding < 0.2)
          limit 1
      )
      group by v.id, r.id
      order by v.id, r.id asc
  ),
  specific_tool_score as (select
      v.id v, r.id r,
      case when count(mv.id) > 0 then count(mr.id)::float / count(mv.id)::float else 1.0 end score,
      count(mr.id) rcount,  count(mv.id) vcount
    from vacancy v
      left join resume r on true
      left join meaning_pivot pv on pv.type='vacancy_specific_tool' and pv.left_id=v.id
      left join meaning mv on mv.id=pv.meaning_id
      left join meaning mr on mr.id=(
        select mr.id from meaning mr
          join meaning_pivot pr on pr.type='resume_specific_tool' and pr.meaning_id=mr.id
          where pr.left_id=r.id and (mr.id=mv.id or mr.embedding <=> mv.embedding < 0.2)
          limit 1
      )
      group by v.id, r.id
      order by v.id, r.id asc
  )
select ps.v "vacancyId", ps.r "resumeId", v.company_name "companyName", vl.language vacancyLanguage, rl.language resumeLanguage,
        ps.score * 100 "positionScore", sk.score * 100 "skillScore", gt.score * 100 "generalToolScore", st.score * 100 "specificToolScore",
        (sk.score + gt.score + st.score) * 100 / 3 "totalScore",
        mv.text position, v.data data
  from position_score ps
  join skill_score sk on sk.v=ps.v and sk.r=ps.r
  join general_tool_score gt on gt.v=ps.v and gt.r=ps.r
  join specific_tool_score st on st.v=ps.v and st.r=ps.r
  join resume r on r.id=ps.r
  join vacancy v on v.id=ps.v
  join meaning mv on mv.id=(
    select mv.id from meaning_pivot pr join meaning mv on mv.id=pr.meaning_id where  pr.type='vacancy_job_position' and pr.left_id=v.id limit 1
  )
  join resume_language rl on rl.resume_id=r.id and rl.level in ('cv', 'native', 'fluent', 'c1', 'c2')
  join vacancy_language vl on vl.vacancy_id=v.id and vl.level in ('jd', 'native', 'fluent', 'c1', 'c2') and vl.language=rl.language
  where
    ps.r=$1::int8
    and ps.score >= 0.5
    and (
        v.is_remote_allowed
        or (
            (
                v.location_country_code is NULL or r.location_country_code is NULL
                or v.location_country_code=r.location_country_code
            ) and (
                v.location_country_code is NULL or r.location_country_code is NULL
                or v.location_city is NULL or r.location_city is NULL
                or v.location_city=r.location_city
            )
        )
    )
    order by (sk.score + gt.score + st.score) desc limit $2 offset $3
`,
        [cvId, limit, offset],
    )

    return result.rows
}

