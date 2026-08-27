# 06 — Recomendaciones e ideas

Lo que me pediste que investigara. Todo sale de haber leído el archivo real: son cosas concretas de
**este** reporte, no consejos generales.

Ordenado por lo que más cambia el día a día con menos trabajo.

---

## Parte 1 — Lo que arreglaría primero

### R-1 🔴 El problema de las fechas duplicadas no es un detalle, es el techo del proyecto

31% de las hojas tienen la fecha del nombre distinta de la de adentro. Nace de duplicar la hoja del
día anterior y olvidarse de cambiar una de las dos.

**Se arregla solo si el reporte deja de ser un Excel duplicado a mano.** Mientras siga siendo
"copiar la pestaña de ayer", va a seguir pasando. Es el argumento más fuerte para hacer la
herramienta: no es que el Excel sea feo, es que **estructuralmente produce datos con fechas mal**.

Mientras tanto, en el Excel: poner en la celda de la fecha una validación que la resalte si es igual
a la del día anterior. Cuesta dos minutos y ataca el 90% de los casos.

### R-2 🔴 Recuperar los días que faltan es más valioso que cualquier función nueva

Con 11 días de 25, ningún acumulado es real y ninguna proyección es confiable. Si los días que
faltan están en el mail, cargarlos vale más que todo lo demás junto.

**Idea práctica:** el sistema puede mostrar un calendario del mes con los días cargados en verde y
los faltantes en gris. Ver el mes agujereado es más convincente que cualquier explicación, y
convierte "completar datos" en algo con final visible.

### R-3 El total del día no existe hoy — y es lo que ella quiere

En el archivo no hay ninguna celda que sume los tres outlets. Cada vez que quiere el número del día,
tiene que sumarlo a mano. Ese es literalmente el primer pedido que hizo.

Es la función más barata de construir y la de mayor impacto inmediato.

### R-4 Separar el reporte de ingresos de la planilla de turnos

Las columnas E, F y G tienen el horario del personal ("Jamie 14:00-1:30, 30 min break"). No tiene
nada que ver con los ingresos y le agrega ruido al reporte.

**Recomendación:** que la herramienta los guarde pero no los muestre en la presentación al jefe. Si
alguien los usa, que sea en su propia pantalla.

*(Antes de sacarlos, preguntar P1-10: capaz que sí se usan para justificar costos de personal
contra ingresos, que sería un análisis interesante.)*

---

## Parte 2 — Ideas que el archivo sugiere y no estaban en el brief

### I-1 ⭐ Los comentarios son un activo desaprovechado

89 comentarios narrando lo que pasó cada turno. Hoy se leen una vez y se pierden dentro de una
pestaña que nadie vuelve a abrir.

Leyéndolos juntos aparecen patrones que **ninguna tabla de números muestra**: reclamos por el mismo
plato, demoras cuando el bar y el room service se llenan a la vez, un problema recurrente con el
tamaño de los vasos de cerveza tirada.

**Idea:** una pantalla de "qué se repite este mes", agrupando comentarios por tema. No hace falta
IA: alcanza con marcar cada comentario con una etiqueta al cargarlo (*queja de comida · demora ·
error de pedido · venta destacada · evento*). Cinco segundos por día, y al fin de mes hay algo real
para llevar a la reunión.

> Esto puede terminar siendo **más útil que la proyección**. La proyección le dice al jefe cómo va
> a cerrar el mes; los comentarios le dicen qué hay que arreglar.

### I-2 ⭐ El AV CHECK es la métrica que ya está y nadie mira

Cada bloque calcula `AV CHECK` = total ÷ cubiertos: el consumo promedio por persona. Está en el
archivo, se calcula solo, y no aparece en ningún resumen.

Es más accionable que el total: si el total baja porque vino menos gente, es una cosa; si baja
porque **cada uno consumió menos**, es otra completamente distinta y se corrige de otra manera
(sugerencia de venta, carta, entrenamiento del salón).

**Idea:** en la presentación diaria, al lado del total del día, poner cubiertos y consumo promedio.
Tres números en vez de uno, y responden "¿vino menos gente o gastaron menos?".

### I-3 Los descuentos merecen una línea propia

Hay una fila `Discounts` en cada bloque. El 24/08 fueron 540 en Penny Blue y 781 en Exchange Lane
sobre 8.000 de venta: casi un 10%.

Se registra, no se suma, no se mira. Un acumulado mensual de descuentos y a quién se le hacen es de
las cosas que un jefe pregunta y nadie tiene a mano.

### I-4 Separar comida de bebida en la proyección

El archivo ya separa `Food` y `Beverage`. Se comportan distinto: la bebida es la que se dispara los
días de evento (el 24/08, Exchange Lane hizo 1.480 de comida y **1.833 de bebida** en la cena).

Proyectarlas por separado es más preciso y además muestra si el problema de un mes flojo es de
cocina o de barra.

### I-5 Detectar el día de evento automáticamente y preguntar

Cuando Penny Blue supera ~9.000, el sistema puede preguntar en un clic: **"¿Este día fue un evento?"**
Sí / No. Con eso se va armando el histórico de días de evento sin que nadie cargue nada extra, y la
proyección mejora sola mes a mes.

### I-6 Un "cierre de mes" de una página

