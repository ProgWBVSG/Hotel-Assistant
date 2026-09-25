-- ============================================================================
-- Cuentas por rol — cerrar el acceso
--
-- Hasta ahora las tablas tenían una política "abierto" que dejaba entrar a
-- cualquiera. Esto la reemplaza por permisos según el rol de cada usuario.
--
-- CORRER ESTO RECIÉN CUANDO LAS CUENTAS YA ESTÉN CREADAS Y VINCULADAS
-- (ver 0004). Si se corre antes, nadie puede entrar porque nadie tiene rol.
--
-- Roles:
--   gerente  → ve y edita todo, incluidos sueldos y metas
--   carga    → carga días, turnos y comentarios; NO ve sueldos ni metas
--   consulta → solo mira; no edita
--   admin    → como gerente, más administración
-- ============================================================================

-- quitar la política abierta de todas las tablas
do $$
declare t text;
begin
  foreach t in array array['propiedades','usuarios','areas','dias','turnos',
                           'personas','equipos','ajustes','historial']
  loop
    execute format('drop policy if exists abierto on %I', t);
  end loop;
end $$;

-- las funciones de rol ya existen (0002). Por si acaso, se recrean.
create or replace function mi_propiedad() returns uuid
language sql stable security definer set search_path = public as $$
  select propiedad_id from usuarios where id = auth.uid() and activo $$;
create or replace function mi_rol() returns text
language sql stable security definer set search_path = public as $$
  select rol from usuarios where id = auth.uid() and activo $$;
create or replace function puede_escribir() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(mi_rol() in ('gerente','carga','admin'), false) $$;
create or replace function ve_sueldos() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(mi_rol() in ('gerente','admin'), false) $$;

-- ------------------------------------------------------------- políticas ---
drop policy if exists p_propiedades on propiedades;
create policy p_propiedades on propiedades for select using (id = mi_propiedad());

drop policy if exists p_usuarios on usuarios;
create policy p_usuarios on usuarios for select using (propiedad_id = mi_propiedad());

drop policy if exists p_areas_ver on areas;
drop policy if exists p_areas_editar on areas;
create policy p_areas_ver on areas for select using (propiedad_id = mi_propiedad());
create policy p_areas_editar on areas for all
  using (propiedad_id = mi_propiedad() and ve_sueldos())
  with check (propiedad_id = mi_propiedad() and ve_sueldos());

drop policy if exists p_dias_ver on dias;
drop policy if exists p_dias_editar on dias;
create policy p_dias_ver on dias for select using (propiedad_id = mi_propiedad());
create policy p_dias_editar on dias for all
  using (propiedad_id = mi_propiedad() and puede_escribir())
  with check (propiedad_id = mi_propiedad() and puede_escribir());

drop policy if exists p_turnos_ver on turnos;
drop policy if exists p_turnos_editar on turnos;
create policy p_turnos_ver on turnos for select using (propiedad_id = mi_propiedad());
create policy p_turnos_editar on turnos for all
  using (propiedad_id = mi_propiedad() and puede_escribir())
  with check (propiedad_id = mi_propiedad() and puede_escribir());

-- la plata: solo gerente y admin, ni para mirar
drop policy if exists p_personas on personas;
create policy p_personas on personas for all
  using (propiedad_id = mi_propiedad() and ve_sueldos())
  with check (propiedad_id = mi_propiedad() and ve_sueldos());

drop policy if exists p_equipos on equipos;
create policy p_equipos on equipos for all
  using (propiedad_id = mi_propiedad() and ve_sueldos())
  with check (propiedad_id = mi_propiedad() and ve_sueldos());

-- ajustes: las metas, reglas de pago y valor hora son sensibles; el resto
-- (corte de historial, moneda, mail, eventos, marcados, notas) lo ve todo
-- el que pertenece a la propiedad
drop policy if exists p_ajustes_ver on ajustes;
drop policy if exists p_ajustes_editar on ajustes;
create policy p_ajustes_ver on ajustes for select using (
  propiedad_id = mi_propiedad()
  and (ve_sueldos() or clave not in ('meta','metaArea','reglasPago','valorHora','equipos','personas'))
);
create policy p_ajustes_editar on ajustes for all
  using (propiedad_id = mi_propiedad() and (
    ve_sueldos() or (puede_escribir()
      and clave not in ('meta','metaArea','reglasPago','valorHora','equipos','personas'))))
  with check (propiedad_id = mi_propiedad() and (
    ve_sueldos() or (puede_escribir()
      and clave not in ('meta','metaArea','reglasPago','valorHora','equipos','personas'))));

drop policy if exists p_historial_ver on historial;
drop policy if exists p_historial_escribir on historial;
create policy p_historial_ver on historial for select using (propiedad_id = mi_propiedad());
create policy p_historial_escribir on historial for insert
  with check (propiedad_id = mi_propiedad() and puede_escribir());
