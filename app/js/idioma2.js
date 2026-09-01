/* ==========================================================================
   Diccionario completo, por frase entera.

   Cada clave es el HTML de un bloque, con los números reemplazados por {}.
   Al traducir se vuelven a poner los números en el mismo orden.

   Se traduce la frase COMPLETA, nunca palabra por palabra: reemplazar palabras
   sueltas mezcla los dos idiomas y queda peor que no traducir.

   Si se agrega una pantalla, hay que volver a extraer los textos. El
   procedimiento está en docs/09-traduccion.md
   ========================================================================== */

var FRASES = {

/* ---- pestaña y pantalla de reglas de pago ---- */
'Reglas de pago': 'Pay rules',
'contra días parecidos': 'vs similar days',
'contra el promedio de {} días parecidos': 'vs the average of {} similar days',
'vs. días parecidos': 'vs similar days',
'% costo': '% cost',

/* ---- registro de movimientos ---- */
'Últimos movimientos': 'Latest activity',
'Abrió WhatsApp con el reporte': 'Opened WhatsApp with the report',
'Abrió el mail del reporte': 'Opened the report email',
'Agregó un feriado': 'Added a public holiday',
'Anotó sobre el personal': 'Added a staffing note',
'Asignó equipo': 'Assigned a team',
'Bajó el resumen': 'Downloaded the summary',
'Bajó una copia': 'Downloaded a backup',
'Cambió el multiplicador del día': 'Changed the day multiplier',
'Cambió el recargo nocturno': 'Changed the night loading',
'Agregó una franja de recargo': 'Added a loading band',
'Quitó una franja de recargo': 'Removed a loading band',
'Dejó las horas sin recargo': 'Set the hours with no loading',
'Cargó los valores del convenio': 'Loaded the award values',
'Cambió el tipo de contrato': 'Changed the contract type',
'Listo: una hora vale lo mismo cualquier día y a cualquier hora':
  'Done: an hour is worth the same any day and at any time',
'Cargados los valores del convenio. Confirmalos con un recibo real.':
  'Award values loaded. Check them against a real payslip.',
'¿Volver a los valores de arranque? Se borran los feriados y las franjas.':
  'Reset to the starting values? Public holidays and bands are cleared.',
'Reglas restauradas': 'Rules reset',
'Marcó como casual': 'Marked as casual',
'Marcó como permanente': 'Marked as permanent',
'Cambió el multiplicador del día (casual)': 'Changed the day multiplier (casual)',
'Cambió el valor hora de un equipo': 'Changed a team hourly rate',
'Cambió el valor hora de una persona': 'Changed a person hourly rate',
'Cambió la meta': 'Changed the target',
'Cargó un Excel': 'Imported an Excel file',
'Cargó un día a mano': 'Entered a day by hand',
'Corrigió un día': 'Corrected a day',
'Empezó de cero': 'Started from scratch',
'Marcó un día': 'Flagged a day',
'Repartió la meta del mes': 'Split the month target',
'Restauró una copia': 'Restored a backup',
'Quitó un feriado': 'Removed a public holiday',
'Volvió a las reglas de fábrica': 'Reset the rules to default',
'Meta repartida según lo que aporta cada área':
  'Target split according to what each area usually brings in',
'El mensaje es largo. Lo copié: pegalo en el chat.':
  'The message is long. I copied it: paste it into the chat.',
'Mensaje copiado': 'Message copied',
'Número guardado': 'Number saved',

/* ---- barra, pestañas, encabezados ---- */
'Reporte diario de ingresos · Alimentos y Bebidas':
  'Daily revenue report · Food & Beverage',
'Resumen del día': 'Daily summary',
'Total del día': 'Day total',
'Total del mes': 'Month total',
'Total del histórico': 'All-time total',
'Acumulado del mes': 'Month to date',
'Días que faltan': 'Days remaining',
'Proyección de cierre': 'Forecast close',
'Contra la meta': 'Vs target',
'Meta del mes': 'Month target',
'Día por día': 'Day by day',
'De dónde viene la plata': 'Where the money comes from',
'Lo que pasó ese día': 'What happened that day',
'Cómo está calculado': 'How it is calculated',
'De dónde sale ese número': 'Where that number comes from',
'Todo el día': 'All day',
'Área': 'Area',
'Días': 'Days',
'Horas': 'Hours',
'Personas': 'People',
'Persona': 'Person',
'Equipo': 'Team',
'Quién': 'Who',
'Dotación': 'Staffing',
'Por hora': 'Per hour',
'Por persona': 'Per person',
'Se aplica': 'Applied',
'De dónde sale': 'Source',
'Valor propio': 'Own rate',
'Valor por hora': 'Hourly rate',
'Valor general por hora': 'Default hourly rate',
'Promedio por día': 'Daily average',
'Promedio por turno': 'Average per shift',
'Horas del mes': 'Month hours',
'Horas pagadas': 'Paid hours',
'Costo de personal': 'Staff cost',
'Costo sobre venta': 'Cost of sales',
'Genera por hora': 'Revenue per hour',
'Franja por franja': 'Slot by slot',
'Cuánto rinde cada hora de personal': 'Revenue per staff hour',
'A qué hora hay gente trabajando': 'When staff are on shift',
'En qué momento entra la plata': 'When the money comes in',
'Días que conviene revisar': 'Days worth reviewing',
'Días de evento que faltan en Penny Blue': 'Remaining event days at Penny Blue',
'Quién trabajó': 'Who worked',
'Qué pasó en Penny Blue': 'What happened at Penny Blue',
'Qué pasó en Exchange Lane': 'What happened at Exchange Lane',
'Qué pasó en In Room Dining': 'What happened at In Room Dining',
'Qué hace cuando lo subís': 'What it does when you upload it',
'Cómo funciona el envío': 'How sending works',
'Enviar el reporte': 'Send the report',
'Así va a llegar': 'This is how it will arrive',
'A quién se le manda': 'Who it goes to',
'Cargar el Excel': 'Import the Excel',
'Cargar el día': 'Add the day',
'Corregir el día': 'Edit the day',
'Guardar el día': 'Save day',
'Guardar los cambios': 'Save changes',
'Salón': 'Floor',
'Supervisión': 'Supervision',
'Español': 'Spanish',
'— sin equipo —': '— no team —',
'valor propio': 'own rate',
'valor general': 'default rate',
'Costo por equipo — {}': 'Cost by team — {}',
'Proyección de cierre — {}': 'Forecast close — {}',
'Resumen de {}': 'Summary — {}',
'Total {}': 'Total {}',
'Último día cargado — {}': 'Last day entered — {}',

/* ---- botones ---- */
'+ Agregar persona': '+ Add person',
'+ Nuevo equipo': '+ New team',
'+ Cargar el día de hoy': '+ Add today',
'Asignar sueltos': 'Assign unassigned',
'Abrir el mail': 'Open email',
'Copiar el texto': 'Copy text',
'Ver la presentación': 'View presentation',
'Ver presentación': 'View presentation',
'No es día de evento': 'Not an event day',
'Volver a los datos de ejemplo': 'Reset to sample data',
'Imprimir o guardar en PDF': 'Print or save as PDF',
'Copiar los del {} ({} personas)': 'Copy from {} ({} people)',

/* ---- pistas y textos cortos ---- */
'Se usa para quien no tenga equipo ni valor propio.':
  'Used for anyone without a team or an own rate.',
'Separá con comas. Se guarda para la próxima.':
  'Separate with commas. Saved for next time.',
'En Australia se paga por hora. Este valor multiplica las horas de cada turno.':
  'In Australia staff are paid hourly. This rate multiplies the hours of each shift.',
'Cuánto se paga la hora (AUD)': 'Hourly rate (AUD)',
'Cuánto se paga la hora ({})': 'Hourly rate ({})',
'Cada hora de personal generó esto en promedio':
  'Each staff hour generated this on average',
'Todavía no cargaste nada': 'Nothing entered yet',
'Todavía no cargaste ningún turno.': 'No shifts entered yet.',
'Se llega con margen': 'Target met with room',
'Día de evento en Penny Blue.': 'Event day at Penny Blue.',
'Arrastrá el reporte acá': 'Drop the report here',
'o hacé clic para buscarlo · archivos .xlsx': 'or click to browse · .xlsx files',
'Nada de esto manda información a ningún lado todavía. El JSON se baja a tu computadora.':
  'None of this sends information anywhere yet. The JSON downloads to your computer.',
'Lo estoy suponiendo por la proporción de los días ya cargados. Si sabés el número real, cargalo.':
  'Assumed from the proportion of days already entered. If you know the real number, enter it.',

/* ---- con números ---- */
'<b>{}</b> días cargados de {}': '<b>{}</b> days entered of {}',
'<b>{} días</b> cargados · promedio <b> {}</b> por día':
  '<b>{} days</b> entered · average <b> {}</b> per day',
'<b>{} días</b> con turnos cargados': '<b>{} days</b> with shifts entered',
'<b>{}</b> días · {} por día': '<b>{}</b> days · {} per day',
'{} horas × {}': '{} hours × {}',
'{}% de la venta': '{}% of sales',
'De cada {} que entran, {} se van en horas':
  'Of every {} that comes in, {} goes to staff hours',
'Entre <b> {}</b> y <b> {}</b>': 'Between <b> {}</b> and <b> {}</b>',
'Supera la meta por <b> {}</b>': 'Above target by <b> {}</b>',
'A <b> {}</b> por día según lo proyectado': 'At <b> {}</b> per day as forecast',
'Consumo promedio <b> {}</b> por persona': 'Average spend <b> {}</b> per person',
'<b> {}</b> comida<br><b> {}</b> bebida · bebida {}% del total':
  '<b> {}</b> food<br><b> {}</b> beverage · beverage {}% of total',
'<b style="color:var(--ok)">+ {}</b> contra días parecidos':
  '<b style="color:var(--ok)">+ {}</b> vs similar days',
'<b style="color:var(--ok)">+ {}</b> contra el promedio de {} días parecidos':
  '<b style="color:var(--ok)">+ {}</b> vs the average of {} similar days',
'<span style="color:var(--aviso)">falta cargar</span>':
  '<span style="color:var(--aviso)">not entered yet</span>',
'<span class="eti eti-acento">valor propio</span>':
  '<span class="eti eti-acento">own rate</span>',
'<span class="eti eti-neutro">valor general</span>':
  '<span class="eti eti-neutro">default rate</span>',
'<span class="eti eti-ok">Supervisión</span>':
  '<span class="eti eti-ok">Supervision</span>',
'<span class="eti eti-ok">Salón</span>':
  '<span class="eti eti-ok">Floor</span>',
'<strong>Salón</strong>': '<strong>Floor</strong>',
'<strong>Supervisión</strong>': '<strong>Supervision</strong>',
'<strong>Sin equipo asignado</strong>': '<strong>No team assigned</strong>',

/* ---- desglose de la proyección ---- */
'<b>Ya facturado</b><small>Suma de los {} días cargados del mes</small>':
  '<b>Already billed</b><small>Sum of the {} days entered this month</small>',
'<b>Exchange Lane</b><small>{} días × {} (mediana de {} días de referencia)</small>':
  '<b>Exchange Lane</b><small>{} days × {} (median of {} reference days)</small>',
'<b>In Room Dining</b><small>{} días × {} (mediana de {} días de referencia)</small>':
  '<b>In Room Dining</b><small>{} days × {} (median of {} reference days)</small>',
'<b>Penny Blue — días normales</b><small>{} días × {} (mediana de {} días de referencia)</small>':
  '<b>Penny Blue — normal days</b><small>{} days × {} (median of {} reference days)</small>',
'<b>Penny Blue — días de evento</b><small>{} días × {} (mediana de {} días de referencia)</small>':
  '<b>Penny Blue — event days</b><small>{} days × {} (median of {} reference days)</small>',

/* ---- párrafos largos ---- */
'<strong>En una frase:</strong> si los {} días que faltan se parecen a los que ya pasaron —con {} días de evento en Penny Blue— el mes cierra alrededor de <strong> {}</strong>.':
  '<strong>In one sentence:</strong> if the {} remaining days behave like the ones already recorded —with {} event days at Penny Blue— the month closes around <strong> {}</strong>.',

'<strong>Se proyecta área por área, no sobre el total.</strong> Las tres se comportan distinto: Exchange Lane e In Room Dining son estables, Penny Blue no.':
  '<strong>Each area is forecast separately, not the total.</strong> The three behave differently: Exchange Lane and In Room Dining are steady, Penny Blue is not.',

'<strong>Penny Blue se separa en dos.</strong> Tiene días normales (alrededor de {}) y días de evento (alrededor de {}). Promediarlos daría un número que no ocurre nunca. El corte está en {}':
  '<strong>Penny Blue is split in two.</strong> It has normal days (around {}) and event days (around {}). Averaging them would give a number that never actually happens. The cut-off is at {}',

'<strong>El piso y el techo</strong> salen de la dispersión real de los días de referencia (percentil {} y {}), más o menos un día de evento. No son supuestos: son lo que ya pasó.':
  '<strong>The floor and ceiling</strong> come from the real spread of the reference days (percentile {} and {}), plus or minus one event day. They are not assumptions: they are what already happened.',

'<strong>El acumulado solo suma los días que existen.</strong> Nunca se rellena un día faltante con un estimado. Si faltan días, el acumulado va a estar por debajo del real y se avisa.':
  '<strong>The running total only adds the days that exist.</strong> A missing day is never filled in with an estimate. If days are missing, the total will be below the real one and it is flagged.',

'<strong>Lo que esto NO es:</strong> una proyección estadística sobre lo ya facturado. <strong>No incluye reservas tomadas para los días que faltan</strong>, porque el sistema no las ve. Si hay eventos grandes ya confirmados, cargalos arriba y el número mejora bastante.':
  '<strong>What this is NOT:</strong> it is a statistical forecast on what has already been billed. <strong>It does not include bookings held for the remaining days</strong>, because the system cannot see them. If there are large confirmed events, enter them above and the number improves considerably.',

'<strong>Día de evento.</strong> Penny Blue hizo {} muy por encima de un día normal. Suma al acumulado, pero no se usa como referencia para proyectar días normales.':
  '<strong>Event day.</strong> Penny Blue did {} well above a normal day. It adds to the running total, but is not used as a reference to forecast normal days.',

'<strong>Contra el día anterior</strong> ({}, dom): + {} Contra el promedio de los últimos {} lun de evento: <strong>+ {}</strong>. Esta segunda comparación es la que vale: un lunes contra un domingo siempre da mal.':
  '<strong>Vs the previous day</strong> ({}, Sun): + {} Vs the average of the last {} event Mondays: <strong>+ {}</strong>. This second comparison is the one that counts: a Monday against a Sunday always looks bad.',

'<strong>Lo que conviene mirar:</strong> en {} cada hora de personal en <strong>cena</strong> generó <strong>AUD {}</strong>, contra <strong>AUD {}</strong> en <strong>madrugada</strong> — {} veces más. Es donde más margen hay para mover gente o para empujar la venta.':
  '<strong>Worth looking at:</strong> in {} each staff hour at <strong>dinner</strong> generated <strong>AUD {}</strong>, against <strong>AUD {}</strong> at <strong>overnight</strong> — {} times more. That is where there is most room to move people or push sales.',

'Se cruzan los ingresos de cada franja con las horas de personal que caen adentro de esa franja. El número que importa es el último: <strong>cuánta plata genera cada hora que se paga</strong>. Cuando es bajo, o sobra gente o falta venta en ese momento.':
  'Revenue for each slot is crossed with the staff hours falling inside it. The number that matters is the last one: <strong>how much each paid hour generates</strong>. When it is low, either there are too many people or not enough sales at that time.',

'<strong>desayuno y almuerzo no aparecen en el cruce</strong> porque no hay turnos cargados en esa franja para esta area. Hay ingresos, pero no queda registrado quien los atendio, asi que no se puede calcular el rendimiento por hora.':
  '<strong>breakfast and lunch do not appear in the cross-check</strong> because there are no shifts entered for that slot in this area. There is revenue, but no record of who served it, so revenue per hour cannot be calculated.',

'<strong>Los ingresos vienen por servicio, no por hora.</strong> El reporte trae desayuno, almuerzo, cena y madrugada — no hay detalle hora por hora. Así que la mayor precisión posible con estos datos es la franja, no la hora exacta.':
  '<strong>Revenue comes by service, not by hour.</strong> The report has breakfast, lunch, dinner and overnight — there is no hour-by-hour detail. So the finest precision available with this data is the slot, not the exact hour.',

'<strong>Las franjas horarias son un supuesto:</strong> desayuno {}:{}–{}:{} · almuerzo {}:{}–{}:{} · cena {}:{}–{}:{} · madrugada {}:{}–{}:{} Si en el hotel son otras, hay que corregirlas y todo el cruce con el personal cambia.':
  '<strong>The time slots are an assumption:</strong> breakfast {}:{}–{}:{} · lunch {}:{}–{}:{} · dinner {}:{}–{}:{} · overnight {}:{}–{}:{} If the hotel uses different ones, they must be corrected and the whole staff cross-check changes.',

'<strong>Los turnos sí tienen hora exacta</strong>, porque están escritos en el reporte (por ejemplo "{}:{} - {}:{} {} min break"). De ahí salen las horas pagadas, descontando el descanso. Los turnos que cruzan la medianoche se manejan bien.':
  '<strong>Shifts do have exact times</strong>, because they are written in the report (for example "{}:{} - {}:{} {} min break"). Paid hours come from there, minus the break. Shifts crossing midnight are handled correctly.',

'<strong>Cuidado con una conclusión apurada:</strong> que una franja rinda poco por hora no siempre significa que sobre gente. Puede que ese personal esté preparando el servicio siguiente. El número marca dónde mirar, no qué hacer.':
  '<strong>Careful with a hasty conclusion:</strong> a slot returning little per hour does not always mean there are too many people. That staff may be setting up the next service. The number shows where to look, not what to do.',

'El sistema compara cada día contra días parecidos: mismas condiciones (evento o normal), horas trabajadas y cuánto rindió cada hora. Cuando algo se sale de lo habitual lo marca — <strong>pero no saca conclusiones solo</strong>. Poné el motivo en la última columna: eso es lo que después explica el mes.':
  'The system compares each day against similar days: same conditions (event or normal), hours worked and revenue per hour. When something falls outside the usual it flags it — <strong>but it does not draw conclusions on its own</strong>. Write the reason in the last column: that is what explains the month later.',

'<strong>Ojo: este costo es parcial.</strong> En el reporte se anotan <b>{} personas por día</b> en promedio ({} horas), y eso da un costo del <b>{}%</b> sobre la venta. En gastronomía ese porcentaje suele estar entre {}% y {}%, así que <strong>lo que figura en el reporte no parece ser todo el equipo</strong>: serían solo los turnos que alguien anota a mano. Sirve para comparar días entre sí, no como costo real de personal.':
  '<strong>Careful: this cost is partial.</strong> The report records <b>{} people per day</b> on average ({} hours), which gives a cost of <b>{}%</b> of sales. In food service that share is usually between {}% and {}%, so <strong>what appears in the report does not seem to be the whole team</strong>: it would only be the shifts someone writes down by hand. Useful to compare days against each other, not as the real staff cost.',

'<strong>Sobre el cálculo.</strong> Las horas salen de los turnos escritos en el reporte, descontando el descanso cuando está anotado ("{} min break"). Los turnos que cruzan la medianoche se calculan bien. El costo usa un valor de hora único: no contempla recargos de fin de semana, feriados, nocturnidad ni categorías distintas. Sirve para comparar días entre sí, no para liquidar sueldos.':
  '<strong>About the calculation.</strong> Hours come from the shifts written in the report, minus the break when noted ("{} min break"). Shifts crossing midnight are calculated correctly. The cost uses a single hourly rate: it does not include weekend, holiday or night loadings, or different classifications. Useful to compare days against each other, not to run payroll.',

'El valor que se aplica a cada persona sale en este orden: <b>{})</b> si tiene un valor propio, ese · <b>{})</b> si no, el de su equipo · <b>{})</b> si no, el valor general. Así se carga una vez por equipo y solo se ajustan las excepciones.':
  'The rate applied to each person is decided in this order: <b>{})</b> if they have an own rate, that one · <b>{})</b> otherwise, their team rate · <b>{})</b> otherwise, the default rate. So you set it once per team and only adjust the exceptions.',

'<strong>Hoy el mail no sale solo.</strong> El botón <b>Abrir el mail</b> abre tu programa de correo con el destinatario, el asunto y todo el reporte ya escrito. Vos lo revisás y le das enviar. Eso es a propósito: el día que un número salga mal, es mejor que lo veas antes de que lo lea tu jefe.':
  '<strong>Today the email does not go out on its own.</strong> The <b>Open email</b> button opens your mail program with the recipient, subject and the whole report already written. You review it and hit send. That is on purpose: the day a number comes out wrong, better you see it before your boss does.',

'<strong>Para que salga automático hace falta un servidor.</strong> Este programa es un archivo que se abre en el navegador: no tiene forma de mandar un mail por su cuenta. Cuando esté armado el Supabase, se le puede agregar un envío programado (por ejemplo, todas las mañanas a las {}).':
  '<strong>Automatic sending needs a server.</strong> This program is a file opened in the browser: it has no way of sending an email on its own. Once Supabase is set up, a scheduled send can be added (for example, every morning at {}).',

'<strong>El JSON ya está listo</strong> para ese momento. El botón "Bajar en JSON" genera exactamente lo que se le va a mandar al servidor cuando exista. Está documentado en <code>docs/{}-envio-por-mail.md</code>.':
  '<strong>The JSON is already prepared</strong> for that moment. The "Download JSON" button generates exactly what will be sent to the server once it exists. Documented in <code>docs/{}-envio-por-mail.md</code>.',

'<strong>El archivo no sale de tu computadora.</strong> Se abre y se lee acá adentro, en el navegador. No se sube a ningún lado.':
  '<strong>The file never leaves your computer.</strong> It is opened and read here, in the browser. It is not uploaded anywhere.',

'Son los comentarios que vienen en el reporte. Hoy quedan dentro de la hoja del día y nadie los vuelve a leer. Acá están todos juntos y se pueden buscar: es donde aparecen los problemas que se repiten.':
  'These are the comments that come in the report. Today they sit inside the day sheet and nobody reads them again. Here they are all together and searchable: this is where recurring problems show up.',

'El día cerró en <strong>AUD {}</strong>, <strong> {} por encima</strong> del promedio de días parecidos. El acumulado del mes es de <strong>AUD {}</strong> sobre {} días cargados, y la proyección de cierre está en <strong>AUD {}</strong>, <strong>por encima de la meta</strong>.':
  'The day closed at <strong>AUD {}</strong>, <strong> {} above</strong> the average of similar days. Month to date is <strong>AUD {}</strong> across {} days entered, and the forecast close is <strong>AUD {}</strong>, <strong>above target</strong>.',

'Acumulado calculado sobre {} días cargados de {} Proyección basada en la mediana de los días de referencia, con {} día(s) de evento previsto(s) en Penny Blue. <strong>La proyección no incluye reservas tomadas para los días que faltan.</strong>':
  'Running total calculated over {} days entered of {} Forecast based on the median of the reference days, with {} expected event day(s) at Penny Blue. <strong>The forecast does not include bookings held for the remaining days.</strong>',

/* ---- pasos del importador ---- */
'<strong>{} Reconoce cada hoja como un día.</strong> Saca la fecha del nombre de la pestaña; si no puede, la busca adentro, en la celda que dice <em>Date</em>.':
  '<strong>{} Reads each sheet as a day.</strong> It takes the date from the tab name; if it cannot, it looks inside, in the cell that says <em>Date</em>.',
'<strong>{} Encuentra las tres áreas solo.</strong> Penny Blue, Exchange Lane e In Room Dining. Entiende que <em>IRD</em>, <em>In Room Dining</em> y <em>in room dining</em> son lo mismo.':
  '<strong>{} Finds the three areas on its own.</strong> Penny Blue, Exchange Lane and In Room Dining. It understands that <em>IRD</em>, <em>In Room Dining</em> and <em>in room dining</em> are the same.',
'<strong>{} Resuelve las celdas combinadas.</strong> Cuando el nombre del área ocupa {} filas, entiende que todas esas filas son de esa área.':
  '<strong>{} Resolves merged cells.</strong> When the area name spans {} rows, it understands that all those rows belong to that area.',
'<strong>{} Ubica cada número en su lugar.</strong> Servicio (desayuno, almuerzo, cena, todo el día) y métrica (cubiertos, comida, bebida, total, ticket promedio, descuentos).':
  '<strong>{} Places each number where it belongs.</strong> Service (breakfast, lunch, dinner, all day) and metric (covers, food, beverage, total, average check, discounts).',
'<strong>{} Rescata los comentarios.</strong> Los reconoce porque son filas de texto que ocupan todo el ancho, y se acuerda debajo de qué área estaban.':
  '<strong>{} Recovers the comments.</strong> It recognises them because they are text rows spanning the full width, and it remembers which area they were under.',
'<strong>{} Calcula lo que el Excel no tiene:</strong> el total del día sumando las tres áreas, y el acumulado del mes.':
  '<strong>{} Calculates what the Excel does not have:</strong> the day total adding the three areas, and the month to date.',

/* ---- días marcados ---- */
'<strong>{}</strong> — Bastantes menos horas que lo habitual ({}% menos).':
  '<strong>{}</strong> — Considerably fewer hours than usual ({}% less).',
'<strong>{}</strong> — Bastantes más horas que lo habitual ({}% más), aunque el rendimiento por hora se sostuvo.':
  '<strong>{}</strong> — Considerably more hours than usual ({}% more), although revenue per hour held up.',
'<strong>{}</strong> — La dotación estuvo en línea con días parecidos.':
  '<strong>{}</strong> — Staffing was in line with similar days.',

/* ---- completados tras revisar pantalla por pantalla ---- */
'{} dias cargados de {} · AUD': '{} days entered of {} · AUD',
'{} días cargados de {} · AUD': '{} days entered of {} · AUD',
'{} días cargados de {} · {}': '{} days entered of {} · {}',
'{} días cargados': '{} days entered',
'Último día cargado — {}': 'Last day entered — {}',
'Basada en {} días cargados · se recalcula con cada día nuevo':
  'Based on {} days entered · recalculated with each new day',
'Horas trabajadas, costo y dotación · {}': 'Hours worked, cost and staffing · {}',
'Cuánto se paga la hora, por equipo y por persona': 'Hourly rate, by team and by person',
'Cómo se fue juntando el mes': 'How the month built up',
'Cómo se fue armando': 'How it built up',
'Traía de antes': 'Before that day',
'Entró ese día': 'Came in that day',
'Lleva juntado': 'Collected so far',
'Falta para la meta': 'Left to target',
'Área:': 'Area:',
'mié': 'Wed', 'sáb': 'Sat', 'mar': 'Tue', 'jue': 'Thu',
'vie': 'Fri', 'lun': 'Mon', 'dom': 'Sun',

/* leyenda del calendario */
'◆ día de evento': '◆ event day',
'Llegó al objetivo': 'Hit target',
'No llegó': 'Below target',
'Se pasó bastante': 'Well above',
'Sin datos': 'No data',
'Objetivo de un día normal: <b>{}</b>': 'Normal day target: <b>{}</b>',
'· de un día de evento: <b>{}</b>': '· event day: <b>{}</b>',
'— sale de repartir la meta del mes.': '— from splitting the month target.',
'— es la mediana de los días ya cargados, porque todavía no hay meta cargada.':
  '— the median of the days entered, since no target has been set yet.',
'El amarillo no quiere decir que esté mal.': 'Yellow does not mean it is bad.',
'Quiere decir que el día se fue tanto por encima que no conviene tomarlo como referencia: si se usa de piso, las cuentas del mes salen infladas y después no se cumplen.':
  'It means the day ran so far above that it should not be taken as a reference: if used as a floor, the month adds up too high and then falls short.',
'La barra clara es lo que ya traía de los días anteriores; la oscura, lo que sumó ese día. La barra completa sería la meta del mes.':
  'The light bar is what carried over from previous days; the dark one is what that day added. The full bar would be the month target.',
'La barra clara es lo que ya traía de los días anteriores; la oscura, lo que sumó ese día.':
  'The light bar is what carried over from previous days; the dark one is what that day added.',

/* tarjetas y tablas */
'· {} días · promedio  {}': '· {} days · average  {}',
'· {} días · promedio {}': '· {} days · average {}',
'{} por día · {}%': '{} per day · {}%',
'{} comentarios registrados en {} días': '{} comments recorded across {} days',
'+ {} vs. días parecidos': '+ {} vs similar days',
'{} horas × {}': '{} hours × {}',
'{} días × {} (mediana de {} días de referencia)':
  '{} days × {} (median of {} reference days)',

/* carga del día */
'Tab pasa al de al lado · Enter baja · se puede pegar un bloque copiado de Excel · se pueden escribir cuentas como <b>{}+{}</b>':
  'Tab moves across · Enter moves down · you can paste a block copied from Excel · you can type sums like <b>{}+{}</b>',
'En gris claro, lo que se hizo el <strong>{}</strong> ({}), para tener una referencia. No se guarda solo: hay que escribirlo.':
  'In light grey, what was done on <strong>{}</strong> ({}), as a reference. It is not saved on its own: it has to be typed.',
'Esto después aparece en la presentación y queda buscable en Observaciones. Evitá poner números de habitación.':
  'This later appears in the presentation and is searchable under Observations. Avoid writing room numbers.',
'Copiar los del {} ({} personas)': 'Copy from {} ({} people)',
'Arrastrá el archivo y el sistema acomoda todo solo':
  'Drop the file and the system sorts it out',

/* horarios y personal */
'Promedio de personas trabajando en cada hora, sobre {} días con turnos cargados. Las barras claras son horas fuera de las franjas de servicio.':
  'Average number of people working each hour, across {} days with shifts entered. Light bars are hours outside the service slots.',
'La columna Horas muestra las del día y, en chico, las habituales para un día parecido. Pasá el mouse por la etiqueta de dotación para ver la explicación completa.':
  'The Hours column shows the day and, in small type, the usual figure for a similar day. Hover over the staffing label to see the full explanation.',

/* ---- ultima revision ---- */
'Objetivo de un día normal: <b>{}</b> · de un día de evento: <b>{}</b> — sale de repartir la meta del mes.':
  'Normal day target: <b>{}</b> · event day: <b>{}</b> — from splitting the month target.',
'Objetivo de un día normal: <b>{}</b> · de un día de evento: <b>{}</b> — es la mediana de los días ya cargados, porque todavía no hay meta cargada.':
  'Normal day target: <b>{}</b> · event day: <b>{}</b> — the median of the days already entered, since no target has been set yet.',
'Objetivo de un día normal:': 'Normal day target:',
'· de un día de evento:': '· event day:',
'Tab pasa al de al lado · Enter baja · se puede pegar un bloque copiado de Excel · se pueden escribir cuentas como <b>{}+{}</b>':
  'Tab moves across · Enter moves down · you can paste a block copied from Excel · you can type sums like <b>{}+{}</b>',
'En gris claro, lo que se hizo el <strong>{}</strong> ({}), para tener una referencia. No se guarda solo: hay que escribirlo.':
  'In light grey, what was done on <strong>{}</strong> ({}), as a reference. It is not saved on its own: it has to be typed.',
'{} por día · {}%': '{} per day · {}%',
'<b>{}</b> por día · {}%': '<b>{}</b> per day · {}%',
'<span><b>{}</b> por día · {}%</span>': '<span><b>{}</b> per day · {}%</span>',
'— Bastantes menos horas que lo habitual ({}% menos).':
  '— Considerably fewer hours than usual ({}% less).',
'— Bastantes más horas que lo habitual ({}% más), aunque el rendimiento por hora se sostuvo.':
  '— Considerably more hours than usual ({}% more), although revenue per hour held up.',
'— La dotación estuvo en línea con días parecidos.':
  '— Staffing was in line with similar days.',
'<strong>Contra el día anterior</strong> ({}, {}): + {}. Contra el promedio de los últimos {} {} de evento: <strong>+ {}</strong>. Esta segunda comparación es la que vale: un lunes contra un domingo siempre da mal.':
  '<strong>Vs the previous day</strong> ({}, {}): + {}. Vs the average of the last {} event {}s: <strong>+ {}</strong>. This second comparison is the one that counts: a Monday against a Sunday always looks bad.',
'<strong>Lo que conviene mirar:</strong> en {}, cada hora de personal en <strong>cena</strong> generó <strong>AUD {}</strong>, contra <strong>AUD {}</strong> en <strong>madrugada</strong> — {} veces más. Es donde más margen hay para mover gente o para empujar la venta.':
  '<strong>Worth looking at:</strong> in {}, each staff hour at <strong>dinner</strong> generated <strong>AUD {}</strong>, against <strong>AUD {}</strong> at <strong>overnight</strong> — {} times more. That is where there is most room to move people or push sales.',

/* ---- cierre ---- */
'Último día cargado — {}': 'Last day entered — {}',
'Copiar los del {} ({} personas)': 'Copy from {} ({} people)',
'Copiar los del {} ({} persona)': 'Copy from {} ({} person)',
'sáb': 'Sat', 'mié': 'Wed', 'lun': 'Mon', 'mar': 'Tue',
'jue': 'Thu', 'vie': 'Fri', 'dom': 'Sun',
'<b>{}</b> por día · {}%': '<b>{}</b> per day · {}%',
'por día · {}%': 'per day · {}%',
'En gris claro, lo que se hizo el': 'In light grey, what was done on',
'({}), para tener una referencia. No se guarda solo: hay que escribirlo.':
  '({}), as a reference. It is not saved on its own: it has to be typed.',
', para tener una referencia. No se guarda solo: hay que escribirlo.':
  ', as a reference. It is not saved on its own: it has to be typed.',
'({}, {}): + {}. Contra el promedio de los últimos {} {} de evento:':
  '({}, {}): + {}. Vs the average of the last {} event {}s:',
'. Esta segunda comparación es la que vale: un lunes contra un domingo siempre da mal.':
  '. This second comparison is the one that counts: a Monday against a Sunday always looks bad.',
'Contra el día anterior': 'Vs the previous day',

/* ---- los datos ---- */
'Los datos': 'Your data',
'Dónde se guardan y cómo moverlos': 'Where they are stored and how to move them',
'Días guardados': 'Days stored',
'Espacio usado': 'Space used',
'Dónde están': 'Where they are',
'Cómo funciona hoy': 'How it works today',
'Copia de seguridad': 'Backup',
'Bajar una copia': 'Download a backup',
'Bajar copia': 'Download backup',
'Restaurar o traer de otra computadora': 'Restore or bring from another computer',
'Elegir un archivo': 'Choose a file',
'Empezar de cero': 'Start from scratch',
'Últimos movimientos': 'Recent activity',
'son de ejemplo': 'these are samples',
'ninguno todavía': 'none yet',
'KB de unos {} disponibles': 'KB of about {} available',
'{} cargados por ustedes': '{} entered by you',
'En este navegador, en esta computadora. <b>No se comparten.</b>':
  'In this browser, on this computer. <b>Not shared.</b>',
'Un archivo con todo: los días, los comentarios, los turnos, los sueldos y las metas.':
  'One file with everything: days, comments, shifts, rates and targets.',
'Reemplaza lo que hay ahora por lo que traiga el archivo. Pide confirmación antes.':
  'Replaces what is here with whatever the file brings. It asks for confirmation first.',
'<strong>Estos números son de ejemplo, no son del hotel.</strong> Antes de cargar días reales hay que vaciar el sistema:':
  '<strong>These figures are samples, not the hotel figures.</strong> Before entering real days the system must be emptied:',
'ir a Los datos': 'go to Your data',
'Listo. El sistema está vacío.': 'Done. The system is empty.',
'Copia bajada': 'Backup downloaded',
'Copia restaurada': 'Backup restored',
'Ese archivo no es una copia válida': 'That file is not a valid backup',
'Ese archivo no es una copia de este sistema': 'That file is not a backup from this system',
'La copia tiene': 'The backup has',
'Vas a borrar': 'You are about to delete',
'días que cargaste vos': 'days you entered',
'Esto no se puede deshacer. ¿Bajaste una copia antes?':
  'This cannot be undone. Did you download a backup first?',
'Se van a borrar los días de ejemplo y vas a arrancar con el sistema vacío.':
  'The sample days will be deleted and you will start with an empty system.',
'¿Seguir?': 'Continue?',
'Se va a reemplazar lo que hay ahora.': 'What is here now will be replaced.',
'Se va a reemplazar todo lo que tenés cargado ahora': 'Everything currently entered will be replaced',
'del': 'from',

/* ---- cierre definitivo ---- */
'PROTOTIPO': 'PROTOTYPE',
'Los datos salen del Excel real': 'Data comes from the real Excel file',
'Todo se guarda solo en esta computadora': 'Everything is stored only on this computer',
'Revisar con sistemas y legales antes de usarlo como fuente oficial':
  'Review with IT and legal before using it as an official source',
'Equipos': 'Teams',
'Idioma': 'Language',
'Bajar en JSON': 'Download JSON',
'sin valor': 'no rate',
'<span class="eti eti-mal">sin valor</span>': '<span class="eti eti-mal">no rate</span>',
'Cargá la meta del mes': 'Set the month target',
'<span class="link" onclick="ir(\'proyeccion\')">Cargá la meta del mes</span>':
  '<span class="link" onclick="ir(\'proyeccion\')">Set the month target</span>',
'Cargá el valor hora arriba': 'Set the hourly rate above',
'Sin meta cargada': 'No target set',
'{} por encima': '{} above',
'{} por debajo': '{} below',

/* equipos y sueldos */
'{} personas sin valor por hora.': '{} people without an hourly rate.',
'<strong>{} personas sin valor por hora.</strong> Sus horas no suman al costo, así que el total va a quedar corto. Asignales un equipo o poneles un valor propio: {} y {} más.':
  '<strong>{} people without an hourly rate.</strong> Their hours do not add to the cost, so the total will fall short. Assign them a team or set an own rate: {} and {} more.',
'Sus horas no suman al costo, así que el total va a quedar corto.':
  'Their hours do not add to the cost, so the total will fall short.',
'Asignales un equipo o poneles un valor propio:': 'Assign them a team or set an own rate:',
'y {} más.': 'and {} more.',

/* pantalla Los datos */
'<strong>Sí, se guarda.</strong> Todo lo que cargues queda en este navegador aunque cierres la pestaña, apagues la computadora o pasen semanas. No hay que apretar ningún botón de guardar.':
  '<strong>Yes, it is saved.</strong> Everything you enter stays in this browser even if you close the tab, shut down the computer or weeks go by. There is no save button to press.',
'Sí, se guarda.': 'Yes, it is saved.',
'<strong>Pero se guarda por navegador y por computadora.</strong> Lo que carga una persona no lo ve la otra. Si abrís esto en el celular, vas a ver otra cosa que en la computadora. Ni siquiera pasa de Chrome a Edge en la misma máquina.':
  '<strong>But it is saved per browser and per computer.</strong> What one person enters, the other cannot see. If you open this on a phone you will see something different than on the computer. It does not even carry from Chrome to Edge on the same machine.',
'Pero se guarda por navegador y por computadora.': 'But it is saved per browser and per computer.',
'<strong>Se puede perder</strong> si se borran los datos de navegación, si se usa una ventana de incógnito, o si el navegador necesita lugar y limpia solo. No es frecuente, pero pasa.':
  '<strong>It can be lost</strong> if browsing data is cleared, if an incognito window is used, or if the browser needs space and clears it on its own. It is not common, but it happens.',
'Se puede perder': 'It can be lost',
'<strong>Por eso conviene bajar una copia cada tanto</strong> — los viernes, por ejemplo. Es un archivo que se guarda donde ustedes quieran y sirve para restaurar o para pasarle los datos a otra persona.':
  '<strong>That is why it is worth downloading a backup now and then</strong> — on Fridays, for example. It is a file you keep wherever you want, and it works to restore or to hand the data to someone else.',
'Por eso conviene bajar una copia cada tanto': 'That is why it is worth downloading a backup now and then',
'<strong>Para trabajar de a dos:</strong> que una sola persona cargue los días, baje la copia al terminar y se la pase a la otra. No es cómodo, pero funciona. La forma buena de resolverlo es la base de datos — está explicado en <code>docs/{}-pasos-para-publicar.md</code>.':
  '<strong>To work as two people:</strong> have one person enter the days, download the backup when finished and pass it to the other. Not convenient, but it works. The proper fix is the database — explained in <code>docs/{}-pasos-para-publicar.md</code>.',
'Para trabajar de a dos:': 'To work as two people:',
'Borra todo lo cargado y deja el sistema vacío para arrancar con datos reales. <strong style="color:var(--mal)">Tenés {} días propios cargados: bajá una copia antes.</strong>':
  'Deletes everything entered and leaves the system empty to start with real data. <strong style="color:var(--mal)">You have {} of your own days entered: download a backup first.</strong>',
'Borra todo lo cargado y deja el sistema vacío para arrancar con datos reales.':
  'Deletes everything entered and leaves the system empty to start with real data.',
'Tenés {} días propios cargados: bajá una copia antes.':
  'You have {} of your own days entered: download a backup first.',

/* ---- ultimos ---- */
'Meta {}': 'Target {}',
'por encima de la meta': 'above target',
'por debajo de la meta': 'below target',
'Las franjas horarias son un supuesto:': 'The time slots are an assumption:',

'<strong>No se llega al ritmo actual.</strong> Para alcanzar la meta hay que hacer <b> {} por día</b> en los {} días que faltan. El promedio de los días cargados es <b> {}</b>.':
  '<strong>Not on track at the current pace.</strong> To reach the target you need <b> {} per day</b> over the {} remaining days. The average of the days entered is <b> {}</b>.',
'Faltan <b> {}</b> para la meta': '<b> {}</b> short of target',
'Hacen falta <b> {}</b> por día. Vienen haciendo {}': 'Needs <b> {}</b> per day. Currently running at {}',
'No se llega al ritmo actual.': 'Not on track at the current pace.',

/* estados vacios */
'No hay días cargados en este mes.': 'No days entered for this month.',
'<h3>No hay días cargados en este mes.</h3>': '<h3>No days entered for this month.</h3>',
'No hay datos de esta área en {}': 'No data for this area in {}',
'No hay turnos cargados en {}': 'No shifts entered in {}',
'Probá con otro mes u otra área.': 'Try another month or area.',
'Los turnos salen de las columnas de la derecha del reporte (nombre, horario y descanso).':
  'Shifts come from the right-hand columns of the report (name, times and break).',
'Sin días en este mes': 'No days in this month',
'Todavía no hay días cargados de este mes': 'No days entered for this month yet',
'Cuando entre el primero, acá va a aparecer cómo se va sumando.':
  'Once the first one is entered, this will show how it adds up.',

'Nada con esa búsqueda': 'Nothing matches that search',
'No hay días cargados': 'No days entered',
'No hay días en este mes': 'No days in this month',
'Todavía no hay turnos cargados': 'No shifts entered yet',
'Todavía no hay un día anterior para comparar.': 'There is no previous day to compare with yet.',
'Las personas aparecen solas cuando se cargan turnos, desde el Excel o a mano.':
  'People appear automatically once shifts are entered, from Excel or by hand.',

'Hoja original: {}': 'Source sheet: {}',
'Hoja original: ejemplo': 'Source sheet: sample',
'Hoja original': 'Source sheet',

/* turnos por area */
'Quién trabajó en {}': 'Who worked at {}',
'Ese día no tiene turnos de': 'That day has no shifts for',
'turnos traídos': 'shifts copied',
'Turnos por área:': 'Shifts by area:',
'sin área:': 'no area:',
'suele estar en': 'usually works at',

/* ---- placeholders ---- */
'@@PH@@Buscar en las observaciones…': '@@PH@@Search observations…',
'@@PH@@Sin meta cargada': '@@PH@@No target set',
'@@PH@@Lo mismo que se escribe en el reporte: cómo estuvo el servicio, si hubo algún reclamo, si vino un grupo, si hubo demoras…':
  '@@PH@@The same as in the report: how service went, whether there was a complaint, a group, or delays…',
'@@PH@@Ej: {}': '@@PH@@e.g. {}',
'@@PH@@Nombre': '@@PH@@Name',
'@@PH@@Motivo…': '@@PH@@Reason…',
'@@PH@@sin valor': '@@PH@@no rate',

/* ---- títulos emergentes ---- */
'@@TI@@Borrar el equipo': '@@TI@@Delete team',
'@@TI@@Pone en este equipo a todos los que todavía no tienen uno':
  '@@TI@@Puts everyone without a team into this one',
'@@TI@@Se repite {} veces en el histórico': '@@TI@@Repeats {} times in the history',
'@@TI@@Sin datos cargados': '@@TI@@No data entered',
'@@TI@@Sin referencia': '@@TI@@No reference',
'@@TI@@La dotación estuvo en línea con días parecidos.':
  '@@TI@@Staffing was in line with similar days.',
'@@TI@@Bastantes menos horas que lo habitual ({}% menos).':
  '@@TI@@Considerably fewer hours than usual ({}% less).',
'@@TI@@El {} fue {}': '@@TI@@On {} it was {}',
'@@TI@@{}:{} — {} personas en promedio': '@@TI@@{}:{} — {} people on average',
'@@TI@@{} - {} | objetivo {} ({}%) - Abajo del objetivo':
  '@@TI@@{} - {} | target {} ({}%) - Below target',
'@@TI@@{} - {} | objetivo {} ({}%) - En objetivo':
  '@@TI@@{} - {} | target {} ({}%) - On target',
'@@TI@@{} - {} | objetivo {} ({}%) - Muy por encima':
  '@@TI@@{} - {} | target {} ({}%) - Well above'
};

