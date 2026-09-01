# Conectar Supabase

Hoy cada navegador guarda lo suyo y nadie ve lo del otro. Este es el plan para que los días vivan
en un solo lugar, con cuentas, permisos y respaldo — sin romper lo que ya funciona.

---

## Qué cambia y qué no

El sistema guarda todo en `localStorage`: el navegador de esa computadora, y nada más. Si una carga
el martes desde la recepción y la otra abre el sistema desde su casa, ven cosas distintas. Si
alguien borra los datos del navegador, se perdió el mes.

Supabase es una base de datos Postgres con cuentas y permisos ya resueltos. El sistema va a seguir
funcionando exactamente igual, pero además manda cada cambio a esa base y lo trae al abrir.

**No va a depender de internet.** Se hace *local primero*: cargar el día sigue escribiendo en el
navegador al instante, y la base se actualiza atrás. Si se cae el wifi, se sigue cargando y cuando
vuelve la conexión se sincroniza solo. Un sistema que se cuelga sin internet no sirve en un hotel.

---

## Tres cosas antes de empezar

### 1. La región va en Sídney

Al crear el proyecto hay que elegir `ap-southeast-2 (Sydney)`. Es donde está el hotel: los datos
quedan en Australia y el sistema responde más rápido. **No se puede cambiar después** sin migrar
todo el proyecto.

### 2. El repositorio es público — y está bien, si se hace bien

Para conectar hacen falta dos datos: la dirección del proyecto y la `anon key`. Esa clave **es
pública por diseño**: viaja al navegador de cualquiera que abra el sistema, así que esconderla en
el repositorio no protege nada.

Lo que protege son dos cosas: las **políticas RLS** en la base (sin sesión válida, la consulta
devuelve cero filas) y **apagar el registro público**, para que nadie se cree una cuenta solo.

Lo que **nunca** puede tocar el repositorio ni el navegador es la `service_role key`: esa se saltea
todos los permisos.

### 3. Las contraseñas las pone el dueño del proyecto

No van pedidas ni escritas en ningún archivo. Las cuentas se crean desde el panel de Supabase.

---

## Paso 1 — Crear el proyecto *(vos, 10 min)*

