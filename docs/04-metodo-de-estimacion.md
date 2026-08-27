# 04 — Cómo se calcula el estimado de cierre de mes

> Este es el corazón del sistema y el número que más van a cuestionar. Todo lo de acá está pensado
> para que la gerente pueda **defenderlo en una frase** frente a su jefe.

> ## ⚠️ CORRECCIÓN — leer antes que nada
>
> Las secciones 1 a 9 las escribí **antes** de ver el Excel real. Al analizarlo
> ([01-excel-analysis.md](01-excel-analysis.md)) resultó que el supuesto central estaba equivocado.
>
> **Suponía** que el día de la semana explicaba la mayor parte de la variación. **En este hotel no:**
> salvo el lunes, todos los días rinden parecido (índices entre 0,74 y 0,91). Lo que mueve el número
> es **Penny Blue**, que oscila un 58% y pasa de ser el 20% del día a ser el 71%.
>
> El método sigue siendo válido como base, pero **no alcanza solo**. La sección **§11 tiene el
> método corregido** para este hotel en particular. Dejo lo anterior porque explica el razonamiento
> y porque el ajuste por día de la semana igual suma — solo que es lo secundario, no lo principal.

---

## Regla número uno

> **Si el sistema no puede explicar un número en una oración que entienda alguien que no sabe de
> estadística, ese número no se muestra.**

Nada de "modelo predictivo". Nada de "algoritmo de machine learning". Lo que se muestra es:

> *"Si lo que queda del mes se comporta como los martes, miércoles y jueves que ya pasaron,
> cerramos en 840 mil."*

---

## 1. El problema con el promedio simple

La forma obvia de estimar es: **promedio diario × días que faltan**.

    Día 10 · MTD = 300.000 · promedio = 30.000/día · faltan 21 días
    Estimado = 300.000 + (30.000 × 21) = 930.000

Parece razonable. **Y está mal**, por una razón concreta: en un hotel los días no son iguales.

Un ejemplo con números inventados pero realistas:

| Día de la semana | Ingreso típico |
|---|---|
| Lunes | 22.000 |
| Martes | 24.000 |
| Miércoles | 25.000 |
| Jueves | 28.000 |
| Viernes | 38.000 |
| Sábado | 45.000 |
| Domingo | 30.000 |

El promedio de esa semana es **30.286**. Pero si los primeros 10 días del mes incluyeron **dos**
fines de semana, el promedio del MTD va a estar cerca de 33.000, y la proyección se infla en unos
60.000. Si incluyeron **uno solo**, pasa lo contrario.

**El error no es chico y además cambia de signo según el mes.** Eso es lo peor que puede pasarle a
un número que se presenta todos los días: que a veces sobre y a veces falte, sin razón visible.

---

## 2. El método que proponemos: promedio por día de la semana

En vez de un promedio único, se calcula **cuánto rinde cada día de la semana** y se proyectan los
días que faltan según qué día son.

### Paso a paso

**Paso 1 — Índice por día de la semana.**
Con los días ya cargados (del mes actual y del histórico si hay), para cada día de la semana:

    índice(día) = promedio de ese día de la semana ÷ promedio de todos los días

Con la tabla de arriba: lunes 0,73 · martes 0,79 · miércoles 0,83 · jueves 0,92 ·
viernes 1,25 · sábado 1,49 · domingo 0,99.

**Paso 2 — Cuánto vale un "día promedio" este mes.**
No se usa el promedio crudo del MTD, sino uno corregido por los días que efectivamente pasaron:

    base = MTD ÷ (suma de los índices de los días transcurridos)

Así, si el mes arrancó con muchos fines de semana, la base se ajusta hacia abajo sola.

**Paso 3 — Proyectar lo que falta.**

    resto = base × (suma de los índices de los días que faltan)
    estimado = MTD + resto

### Por qué esto es mejor

- Se corrige solo: no importa si el mes empezó lunes o sábado.
- No necesita histórico para funcionar: con dos semanas del mes en curso ya tiene índices propios.
- Con histórico, los índices son mejores, pero el método no cambia.
- **Se explica en una frase.**

### Cuando no alcanza

Si hay menos de 7 días cargados, no hay índices confiables. Ahí el sistema **usa el promedio simple
y lo dice**:

