## TODO

- resume experience dates to sort
- resume remote and terms
- in frontend make everything optional in vacancy and resume to not fail when there is no data



### Queries

```sql
-- for a resume and vacancy, get the score of skills match v2
select v.id v, r.id r, count(mr.id)::float / count(mv.id)::float score, count(mr.id) rcount,  count(mv.id) vcount
  from vacancy v
    join meaning_pivot pv on pv.type='vacancy_skill' and pv.left_id=v.id
    join meaning mv on mv.id=pv.meaning_id
    join resume r on r.id IN (1, 2, 3)
    left join meaning mr on mr.id=(
      select mr.id from meaning mr
        join meaning_pivot pr on pr.type='resume_skill' and pr.meaning_id=mr.id
        where pr.left_id=r.id and (mr.id=mv.id or mr.embedding <=> mv.embedding < 0.4)
        limit 1
    )
    where v.id=2
    group by v.id, r.id
    order by v.id, r.id asc;
```


All flat scores
```sql
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
select ps.v, ps.r,
       ps.score pos_score, sk.score sk_score, gt.score gtool_score, st.score stool_score,
       (sk.score + gt.score + st.score) / 3 match_score
  from position_score ps
  join skill_score sk on sk.v=ps.v and sk.r=ps.r
  join general_tool_score gt on gt.v=ps.v and gt.r=ps.r
  join specific_tool_score st on st.v=ps.v and st.r=ps.r
  where ps.score >= 0.5
```