1. [supabase.com](https://supabase.com) → crear la cuenta.
2. *New project*. Nombre: `reporte-diario`.
3. **Region: Sydney (ap-southeast-2)**.
4. Contraseña de base de datos → guardarla en el gestor de contraseñas.
5. Plan gratuito. Para tres áreas y un día por jornada sobra.

Después: *Project Settings → API* y copiar la **Project URL** y la clave **anon public**.

---

## Paso 2 — Ajustar el esquema *(código)*

En `supabase/migrations/0001_esquema_inicial.sql` ya hay un esquema con propiedades, usuarios,
roles y RLS. Nunca se ejecutó, y le falta lo que se agregó después: metas por área, reglas de pago
y quién es casual.

### La decisión de fondo: cómo se guarda un día

El esquema actual desarma cada día en filas sueltas (una por área × servicio × métrica). Es la
forma «de manual» y es cómoda para consultar. El problema es que la aplicación tiene los días en
otra forma, así que habría que traducir de ida y de vuelta en cada guardado — y ahí aparecen los
errores.

**Recomendación: guardar el día como viene, en columnas `jsonb`.** Postgres consulta JSON
perfectamente, la traducción desaparece y el código a escribir se reduce a la mitad. Si más
adelante quieren mirar los datos con Excel o Power BI, se arma una vista SQL que los desarme.

```sql
-- un día, una fila
create table dias (
  propiedad_id  uuid not null references propiedades(id),
  fecha         date not null,
  areas         jsonb not null default '{}',   -- ingresos por área y servicio
  comentarios   jsonb not null default '[]',
  hoja          text,
  origen        text default 'manual',
  cargado_por   uuid references usuarios(id),
  editado_en    timestamptz default now(),
  primary key (propiedad_id, fecha)
);

-- los turnos van aparte: quién trabajó se puede ver
-- sin poder ver cuánto cobra, que está en otra tabla
create table turnos (
  id           uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null,
  fecha        date not null,
  quien        text not null,
  area         text,
  desde        int, hasta int, descanso int, horas numeric(5,2)
);

-- configuración: metas por área, reglas de pago, equipos
create table ajustes (
  propiedad_id uuid not null references propiedades(id),
  clave        text not null,      -- 'metaArea', 'reglasPago', ...
  valor        jsonb not null,
  editado_en   timestamptz default now(),
  primary key (propiedad_id, clave)
);
```

> **Por qué los turnos y los sueldos van separados.** Así el rol `carga` puede anotar quién trabajó
> y en qué horario, sin acceso a la tabla donde está el valor hora de cada persona. Es el motivo
> entero de que existan los roles.

---

## Paso 3 — Correr el esquema *(vos, 5 min)*

*SQL Editor → New query*. Pegar el archivo entero y *Run*. Crea las tablas, las políticas de
seguridad y las funciones de permisos.

Después, en otra consulta, crear el hotel y sus áreas:

```sql
insert into propiedades (nombre, moneda, zona_horaria)
values ('Nombre del hotel', 'AUD', 'Australia/Sydney')
returning id;
-- guardar el id que devuelve: se usa en el paso 4

insert into areas (propiedad_id, nombre, orden) values
  ('<id-de-arriba>', 'Penny Blue', 1),
  ('<id-de-arriba>', 'Exchange Lane', 2),
  ('<id-de-arriba>', 'In Room Dining', 3);
```

---

## Paso 4 — Las cuentas y los permisos *(vos, 10 min)*

*Authentication → Users → Add user*, una cuenta por persona. Marcar *Auto Confirm User*.

Crear la cuenta no alcanza: hay que decirle a la base a qué hotel pertenece y con qué rol.

```sql
insert into usuarios (id, propiedad_id, nombre, email, rol)
values ('<id-del-usuario>', '<id-del-hotel>',
        'Nombre', 'mail@hotel.com', 'gerente');
```

| Rol | Qué puede hacer |
|---|---|
| `gerente` | Todo: cargar, ver sueldos, poner metas, mandar el reporte |
| `carga` | Cargar días, turnos y comentarios. **No ve sueldos ni metas.** |
| `consulta` | Solo mirar |
| `admin` | Administrar cuentas y configuración |

---

## Paso 5 — Apagar el registro público *(vos, 2 min)*

**Este es el paso que no se puede saltear.** Supabase viene con el registro abierto: cualquiera con
la dirección del proyecto puede crearse una cuenta, entrar al sistema y ver la facturación.

*Authentication → Sign In / Providers → Email* → desactivar **Enable email signup**. Desde ahí las
cuentas solo se crean desde el panel.

En *Authentication → Policies*, confirmar que **todas** las tablas digan *RLS enabled*.

---

## Paso 6 — Conectar la aplicación *(código)*

### La pantalla de entrada
Mail y contraseña, en los dos idiomas. Sin sesión, el sistema no muestra nada.

### La capa de sincronización
Todo pasa por `guardarTodo()` y `cargarTodo()` en `app/js/calculos.js`. Ahí entra Supabase, y por
eso el resto no se toca: cálculos, pantallas, proyección y reglas de pago quedan igual.

- **Al guardar:** escribe en el navegador (instantáneo) y encola el cambio para la base.
- **Al abrir:** trae lo de la base y lo mezcla con lo local.
- **Si dos personas tocan el mismo día:** gana el cambio más reciente, y queda en el historial quién
  y cuándo. Nada se pisa en silencio.

### Sin librerías
Supabase tiene API REST, así que se conecta con `fetch` normal. El sistema sigue abriendo con doble
clic y sin instalar nada.

```js
fetch(URL + '/rest/v1/dias?select=*', {
  headers: {
    apikey: ANON,
    Authorization: 'Bearer ' + sesion.access_token
  }
})
```

---

## Paso 7 — Probar que la seguridad funciona *(15 min)*

No alcanza con que el sistema ande. Hay que comprobar que **sin sesión no se ve nada**:

```bash
curl "https://TU-PROYECTO.supabase.co/rest/v1/dias?select=*" -H "apikey: TU-ANON-KEY"
```

**Tiene que devolver `[]`.** Una lista vacía significa que RLS está haciendo su trabajo. Si devuelve
los días del hotel, se para todo: hay una tabla sin políticas y hay que arreglarla antes de cargar
un solo dato real.

Después: entrar con una cuenta `carga` y confirmar que la pantalla de sueldos no muestra montos.

---

## Paso 8 — Pasar los datos reales y publicar *(20 min)*

1. Desde la computadora con los días cargados: *Los datos → Bajar una copia*.
2. Entrar al sistema ya conectado y subirlo. Los días viajan a la base.
3. Verificar en Supabase (*Table Editor → dias*) que estén todos.
4. Recién ahí, desde los otros dispositivos, entrar con cada cuenta y confirmar que ven lo mismo.

En Vercel no hay que cambiar nada: la aplicación sigue siendo estática.

> **Los respaldos hay que prenderlos.** El plan gratuito guarda una copia por día y la conserva 7
> días. Es poco para la facturación de un hotel. Conviene el plan Pro (~USD 25/mes) o bajar una
> copia el primero de cada mes desde *Los datos*. Una de las dos, pero alguna.

---

## Lo que hace falta para arrancar

- [ ] La **Project URL** y la **anon key** (paso 1). Nada más: ni la contraseña de la base, ni la `service_role`.
- [ ] El **nombre del hotel** como tiene que figurar en el reporte.
- [ ] Cuántas personas entran y **con qué rol** cada una.
- [ ] Confirmar si va **jsonb** (recomendado) o el esquema desarmado en filas.

---

## Qué se gana

| Hoy | Con Supabase |
|---|---|
| Cada navegador guarda lo suyo | Un solo lugar, todas ven lo mismo |
| Si se borra el navegador, se perdió | Respaldo diario, y copia manual cuando se quiera |
| Cualquiera con el link ve todo | Entra solo quien tiene cuenta |
| No se sabe quién cargó qué | Cada cambio queda con nombre y hora |
| Los sueldos los ve cualquiera que abra | Solo el rol que corresponde |
| Solo desde esa computadora | Desde el teléfono, en el salón |

---

Un consejo de orden: hacer los pasos 1 y 5 el mismo día. Un proyecto de Supabase creado y con el
registro abierto es una puerta sin llave, aunque todavía no haya nada adentro.
