# 01 — Análisis del Excel real

> ℹ️ **Versión pública.** Los ejemplos de comentarios están reescritos y las cifras
> exactas de facturación se omiten. El análisis de la estructura y de los problemas de
> datos está completo.

**Archivo:** `2026.xlsx` · 468 KB · 89 hojas · analizado el 26/08/2026
**Copia de trabajo:** `reporte-diario/fuente/2026.xlsx`
**Datos extraídos:** `fuente/extraido.csv` (5.502 filas) · `fuente/comentarios.json` (89 comentarios)

> Todo lo de este documento sale de leer el archivo, no de suponer.

---

## 1. Lo primero: esto no es lo que yo esperaba

El brief hablaba de "ingresos generados en distintas áreas del hotel". **No es eso.**

Es un **F&B Daily Report**: el reporte diario de gastronomía. Cubre tres puntos de venta, no las
áreas del hotel. No hay habitaciones, no hay eventos como área, no hay "otros ingresos".

Esto cambia cosas importantes y hay que confirmarlo antes de seguir:

- ¿Este es **el** reporte que le llega, o es **uno de varios** (y existe otro con habitaciones)?
- Si es solo F&B, la meta mensual y la proyección son **de gastronomía**, no del hotel.
- Los montos son chicos para un hotel entero: mediana del orden de **7.500 por día**, con picos que llegan al triple. Eso es
  consistente con F&B solo.

**La moneda no figura en ninguna parte del archivo.** Ni símbolo, ni formato, ni encabezado. Vos
mencionaste USD; en el archivo no está escrito. Hay que confirmarlo.

---

## 2. Cómo está armado

**Una hoja por día.** No hay una planilla con una fila por día: hay 89 pestañas, cada una con el
reporte completo de una jornada. El resumen mensual que querés **hoy no existe en ningún lado**.

### Estructura de cada hoja (~97 filas × 7 columnas, 29 celdas combinadas)

    Fila 1     F&B DAILY REPORT                     (combinado A1:G3)
    Fila 4     Date | 2026-08-24
    Fila 5     MOD  | Breakfast | Lunch | Dinner     (MOD = Manager on Duty)
    Fila 6     OUTLET | [nombre] | [nombre] | [nombre]

    Filas 7-35   ┌ PENNY BLUE
                 │   Breakfast → Covers, Food, Beverage, Total, AV CHECK, Discounts
                 │   Lunch     → idem
                 │   Dinner    → idem + Misc/Banquets
                 └   All Day   → totales del outlet
    Fila 61      « comentario de texto libre, ocupa todo el ancho »

    Filas 37-60  ┌ EXCHANGE LANE  (misma estructura)
    Filas 62-94  ┌ IN ROOM DINING (agrega Overnight y Delivery Charge)
    Filas 95-97  « más comentarios »

**Columna por columna:**

| Col | Qué tiene |
|---|---|
| A | Nombre del outlet (combinado verticalmente) · y los comentarios largos |
| B | Servicio: Breakfast / Lunch / Dinner / Overnight / All Day |
| C | Métrica: Covers, Food, Beverage, Total, AV CHECK, Discounts, Delivery Charge |
| **D** | **El número.** Es la única columna con importes |
| E, F, G | Otra cosa: **planilla de turnos del personal** (Staff / Timings / Comments) |

> Las columnas E-F-G no tienen nada que ver con los ingresos. Son quién trabajó, en qué horario y si
> tomó descanso ("30 min break", "NO break"). Está mezclado en el mismo reporte.

### Los tres outlets y cómo fueron cambiando

| Período | Outlets |
|---|---|
| Feb 2025 → abr 2026 | Exchange Lane · **IRD** |
| ~May 2026 | Exchange Lane · **In Room Dining** *(mismo outlet, renombrado)* |
| **Jul 2026 en adelante** | **Penny Blue** · Exchange Lane · In Room Dining |

**Penny Blue es nuevo: aparece recién en julio de 2026.** Cualquier comparación contra el año
anterior va a comparar peras con manzanas si no se tiene esto en cuenta.

---

## 3. Cómo se calculan los totales — y por qué preocupa

