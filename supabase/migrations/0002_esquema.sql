-- ============================================================================
-- Reporte Diario de Ingresos — esquema
--
-- Pegar ENTERO en el SQL Editor de Supabase y darle Run. Se puede correr más
-- de una vez sin romper nada.
--
-- Regla de oro: la seguridad vive acá, en la base, no en la pantalla. Aunque
-- alguien se saltee la aplicación y pegue la clave en una terminal, RLS no le
-- devuelve una sola fila si no tiene sesión.
--
-- El día se guarda como viene de la aplicación, en jsonb. Postgres consulta
-- JSON perfectamente y así no hay que traducir de ida y de vuelta en cada
-- guardado, que es donde aparecen los errores. Al final del archivo hay una
-- vista que lo desarma en filas, para Excel o Power BI.
-- ============================================================================

-- ---------------------------------------------------------------- propiedad
create table if not exists propiedades (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  moneda       text not null default 'AUD',
  zona_horaria text not null default 'Australia/Sydney',
  creado_en    timestamptz not null default now()
);

-- ----------------------------------------------------------------- usuarios
-- El id es el mismo de auth.users: así RLS puede usar auth.uid() directo.
create table if not exists usuarios (
  id           uuid primary key references auth.users(id) on delete cascade,
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  nombre       text not null,
  email        text not null,
  rol          text not null default 'carga'
               check (rol in ('gerente','carga','consulta','admin')),
  activo       boolean not null default true,
  creado_en    timestamptz not null default now()
);
create index if not exists usuarios_propiedad on usuarios (propiedad_id);

-- -------------------------------------------------------------------- áreas
create table if not exists areas (
  id           uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  nombre       text not null,
  orden        int not null default 0,
  activa       boolean not null default true,
  unique (propiedad_id, nombre)
);

-- --------------------------------------------------------------------- días
-- Un día, una fila. Así dos personas pueden cargar días distintos a la vez
-- sin pisarse.
create table if not exists dias (
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  fecha        date not null,
  areas        jsonb not null default '{}'::jsonb,
  comentarios  jsonb not null default '[]'::jsonb,
  hoja         text,
  origen       text not null default 'manual' check (origen in ('manual','excel')),
  es_evento    boolean,                    -- null = lo decide el sistema
  cargado_por  uuid references usuarios(id),
  editado_en   timestamptz not null default now(),
  primary key (propiedad_id, fecha)
);
create index if not exists dias_fecha on dias (propiedad_id, fecha desc);

-- ------------------------------------------------------------------- turnos
-- Aparte de los días a propósito: quién trabajó se puede ver sin poder ver
-- cuánto cobra, que está en `personas`. Es el motivo de que exista el rol
-- `carga`.
create table if not exists turnos (
  id           uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  fecha        date not null,
  quien        text not null,
  area         text,
  desde        int,
  hasta        int,
  descanso     int not null default 0,
  horas        numeric(5,2),
  editado_en   timestamptz not null default now()
);
create index if not exists turnos_fecha on turnos (propiedad_id, fecha);

-- ----------------------------------------------------------------- personas
-- Acá está la plata. Tabla separada con su propia política.
create table if not exists personas (
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  nombre       text not null,
  equipo       text,
  valor_hora   numeric(8,2),
  casual       boolean not null default false,
  primary key (propiedad_id, nombre)
);

create table if not exists equipos (
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  nombre       text not null,
  valor_hora   numeric(8,2),
  primary key (propiedad_id, nombre)
);

-- ----------------------------------------------------------------- ajustes
-- Metas por área, reglas de pago, destinatarios del mail. Clave-valor para
-- que agregar una configuración nueva no obligue a migrar la base.
create table if not exists ajustes (
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  clave        text not null,
  valor        jsonb not null,
  editado_en   timestamptz not null default now(),
  primary key (propiedad_id, clave)
);

-- ---------------------------------------------------------------- historial
create table if not exists historial (
  id           bigserial primary key,
  propiedad_id uuid not null references propiedades(id) on delete cascade,
  usuario_id   uuid references usuarios(id),
  que          text not null,
  detalle      text,
  cuando       timestamptz not null default now()
);
create index if not exists historial_cuando on historial (propiedad_id, cuando desc);

-- ============================================================================
-- SEGURIDAD
-- ============================================================================

alter table propiedades enable row level security;
alter table usuarios    enable row level security;
alter table areas       enable row level security;
alter table dias        enable row level security;
alter table turnos      enable row level security;
alter table personas    enable row level security;
alter table equipos     enable row level security;
alter table ajustes     enable row level security;
alter table historial   enable row level security;

-- A qué propiedad pertenece quien está preguntando.
create or replace function mi_propiedad() returns uuid
language sql stable security definer set search_path = public as $$
  select propiedad_id from usuarios where id = auth.uid() and activo
$$;

create or replace function mi_rol() returns text
language sql stable security definer set search_path = public as $$
  select rol from usuarios where id = auth.uid() and activo
$$;

-- Quién puede escribir. `consulta` solo mira.
create or replace function puede_escribir() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(mi_rol() in ('gerente','carga','admin'), false)
$$;

