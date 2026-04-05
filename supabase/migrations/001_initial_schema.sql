-- Enums
create type hold_type as enum ('jug', 'crimp', 'sloper', 'pinch', 'pocket', 'volume', 'edge');
create type hold_size as enum ('small', 'medium', 'large');
create type hold_status as enum ('pending', 'approved', 'rejected');
create type grade_vote as enum ('much_easier', 'easier', 'as_graded', 'harder', 'much_harder');

-- Gyms
create table gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude double precision,
  longitude double precision
);

-- Holds
create table holds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type hold_type not null,
  size hold_size not null,
  color text not null default '#FFFFFF',
  model_url text,
  submitted_by uuid references auth.users(id) on delete set null,
  status hold_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- Routes
create table routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gym_id uuid references gyms(id) on delete set null,
  grade text not null,
  setter text,
  created_at timestamptz not null default now()
);

-- Route holds (placement of holds on a route)
create table route_holds (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes(id) on delete cascade,
  hold_id uuid not null references holds(id) on delete cascade,
  x_position double precision not null,
  y_position double precision not null,
  z_position double precision not null default 0,
  rotation_x double precision not null default 0,
  rotation_y double precision not null default 0,
  rotation_z double precision not null default 0
);

-- Grade consensus votes
create table route_grade_votes (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote grade_vote not null,
  unique(route_id, user_id)
);

-- Storage bucket for 3D hold models
insert into storage.buckets (id, name, public) values ('hold-models', 'hold-models', true);