Hay muy pocas fórmulas reales. La mayoría de los números **están escritos a mano**. Ejemplos
textuales del día 24/08/2026:

    D39 = =7+15                 ← alguien sumó dos importes a mano dentro de la celda
    D45 = =80+78+81+26          ← cuatro tickets sumados a mano
    D51 = =926+48+475+384
    D57 = =1006+133+571+410
    D46 = =D45+D44              ← esta sí es una fórmula de verdad
    D47 = =D46/D43              ← AV CHECK = Total ÷ Covers

De las ~97 filas, **solo 11 celdas tienen fórmula**, y de esas, 6 son sumas escritas a mano.

**Qué significa esto:**
- El "Total" de cada servicio a veces es fórmula y a veces es un número tipeado.
- **No hay ninguna fórmula que sume los tres outlets.** El total del día no existe en el archivo:
  lo calculé yo sumando los "All Day → Total" de cada outlet.
- Si alguien se equivoca tipeando, no hay nada que lo detecte.

---

## 4. Los problemas de datos que encontré

### 4.1 🔴 La fecha del nombre no coincide con la fecha de adentro — en 28 de 89 hojas (31%)

Este es el problema más grave del archivo.

| Nombre de la pestaña | Fecha en la celda | Diferencia |
|---|---|---|
| `18.02.2025` | 2025-09-18 | **7 meses** |
| `20.02.2025` | 2025-09-29 | 7 meses |
| `04.10.2025 (2)` | 2025-04-15 | 6 meses |
| `21.01.2026 (2)` | 2026-04-03 | 2 meses |
| `14.07.2026` | 2026-07-25 | 11 días |
| `24.08.2026 (2)` | 2026-08-25 | 1 día |

**Por qué pasa:** se duplica la hoja del día anterior, se renombra la pestaña y se olvidan de
cambiar la celda `Date` — o al revés.

**Por qué importa muchísimo:** si el sistema toma la fecha equivocada, el resumen mensual y la
proyección quedan mal. Y no hay forma automática de saber cuál de las dos fechas es la buena.
**Es una pregunta para tu hermana, no algo que yo pueda decidir.**

### 4.2 🔴 Faltan la mayoría de los días

87 días útiles repartidos en 18 meses. Un mes cualquiera, por ejemplo:

    Días con datos:  04, 05, 06, 07, 08, 12, 15, 16, 23, 24, 25   (11 días)
    Días que faltan: 01, 02, 03, 09, 10, 11, 13, 14, 17, 18, 19, 20, 21, 22

**El acumulado del mes no se puede calcular con este archivo.** Faltan 14 de 25 días.

Puede ser que (a) el reporte no se genere todos los días, (b) se genere pero no se guarde en este
Excel, o (c) los días que faltan estén en otro archivo o en el mail. **Es la pregunta más
importante de todas**, porque si no hay serie completa, no hay acumulado ni proyección posible.

### 4.3 Nombres inconsistentes

- Pestañas: `01.03.25` · `20.06.2025` · `3.06.2026` · `12..05..2026` (doble punto) · `16.11.25`
- 5 pestañas sin renombrar: `Sheet1` a `Sheet5` (sus fechas internas son de julio 2025)
- Duplicados con `(2)`: `24.08.2026` y `24.08.2026 (2)` — que además tienen fechas internas distintas
- Outlets: `IRD` / `In Room Dining` / `in room dining` · `Penny Blue` / `penny blue`

### 4.4 Otros

- `Sheet2` tiene la fecha como el número **8032025** en vez de una fecha.
- Un día con total 0 (01/03/2025) — hoja de plantilla vacía, probablemente.
- La fila 92 dice **"Month to Date"** y **la celda de al lado está vacía**. El campo que querés ya
  existe en la plantilla; simplemente nunca se completa.

---

## 5. Los comentarios

**89 comentarios en 55 de las 89 hojas.** Están en filas combinadas que ocupan todo el ancho,
debajo del bloque de cada outlet. Promedio 354 caracteres, el más largo 2.174.

No son comentarios sobre los números: son **relatos de lo que pasó en el turno**. Cuatro tipos que
se repiten:

**Reclamos de huéspedes con su resolución** — el más frecuente:
> *"[Mesa N], regular guests, ordered a well done steak but received a medium steak instead. The kitchen offered to remake it, however the guest declined…"*
>
> *(ejemplo reescrito: el original menciona el número de mesa)*

