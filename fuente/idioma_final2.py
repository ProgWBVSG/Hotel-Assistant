# -*- coding: utf-8 -*-
"""
Arregla la causa de fondo: el traductor cambiaba las etiquetas de adentro
(<strong>, <em>...) antes que la frase completa, y la dejaba a medias.
Ahora solo se traducen bloques enteros; lo que no esta en el diccionario
queda entero en espanol, que es el comportamiento correcto.
"""
import io, re, time, os
os.chdir(os.path.join(os.path.dirname(__file__), '..', 'app'))

# ---------------------------------------------------------------------------
# 1) Sacar las etiquetas de linea del selector de bloques
# ---------------------------------------------------------------------------
p = 'js/idioma.js'
s = io.open(p, encoding='utf-8').read()

s = re.sub(
  r"var SEL_BLOQUES = [^;]+;",
  """var SEL_BLOQUES =
  /* Solo bloques que contienen una frase completa. Las etiquetas de línea
     (<strong>, <em>, <small>) NO van acá: si se tradujeran por separado,
     partirían la frase que las contiene y quedaría mitad en cada idioma. */
  'div.caja,div.pista,div.t-rotulo,div.t-pie,div.titulo-seccion,' +
  'div.vacio h3,div.vacio p,p,td,th,h1,h2,h3,label,button,option,' +
  'div.calculo-desc,div.calculo-total,div.hoja-resumen,div.hoja-nota,' +
  'div.cal-num,div.cal-monto,span.eti,li,div.ayuda';""",
  s, count=1)

# ---------------------------------------------------------------------------
# 2) La franja: una sola funcion, que va y vuelve
# ---------------------------------------------------------------------------
s = re.sub(r"  /\* la franja de arriba es una sola frase.*?\n  \}\n", "", s, flags=re.S)
s = re.sub(r"/\* Si se volvió a español, la franja tiene que volver también\. \*/\nfunction restaurarFranja\(\) \{.*?\n\}\n\n", "", s, flags=re.S)
s = s.replace("  restaurarFranja();\n", "  ajustarFranja();\n")

s = s.replace("function traducirZona(raiz) {",
"""/* La franja de arriba es una sola frase fija: se cambia entera y se puede volver. */
var FRANJA_ES = null;
function ajustarFranja() {
  var fr = document.getElementById('franja');
  if (!fr) return;
  if (FRANJA_ES === null) FRANJA_ES = fr.innerHTML;
  fr.innerHTML = (E.idioma || 'es') === 'en'
    ? '<strong>PROTOTYPE</strong> · Data comes from the real Excel file · ' +
      'Everything is stored only on this computer · ' +
      'Review with IT and legal before using it as an official source'
    : FRANJA_ES;
}

function traducirZona(raiz) {""")

# que se llame siempre, tambien en espanol
s = s.replace("function traducirPantalla() {\n  ajustarFranja();\n  if ((E.idioma || 'es') === 'es') return;",
              "function traducirPantalla() {\n  ajustarFranja();\n  if ((E.idioma || 'es') === 'es') return;")
if 'ajustarFranja();' not in s.split('function traducirPantalla()')[1][:200]:
    s = s.replace("function traducirPantalla() {",
                  "function traducirPantalla() {\n  ajustarFranja();", 1)
# sacar la franja de la lista de zonas (ya se maneja aparte)
s = s.replace("   document.getElementById('franja')].forEach(traducirZona);",
              "   null].forEach(traducirZona);")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------------------------------------------------------------------
# 3) Frases que se arman en JS: bilingues enteras
# ---------------------------------------------------------------------------
p = 'js/vistas2.js'
s = io.open(p, encoding='utf-8').read()

# franjas horarias son un supuesto
viejo = """    '<p><strong>Las franjas horarias son un supuesto:</strong> ' +
    FRANJAS.map(function (f) { return f.nombre.toLowerCase() + ' ' + horaTexto(f.desde) + '–' + horaTexto(f.hasta); }).join(' · ') +
    '. Si en el hotel son otras, hay que corregirlas y todo el cruce con el personal cambia.</p>' +"""
nuevo = """    (enIngles()
      ? '<p><strong>The time slots are an assumption:</strong> ' +
        FRANJAS.map(function (f) { return f.nombre.toLowerCase() + ' ' + horaTexto(f.desde) + '–' + horaTexto(f.hasta); }).join(' · ') +
        '. If the hotel uses different ones, they must be corrected and the whole staff cross-check changes.</p>'
      : '<p><strong>Las franjas horarias son un supuesto:</strong> ' +
        FRANJAS.map(function (f) { return f.nombre.toLowerCase() + ' ' + horaTexto(f.desde) + '–' + horaTexto(f.hasta); }).join(' · ') +
        '. Si en el hotel son otras, hay que corregirlas y todo el cruce con el personal cambia.</p>') +"""
