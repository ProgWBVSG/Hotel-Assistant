# -*- coding: utf-8 -*-
"""Fechas cortas ("24 ago") como un solo dato + las ultimas frases."""
import io, re, time, os
os.chdir(os.path.join(os.path.dirname(__file__), '..', 'app'))

p = 'js/idioma2.js'
s = io.open(p, encoding='utf-8').read()

# "24 ago" tiene que ser UN dato, no dos. Si no, la clave queda con dos {}.
viejo = u"""  /* primero lo más largo: "agosto de 2026" entero es un solo dato */
  t = t.replace(RE_FECHA, function (m) { partes.push(m); return '\\u0001'; });"""
nuevo = u"""  /* primero lo más largo: "agosto de 2026" y "24 ago" son un solo dato */
  t = t.replace(RE_FECHACORTA, function (m) { partes.push(m); return '\\u0001'; });
  t = t.replace(RE_FECHA, function (m) { partes.push(m); return '\\u0001'; });"""
assert viejo in s
s = s.replace(viejo, nuevo)

# declarar el patron nuevo antes de RE_FECHA
s = s.replace(u"var RE_FECHA = new RegExp(",
u"""var RE_FECHACORTA = new RegExp(
  '\\\\b\\\\d{1,2}\\\\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|' +
  'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\\\b', 'g');
var RE_FECHA = new RegExp(""")

# y en el armado del orden
s = s.replace(
  u"    RE_FECHA.source + '|' + RE_DIA.source + '|' + RE_MESCORTO.source + '|' +",
  u"    RE_FECHACORTA.source + '|' + RE_FECHA.source + '|' + RE_DIA.source + '|' + RE_MESCORTO.source + '|' +")

# ------------------------------------------------ ultimas frases --------
mas = u"""
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
"""
s = s.replace(u"\n/* ---- placeholders ---- */", mas + u"\n/* ---- placeholders ---- */")
io.open(p, 'w', encoding='utf-8').write(s)

v = str(int(time.time()))
p = 'index.html'
s = io.open(p, encoding='utf-8').read()
s = re.sub(r'\?v=\d+', '', s)
s = re.sub(r'(src="js/[a-z0-9-]+\.js)"', r'\1?v=' + v + '"', s)
s = re.sub(r'(href="assets/estilos\.css)"', r'\1?v=' + v + '"', s)
io.open(p, 'w', encoding='utf-8').write(s)
print('listo', v)
