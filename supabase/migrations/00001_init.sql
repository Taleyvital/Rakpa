-- ============================================================
-- Rakpa — Schéma base de données (à exécuter dans le SQL Editor)
-- Tables: itineraires, itineraire_etapes, itineraire_votes
-- Triggers : calcul des votes + validation automatique (>= 5 👍)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Table principals
-- ------------------------------------------------------------
create table public.itineraires (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz not null default now(),
  user_id       uuid references auth.users (id) on delete set null,
  depart        text not null,
  arrivee       text not null,
  commune_depart text,
  commune_arrivee text,
  type_transport text not null
                check (type_transport in ('gbaka','woro-woro','sotra','zemidjan','mixte')),
  prix_min      numeric not null default 0,
  prix_max      numeric not null default 0,
  duree_min     numeric not null default 0,
  duree_max     numeric not null default 0,
  description   text,
  conseil_general text,
  votes_up      integer not null default 0,
  votes_down    integer not null default 0,
  statut        text not null default 'en_attente'
                check (statut in ('en_attente','valide','rejete')),
  nb_etapes     integer not null default 0,
  utilise_count integer not null default 0
);

create index itineraires_statut_idx   on itineraires (statut);
create index itineraires_depart_idx   on itineraires (depart);
create index itineraires_arrivee_idx  on itineraires (arrivee);
create index itineraires_user_idx     on itineraires (user_id);

-- ------------------------------------------------------------
-- 2. Étapes d'un itinéraire
-- ------------------------------------------------------------
create table itineraire_etapes (
  id              uuid primary key default uuid_generate_v4(),
  itineraire_id   uuid not null references itineraires (id) on delete cascade,
  ordre           integer not null default 1,
  type            text not null
                  check (type in ('gbaka','woro-woro','sotra','zemidjan','a_pied','correspondance')),
  point_depart    text not null,
  point_arrivee   text not null,
  instruction     text,
  quoi_dire       text,
  arrets_intermediaires text[] not null default '{}',
  prix            numeric not null default 0,
  duree           numeric not null default 0,
  unique (itineraire_id, ordre)
);

create index etapes_itineraire_idx on itineraire_etapes (itineraire_id);

-- ------------------------------------------------------------
-- 3) Votes
-- ------------------------------------------------------------
create table itineraire_votes (
  itineraire_id uuid not null references itineraires (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  vote          text not null check (vote in ('up','down')),
  created_at    timestamptz not null default now(),
  primary key (itineraire_id, user_id)
);

-- ------------------------------------------------------------
-- 4) Trigger : recalcul des compteurs de votes
-- ------------------------------------------------------------
create or replace function recalculer_votes()
returns trigger
language plpgsql
security definer
as $$
begin
  update itineraires
  set votes_up   = coalesce((select count(*) from itineraire_votes v
                             where v.itineraire_id = itineraires.id and v.vote = 'up'), 0),
      votes_down = coalesce((select count(*) from itineraire_votes v
                       where v.itineraire_id = itineraires.id and v.vote = 'down'), 0)
  where id in (
    select distinct coalesce(old.itineraire_id, new.itineraire_id)
  );

  -- Validation automatique des itinéraires en attente à partir de 5 votes positifs
  update itineraires
  set statut = 'valide'
  where statut = 'en_attente'
    and votes_up >= 5;

  return null;
end;
$$;

drop trigger if exists trg_recalculer_votes on itineraire_votes;
create trigger trg_recalculer_votes
after insert or update or delete on itineraire_votes
for each row execute function recalculer_votes();

-- ------------------------------------------------------------
-- 5) Row Level Security
-- ------------------------------------------------------------
alter table itineraires      enable row level security;
alter table itineraire_etapes enable row level security;
alter table itineraire_votes enable row level security;

-- itinéraires : lecture publique, insertion connectée, modif pro/administrateur
create policy "Lecture publique des itinéraires"
  on itineraires for select using (true);

create policy "Insertion d'un itinéraire par un utilisateur connecté"
  on itineraires for insert to authenticated
  with check (auth.uid() = user_id);

-- anything else : lecture/insertion/suppression des votes par connecté
create policy "Lecture des étapes"
  on itineraire_etapes for select using (true);

create policy "Insertion des étapes par le créateur"
  on itineraire_etapes for insert to authenticated
  with check (
    exists (
      select 1 from itineraires i
      where i.id = itineraire_etapes.itineraire_id and i.user_id = auth.uid()
    )
  );

create policy "Lecture publique des votes"
  on itineraire_votes for select using (true);

create policy "Insertion / mise à jour de son vote"
  on itineraire_votes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Suppression de son vote"
  on itineraire_votes for delete to authenticated
  using (user_id = auth.uid());