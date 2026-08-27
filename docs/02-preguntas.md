# 02 — Preguntas para tu hermana

Salen de leer el Excel real, no de un cuestionario genérico. **Las P0 bloquean el desarrollo.**

Si solo hay tiempo para tres, son la **P0-1**, la **P0-2** y la **P0-5**.

---

## P0 — Sin esto no se puede construir

### P0-1 🔴 ¿Faltan días, o el reporte no se hace todos los días?

En agosto 2026 hay 11 días de 25. Faltan el 01, 02, 03, 09, 10, 11, 13, 14, 17, 18, 19, 20, 21 y 22.

- ¿El reporte se genera **todos los días**?
- Si sí, ¿dónde están los días que no están en el Excel? ¿Quedaron solo en el mail?
- ¿Se puede recuperar la serie completa de por lo menos los últimos 3 meses?

> **Por qué bloquea:** el acumulado del mes que querés **no se puede calcular** si faltan más de la
> mitad de los días. Y sin acumulado real no hay proyección. Es la pregunta más importante de todas.

### P0-2 🔴 Cuando la fecha de la pestaña y la de adentro no coinciden, ¿cuál vale?

Pasa en **28 de 89 hojas**. Ejemplos:

| Pestaña | Fecha adentro |
|---|---|
| `18.02.2025` | 2025-09-18 |
| `14.07.2026` | 2026-07-25 |
| `24.08.2026 (2)` | 2026-08-25 |

- ¿Cuál es la buena, la del nombre o la de la celda?
- ¿Es siempre la misma la correcta, o depende?
- ¿Sabías que pasaba esto?

> **Por qué bloquea:** el 31% de los datos históricos puede estar en la fecha equivocada. Ninguna
> regla automática puede decidirlo.

### P0-3 🔴 ¿Este es el único reporte, o hay otro con habitaciones?

El archivo es **solo gastronomía** (F&B): Penny Blue, Exchange Lane, In Room Dining.

- ¿Hay otro reporte diario con los ingresos de habitaciones, eventos, spa, etc.?
- Cuando decís "diversas áreas", ¿te referís a estos tres outlets o a algo más grande?
- La proyección que querés, ¿es de F&B o del hotel entero?

> **Por qué importa:** cambia completamente el alcance. Si es solo F&B, la herramienta es de
> gastronomía. Si hay que sumar habitaciones, hace falta esa otra fuente.

### P0-4 🔴 ¿Qué moneda es?

**En el archivo no está escrito en ningún lado.** Vos dijiste USD.

- ¿Es USD? ¿O es libra, euro, dólar australiano?
- Los montos (mediana 7.567 por día) ¿te suenan razonables para el F&B de este hotel?
- ¿Los importes son netos o llevan impuestos?

> Los comentarios mencionan "football", "ATAC event", y nombres como Penny Blue y Exchange Lane
> suenan británicos o australianos. No quiero asumir.

### P0-5 🔴 Los días altos de Penny Blue, ¿son eventos?

Penny Blue tiene dos modos claros: días de ~2.000-6.000 y días de ~12.000-15.000, casi nada en el
medio. Es lo que más mueve el total.

- ¿Los días altos son banquetes, comedor privado, grupos?
- **¿Se sabe con anticipación cuántos hay en el mes?**
- ¿Quién tiene ese dato?

> **Por qué bloquea:** si se sabe de antemano, la proyección pasa de ser una adivinanza a ser un
> cálculo. Es la mejora más grande disponible. Ver [04](04-metodo-de-estimacion.md) §11.2.

### P0-6 ¿Existe una meta mensual?

- ¿Hay meta, presupuesto u objetivo para el mes?
- ¿Es de F&B o del hotel? ¿Por outlet?
- ¿Quién la fija y cuándo?
- ¿Cambia mes a mes?

> Sin meta, la mitad de la presentación pierde sentido: "vamos a cerrar en 385.000" no dice nada si
> no hay contra qué compararlo.

### P0-7 ¿Quién arma el reporte y quién lo recibe?

- ¿Lo arma el Manager on Duty al cerrar el turno?
- ¿A vos te llega ya hecho, o lo armás vos?
- ¿A quién más le llega?
- ¿Llega como Excel adjunto, como texto en el cuerpo del mail, o los dos?

