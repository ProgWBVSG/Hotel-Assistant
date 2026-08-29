# Hotel Assistant — Reporte diario de ingresos

Herramienta de control de gestión para el reporte diario de gastronomía de un hotel.
Registra lo vendido cada día por área, arma el acumulado del mes, proyecta el cierre y genera una
presentación de una página para la reunión de la mañana.

> ⚠️ **Este repositorio no contiene datos reales.** Los números, nombres y comentarios que trae son
> generados. Ver [Datos](#datos).

---

## Cómo se usa

Descargar el repositorio y hacer **doble clic en `app/index.html`**. No hay que instalar nada, no
hace falta servidor y funciona sin internet (la tipografía se descarga la primera vez).

Todo se guarda en el navegador de esa computadora. No sale nada a ningún servidor.

---

## Qué hace

| Pantalla | Para qué |
|---|---|
| **Cargar día** | Registrar lo vendido. Solo se tipea cubiertos, comida, bebida y descuentos; el total y el ticket promedio se calculan solos. Los turnos se cargan por área. |
| **Resumen del mes** | Cómo se fue juntando el mes día a día, y un calendario con semáforo contra el objetivo diario. |
| **Día** | El detalle de una jornada, con comparación contra días parecidos. |
| **Proyección** | Cuánto se espera cerrar el mes, con el cálculo a la vista. |
| **Horarios** | En qué franja entra la plata y cuánto rinde cada hora de personal. |
| **Personal** | Horas, costo y dotación día por día. Marca los días donde pudo sobrar o faltar gente. |
| **Presentación** | Una hoja formal para mostrar, imprimible y a PDF. |
| **Comentarios** | Todas las observaciones del turno, juntas y buscables. |
| **Enviar** | Arma el reporte listo para mandar por mail. |
| **Cargar Excel** | Lee el reporte diario en `.xlsx` y acomoda todo solo. |
| **Equipos y sueldos** | Valor por hora, por equipo y por persona. |
| **Los datos** | Dónde se guardan, copia de seguridad y empezar de cero. |

**Español e inglés**, con el selector de arriba a la derecha. Moneda configurable (AUD por defecto).

---

## Decisiones que vale la pena conocer

**El acumulado nunca rellena días que faltan.** Si el mes tiene 10 días cargados de 25, el
acumulado suma esos 10 y lo dice. Un número inventado en un reporte que se presenta a un superior
es peor que un número incompleto.

**La proyección se calcula por área, no sobre el total.** Las áreas se comportan distinto: una
puede ser estable y otra oscilar al triple según haya evento o no. Promediarlas da un número que no
ocurre nunca. El detalle del cálculo está a la vista en la pantalla, para poder defenderlo si lo
cuestionan.

**El amarillo del calendario no quiere decir que esté bien.** Un día que se pasa mucho del objetivo
se marca aparte, porque si se toma como referencia las cuentas del mes salen infladas.

**El mail no se manda solo.** El botón abre el programa de correo con todo escrito; lo revisa una
persona y le da enviar. El día que un número salga mal, mejor verlo antes de que lo lea el jefe.

**Los turnos son de cada área, no del día.** En un restaurante no trabaja la misma gente que en
room service. Cada área tiene su propia lista, y el sistema aprende del histórico quién suele
trabajar dónde: sugiere primero a esa gente, propone los horarios habituales de esa área y avisa
si se carga a alguien que normalmente está en otro lado.

**No se guardan datos de huéspedes.** Los comentarios del reporte a veces mencionan números de
habitación; la aplicación avisa que no conviene escribirlos.

---

## Lector de Excel

Lee archivos `.xlsx` sin ninguna librería externa: abre el ZIP con el descompresor que ya trae el
navegador (`DecompressionStream`) y parsea el XML con `DOMParser`. Está en
[`app/js/lector-excel.js`](app/js/lector-excel.js).

Resuelve solo las cosas que rompen a un importador común:

- Encabezados que no están en la primera fila
- Celdas combinadas verticales (el nombre del área ocupando 30 filas)
- Nombres de área escritos distinto (`IRD`, `In Room Dining`, `in room dining`)
- Fechas en el nombre de la pestaña, o adentro, o en las dos con valores distintos
- Comentarios en filas de texto que ocupan todo el ancho
- Turnos del personal escritos a mano (`16:00 - 23:00, 30 min break`), incluso cruzando la medianoche

---

## Estructura

```
app/                 la aplicación (se abre con doble clic)
  index.html
  assets/estilos.css
  js/
    lector-excel.js  lee .xlsx sin librerías
    calculos.js      totales, acumulado y proyección
    analisis.js      objetivo diario, horarios y personal
    sueldos.js       valor hora por equipo y por persona
    carga-dia.js     la pantalla de carga
    turnos-area.js   turnos por área y aprendizaje de quién trabaja dónde
    atajos.js        pegar de Excel, cuentas, filtros de tecleo
    idioma.js        traducción de la pantalla
    idioma2.js       diccionario
    vistas*.js       las pantallas
    datos-demo.js    datos de ejemplo generados

docs/                análisis del formato, método de estimación y decisiones
supabase/            esquema SQL y función de envío (sin desplegar)
fuente/
  generar_demo.py    genera los datos de ejemplo del repositorio
  generar_datos.py   lee un .xlsx real y arma datos-reales.js (queda local)
```

---

## Datos

**Lo que hay en el repositorio son datos generados**, en `app/js/datos-demo.js`: 49 días con
importes, nombres y comentarios inventados. Imitan la forma de un reporte real (cuánto varía cada
área, días normales contra días de evento) para que la aplicación se vea como se va a ver en uso,
pero ninguna cifra corresponde a un hotel.

Se regeneran con `python fuente/generar_demo.py`.

> En la consola del navegador aparece un **404 de `js/datos-reales.js`**. Es esperado: ese archivo
> solo existe en la máquina donde están los datos del hotel, y la página está preparada para
> seguir sin él. No es un error.

**Los datos reales no están acá y no deben subirse.** El `.gitignore` deja afuera el `.xlsx`,
`app/js/datos-reales.js` y los comentarios extraídos. Si existe `app/js/datos-reales.js` en la
computadora, la aplicación lo usa en lugar de los de ejemplo; si no existe, no pasa nada.

---

## Publicarlo en la web

El repositorio trae `vercel.json`, que le dice a Vercel que la aplicación está en `app/`.
Con eso alcanza: importar el repositorio y darle **Deploy**, sin tocar nada más.

- **No** hay que poner nada en *Build Command*.
- **No** hay que cambiar *Root Directory* — dejarlo en la raíz. Si se pone `app` ahí **y** además
  está el `vercel.json`, queda apuntando a `app/app` y da 404.

Si igual aparece un **404: NOT_FOUND**, es que está buscando el `index.html` en el lugar
equivocado. Se arregla de una de las dos formas, nunca las dos juntas:

| | Qué hacer |
|---|---|
| **A** *(la que trae el repo)* | Dejar `vercel.json` y *Root Directory* vacío |
| **B** | Borrar `vercel.json` y poner *Root Directory* = `app` en Settings → General |

Después de cambiarlo hay que volver a desplegar: **Deployments → … → Redeploy**.

> Publicado así, **entra cualquiera que tenga el link**. Los datos siguen guardándose en cada
> navegador, así que no se filtra nada del hotel, pero conviene poner login antes de conectar
> Supabase.

---

## Estado

Funciona y se puede usar. Lo que **todavía no tiene**:

- **No hay login.** Publicado en una dirección web, entra cualquiera con el link.
- **Los datos no se comparten** entre computadoras: cada una tiene los suyos.
- **No hay copia de seguridad automática.** Hay que bajar la copia a mano desde *Los datos*.
- **El mail no sale solo.** Necesita servidor.

El esquema de base de datos y la función de envío están escritos en `supabase/`, **sin desplegar y
sin probar**. Los pasos para ponerlos en marcha están en
[`docs/08-pasos-para-publicar.md`](docs/08-pasos-para-publicar.md).

---

## Documentación

| Documento | Qué tiene |
|---|---|
| [`docs/01-excel-analysis.md`](docs/01-excel-analysis.md) | Cómo está armado el reporte de origen y qué problemas de datos tiene |
| [`docs/02-preguntas.md`](docs/02-preguntas.md) | Lo que hay que confirmar antes de dar los números por buenos |
| [`docs/04-metodo-de-estimacion.md`](docs/04-metodo-de-estimacion.md) | Cómo se calcula la proyección, y por qué así |
| [`docs/06-recomendaciones.md`](docs/06-recomendaciones.md) | Mejoras encontradas al construirlo |
| [`docs/07-envio-por-mail.md`](docs/07-envio-por-mail.md) | El JSON del reporte y qué falta para el envío automático |
| [`docs/08-pasos-para-publicar.md`](docs/08-pasos-para-publicar.md) | Cómo llevarlo a Supabase y publicarlo |

---

## Licencia

Sin licencia definida. Uso interno.
