-- ============================================================================
-- Vincular cada cuenta al hotel y darle su rol
--
-- Primero se crea la cuenta en el panel (Authentication → Users → Add user,
-- con "Auto Confirm User" tildado). Después se corre esto, una vez por
-- persona: busca la cuenta por su mail y la deja vinculada con su rol.
--
-- Solo hay que cambiar el mail y el rol de cada línea. El id del hotel ya es
-- el que usa el sistema. Se puede correr las veces que haga falta.
--
-- Roles: 'gerente' | 'carga' | 'consulta' | 'admin'
-- ============================================================================

do $$
declare
  v_hotel uuid := '00000000-0000-0000-0000-000000000001';
  v_uid   uuid;

  -- >>> una línea por persona: (mail de la cuenta, nombre, rol) <<<
  gente record;
begin
  for gente in
    select * from (values
      ('mail-de-tu-hermana@ejemplo.com', 'Nombre de tu hermana', 'gerente'),
      ('mail-de-la-otra@ejemplo.com',    'La otra hermana',      'gerente')
      -- ('mail-del-turno@ejemplo.com',  'Quien carga el turno', 'carga')
    ) as t(email, nombre, rol)
  loop
    select id into v_uid from auth.users where email = gente.email;
    if v_uid is null then
      raise notice 'FALTA crear la cuenta %  (creala en Authentication -> Users)', gente.email;
    else
      insert into usuarios (id, propiedad_id, nombre, email, rol)
      values (v_uid, v_hotel, gente.nombre, gente.email, gente.rol)
      on conflict (id) do update
        set propiedad_id = excluded.propiedad_id,
            nombre = excluded.nombre,
            rol = excluded.rol,
            activo = true;
      raise notice 'OK  %  ->  %', gente.email, gente.rol;
    end if;
  end loop;
end $$;

-- comprobar cómo quedó:
-- select email, rol from usuarios order by rol, email;