if viejo in s:
    s = s.replace(viejo, nuevo)
    print('franjas supuesto: ok')

# desayuno y almuerzo no aparecen
m = re.search(r"      h \+= '<div class=\"caja gris\" style=\"margin-top:13px\"><strong>' \+\n(.*?)\n    \}", s, re.S)
if m:
    s = s.replace(m.group(0),
"""      h += '<div class="caja gris" style="margin-top:13px"><strong>' +
        sinTurnos.map(function (x) { return x.franja.nombre.toLowerCase(); })
          .join(enIngles() ? ' and ' : ' y ') +
        (enIngles()
          ? (sinTurnos.length === 1 ? ' does not appear' : ' do not appear') +
            ' in the cross-check</strong> because there are no shifts entered for that slot in this ' +
            'area. There is revenue, but no record of who served it, so revenue per hour cannot be ' +
            'calculated.</div>'
          : (sinTurnos.length === 1 ? ' no aparece' : ' no aparecen') +
            ' en el cruce</strong> porque no hay turnos cargados en esa franja para esta área. ' +
            'Hay ingresos, pero no queda registrado quién los atendió, así que no se puede ' +
            'calcular el rendimiento por hora.</div>');
    }""")
    print('sin turnos: ok')
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------------------------------------------------------------------
# 4) vistas4: el aviso de gente sin valor
# ---------------------------------------------------------------------------
p = 'js/vistas4.js'
s = io.open(p, encoding='utf-8').read()
viejo = """    h += '<div class="caja aviso"><strong>' + sinValor.length + ' personas sin valor por hora.</strong> ' +
      'Sus horas no suman al costo, así que el total va a quedar corto. ' +
      'Asignales un equipo o poneles un valor propio: ' +
      sinValor.slice(0, 6).map(function (g) { return esc(g.quien); }).join(', ') +
      (sinValor.length > 6 ? ' y ' + (sinValor.length - 6) + ' más' : '') + '.</div>';"""
nuevo = """    var quienes = sinValor.slice(0, 6).map(function (g) { return esc(g.quien); }).join(', ');
    h += enIngles()
      ? '<div class="caja aviso"><strong>' + sinValor.length + ' people without an hourly rate.</strong> ' +
        'Their hours do not add to the cost, so the total will fall short. ' +
        'Assign them a team or set an own rate: ' + quienes +
        (sinValor.length > 6 ? ' and ' + (sinValor.length - 6) + ' more' : '') + '.</div>'
      : '<div class="caja aviso"><strong>' + sinValor.length + ' personas sin valor por hora.</strong> ' +
        'Sus horas no suman al costo, así que el total va a quedar corto. ' +
        'Asignales un equipo o poneles un valor propio: ' + quienes +
        (sinValor.length > 6 ? ' y ' + (sinValor.length - 6) + ' más' : '') + '.</div>';"""
if viejo in s:
    s = s.replace(viejo, nuevo); print('sin valor: ok')
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------------------------------------------------------------------
# 5) datos-gestion: los parrafos largos, bilingues enteros
# ---------------------------------------------------------------------------
p = 'js/datos-gestion.js'
s = io.open(p, encoding='utf-8').read()
m = re.search(r"  h \+= '<div class=\"marco\" style=\"padding:18px 20px;font-size:12\.5px;line-height:1\.65\">' \+\n.*?padding-top:10px\">Por eso.*?\n", s, re.S)
viejo = s[s.index("  h += '<div class=\"marco\" style=\"padding:18px 20px;font-size:12.5px;line-height:1.65\">' +"):
           s.index("o para pasarle los datos a otra persona.</p></div>';") + len("o para pasarle los datos a otra persona.</p></div>';")]
