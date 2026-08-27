# -*- coding: utf-8 -*-
"""Agrega las frases que faltaban y hace bilingue el texto del mail."""
import io, re, time, os

os.chdir(os.path.join(os.path.dirname(__file__), '..', 'app'))

# ------------------------------------------------ frases que faltaban -----
p = 'js/idioma2.js'
s = io.open(p, encoding='utf-8').read()

nuevas = u"""
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
"""
s = s.replace(u"\n/* ---- placeholders ---- */", nuevas + u"\n/* ---- placeholders ---- */")
io.open(p, 'w', encoding='utf-8').write(s)

# ------------------------------------------------ mail bilingue ----------
p = 'js/vistas4.js'
s = io.open(p, encoding='utf-8').read()

cabecera = u"""  var EN = (E.idioma || 'es') === 'en';
  var R = EN ? {
    tit:'DAILY REVENUE REPORT — FOOD & BEVERAGE', res:'SUMMARY', area:'BY AREA',
    obs:'SHIFT OBSERVATIONS', per:'STAFF', avisos:'ALERTS', general:'General',
    total:'Day total', comp:'Vs similar days', acum:'Month to date',
    proy:'Forecast close', meta:'Month target',
    entre:'between', dias:'days entered of',
    incompleto:'Incomplete day: no report from', eventoDia:'Event day at Penny Blue.',
    cub:'covers', ticket:'avg check', comida:'Food', bebida:'Beverage', desc:'Discounts',
    personas:'people', horas:'hours', costo:'cost', deVenta:'of sales',
    sinRep:'not reported', arriba:'above ', abajo:'below ',
    pie1:'The running total only adds the days entered. The forecast is statistical, based on',
    pie2:'what has already been billed, and excludes bookings held for the remaining days.'
  } : {
    tit:'REPORTE DIARIO DE INGRESOS — ALIMENTOS Y BEBIDAS', res:'RESUMEN', area:'POR ÁREA',
    obs:'OBSERVACIONES DEL TURNO', per:'PERSONAL', avisos:'AVISOS', general:'General',
    total:'Total del día', comp:'Contra días parecidos', acum:'Acumulado del mes',
    proy:'Proyección de cierre', meta:'Meta del mes',
    entre:'entre', dias:'días cargados de',
    incompleto:'Día incompleto: no reportó', eventoDia:'Día de evento en Penny Blue.',
    cub:'cubiertos', ticket:'ticket', comida:'Comida', bebida:'Bebida', desc:'Descuentos',
    personas:'personas', horas:'horas', costo:'costo', deVenta:'de la venta',
    sinRep:'sin reportar', arriba:'por encima ', abajo:'por debajo ',
    pie1:'El acumulado suma solo los días cargados. La proyección es estadística sobre lo ya',
    pie2:'facturado y no incluye reservas tomadas para los días que faltan.'
  };

  L.push(R.tit);"""

viejo = u"  L.push('REPORTE DIARIO DE INGRESOS — ALIMENTOS Y BEBIDAS');"
assert viejo in s, 'no se encontro el encabezado del reporte'
s = s.replace(viejo, cabecera)

reemplazos = [
    (u"L.push('RESUMEN');", u"L.push(R.res);"),
    (u"'  Total del día ........... '", u"'  ' + pad(R.total, 24) + ' '"),
    (u"'  Contra días parecidos ... '", u"'  ' + pad(R.comp, 24) + ' '"),
    (u"'  Acumulado del mes ....... '", u"'  ' + pad(R.acum, 24) + ' '"),
    (u"'  Proyección de cierre .... '", u"'  ' + pad(R.proy, 24) + ' '"),
    (u"'  Meta del mes ............ '", u"'  ' + pad(R.meta, 24) + ' '"),
    (u"' días cargados de '", u"' ' + R.dias + ' '"),
    (u"'   (entre '", u"'   (' + R.entre + ' '"),
    (u"L.push('POR ÁREA');", u"L.push(R.area);"),
    (u"' sin reportar'", u"' ' + R.sinRep"),
    (u"' cubiertos · ticket '", u"' ' + R.cub + ' · ' + R.ticket + ' '"),
    (u"'  Comida '", u"'  ' + R.comida + ' '"),
    (u"'  ·  Bebida '", u"'  ·  ' + R.bebida + ' '"),
    (u"'  ·  Descuentos '", u"'  ·  ' + R.desc + ' '"),
    (u"L.push('AVISOS');", u"L.push(R.avisos);"),
    (u"'  · Día incompleto: no reportó '", u"'  · ' + R.incompleto + ' '"),
    (u"'  · Día de evento en Penny Blue.'", u"'  · ' + R.eventoDia"),
    (u"L.push('OBSERVACIONES DEL TURNO');", u"L.push(R.obs);"),
    (u"(c.area || 'General')", u"(c.area || R.general)"),
    (u"L.push('PERSONAL');", u"L.push(R.per);"),
    (u"' personas · '", u"' ' + R.personas + ' · '"),
    (u"' · costo '", u"' · ' + R.costo + ' '"),
    (u"'% de la venta)'", u"'% ' + R.deVenta + ')'"),
    (u"'por encima '", u"R.arriba"),
    (u"'por debajo '", u"R.abajo"),
    (u"L.push('El acumulado suma solo los días cargados. La proyección es estadística sobre lo ya');",
     u"L.push(R.pie1);"),
    (u"L.push('facturado y no incluye reservas tomadas para los días que faltan.');",
     u"L.push(R.pie2);"),
]
for a, b in reemplazos:
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)

# ------------------------------------------------ cache -----------------
v = str(int(time.time()))
p = 'index.html'
s = io.open(p, encoding='utf-8').read()
s = re.sub(r'\?v=\d+', '', s)
s = re.sub(r'(src="js/[a-z0-9-]+\.js)"', r'\1?v=' + v + '"', s)
s = re.sub(r'(href="assets/estilos\.css)"', r'\1?v=' + v + '"', s)
io.open(p, 'w', encoding='utf-8').write(s)
print('listo', v)