-- Quién puede ver y tocar la plata. `carga` no.
create or replace function ve_sueldos() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(mi_rol() in ('gerente','admin'), false)
$$;

-- --------------------------------------------------------------- políticas
-- Todo lo que sigue vale solo dentro de la propia propiedad. Sin sesión,
-- mi_propiedad() devuelve null y ninguna condición se cumple: cero filas.

drop policy if exists p_propiedades on propiedades;
create policy p_propiedades on propiedades for select
  using (id = mi_propiedad());

drop policy if exists p_usuarios on usuarios;
create policy p_usuarios on usuarios for select
  using (propiedad_id = mi_propiedad());

drop policy if exists p_areas_ver on areas;
create policy p_areas_ver on areas for select
  using (propiedad_id = mi_propiedad());
drop policy if exists p_areas_editar on areas;
create policy p_areas_editar on areas for all
  using (propiedad_id = mi_propiedad() and mi_rol() in ('gerente','admin'))
  with check (propiedad_id = mi_propiedad() and mi_rol() in ('gerente','admin'));

drop policy if exists p_dias_ver on dias;
create policy p_dias_ver on dias for select
  using (propiedad_id = mi_propiedad());
drop policy if exists p_dias_editar on dias;
create policy p_dias_editar on dias for all
  using (propiedad_id = mi_propiedad() and puede_escribir())
  with check (propiedad_id = mi_propiedad() and puede_escribir());

drop policy if exists p_turnos_ver on turnos;
create policy p_turnos_ver on turnos for select
  using (propiedad_id = mi_propiedad());
drop policy if exists p_turnos_editar on turnos;
create policy p_turnos_editar on turnos for all
  using (propiedad_id = mi_propiedad() and puede_escribir())
  with check (propiedad_id = mi_propiedad() and puede_escribir());

-- La plata: solo gerente y admin, ni para mirar.
drop policy if exists p_personas on personas;
create policy p_personas on personas for all
  using (propiedad_id = mi_propiedad() and ve_sueldos())
  with check (propiedad_id = mi_propiedad() and ve_sueldos());

drop policy if exists p_equipos on equipos;
create policy p_equipos on equipos for all
  using (propiedad_id = mi_propiedad() and ve_sueldos())
  with check (propiedad_id = mi_propiedad() and ve_sueldos());

-- Ajustes: las metas y las reglas de pago son cosa de gerencia. El resto de
-- la configuración la puede leer cualquiera de la propiedad.
drop policy if exists p_ajustes_ver on ajustes;
create policy p_ajustes_ver on ajustes for select
  using (
    propiedad_id = mi_propiedad()
    and (ve_sueldos() or clave not in ('meta','metaArea','reglasPago','valorHora'))
  );
drop policy if exists p_ajustes_editar on ajustes;
create policy p_ajustes_editar on ajustes for all
  using (propiedad_id = mi_propiedad() and ve_sueldos())
  with check (propiedad_id = mi_propiedad() and ve_sueldos());

drop policy if exists p_historial_ver on historial;
create policy p_historial_ver on historial for select
  using (propiedad_id = mi_propiedad());
drop policy if exists p_historial_escribir on historial;
create policy p_historial_escribir on historial for insert
  with check (propiedad_id = mi_propiedad() and puede_escribir());

-- ============================================================================
-- Para mirar los datos desde afuera (Excel, Power BI, una consulta suelta).
-- Desarma el jsonb en filas, sin que la aplicación tenga que cambiar.
-- ============================================================================
create or replace view v_lineas as
select
  d.propiedad_id,
  d.fecha,
  a.key                                as area,
  s.key                                as servicio,
  (s.value ->> 'Covers')::numeric      as cubiertos,
  (s.value ->> 'Food')::numeric        as comida,
  (s.value ->> 'Beverage')::numeric    as bebida,
  (s.value ->> 'Total')::numeric       as total,
  (s.value ->> 'Discounts')::numeric   as descuentos
from dias d
cross join lateral jsonb_each(d.areas)   as a(key, value)
cross join lateral jsonb_each(a.value)   as s(key, value)
where jsonb_typeof(a.value) = 'object'
  and jsonb_typeof(s.value) = 'object';

-- ============================================================================
-- ARRANQUE — descomentar, cambiar el nombre del hotel y correr una sola vez.
-- ============================================================================

-- insert into propiedades (nombre, moneda, zona_horaria)
-- values ('Nombre del hotel', 'AUD', 'Australia/Sydney')
-- returning id;
--
-- -- con el id de arriba:
-- insert into areas (propiedad_id, nombre, orden) values
--   ('<id>', 'Penny Blue', 1),
--   ('<id>', 'Exchange Lane', 2),
--   ('<id>', 'In Room Dining', 3);
--
-- -- después de crear cada cuenta en Authentication → Users:
-- insert into usuarios (id, propiedad_id, nombre, email, rol)
-- values ('<id-del-usuario>', '<id>', 'Nombre', 'mail@hotel.com', 'gerente');