El día 1 de cada mes, generar automáticamente: cómo cerró el mes, contra la meta, contra el mes
anterior, cuántos días de evento hubo, los tres comentarios más repetidos y **cuánto se equivocó la
proyección**.

Esa última parte es la que construye confianza en el sistema. Si a los tres meses puede decir *"la
proyección del día 15 se equivocó en promedio 3%"*, el número deja de ser opinión.

### I-7 Comparar contra el mismo día de la semana, no contra ayer

El brief pide comparar contra el día anterior. Con estos datos eso engaña: un lunes contra un
domingo siempre va a dar mal (índice 0,60 vs 0,83).

**Mejor:** "contra los últimos 4 martes". Es una comparación justa y no genera alarmas falsas.

### I-8 Aviso de outlet faltante antes de la reunión

Si a las 8 de la mañana falta un outlet, la gerente tiene que enterarse **antes** de la reunión, no
durante. Un aviso simple: *"Falta Exchange Lane del día de ayer"*.

---

## Parte 3 — Lo que NO haría

| Idea | Por qué no |
|---|---|
| Conectar con el sistema de cajas (POS) | Sin autorización de sistemas, ni se toca. Y sin el flujo manual resuelto, integrar solo automatiza el desorden. |
| Gráficos lindos en la presentación | El jefe quiere números y una explicación. Un gráfico de torta de tres outlets no dice nada que la tabla no diga. |
| IA que "analice" los comentarios | Todavía no. Primero etiquetarlos a mano cinco segundos por día. Si en tres meses hay 300 comentarios etiquetados, ahí sí. |
| Mandar el mail automáticamente | Que la gerente lo revise y lo mande ella. El día que el sistema mande un número mal a su jefe, se terminó el proyecto. |
| Proyección a más de un mes | Con 87 días salteados no alcanza ni para un mes bien. |
| Multimoneda | Ni siquiera sabemos cuál es la moneda todavía. |
| Reemplazar el Excel de golpe | Que convivan unos meses. El Excel es el respaldo mientras se gana confianza. |

---

## Parte 4 — Las preguntas clave para el trabajo diario

Me pediste preguntas clave. Estas son las que yo le haría a tu hermana, en orden. **Las tres
primeras valen más que todas las demás juntas.**

### Las tres que hay que responder sí o sí

1. **"¿El reporte se hace todos los días?"** — Define si el proyecto es viable como lo pensás.
2. **"Cuando la pestaña dice una fecha y adentro dice otra, ¿cuál es la buena?"** — Define si el
   histórico sirve.
3. **"Los días que Penny Blue hace 13.000, ¿son eventos? ¿Sabés cuántos vienen este mes?"** —
   Define si la proyección es un cálculo o una adivinanza.

### Sobre lo que realmente necesita

4. **"¿Qué te pregunta tu jefe todas las mañanas?"** — Eso va arriba de todo. Si pregunta siempre
   lo mismo, el sistema tiene que responderlo antes de que abra la boca.
5. **"¿Qué pasa si el número está mal?"** — Define cuánta validación hace falta.
6. **"¿Qué hacés hoy cuando el jefe pregunta algo que no está en el reporte?"** — Ahí está la
   función que falta.
7. **"¿Cuánto tardás en armar lo que le mostrás?"** — Es la métrica de éxito.
8. **"¿Qué decisión se toma con estos números?"** — Si la respuesta es "ninguna, es informativo",
   el diseño cambia: se optimiza para leer rápido, no para decidir.

### Sobre los comentarios

9. **"¿Los leés todos los días o solo cuando pasa algo grave?"**
10. **"¿Alguna vez alguien hizo algo por un comentario del reporte?"** — Si nunca, hay un problema
    de circuito, no de herramienta.
11. **"¿Se puede guardar el número de habitación, o hay que borrarlo?"**

### La incómoda pero necesaria

12. **"Si te doy esta herramienta y mañana te la saco, ¿la extrañarías?"**

Preguntarla al final del piloto, no antes. Es la única respuesta que importa de verdad.

---

## Parte 5 — Lo que yo haría en las próximas dos semanas

| Semana | Qué |
|---|---|
| **Ya** | Mandarle las 3 preguntas bloqueantes. No hace falta reunión, van por mensaje. |
| **Semana 1** | Demo con los datos reales ya extraídos: total del día, acumulado, proyección, presentación de una página. Los datos ya están parseados en `fuente/extraido.csv`. |
| **Semana 1** | Que lo abra y diga qué está mal. Con datos reales, no inventados: va a reconocer los números y detectar errores enseguida. |
| **Semana 2** | Corregir según lo que diga + cargar los días que falten. |
| **Semana 2** | Que use la presentación **una vez** en la reunión real con el jefe. Ahí se ve todo. |

> El paso más importante es el último. Una reunión real con el jefe dice más que veinte
> conversaciones sobre qué debería mostrar la herramienta.

---

## Nota final sobre el alcance

Vale la pena decirlo: **este reporte es solo de gastronomía.** Cuando dijiste "ingresos en diversas
áreas", puede ser que estuvieras pensando en algo más grande (habitaciones, eventos, spa).

Si es así, esto es una parte del problema, no todo. Y conviene saberlo ahora: si hay que sumar
habitaciones, hace falta otra fuente, y el diseño de la presentación cambia bastante.

Es la pregunta **P0-3**, y sería la cuarta en mi lista de las importantes.