**Problemas de operación:**
> *"In Room Dining got busy at the same time as the bar. We had slight delays on orders but guests were kept informed about waiting times."*

**Ventas destacadas:**
> *"[Habitación N] ordered several of our most expensive wines."*
>
> *(ejemplo reescrito: el original menciona el número de habitación y las etiquetas)*

**Contexto del volumen:**
> *"Guests from a nearby event arrived at the bar in the late afternoon, resulting in a busy period, followed by more guests after the football."*
>
> *(ejemplo reescrito: el original nombra el evento)*

**Están en inglés.** Todo el reporte está en inglés.

⚠️ **Contienen números de habitación y de mesa** (`Room ***`, `Table **`). Eso es dato de huésped:
identifica a una persona concreta en una fecha concreta. Hay que decidir qué se hace con eso antes
de meterlo en ningún sistema. Ver [02-preguntas.md](02-preguntas.md) P0-9.

---

## 6. Qué mueve el número — el hallazgo más útil

Miré si el día de la semana explica la variación. **Casi no la explica:**

| Día | Casos | Mediana | Índice |
|---|---|---|---|
| Lunes | 10 | — | 0,60 |
| Martes | 17 | — | 0,79 |
| Miércoles | 15 | — | 0,78 |
| Jueves | 16 | — | 0,91 |
| Viernes | 10 | — | 0,74 |
| Sábado | 11 | — | 0,80 |
| Domingo | 7 | — | 0,83 |

Salvo el lunes, todos los días se parecen. **Lo que mueve el número es otra cosa: Penny Blue.**

Últimos 3 meses (33 días):

| Outlet | Mínimo | Mediana | Máximo | Variabilidad |
|---|---|---|---|---|
| **Penny Blue** | — | — | — | **58%** |
| Exchange Lane | — | — | — | 29% |
| In Room Dining | — | — | — | 30% |
| **Total del día** | — | — | — | 32% |

*(los importes se omiten en el repositorio público; lo que importa acá es la variabilidad de la última columna)*

Penny Blue pasa de ser el 20% del día a ser el 71%:

    día A    Penny Blue = 20% del total del día
    día B    Penny Blue = 58% del total del día
    día C    Penny Blue = 71% del total del día

Y no es gradual: **es o ~2.000-6.000, o ~12.000-15.000.** Son dos modos distintos. Casi seguro que
los días altos son eventos, banquetes o comedor privado reservado (la fila `Misc/Banquets` del
bloque Dinner apunta a eso).

> **Consecuencia directa para la proyección:** intentar proyectar con promedios y días de la semana
> va a fallar sistemáticamente en este hotel. Lo que define el mes es **cuántos días de evento tiene
> Penny Blue**. Si tu hermana sabe eso con anticipación —y probablemente sí, porque los eventos se
> reservan—, cargarlo mejora la proyección más que cualquier método estadístico.
>
> Esto obligó a corregir el método que había escrito antes de ver el archivo. Ver
> [04-metodo-de-estimacion.md](04-metodo-de-estimacion.md) §11.

---

## 7. Lo que NO hay en el archivo

Buscado explícitamente y no encontrado:

- ❌ Total del día sumando los tres outlets
- ❌ Acumulado del mes (la etiqueta existe, el valor no)
- ❌ Meta o presupuesto mensual
- ❌ Comparación con el mes anterior o el año anterior
- ❌ Moneda declarada en cualquier forma
- ❌ Tablas dinámicas
- ❌ Filtros
- ❌ Cualquier hoja de resumen

**Todo lo que pediste hay que construirlo. Nada de eso existe hoy.**

---

## 8. Se puede leer automáticamente

Sí. Probado sobre las 89 hojas:

- **5.502 filas** extraídas correctamente (fecha, outlet, servicio, métrica, valor)
- **87 días** con total calculable
- **89 comentarios** recuperados con su outlet
- La estructura es lo bastante regular como para parsearla resolviendo las celdas combinadas

Lo que **no** se puede resolver solo: cuál de las dos fechas vale cuando no coinciden (§4.1) y los
días que faltan (§4.2). Eso necesita respuesta humana.

El importador tiene que asumir desde el día uno: encabezados en fila variable, celdas combinadas,
nombres de outlet inconsistentes, pestañas mal nombradas y días faltantes. **No es un caso raro:
es el caso normal de este archivo.**