> *"Con 4 días cargados todavía no se puede distinguir un martes de un sábado. Este estimado usa el
> promedio simple y va a cambiar bastante en los próximos días."*

---

## 3. Piso, base y techo

Acá me aparto del brief. **No se arman usando métodos distintos** (eso mezcla el error del método
con la incertidumbre real). Se arman midiendo **cuánto varían de verdad los días comparables**.

Para cada día que falta se miran todos los días del mismo día de la semana que ya se conocen, y en
vez del promedio se usan los percentiles:

| Escenario | Qué usa | Cómo se lee |
|---|---|---|
| **Piso** | Percentil 25 de cada día de la semana | "Si vienen días flojos como los peores que tuvimos" |
| **Base** | La mediana | "Si sigue como viene" |
| **Techo** | Percentil 75 | "Si vienen días buenos como los mejores que tuvimos" |

Ventajas: el rango sale **de los datos del propio hotel**, no de un supuesto; se angosta solo a
medida que avanza el mes (quedan menos días por proyectar); y es honesto — si el hotel tiene días
muy parejos, el rango va a ser angosto, y si son muy dispares, ancho. Eso ya es información.

> **Se muestra la base como número principal**, con el piso y el techo al lado, más chicos.
> Nunca tres números del mismo tamaño: el jefe necesita **un** número.

---

## 4. Comparación con la meta

Sobre el estimado base:

| Situación | Qué muestra | Color |
|---|---|---|
| Estimado ≥ meta | "Llegamos con X de margen" | Verde |
| Estimado entre 95% y 100% de la meta | "Faltan X. Se puede." | Ámbar |
| Estimado < 95% de la meta | "Faltan X. Hacen falta Y por día contra los Z que venimos haciendo." | Rojo |

Esa última línea es la más útil de todo el sistema, porque convierte un problema abstracto en una
instrucción concreta:

> *"Para llegar a la meta hay que hacer 34.500 por día en los 12 días que faltan. Venimos haciendo
> 29.800."*

---

## 5. Explicar por qué cambió respecto de ayer

El brief lo pide y es lo que más se va a usar en la reunión. Se descompone la diferencia en dos
partes que suman exacto:

    Cambio del estimado = (lo de ayer contra lo esperado para ese día) + (efecto de recalcular la base)

Y se escribe en castellano:

> *"El estimado bajó 21.000. Ayer fue miércoles y entraron 19.400 cuando lo esperable para un
> miércoles eran 25.000. Esos 5.600 de menos, aplicados al ritmo de los 17 días que faltan,
> explican la caída."*

Si el cambio es chico (menos del 1%), no se explica nada: se dice "sin cambios relevantes". No hay
que hacer ruido con variaciones que no significan nada.

---

## 6. Los dos casos que rompen todo

### 6.1 Un área no reportó

Es el riesgo más grave de todo el sistema. Si A&B no reportó el día 12, ese día suma menos, el
promedio baja y **el estimado cae sin que haya pasado nada malo en el hotel**.

Qué hace el sistema:

1. Compara las áreas del día contra las que reportaron en los últimos 7 días.
2. Si falta alguna, marca el día como **incompleto** con un cartel bien visible.
3. **Ese día no entra en la base del estimado.** Se calcula sin él.
4. La presentación dice: *"El día 12 está incompleto (falta A&B). No se usó para la proyección."*
5. Cuando llega el dato, se completa y se recalcula todo.

> Sin esto, el sistema miente sin saberlo. Es la validación más importante del proyecto.

### 6.2 Un día fuera de rango (un evento)

Una convención hace que el día 15 sea 3 veces un día normal. Si entra al promedio, la proyección se
va para arriba y no se va a cumplir.

Qué hace el sistema:

1. Marca los días que se apartan mucho de lo esperable para ese día de la semana.
2. Pregunta: **"¿Este día fue algo puntual, o es el nuevo nivel?"**
3. Si es puntual: **el día suma al MTD** (porque la plata entró de verdad) pero **no entra en la
   base** del cálculo del resto.
4. Queda anotado en la presentación: *"El día 15 (convención) no se usó como referencia."*

La distinción entre "suma al acumulado" y "sirve como referencia" es sutil y es la que hace que el
número no se vaya de cauce.

---

## 7. Nivel de confianza — recién cuando haya con qué

El sistema **guarda todos los días lo que proyectó**. Al cerrar el mes compara.

