-- ============================================================================
-- Reporte Diario de Ingresos — esquema inicial
--
-- Este archivo NO fue ejecutado todavía. Es el punto de partida para cuando
-- se cree el proyecto de Supabase.
--
-- Regla de oro: la seguridad vive acá, en la base, no en la pantalla.
-- Aunque alguien se saltee la aplicación, RLS no le devuelve filas ajenas.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- propiedad
create table propiedades (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  moneda       text not null default 'AUD',
  idioma       text not null default 'es',
  zona_horaria text not null default 'Australia/Sydney',
  creado_en    timestamptz not null default now()
);

-- ------------------------------------------------------------------ usuarios
-- El id es el mismo de auth.users: así RLS puede usar auth.uid() directo.
create table usuarios (
  id           uuid primary key references auth.users(id) on delete cascade,
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  nombre       text not null,
  email        text not null,
  rol          text not null default 'carga'
               check (rol in ('gerente','carga','consulta','admin')),
  activo       boolean not null default true,
  creado_en    timestamptz not null default now()
);
create index on usuarios (propiedad_id);

-- --------------------------------------------------------------------- áreas
create table areas (
  id           uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  nombre       text not null,
  orden        int  not null default 0,
  activa       boolean not null default true,
  unique (propiedad_id, nombre)
);

-- ---------------------------------------------------------------------- días
create table dias (
  id           uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  fecha        date not null,
  origen       text not null default 'manual' check (origen in ('manual','excel')),
  hoja         text,
  es_evento    boolean,                      -- null = lo decide el sistema
  incompleto   boolean not null default false,
  cargado_por  uuid references usuarios(id),
  creado_en    timestamptz not null default now(),
  editado_en   timestamptz not null default now(),
  unique (propiedad_id, fecha)                -- un día, una fila
);
create index on dias (propiedad_id, fecha desc);

-- ------------------------------------------------------------------ importes
-- Una fila por área × servicio × métrica. Formato largo: agregar una métrica
-- nueva no obliga a cambiar el esquema.
create table lineas (
  id        uuid primary key default gen_random_uuid(),
  dia_id    uuid not null references dias(id) on delete cascade,
  area_id   uuid not null references areas(id),
  servicio  text not null,                    -- Breakfast, Lunch, Dinner, Overnight, All Day
  metrica   text not null,                    -- Covers, Food, Beverage, Total, AV Check, ...
  valor     numeric(12,2) not null,
  unique (dia_id, area_id, servicio, metrica)
);
create index on lineas (dia_id);

-- --------------------------------------------------------------- comentarios
create table comentarios (
  id        uuid primary key default gen_random_uuid(),
  dia_id    uuid not null references dias(id) on delete cascade,
  area_id   uuid references areas(id),        -- null = comentario general
  texto     text not null,
  importante boolean not null default false,
  creado_en timestamptz not null default now()
);
create index on comentarios (dia_id);

-- --------------------------------------------------------- equipos y personas
create table equipos (
  id           uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  nombre       text not null,
  valor_hora   numeric(8,2) not null default 0,
  unique (propiedad_id, nombre)
);

create table personas (
  id           uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  nombre       text not null,
  equipo_id    uuid references equipos(id) on delete set null,
  valor_hora   numeric(8,2),                  -- null = usa el del equipo
  activa       boolean not null default true,
  unique (propiedad_id, nombre)
);

-- ------------------------------------------------------------------- turnos
create table turnos (
  id         uuid primary key default gen_random_uuid(),
  dia_id     uuid not null references dias(id) on delete cascade,
  persona_id uuid references personas(id),
  nombre     text not null,                   -- se guarda igual, por si la persona se borra
  area_id    uuid references areas(id),
  desde_min  int not null,                    -- minutos desde medianoche
  hasta_min  int not null,                    -- puede pasar de 1440 si cruza el día
  descanso   int not null default 0,
  horas      numeric(5,2) not null
);
create index on turnos (dia_id);

-- -------------------------------------------------------------- metas y notas
create table metas (
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  periodo      text not null,                 -- '2026-08'
  monto        numeric(12,2) not null,
  eventos_previstos int,
  primary key (propiedad_id, periodo)
);

create table notas_personal (
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  fecha        date not null,
  texto        text not null,
  primary key (propiedad_id, fecha)
);

-- ------------------------------------------------------- proyecciones guardadas
-- Se guarda lo que se proyectó cada día. Al cerrar el mes se compara contra
-- lo real: recién ahí se puede decir cuánto suele equivocarse.
create table proyecciones (
  id           uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  periodo      text not null,
  calculada_el date not null,
  dias_cargados int not null,
  base         numeric(12,2) not null,
  piso         numeric(12,2),
  techo        numeric(12,2),
  meta         numeric(12,2),
  unique (propiedad_id, periodo, calculada_el)
);

-- ------------------------------------------------------------------ auditoría
create table auditoria (
  id           bigserial primary key,
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  usuario_id   uuid references usuarios(id),
  accion       text not null,
  entidad      text,
  entidad_id   uuid,
  detalle      jsonb,
  cuando       timestamptz not null default now()
);
create index on auditoria (propiedad_id, cuando desc);

-- ------------------------------------------------------------ envíos de mail
create table envios (
  id           uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  fecha        date not null,
  destinatarios text[] not null,
  estado       text not null default 'pendiente'
               check (estado in ('pendiente','enviado','error')),
  error        text,
  enviado_en   timestamptz,
  creado_en    timestamptz not null default now()
);

