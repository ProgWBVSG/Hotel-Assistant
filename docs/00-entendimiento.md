# 00 — Entendimiento, supuestos y plan

> **Estado: falta el Excel.** Este documento cubre todo lo que se puede definir sin el archivo.
> El análisis del archivo (`01-excel-analysis.md`) está esperando que llegue.

---

## 1. Qué entendí

Todos los días llega por mail un reporte con los ingresos de distintas áreas del hotel. Hoy vive en
Excel. La gerente necesita cuatro cosas que hoy no tiene resueltas:

1. **Un resumen mensual día por día** — cuánto entró cada día y cuánto va acumulado en el mes.
2. **Un estimado de cierre de mes que se recalcule solo cada día**, y que sea explicable.
3. **Una presentación formal diaria** para mostrarle al jefe cada mañana.
4. **Que los comentarios del reporte no se pierdan** — hoy se insertan sueltos en la planilla.

El ejemplo que diste: *"Día 3, juntaron 30 mil USD. El acumulado hasta ahora es 80 mil."* Eso es
exactamente el par **total del día + acumulado del mes (MTD)**, que es la base de todo lo demás.

## 2. Lo que hace distinto a este proyecto

No es un tablero para mirar. **Es un documento que se presenta a un superior todos los días a la
misma hora.** Eso cambia tres cosas:

- **El formato importa tanto como el número.** Si cada día se ve distinto, el jefe pierde tiempo
  buscando dónde está el dato. Formato idéntico, siempre.
- **Un número mal no es un bug, es un problema laboral.** La confianza en la cifra está por encima
  de cualquier otra cosa.
- **El estimado va a ser cuestionado.** El jefe va a preguntar "¿de dónde sacaste eso?". Si el
  sistema no puede contestar en una frase, el estimado no sirve.

De ahí sale el principio rector:

> **Ningún número aparece sin poder explicar de dónde salió.**

## 3. Tres cosas del brief con las que no coincido

Las digo ahora para que decidas vos, y sigo trabajando igual.

### 3.1 El run rate no es un escenario conservador

El brief propone: conservador = run rate, esperado = curva histórica, optimista = interanual.

El problema: **el run rate no es conservador, es ingenuo.** En un hotel el ingreso depende
fuertemente del día de la semana. Si los primeros 10 días del mes cayeron dos fines de semana, el
promedio diario está inflado y la proyección se va para arriba. Si cayó uno solo, pasa lo contrario.
No es conservador ni optimista: es **impredecible en la dirección del error**, que es peor.

**Propuesta:** los tres escenarios no se arman eligiendo métodos distintos, sino midiendo la
dispersión real de los días comparables. Piso, base y techo salen de los mismos datos. Detalle en
[04-metodo-de-estimacion.md](04-metodo-de-estimacion.md).

### 3.2 Esto es una proyección estadística, no un forecast de revenue

Un forecast hotelero de verdad usa las **reservas ya tomadas** para los días que faltan (*on the
books*). Nosotros no las tenemos: solo tenemos lo que ya pasó.

Es una diferencia grande y hay que decirla en la presentación, porque si el jefe lee "proyección de
cierre" va a asumir que incluye lo que ya está reservado. **No lo incluye.** Va a estar escrito en
la propia presentación, en letra chica pero visible.

### 3.3 No se puede dar un "nivel de confianza" al principio

El brief pide mostrar probabilidad o nivel de confianza en cada escenario. Al principio **no hay
con qué calcularlo**, y poner un "85% de confianza" inventado es peor que no poner nada — es
exactamente el tipo de número que hace que después nadie confíe en el sistema.

**Propuesta:** el sistema guarda cada día lo que proyectó. Al cierre de mes compara proyección
contra realidad. Después de 2 o 3 meses puede decir algo real: *"en los últimos 3 meses, la
proyección del día 10 se equivocó en promedio un 4%"*. Hasta entonces dice, con todas las letras:
**"todavía no hay base para dar un margen de error"**.

## 4. Supuestos (ninguno confirmado)