Después de 2 o 3 meses puede decir cosas reales:

> *"En los últimos 3 meses, la proyección del día 10 se desvió en promedio un 4,2%. La del día 20,
> un 1,8%."*

Y a partir de ahí sí se puede poner un rango con fundamento.

**Hasta entonces, el sistema dice exactamente esto:**

> *"Todavía no hay meses cerrados para saber cuánto suele equivocarse esta proyección."*

No se inventa un porcentaje de confianza. Un número inventado que después falla destruye la
credibilidad de todo el sistema, incluidos los números que sí están bien.

---

## 8. Lo que este estimado NO es

Va escrito en la propia presentación, chico pero visible:

> *Proyección estadística sobre lo ya facturado. **No incluye reservas tomadas para los días que
> faltan.***

Un forecast hotelero real usa las reservas en firme. Nosotros no las tenemos porque no hay conexión
con el PMS. Si el jefe cree que el número las incluye, va a tomar decisiones mal. Decirlo cuesta una
línea y evita un problema serio.

---

## 9. Ejemplo completo

Datos inventados. Mes de 31 días, hoy es el día 12.

    MTD (días 1 al 12) ............................. 348.000
    Meta del mes ................................... 900.000

    Índices (calculados con los 12 días + histórico)
      lun 0,74 · mar 0,80 · mié 0,84 · jue 0,91 · vie 1,24 · sáb 1,48 · dom 0,99

    Suma de índices de los días 1 a 12 ............. 11,60
    Base de un día promedio: 348.000 ÷ 11,60 ....... 30.000

    Suma de índices de los días 13 a 31 ............ 19,30
    Resto proyectado: 30.000 × 19,30 ............... 579.000

    ESTIMADO BASE .................................. 927.000
    Piso (percentil 25) ............................ 871.000
    Techo (percentil 75) ........................... 982.000

    Contra la meta ................................. +27.000  (llegamos)

    Cambio contra ayer ............................. +8.000
    Por qué: "Ayer fue sábado y entraron 47.200 cuando lo esperable
              eran 44.400. Ese excedente, aplicado al resto del mes,
              subió el estimado."

    Días excluidos de la base: ninguno.

Eso es lo que va en la presentación. **Todo el cálculo cabe en la pantalla** y cualquiera lo puede
seguir con una calculadora — que es exactamente el punto.

---

## 10. Qué hay que confirmar antes de programarlo

| # | Pregunta | Por qué cambia el cálculo |
|---|---|---|
| 1 | ¿Cuántos meses de histórico hay? | Menos de 2 → sin índices confiables al arrancar el mes |
| 2 | ¿La meta es del mes completo o por área? | Si es por área, hay que proyectar cada área por separado |
| 3 | ¿Hay estacionalidad fuerte entre meses? | Si diciembre es el triple que febrero, el histórico hay que normalizarlo |
| 4 | ¿Los feriados mueven mucho el número? | Habría que tratarlos como día de la semana propio |
| 5 | ¿Se corrigen días para atrás? | Obliga a versionar y a recalcular la serie |
| 6 | ¿Los eventos grandes se conocen con anticipación? | Si sí, se pueden sumar a mano al resto proyectado y mejora muchísimo |

> **La pregunta 6 es la de mayor impacto.** Si la gerente sabe que el día 22 hay una convención, el
> sistema puede sumarla en vez de ignorarla, y la proyección deja de ser puramente estadística para
> acercarse a un forecast de verdad. Es la mejora más grande disponible sin tocar ningún sistema
> externo.

---

# 11. Método corregido para este hotel

Escrito **después** de analizar el archivo real. Esto es lo que hay que programar.

## 11.1 El principio: proyectar por outlet, no el total

Los tres outlets se comportan distinto. Meterlos en un solo promedio mezcla una serie estable con
una que salta al triple. Se proyecta **cada uno por separado y se suman**.

| Outlet | Variabilidad | Cómo se proyecta |
|---|---|---|
| Exchange Lane | 29% | Promedio por día de la semana (§2). Es estable y predecible. |
| In Room Dining | 30% | Igual. Todavía más estable en valores absolutos. |
| **Penny Blue** | **58%** | **Aparte.** Ver 11.2. |

Solo esto ya reduce mucho el error, porque deja de contaminar dos series buenas con una difícil.

## 11.2 Penny Blue: días normales y días de evento

