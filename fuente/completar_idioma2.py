# -*- coding: utf-8 -*-
"""Motor de plantillas mas tolerante + las frases que quedaban."""
import io, re, time, os
os.chdir(os.path.join(os.path.dirname(__file__), '..', 'app'))

# ---------------------------------------------------------------- motor --
p = 'js/idioma2.js'
s = io.open(p, encoding='utf-8').read()

viejo = u"""function plantillaDe(s) {
  var numeros = [];
  var clave = String(s).replace(/[\\d][\\d.,]*/g, function (m) { numeros.push(m); return '{}'; });
  return { clave: clave.replace(/\\s+/g, ' ').trim(), numeros: numeros, original: s };
}"""

nuevo = u"""/* Meses y días, en los dos idiomas: se tratan como un dato más.
   Si no, "Forecast close — August 2026" no encuentra la clave que dice
   "Proyección de cierre — {}", porque el mes ya venía traducido. */
var RE_FECHA = new RegExp(
  '\\\\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|' +
  'January|February|March|April|May|June|July|August|September|October|November|December)' +
  '(\\\\s+de)?\\\\s+\\\\d{4}', 'g');
var RE_DIA = new RegExp(
  '\\\\b(lunes|martes|miércoles|jueves|viernes|sábado|domingo|' +
  'Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\\\\b', 'g');
var RE_MESCORTO = new RegExp(
  '\\\\b(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|' +
  'Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\\\b', 'g');
var RE_DIACORTO = new RegExp(
  '\\\\b(lun|mar|mié|jue|vie|sáb|dom|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\\\\b', 'g');

function plantillaDe(s) {
  var partes = [];
  var t = String(s);

  /* primero lo más largo: "agosto de 2026" entero es un solo dato */
  t = t.replace(RE_FECHA, function (m) { partes.push(m); return '\\u0001'; });
  t = t.replace(RE_DIA, function (m) { partes.push(m); return '\\u0001'; });
  t = t.replace(RE_MESCORTO, function (m) { partes.push(m); return '\\u0001'; });
  t = t.replace(RE_DIACORTO, function (m) { partes.push(m); return '\\u0001'; });
  t = t.replace(/[\\d][\\d.,]*/g, function (m) { partes.push(m); return '\\u0001'; });

  /* los marcadores se ordenan por posición para poder reponerlos */
  var orden = [];
  var i = 0, j = 0;
  var original = String(s);
  var re = new RegExp(
    RE_FECHA.source + '|' + RE_DIA.source + '|' + RE_MESCORTO.source + '|' +
    RE_DIACORTO.source + '|' + '[\\\\d][\\\\d.,]*', 'g');
  var m;
  while ((m = re.exec(original)) !== null) orden.push(m[0]);

  return {
    clave: t.split('\\u0001').join('{}').replace(/\\s+/g, ' ').trim(),
    numeros: orden,
    original: s
  };
}"""

assert viejo in s, 'no se encontro plantillaDe'
s = s.replace(viejo, nuevo)

# ---------------------------------------------- frases que quedaban -----
mas = u"""
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
"""
s = s.replace(u"\n/* ---- placeholders ---- */", mas + u"\n/* ---- placeholders ---- */")
io.open(p, 'w', encoding='utf-8').write(s)

# ------------------------------------------- mas bloques en el selector --
p = 'js/idioma.js'
s = io.open(p, encoding='utf-8').read()
s = s.replace(
  u"'div.cal-num,div.cal-monto,span.eti,strong,em,small,li';",
  u"'div.cal-num,div.cal-monto,span.eti,strong,em,small,li,' +\n  'div.calculo-linea>div,div.ficha-meta>span,div:not([class]),span:not([class])';")
io.open(p, 'w', encoding='utf-8').write(s)

# ------------------------------------------------------------- cache ----
v = str(int(time.time()))
p = 'index.html'
s = io.open(p, encoding='utf-8').read()
s = re.sub(r'\?v=\d+', '', s)
s = re.sub(r'(src="js/[a-z0-9-]+\.js)"', r'\1?v=' + v + '"', s)
s = re.sub(r'(href="assets/estilos\.css)"', r'\1?v=' + v + '"', s)
io.open(p, 'w', encoding='utf-8').write(s)
print('listo', v)