nuevo = """  h += '<div class="marco" style="padding:18px 20px;font-size:12.5px;line-height:1.65">' +
    (enIngles()
      ? '<p><strong>Yes, it is saved.</strong> Everything you enter stays in this browser even if ' +
        'you close the tab, shut down the computer or weeks go by. There is no save button.</p>' +
        '<p><strong>But it is saved per browser and per computer.</strong> What one person enters, ' +
        'the other cannot see. If you open this on a phone you will see something different than on ' +
        'the computer. It does not even carry from Chrome to Edge on the same machine.</p>' +
        '<p><strong>It can be lost</strong> if browsing data is cleared, if an incognito window is ' +
        'used, or if the browser needs space and clears it on its own. Not common, but it happens.</p>' +
        '<p style="margin-bottom:0"><strong>That is why it is worth downloading a backup now and ' +
        'then</strong> — on Fridays, for example. It is a file you keep wherever you want, and it ' +
        'works to restore or to hand the data to someone else.</p>'
      : '<p><strong>Sí, se guarda.</strong> Todo lo que cargues queda en este navegador aunque ' +
        'cierres la pestaña, apagues la computadora o pasen semanas. No hay que apretar ningún ' +
        'botón de guardar.</p>' +
        '<p><strong>Pero se guarda por navegador y por computadora.</strong> Lo que carga una ' +
        'persona no lo ve la otra. Si abrís esto en el celular, vas a ver otra cosa que en la ' +
        'computadora. Ni siquiera pasa de Chrome a Edge en la misma máquina.</p>' +
        '<p><strong>Se puede perder</strong> si se borran los datos de navegación, si se usa una ' +
        'ventana de incógnito, o si el navegador necesita lugar y limpia solo. No es frecuente, ' +
        'pero pasa.</p>' +
        '<p style="margin-bottom:0"><strong>Por eso conviene bajar una copia cada tanto</strong> — ' +
        'los viernes, por ejemplo. Es un archivo que se guarda donde ustedes quieran y sirve para ' +
        'restaurar o para pasarle los datos a otra persona.</p>') + '</div>';"""
s = s.replace(viejo, nuevo)

viejo2 = s[s.index("  h += '<div class=\"caja gris\" style=\"margin-top:16px\">' +\n    '<strong>Para trabajar de a dos:</strong>"):
            s.index("<code>docs/08-pasos-para-publicar.md</code>.</div>';") + len("<code>docs/08-pasos-para-publicar.md</code>.</div>';")]
nuevo2 = """  h += '<div class="caja gris" style="margin-top:16px">' +
    (enIngles()
      ? '<strong>To work as two people:</strong> have one person enter the days, download the ' +
        'backup when finished and pass it to the other. Not convenient, but it works. The proper ' +
        'fix is the database — explained in <code>docs/08-pasos-para-publicar.md</code>.'
      : '<strong>Para trabajar de a dos:</strong> que una sola persona cargue los días, baje la ' +
        'copia al terminar y se la pase a la otra. No es cómodo, pero funciona. La forma buena de ' +
        'resolverlo es la base de datos — está explicado en <code>docs/08-pasos-para-publicar.md</code>.') +
    '</div>';"""
s = s.replace(viejo2, nuevo2)

viejo3 = s[s.index("    '<div style=\"font-size:12.5px;color:var(--tinta-media);margin-bottom:13px\">' +\n    'Borra todo lo cargado"):
            s.index("'bajá una copia antes.</strong>' : '') + '</div>' +") + len("'bajá una copia antes.</strong>' : '') + '</div>' +")]
nuevo3 = """    '<div style="font-size:12.5px;color:var(--tinta-media);margin-bottom:13px">' +
    (enIngles()
      ? 'Deletes everything entered and leaves the system empty to start with real data. ' +
        (propios ? '<strong style="color:var(--mal)">You have ' + propios + ' of your own days ' +
                   'entered: download a backup first.</strong>' : '')
      : 'Borra todo lo cargado y deja el sistema vacío para arrancar con datos reales. ' +
        (propios ? '<strong style="color:var(--mal)">Tenés ' + propios + ' días propios cargados: ' +
                   'bajá una copia antes.</strong>' : '')) + '</div>' +"""
s = s.replace(viejo3, nuevo3)
io.open(p, 'w', encoding='utf-8').write(s)
print('datos-gestion: ok')

# ---------------------------------------------------------------------------
# 6) Lo que queda, al diccionario
# ---------------------------------------------------------------------------
p = 'js/idioma2.js'
s = io.open(p, encoding='utf-8').read()
mas = u"""
/* ---- ultimos ---- */
'Meta {}': 'Target {}',
'por encima de la meta': 'above target',
'por debajo de la meta': 'below target',
'Las franjas horarias son un supuesto:': 'The time slots are an assumption:',
"""
s = s.replace(u"\n/* ---- placeholders ---- */", mas + u"\n/* ---- placeholders ---- */")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------------------------------------------------------------------
v = str(int(time.time()))
p = 'index.html'
s = io.open(p, encoding='utf-8').read()
s = re.sub(r'\?v=\d+', '', s)
s = re.sub(r'(src="js/(?!datos-reales)[a-z0-9-]+\.js)"', r'\1?v=' + v + '"', s)
s = re.sub(r'(href="assets/estilos\.css)"', r'\1?v=' + v + '"', s)
io.open(p, 'w', encoding='utf-8').write(s)
print('listo', v)