Los datos no son una curva: son **dos grupos**.

    Días normales:  ~760 a ~6.500     (servicio corriente)
    Días de evento: ~12.000 a ~14.900 (banquete, comedor privado, grupo)

No hay casi nada en el medio. Promediarlos da un número que **no ocurre nunca**: ni los días
normales ni los de evento se parecen al promedio.

**Cómo se proyecta:**

    Penny Blue del resto del mes
      = (días normales que faltan   × mediana de días normales)
      + (días de evento que faltan  × mediana de días de evento)

Y la pregunta que el sistema tiene que hacerle a la gerente, una sola vez por mes:

> **"¿Cuántos días de evento quedan en Penny Blue este mes?"**

Con eso la proyección deja de ser una adivinanza estadística. Los eventos **se reservan con
anticipación**, así que ella tiene el dato aunque el sistema no lo tenga. Es la mejora más grande
que puede hacerse sin conectar ningún sistema externo.

Si no lo carga, el sistema usa la proporción histórica de días de evento y **avisa que lo está
suponiendo**:

> *"Estoy asumiendo 4 días de evento en lo que queda del mes, que es la proporción de los últimos
> 3 meses. Si sabés el número real, cargalo: cambia bastante la proyección."*

**Cómo se clasifica un día como "de evento":** por defecto, si Penny Blue supera el punto medio
entre los dos grupos (~9.000 con los datos actuales, recalculado cada mes). La gerente puede
corregir la clasificación de cualquier día con un clic. Nunca se clasifica en silencio: el día
queda marcado y visible.

## 11.3 Qué pasa con los días que faltan

Es el problema más serio (agosto 2026 tiene 11 días de 25). Reglas:

1. **El acumulado del mes solo suma los días que existen.** Nunca se rellena un día faltante con un
   estimado y se lo presenta como si fuera real.
2. La presentación dice, arriba y a la vista: **"Acumulado sobre 11 días cargados de 25
   transcurridos."** El jefe tiene que saber que el número no es el acumulado real.
3. Para la proyección, los días faltantes se tratan como días a proyectar, igual que los futuros.
4. Se muestra un aviso permanente hasta que se completen.

> Si el reporte efectivamente se genera todos los días y solo se guardan algunos, esto se resuelve
> cargando los que faltan y el problema desaparece. **Es la pregunta P0-1.**

## 11.4 Cuál es el rango

Con los datos actuales (33 días, jun-ago 2026), sale de la dispersión real:

- **Base:** mediana de días comparables por outlet
- **Piso:** percentil 25, y **un día de evento menos** de los previstos en Penny Blue
- **Techo:** percentil 75, y **un día de evento más**

El rango de Penny Blue domina el rango total, que es correcto: es de donde viene la incertidumbre
de verdad.

## 11.5 Cómo se explica en la reunión

    Estimado de cierre: 385.000

    De dónde sale:
      Exchange Lane    ·  9 días × 5.640 (mediana de sus días) ....  50.760
      In Room Dining   ·  9 días × 1.840 ..........................  16.560
      Penny Blue       ·  6 días normales × 4.900 ................  29.400
                       ·  3 días de evento × 13.100 ..............  39.300
      Ya facturado en el mes (11 días) .........................  249.000
                                                                  ─────────
                                                                    385.020

    Contra la meta de 400.000: faltan 15.000.

    ⚠ El acumulado cubre 11 días de los 25 transcurridos.
    ⚠ Los 3 días de evento son los que cargó gerencia el día 5.

Cualquiera puede seguir ese cálculo con una calculadora. Ese es el punto: **el jefe tiene que poder
auditarlo en la reunión, no confiar.**

## 11.6 Lo que hay que confirmar para que esto funcione

| # | Pregunta | Sin la respuesta |
|---|---|---|
| 1 | ¿Los días faltantes existen en otro lado? | El acumulado nunca va a ser real |
| 2 | ¿Los días altos de Penny Blue son eventos? | Se cae la base del método |
| 3 | ¿Se sabe con anticipación cuántos eventos hay? | Vuelve a ser adivinanza estadística |
| 4 | ¿Existe meta mensual? ¿De F&B o del hotel? | No hay contra qué comparar |
| 5 | ¿Los números se corrigen después? | Habría que versionar y recalcular |

Las cinco están en [02-preguntas.md](02-preguntas.md) como P0.