-- ============================================================================
-- SEGURIDAD
-- ============================================================================

alter table propiedades    enable row level security;
alter table usuarios       enable row level security;
alter table areas          enable row level security;
alter table dias           enable row level security;
alter table lineas         enable row level security;
alter table comentarios    enable row level security;
alter table equipos        enable row level security;
alter table personas       enable row level security;
alter table turnos         enable row level security;
alter table metas          enable row level security;
alter table notas_personal enable row level security;
alter table proyecciones   enable row level security;
alter table auditoria      enable row level security;
alter table envios         enable row level security;

-- A qué propiedad pertenece quien está preguntando.
create or replace function mi_propiedad()
returns uuid language sql stable security definer set search_path = public as $$
  select propiedad_id from usuarios where id = auth.uid() and activo
$$;

create or replace function mi_rol()
returns text language sql stable security definer set search_path = public as $$
  select rol from usuarios where id = auth.uid() and activo
$$;

create or replace function puede_escribir()
returns boolean language sql stable as $$
  select mi_rol() in ('gerente','carga','admin')
$$;

-- Cada quien ve solo su propiedad.
create policy ver_propiedad on propiedades for select using (id = mi_propiedad());
create policy ver_usuarios  on usuarios    for select using (propiedad_id = mi_propiedad());
create policy ver_areas     on areas       for select using (propiedad_id = mi_propiedad());
create policy ver_dias      on dias        for select using (propiedad_id = mi_propiedad());
create policy ver_equipos   on equipos     for select using (propiedad_id = mi_propiedad());
create policy ver_personas  on personas    for select using (propiedad_id = mi_propiedad());
create policy ver_metas     on metas       for select using (propiedad_id = mi_propiedad());
create policy ver_notas     on notas_personal for select using (propiedad_id = mi_propiedad());
create policy ver_proy      on proyecciones for select using (propiedad_id = mi_propiedad());
create policy ver_envios    on envios      for select using (propiedad_id = mi_propiedad());

-- Las tablas que cuelgan de un día heredan el permiso del día.
create policy ver_lineas on lineas for select using (
  exists (select 1 from dias d where d.id = lineas.dia_id and d.propiedad_id = mi_propiedad()));
create policy ver_coment on comentarios for select using (
  exists (select 1 from dias d where d.id = comentarios.dia_id and d.propiedad_id = mi_propiedad()));
create policy ver_turnos on turnos for select using (
  exists (select 1 from dias d where d.id = turnos.dia_id and d.propiedad_id = mi_propiedad()));

-- Escritura: solo gerente, carga y admin.
create policy esc_dias   on dias   for all using (propiedad_id = mi_propiedad() and puede_escribir())
                                   with check (propiedad_id = mi_propiedad() and puede_escribir());
create policy esc_lineas on lineas for all using (
  exists (select 1 from dias d where d.id = lineas.dia_id and d.propiedad_id = mi_propiedad()) and puede_escribir())
  with check (exists (select 1 from dias d where d.id = lineas.dia_id and d.propiedad_id = mi_propiedad()) and puede_escribir());
create policy esc_coment on comentarios for all using (
  exists (select 1 from dias d where d.id = comentarios.dia_id and d.propiedad_id = mi_propiedad()) and puede_escribir())
  with check (exists (select 1 from dias d where d.id = comentarios.dia_id and d.propiedad_id = mi_propiedad()) and puede_escribir());
create policy esc_turnos on turnos for all using (
  exists (select 1 from dias d where d.id = turnos.dia_id and d.propiedad_id = mi_propiedad()) and puede_escribir())
  with check (exists (select 1 from dias d where d.id = turnos.dia_id and d.propiedad_id = mi_propiedad()) and puede_escribir());

-- Sueldos: solo gerente y admin. Un usuario de carga no ve cuánto cobra nadie.
create policy esc_equipos on equipos for all
  using (propiedad_id = mi_propiedad() and mi_rol() in ('gerente','admin'))
  with check (propiedad_id = mi_propiedad() and mi_rol() in ('gerente','admin'));
create policy esc_personas on personas for all
  using (propiedad_id = mi_propiedad() and mi_rol() in ('gerente','admin'))
  with check (propiedad_id = mi_propiedad() and mi_rol() in ('gerente','admin'));
create policy esc_metas on metas for all
  using (propiedad_id = mi_propiedad() and mi_rol() in ('gerente','admin'))
  with check (propiedad_id = mi_propiedad() and mi_rol() in ('gerente','admin'));

-- La auditoría se escribe, no se toca. Nadie puede borrarla ni editarla.
create policy ver_auditoria on auditoria for select
  using (propiedad_id = mi_propiedad() and mi_rol() in ('gerente','admin'));
create policy ins_auditoria on auditoria for insert
  with check (propiedad_id = mi_propiedad());

-- ============================================================================
-- Semilla mínima. Reemplazar el nombre antes de correrlo.
-- ============================================================================
-- insert into propiedades (nombre) values ('Hotel — F&B');
-- insert into areas (propiedad_id, nombre, orden)
-- select id, x.nombre, x.orden from propiedades,
--   (values ('Penny Blue',1), ('Exchange Lane',2), ('In Room Dining',3)) as x(nombre,orden);
