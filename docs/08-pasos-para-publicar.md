# 08 — Pasos para publicarlo

Lo que **yo no puedo hacer** porque necesita tus cuentas y tus claves. Está todo preparado; falta
ejecutarlo.

---

## Hoy mismo: que lo usen sin nada de esto

**No hace falta publicar nada para empezar.** Mandales la carpeta `app/` por WhatsApp, mail o
pendrive y que hagan doble clic en `index.html`.

Limitación: **cada una tiene sus propios datos.** Lo que carga una no lo ve la otra. Para probar
una semana alcanza; para trabajar de verdad, no.

Si quieren compartir mientras tanto, hay un botón para bajar una copia y otro para cargarla.

---

## Paso 1 — Subirlo a GitHub

El repositorio ya está iniciado, con `.gitignore` configurado para que **no suban los datos reales
del hotel**: el Excel y `datos-reales.js` quedan afuera a propósito.

```bash
cd "reporte-diario"
git add .
git commit -m "Reporte diario de ingresos F&B"
```

Después, creás el repo en GitHub **en privado** y:

```bash
git remote add origin https://github.com/TU-USUARIO/reporte-diario.git
git branch -M main
git push -u origin main
```

> **Que sea privado.** Aunque el `.gitignore` deja afuera los datos, es información operativa de un
> hotel. No hay razón para que sea público.

---

## Paso 2 — Publicarlo para que entren desde cualquier lado

La forma más simple, y gratis:

1. Entrar a [vercel.com](https://vercel.com) con la cuenta de GitHub.
2. Importar el repositorio.
3. En *Root Directory* poner **`app`**.
4. Sin comando de build: son archivos sueltos.
5. Deploy.

Queda en una dirección tipo `reporte-diario.vercel.app`. Sirve igual Netlify o GitHub Pages.

**Ojo:** publicado así, cualquiera con el link entra. Los datos siguen guardándose en cada
navegador, así que no se filtra nada — pero antes de conectar Supabase hay que poner el login.

---

## Paso 3 — Supabase

### 3.1 Crear el proyecto

1. [supabase.com](https://supabase.com) → New project.
2. **Región: Sydney** (`ap-southeast-2`). Es donde está el hotel y donde deberían quedar los datos.
3. Guardar la contraseña de la base en un lugar seguro.

### 3.2 Correr el esquema

En el SQL Editor, pegar entero el archivo `supabase/migrations/0001_esquema_inicial.sql`.

Crea las tablas, las políticas de seguridad y los roles. **La seguridad está en la base, no en la
pantalla**: aunque alguien se saltee la aplicación, no puede ver datos de otra propiedad.

Al final del archivo hay dos líneas comentadas para crear la propiedad y las tres áreas.
Descomentalas y cambiá el nombre del hotel antes de correrlas.

### 3.3 Crear los usuarios

En *Authentication → Users*, una por hermana. Después, en el SQL Editor:

```sql
insert into usuarios (id, propiedad_id, nombre, email, rol)
values ('<id-del-usuario>', '<id-de-la-propiedad>', 'Nombre', 'mail@hotel.com', 'gerente');
```

Roles disponibles:

| Rol | Qué puede |
|---|---|
| `gerente` | Todo, incluidos sueldos y metas |
| `carga` | Cargar días y comentarios. **No ve sueldos.** |
| `consulta` | Solo mirar |
| `admin` | Configuración y usuarios |

> El rol `carga` existe para que el turno pueda cargar el reporte sin ver cuánto cobra cada uno.
> Vale la pena usarlo.

### 3.4 Conectar la aplicación

Falta escribir la capa que reemplaza `localStorage` por Supabase. Es el trabajo que sigue: los
cálculos y las pantallas no cambian, solo de dónde salen y adónde van los datos.

Concretamente, cambia solo esto de `js/calculos.js`:

- `guardarTodo()` → escribe en Supabase
- `cargarTodo()` → lee de Supabase
- se agrega login

Todo lo demás queda igual. Está pensado así desde el principio.

---

## Paso 4 — El mail

Ver [07-envio-por-mail.md](07-envio-por-mail.md). Resumen:

1. Cuenta en Resend y verificar el dominio del hotel.
2. `supabase functions deploy enviar-reporte`
3. Cargar los secretos.
4. Empezar con el botón manual. Automatizar recién cuando confíen en los números.

---

## Qué haría yo, en orden

| Cuándo | Qué |
|---|---|
| **Hoy** | Que lo usen desde el archivo. Que carguen los días de esta semana. |
| **Esta semana** | Ver qué molesta al usarlo de verdad. Corregir eso primero. |
| **Semana que viene** | GitHub + Vercel, para que entren desde cualquier computadora. |
| **Cuando ya lo usen todos los días** | Supabase, para compartir datos. |
| **Al final** | El mail automático. |

**El orden importa.** Armar Supabase para algo que después no se usa es trabajo tirado. Primero que
lo usen una semana; si a la segunda semana lo siguen abriendo, ahí vale la pena la infraestructura.

---

## Lo que falta y hay que tener presente

| # | Qué | Cuándo aparece |
|---|---|---|
| 1 | **No hay login.** Publicado en Vercel, entra cualquiera con el link. | Antes de conectar Supabase |
| 2 | **Los datos no se comparten** entre computadoras. | Ya, si lo usan dos personas |
| 3 | **No hay copia de seguridad automática.** Si se borra el navegador, se pierde todo. | Ya — usar el botón de bajar copia |
| 4 | **Los comentarios traen números de habitación.** | Antes de mandarlos por mail |
| 5 | **El costo de personal es parcial**: solo los turnos que se anotan en el reporte. | Ya está avisado en pantalla |