> Si lo arma ella, la herramienta tiene que **reemplazar ese armado**. Si lo recibe, tiene que
> **leerlo**. Son dos productos distintos.

### P0-8 ¿Los números se corrigen después?

- ¿Pasa que un día se ajusta dos o tres días más tarde?
- Si pasa, ¿se corrige la hoja vieja o se deja como está?

> Si se corrigen, la presentación del jueves puede contradecir la del lunes. Hay que versionar.

### P0-9 🔴 Los comentarios tienen números de habitación y de mesa

Cosas como `Room 1306`, `Room 1422`, `Table 34`. Eso identifica a un huésped concreto en una fecha
concreta: es dato personal.

- ¿Hay alguna política sobre esto?
- ¿Se pueden guardar los comentarios tal cual, o hay que borrar los números de habitación?
- ¿Alguien de sistemas o legales tendría que revisarlo?

> Mi recomendación por defecto: **guardar el comentario pero reemplazar el número de habitación**
> (`Room 1306` → `Room ***`). El valor del comentario está en lo que pasó, no en quién era.

---

## P1 — Del proceso diario

| # | Pregunta | Por qué |
|---|---|---|
| P1-1 | ¿A qué hora llega el reporte? | Define cuándo se procesa |
| P1-2 | ¿A qué hora se lo mostrás al jefe? | Define el límite para tener la presentación lista |
| P1-3 | ¿Cómo se la mostrás hoy? ¿Pantalla, impreso, proyector? | Define el formato de salida |
| P1-4 | ¿El jefe pregunta siempre lo mismo? ¿Qué? | Eso va arriba de todo en la presentación |
| P1-5 | ¿Qué decisión se toma con estos números? | Si no se toma ninguna, el diseño cambia |
| P1-6 | ¿Qué pasa si un outlet no reporta? | Define cómo tratar días incompletos |
| P1-7 | ¿Hoy calculás el acumulado a mano? ¿Cuánto tardás? | Es la métrica de éxito del proyecto |
| P1-8 | La fila "Month to Date" está vacía siempre. ¿Alguna vez se usó? | El campo existe pero nadie lo completa |
| P1-9 | ¿Qué mirás primero cuando abrís el reporte? | Va primero en la presentación |
| P1-10 | ¿Los turnos del personal (columnas E-F-G) los usás? | Si no, no los traemos |
| P1-11 | ¿Se compara contra el mes pasado o el año pasado? | Penny Blue no existía antes de julio 2026 |
| P1-12 | ¿Qué hacés hoy con los comentarios? ¿Los leés? ¿Los reenviás? | Define cuánto invertir en ese módulo |

---

## P2 — Preferencias

| # | Pregunta |
|---|---|
| P2-1 | La presentación al jefe, ¿una hoja o varias? |
| P2-2 | ¿Necesitás imprimirla o alcanza con la pantalla? |
| P2-3 | ¿En inglés, en español, o los dos? *(el Excel está todo en inglés)* |
| P2-4 | ¿Querés ver gráficos, o preferís solo números? |
| P2-5 | Si el sistema te pudiera avisar **tres** cosas por mail, ¿cuáles? |
| P2-6 | ¿Qué te gustaría dejar de hacer a mano? |
| P2-7 | ¿Seguirías usando el Excel en paralelo al principio? |
| P2-8 | ¿Alguien más va a cargar datos, o solo vos? |

---

## Preguntas que YA se contestaron leyendo el archivo

Para no hacerlas al pedo:

- ✅ **Qué áreas hay:** Penny Blue, Exchange Lane, In Room Dining. Penny Blue desde julio 2026.
- ✅ **Cómo se calcula el total del día:** no se calcula. Hay que sumar los tres "All Day → Total".
- ✅ **Cómo se calcula el acumulado:** no se calcula. La etiqueta existe, la celda está vacía.
- ✅ **Si hay tablas dinámicas o filtros:** no hay ninguna.
- ✅ **Cómo se agregan los comentarios:** texto libre en filas combinadas debajo de cada outlet.
- ✅ **Formato de fecha:** fecha real en la celda B4, pero el nombre de la pestaña es texto suelto.
- ✅ **Si hay comparación con presupuesto o año anterior:** no hay ninguna.
- ✅ **Qué métricas se llevan:** Covers, Food, Beverage, Total, AV CHECK, Discounts, y Delivery
  Charge y Misc/Banquets en algunos bloques.