| ID | Supuesto | Si es falso… | Se cierra con |
|---|---|---|---|
| S-01 | El reporte llega una vez por día, con los datos del día anterior | Cambia toda la lógica de "hoy" vs "ayer" | Pregunta P1 |
| S-02 | Las áreas son estables mes a mes (siempre las mismas) | El importador necesita manejar áreas nuevas y bajas | El Excel |
| S-03 | Los importes ya vienen netos y en una sola moneda | Se agrega conversión y hay que definir el tipo de cambio | El Excel + P0 |
| S-04 | Existe una meta mensual, aunque sea informal | Sin meta, la mitad de la presentación pierde sentido | Pregunta P0 |
| S-05 | Hay al menos 3 meses de histórico recuperable | Sin histórico, solo se puede usar el método más pobre | El Excel |
| S-06 | Los comentarios son texto libre, sin formato fijo | Si tienen estructura, se pueden clasificar solos | El Excel |
| S-07 | El reporte lo arma otra persona y ella lo recibe ya hecho | Si lo arma ella, el sistema tiene que reemplazar ese armado, no leerlo | Pregunta P0 |
| S-08 | Los números son definitivos, no se corrigen después | Hace falta versionado del día y "recálculo hacia atrás" | Pregunta P1 |

> **S-08 es el más peligroso.** En hotelería es común que un día se ajuste dos o tres días después
> (una factura mal cargada, un evento que se reclasifica). Si eso pasa y el sistema no lo contempla,
> la presentación del jueves va a contradecir la del lunes y nadie va a saber cuál vale.

## 5. Riesgos

| # | Riesgo | Probabilidad | Impacto | Qué hacemos |
|---|---|---|---|---|
| R-1 | Un área no reporta y el día queda incompleto sin que se note | **Alta** | **Crítico** | El sistema detecta áreas faltantes, marca el día como incompleto y **lo excluye de la base del estimado** |
| R-2 | Un evento puntual (una convención) distorsiona la proyección | **Alta** | Alto | Detección de días fuera de rango + poder marcarlos como "no repetible" |
| R-3 | Los datos se corrigen a posteriori | Media | Alto | Cada día guarda versiones; la presentación dice qué versión usó |
| R-4 | El Excel real es mucho más sucio de lo esperado | **Alta** | Alto | Nada se construye hasta verlo |
| R-5 | El jefe cuestiona el estimado y no se puede defender | Media | **Crítico** | Cada número muestra su método y sus supuestos |
| R-6 | Son datos financieros en una herramienta no aprobada | Media | **Crítico** | Solo datos ficticios hasta autorización escrita |
| R-7 | La presentación cambia de formato entre días | Baja | Alto | Plantilla fija, sin excepciones |

## 6. MVP propuesto

**Entra:**
1. Carga del día (importando el Excel o a mano)
2. Total del día + desglose por área
3. Acumulado del mes (MTD) y comparación con el día anterior
4. Estimado de cierre con piso, base y techo, con supuestos a la vista
5. Meta mensual y diferencia contra el estimado
6. Comentarios del día, con marcado de importantes
7. Presentación diaria de una página, imprimible y a PDF
8. Detección de área sin reportar y de días fuera de rango
9. Historial del mes en tabla tipo planilla
10. Exportación a Excel y CSV
11. Registro de quién cargó y modificó cada dato
12. Datos demo

**No entra en el MVP:** integración con PMS o POS · envío automático de mails · multimoneda ·
comparación interanual real (hasta tener un año de datos) · app móvil · IA generativa.

## 7. Plan

| Fase | Qué | Depende de |
|---|---|---|
| **0** | Entendimiento, preguntas, modelo, método de estimación | — *(hecho, salvo el análisis del Excel)* |
| **1** | Análisis del Excel real | **El archivo** |
| **2** | Demo funcionando con datos ficticios | Fase 0 |
| **3** | Ajuste del demo con el formato real y los nombres reales | Fase 1 |
| **4** | Validación con la gerente: ¿el estimado le cierra? ¿la presentación sirve? | Fase 3 |
| **5** | Sistema real con login, base de datos y permisos | Fase 4 + autorización |

**Se puede avanzar hasta la Fase 2 sin el Excel.** El demo se arma con datos inventados que imitan
la forma esperada, y cuando llegue el archivo se ajusta.

## 8. Qué necesito de vos

**Bloqueante:**
1. **El Excel**, anonimizado si hace falta — con la estructura intacta (celdas combinadas,
   encabezados donde estén, todo). Idealmente 2 o 3 meses, no uno solo.
2. **Un mail de ejemplo** con el reporte como llega, para ver qué trae además de la tabla.

**Muy útil:**
3. Cómo se ve la presentación que hoy le muestra al jefe (aunque sea una foto de la pantalla).
4. Si existe la meta mensual y quién la fija.
5. Las preguntas P0 de [02-preguntas.md](02-preguntas.md).

Sin 1 y 2 puedo construir el demo, pero va a estar adivinando el formato.
