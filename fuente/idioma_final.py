# -*- coding: utf-8 -*-
"""Cierra la traduccion: nombres de franja bilingues, frases armadas en JS, y el resto al diccionario."""
import io, re, time, os
os.chdir(os.path.join(os.path.dirname(__file__), '..', 'app'))

# ---------------------------------------------------------------------------
# 1) Los nombres de las franjas son DATO, no texto fijo: bilingues en el origen
# ---------------------------------------------------------------------------
p = 'js/analisis.js'
s = io.open(p, encoding='utf-8').read()
viejo = """var FRANJAS = [
  { id:'Breakfast', nombre:'Desayuno',  desde:6*60,  hasta:11*60 },
  { id:'Lunch',     nombre:'Almuerzo',  desde:12*60, hasta:15*60 },
  { id:'Dinner',    nombre:'Cena',      desde:17*60, hasta:23*60 },
  { id:'Overnight', nombre:'Madrugada', desde:23*60, hasta:30*60 }
];"""
nuevo = """var FRANJAS_BASE = [
  { id:'Breakfast', es:'Desayuno',  en:'Breakfast', desde:6*60,  hasta:11*60 },
  { id:'Lunch',     es:'Almuerzo',  en:'Lunch',     desde:12*60, hasta:15*60 },
  { id:'Dinner',    es:'Cena',      en:'Dinner',    desde:17*60, hasta:23*60 },
  { id:'Overnight', es:'Madrugada', en:'Overnight', desde:23*60, hasta:30*60 }
];

/* El nombre de la franja se arma segun el idioma: es un dato que se muestra,
   no un texto fijo de la pantalla. */
Object.defineProperty(window, 'FRANJAS', {
  get: function () {
    var en = (typeof enIngles === 'function') && enIngles();
    return FRANJAS_BASE.map(function (f) {
      return { id:f.id, nombre: en ? f.en : f.es, desde:f.desde, hasta:f.hasta };
    });
  }
});"""
assert viejo in s, 'FRANJAS'
s = s.replace(viejo, nuevo)
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------------------------------------------------------------------
# 2) Frases que se arman en JS con datos adentro: bilingues en el origen
# ---------------------------------------------------------------------------
p = 'js/vistas2.js'
s = io.open(p, encoding='utf-8').read()

viejo = """    h += '<div class="caja ok"><strong>Lo que conviene mirar:</strong> en ' +
      nombreMes(MES) + ', cada hora de personal en <strong>' + a.mejor.franja.nombre.toLowerCase() +
      '</strong> generó <strong>' + E.moneda + ' ' + plata(a.mejor.porHora) + '</strong>, ' +
      'contra <strong>' + E.moneda + ' ' + plata(a.peor.porHora) + '</strong> en <strong>' +
      a.peor.franja.nombre.toLowerCase() + '</strong>' +
      (brecha ? ' — ' + brecha + ' veces más' : '') + '. ' +
      'Es donde más margen hay para mover gente o para empujar la venta.</div>';"""
nuevo = """    h += enIngles()
      ? '<div class="caja ok"><strong>Worth looking at:</strong> in ' +
        nombreMes(MES) + ', each staff hour at <strong>' + a.mejor.franja.nombre.toLowerCase() +
        '</strong> generated <strong>' + E.moneda + ' ' + plata(a.mejor.porHora) + '</strong>, ' +
        'against <strong>' + E.moneda + ' ' + plata(a.peor.porHora) + '</strong> at <strong>' +
        a.peor.franja.nombre.toLowerCase() + '</strong>' +
        (brecha ? ' — ' + brecha + ' times more' : '') + '. ' +
        'That is where there is most room to move people or push sales.</div>'
      : '<div class="caja ok"><strong>Lo que conviene mirar:</strong> en ' +
        nombreMes(MES) + ', cada hora de personal en <strong>' + a.mejor.franja.nombre.toLowerCase() +
        '</strong> generó <strong>' + E.moneda + ' ' + plata(a.mejor.porHora) + '</strong>, ' +
        'contra <strong>' + E.moneda + ' ' + plata(a.peor.porHora) + '</strong> en <strong>' +
        a.peor.franja.nombre.toLowerCase() + '</strong>' +
        (brecha ? ' — ' + brecha + ' veces más' : '') + '. ' +
        'Es donde más margen hay para mover gente o para empujar la venta.</div>';"""
assert viejo in s, 'conviene mirar'
s = s.replace(viejo, nuevo)

