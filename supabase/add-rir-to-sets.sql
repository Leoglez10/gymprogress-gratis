-- Migration: add RIR to sets and constraints for RPE
alter table public.sets
  add column if not exists rir integer check (rir >= 0 and rir <= 10);

-- RPE should be 1-10 (allow decimals like 7.5 if numeric)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sets_rpe_range'
      and conrelid = 'public.sets'::regclass
  ) then
    alter table public.sets
      add constraint sets_rpe_range
      check (rpe is null or (rpe >= 1 and rpe <= 10));
  end if;
end $$;

-- Optional: index for faster per-entry queries
create index if not exists idx_sets_entry_id on public.sets(entry_id);

-- Optional: maintain set_number >= 1
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sets_set_number_min'
      and conrelid = 'public.sets'::regclass
  ) then
    alter table public.sets
      add constraint sets_set_number_min check (set_number >= 1);
  end if;
end $$;
