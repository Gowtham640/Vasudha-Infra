-- USERS
create table public.users (
id uuid not null default gen_random_uuid (),
name text not null,
email text not null,
role text null default 'user',
created_at timestamp without time zone null default now(),
constraint users_pkey primary key (id),
constraint users_email_key unique (email),
constraint users_id_fkey foreign KEY (id) references auth.users (id)
);

-- PROJECTS
create table public.projects (
id uuid not null default gen_random_uuid (),
name text not null,
slug text not null,
description text null,
price numeric null,
status text null default 'available',
address text null,
landmark text null,
map_embed_url text null,
created_at timestamp without time zone null default now(),
constraint projects_pkey primary key (id),
constraint projects_slug_key unique (slug)
);

create index IF not exists projects_slug_idx on public.projects using btree (slug);

-- PROJECT IMAGES
create table public.project_images (
id uuid not null default gen_random_uuid (),
project_id uuid null,
image_path text not null,
order_index integer null default 0,
alt_text text null,
is_cover boolean null default false,
constraint project_images_pkey primary key (id),
constraint project_images_project_id_fkey foreign KEY (project_id) references projects (id) on delete CASCADE
);

-- PAGES
create table public.pages (
id uuid not null default gen_random_uuid (),
slug text not null,
title text not null,
seo_title text null,
seo_description text null,
created_at timestamp without time zone null default now(),
constraint pages_pkey primary key (id),
constraint pages_slug_key unique (slug)
);

create index IF not exists pages_slug_idx on public.pages using btree (slug);

-- SECTIONS
create table public.sections (
id uuid not null default gen_random_uuid (),
page_id uuid null,
type text not null,
data_source_type text null default 'static',
order_index integer not null,
is_visible boolean null default true,
created_at timestamp without time zone null default now(),
constraint sections_pkey primary key (id),
constraint sections_page_id_fkey foreign KEY (page_id) references pages (id) on delete CASCADE
);

create index IF not exists sections_page_id_idx on public.sections using btree (page_id);

-- SECTION CONTENT
create table public.section_content (
id uuid not null default gen_random_uuid (),
section_id uuid null,
content jsonb not null,
constraint section_content_pkey primary key (id),
constraint section_content_section_id_fkey foreign KEY (section_id) references sections (id) on delete CASCADE
);

-- LEADS
create table public.leads (
id uuid not null default gen_random_uuid (),
name text null,
phone text null,
email text null,
message text null,
project_id uuid null,
created_at timestamp without time zone null default now(),
constraint leads_pkey primary key (id),
constraint leads_project_id_fkey foreign KEY (project_id) references projects (id)
);

-- LOGS
create table public.logs (
id uuid not null default gen_random_uuid (),
event text null,
metadata jsonb null,
created_at timestamp without time zone null default now(),
constraint logs_pkey primary key (id)
);

RLS POLICIES:
create policy "Public read pages"
on public.pages for select
using (true);

create policy "Public read sections"
on public.sections for select
using (true);

create policy "Public read section content"
on public.section_content for select
using (true);

create policy "Public read projects"
on public.projects for select
using (true);

create policy "Public read project images"
on public.project_images for select
using (true);

create policy "Public insert leads"
on public.leads for insert
with check (true);

create policy "Admin full access pages"
on public.pages for all
using (public.is_admin());

create policy "Admin full access sections"
on public.sections for all
using (public.is_admin());

create policy "Admin full access section content"
on public.section_content for all
using (public.is_admin());

create policy "Admin full access projects"
on public.projects for all
using (public.is_admin());

create policy "Admin full access project images"
on public.project_images for all
using (public.is_admin());

create policy "Admin read leads"
on public.leads for select
using (public.is_admin());

create policy "Admin full access logs"
on public.logs for all
using (public.is_admin());

create policy "Owner full access users"
on public.users
for all
using (public.is_owner());