viejo2 = """      var sinTurnos = a.lista.filter(function (x) { return x.total > 0 && x.horas === 0; });"""
if viejo2 in s:
    s = s.replace(
      """        sinTurnos.map(function (x) { return x.franja.nombre.toLowerCase(); }).join(' y ') +
        (sinTurnos.length === 1 ? ' no aparece' : ' no aparecen') + ' en el cruce</strong> porque no hay ' +
        'turnos cargados en esa franja para esta area. Hay ingresos, pero no queda registrado quien los ' +
        'atendio, asi que no se puede calcular el rendimiento por hora.</div>';""",
      """        sinTurnos.map(function (x) { return x.franja.nombre.toLowerCase(); }).join(enIngles() ? ' and ' : ' y ') +
        (enIngles()
          ? (sinTurnos.length === 1 ? ' does not appear' : ' do not appear') +
            ' in the cross-check</strong> because there are no shifts entered for that slot in this ' +
            'area. There is revenue, but no record of who served it, so revenue per hour cannot be ' +
            'calculated.</div>'
          : (sinTurnos.length === 1 ? ' no aparece' : ' no aparecen') + ' en el cruce</strong> porque ' +
            'no hay turnos cargados en esa franja para esta área. Hay ingresos, pero no queda ' +
            'registrado quién los atendió, así que no se puede calcular el rendimiento por hora.</div>');""")

s = s.replace("""'cuánto se paga la hora. Está en <span class="link" onclick="ir(\\'personal\\')">Personal</span>.</div>';""",
              """(enIngles() ? 'the hourly rate. It is under ' : 'cuánto se paga la hora. Está en ') +
        '<span class="link" onclick="ir(\\'personal\\')">' + (enIngles() ? 'Staff' : 'Personal') +
        '</span>.</div>';""")
s = s.replace("""h += '<div class="caja aviso" style="margin-top:13px">Para ver el costo hace falta cargar ' +""",
              """h += '<div class="caja aviso" style="margin-top:13px">' +
        (enIngles() ? 'To see the cost you need to set ' : 'Para ver el costo hace falta cargar ') +""")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------------------------------------------------------------------
# 3) Resumen de la presentacion
# ---------------------------------------------------------------------------
p = 'js/vistas.js'
s = io.open(p, encoding='utf-8').read()
s = s.replace("""'El día cerró en <strong>'""", """(enIngles() ? 'The day closed at <strong>' : 'El día cerró en <strong>')""")
s = s.replace("""' por encima</strong> del promedio de días parecidos. '""",
              """(enIngles() ? ' above</strong> the average of similar days. ' : ' por encima</strong> del promedio de días parecidos. ')""")
s = s.replace("""' por debajo</strong> del promedio de días parecidos. '""",
              """(enIngles() ? ' below</strong> the average of similar days. ' : ' por debajo</strong> del promedio de días parecidos. ')""")
s = s.replace("""'El acumulado del mes es de <strong>'""",
              """(enIngles() ? 'Month to date is <strong>' : 'El acumulado del mes es de <strong>')""")
s = s.replace("""' días cargados, y la proyección de cierre está en <strong>'""",
              """(enIngles() ? ' days entered, and the forecast close is <strong>' : ' días cargados, y la proyección de cierre está en <strong>')""")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------------------------------------------------------------------
# 4) El resto, al diccionario
# ---------------------------------------------------------------------------
p = 'js/idioma2.js'
s = io.open(p, encoding='utf-8').read()
mas = u"""
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
'<span class="link" onclick="ir(\\'proyeccion\\')">Cargá la meta del mes</span>':
  '<span class="link" onclick="ir(\\'proyeccion\\')">Set the month target</span>',
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
"""
s = s.replace(u"\n/* ---- placeholders ---- */", mas + u"\n/* ---- placeholders ---- */")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------------------------------------------------------------------
# 5) La franja de arriba, traducida
# ---------------------------------------------------------------------------
p = 'index.html'
s = io.open(p, encoding='utf-8').read()
v = str(int(time.time()))
s = re.sub(r'\?v=\d+', '', s)
s = re.sub(r'(src="js/(?!datos-reales)[a-z0-9-]+\.js)"', r'\1?v=' + v + '"', s)
s = re.sub(r'(href="assets/estilos\.css)"', r'\1?v=' + v + '"', s)
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------------------------------------------------------------------
# 6) Las pestanas se cortaban a la derecha
# ---------------------------------------------------------------------------
p = 'assets/estilos.css'
s = io.open(p, encoding='utf-8').read()
s += """
/* La ultima pestana quedaba cortada al hacer scroll */
.tabs{ padding-right:10px; }
.tabs a:last-child{ margin-right:6px; }
"""
io.open(p, 'w', encoding='utf-8').write(s)
print('listo', v)