/* ==========================================================================
   Motor: plantilla + búsqueda + reinyección de números
   ========================================================================== */

var _PLANT = null;

/* Meses y días, en los dos idiomas: se tratan como un dato más.
   Si no, "Forecast close — August 2026" no encuentra la clave que dice
   "Proyección de cierre — {}", porque el mes ya venía traducido. */
var RE_FECHACORTA = new RegExp(
  '\\b\\d{1,2}\\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|' +
  'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\b', 'g');
var RE_FECHA = new RegExp(
  '\\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|' +
  'January|February|March|April|May|June|July|August|September|October|November|December)' +
  '(\\s+de)?\\s+\\d{4}', 'g');
var RE_DIA = new RegExp(
  '\\b(lunes|martes|miércoles|jueves|viernes|sábado|domingo|' +
  'Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\\b', 'g');
var RE_MESCORTO = new RegExp(
  '\\b(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|' +
  'Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\b', 'g');
var RE_DIACORTO = new RegExp(
  '\\b(lun|mar|mié|jue|vie|sáb|dom|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\\b', 'g');

function plantillaDe(s) {
  var partes = [];
  var t = String(s);

  /* primero lo más largo: "agosto de 2026" y "24 ago" son un solo dato */
  t = t.replace(RE_FECHACORTA, function (m) { partes.push(m); return '\u0001'; });
  t = t.replace(RE_FECHA, function (m) { partes.push(m); return '\u0001'; });
  t = t.replace(RE_DIA, function (m) { partes.push(m); return '\u0001'; });
  t = t.replace(RE_MESCORTO, function (m) { partes.push(m); return '\u0001'; });
  t = t.replace(RE_DIACORTO, function (m) { partes.push(m); return '\u0001'; });
  t = t.replace(/[\d][\d.,]*/g, function (m) { partes.push(m); return '\u0001'; });

  /* los marcadores se ordenan por posición para poder reponerlos */
  var orden = [];
  var i = 0, j = 0;
  var original = String(s);
  var re = new RegExp(
    RE_FECHACORTA.source + '|' + RE_FECHA.source + '|' + RE_DIA.source + '|' + RE_MESCORTO.source + '|' +
    RE_DIACORTO.source + '|' + '[\\d][\\d.,]*', 'g');
  var m;
  while ((m = re.exec(original)) !== null) orden.push(m[0]);

  return {
    clave: t.split('\u0001').join('{}').replace(/\s+/g, ' ').trim(),
    numeros: orden,
    original: s
  };
}

function rellenar(plantilla, numeros) {
  var i = 0;
  return plantilla.replace(/\{\}/g, function () { return numeros[i++] !== undefined ? numeros[i - 1] : ''; });
}

function tablaFrases() {
  if (!_PLANT) {
    _PLANT = {};
    for (var k in FRASES) _PLANT[k] = FRASES[k];
    /* el diccionario viejo sigue sirviendo para textos sueltos y pestañas */
    if (typeof DIC !== 'undefined') for (var j in DIC) if (!_PLANT[j]) _PLANT[j] = DIC[j];
  }
  return _PLANT;
}

/* Traduce un texto completo. Devuelve null si no está en el diccionario:
   así el que llama sabe que tiene que dejarlo como estaba. */
function traducirFrase(txt) {
  if (!txt) return null;
  var t = tablaFrases();
  var p = plantillaDe(txt);
  if (t[p.clave] === undefined) return null;
  return rellenar(t[p.clave], p.numeros);
}
