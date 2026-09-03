/* ==========================================================================
   Los datos: dónde están, cómo empezar de cero, cómo hacer una copia
   y cómo pasarlos a otra computadora.

   Mientras no haya base de datos, todo vive en el navegador de cada máquina.
   Estas tres cosas son las que hacen que eso alcance para trabajar.
   ========================================================================== */

/* ¿Lo que hay cargado son los datos de ejemplo? */
function sonDatosDeEjemplo() {
  if (!E.dias.length) return false;
  var deEjemplo = E.dias.filter(function (d) { return d.hoja === 'ejemplo'; }).length;
  return deEjemplo > E.dias.length / 2;
}

function hayDatosPropios() {
  return E.dias.some(function (d) { return d.hoja !== 'ejemplo'; });
}

/* Cuánto lugar ocupa lo guardado. */
function espacioUsado() {
  try {
    var s = localStorage.getItem(CLAVE_G) || '';
    return Math.round(s.length / 1024);
  } catch (e) { return 0; }
}

/* ------------------------------------------------- empezar de cero ----- */

function empezarVacio() {
  var propios = E.dias.filter(function (d) { return d.hoja !== 'ejemplo'; }).length;
  var aviso = propios
    ? T('Vas a borrar') + ' ' + propios + ' ' + T('días que cargaste vos') + '.\n\n' +
      T('Esto no se puede deshacer. ¿Bajaste una copia antes?')
    : T('Se van a borrar los días de ejemplo y vas a arrancar con el sistema vacío.') + '\n\n' +
      T('¿Seguir?');
  if (!confirm(aviso)) return;

  E.dias = [];
  E.meta = {}; E.metaArea = {}; E.eventos = {}; E.marcados = {}; E.notasPersonal = {};
  anotar('Empezó de cero', '');
  guardarTodo();
  MES = new Date().toISOString().slice(0, 7);
  DIA_SEL = null;
  VISTA = 'cargardia';
  pintar();
  decir(T('Listo. El sistema está vacío.'), 'ok');
}

/* ------------------------------------------------------- copia ---------- */

function bajarCopia() {
  var copia = {
    formato: 'reporte-diario', version: 1,
    generado: new Date().toISOString(),
    moneda: E.moneda, idioma: E.idioma, valorHora: E.valorHora,
    equipos: E.equipos, personas: E.personas,
    meta: E.meta, eventos: E.eventos, marcados: E.marcados,
    notasPersonal: E.notasPersonal, mail: E.mail,
    dias: E.dias, historial: E.historial
  };
  var nombre = 'copia-reporte-' + new Date().toISOString().slice(0, 10) + '.json';
  var b = new Blob([JSON.stringify(copia)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = nombre;
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 600);
  anotar('Bajó una copia', E.dias.length + ' días');
  guardarTodo();
  decir(T('Copia bajada') + ': ' + nombre, 'ok');
}

function elegirCopia() {
  var i = document.createElement('input');
  i.type = 'file'; i.accept = '.json,application/json';
  i.onchange = function () { if (i.files[0]) restaurarCopia(i.files[0]); };
  i.click();
}

function restaurarCopia(archivo) {
  var lector = new FileReader();
  lector.onload = function (ev) {
    var c;
    try { c = JSON.parse(ev.target.result); }
    catch (e) { decir(T('Ese archivo no es una copia válida'), 'mal'); return; }

    if (c.formato !== 'reporte-diario' || !Array.isArray(c.dias)) {
      decir(T('Ese archivo no es una copia de este sistema'), 'mal');
      return;
    }

    var propios = E.dias.filter(function (d) { return d.hoja !== 'ejemplo'; }).length;
    var msg = T('La copia tiene') + ' ' + c.dias.length + ' ' + T('días') +
              (c.generado ? ' (' + T('del') + ' ' + c.generado.slice(0, 10) + ')' : '') + '.\n\n' +
              (propios
                ? T('Se va a reemplazar todo lo que tenés cargado ahora') + ' (' + propios + ' ' + T('días') + ').'
                : T('Se va a reemplazar lo que hay ahora.')) + '\n\n' + T('¿Seguir?');
    if (!confirm(msg)) return;

    E.dias = c.dias;
    ['moneda','idioma','valorHora','equipos','personas','meta','eventos',
     'marcados','notasPersonal','mail','historial'].forEach(function (k) {
      if (c[k] !== undefined) E[k] = c[k];
    });
    E.dias.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });

    anotar('Restauró una copia', c.dias.length + ' días');
    guardarTodo();
    var ms = mesesDisponibles();
    if (ms.length) MES = ms[ms.length - 1];
    VISTA = 'resumen';
    pintar();
    decir(T('Copia restaurada') + ': ' + c.dias.length + ' ' + T('días'), 'ok');
  };
  lector.readAsText(archivo, 'UTF-8');
}

/* ------------------------------------------------------- pantalla ------- */

function vistaDatos() {
  var h = cab('Los datos', 'Dónde se guardan y cómo moverlos');

  var ejemplo = sonDatosDeEjemplo();
  var propios = E.dias.filter(function (d) { return d.hoja !== 'ejemplo'; }).length;

  /* --- lo primero: si son de ejemplo, avisarlo fuerte --- */
  if (ejemplo) {
    h += (enIngles()
      ? '<div class="caja mal"><strong>What you are seeing is made-up data.</strong> ' +
        'The ' + E.dias.length + ' days loaded are samples, so you can see how it works. ' +
        '<strong>Before using it for real the system must be emptied</strong>, or the real ' +
        'figures will end up mixed with the fake ones.' +
        '<div style="margin-top:11px"><button class="boton primario" onclick="empezarVacio()">' +
        'Start from scratch</button></div></div>'
      : '<div class="caja mal"><strong>Lo que estás viendo son datos inventados.</strong> ' +
      'Los ' + E.dias.length + ' días cargados son de ejemplo, para que se vea cómo funciona. ' +
      '<strong>Antes de empezar a usarlo en serio hay que vaciarlo</strong>, o los números reales ' +
      'van a quedar mezclados con los falsos.' +
      '<div style="margin-top:11px"><button class="boton primario" onclick="empezarVacio()">' +
      'Empezar de cero</button></div></div>');
  }

  /* --- estado --- */
  h += '<div class="tarjetas" style="margin-bottom:20px">';
  h += tarjeta(ejemplo ? 'mal' : 'acento', 'Días guardados', E.dias.length, 'grande',
    ejemplo ? '<span style="color:var(--mal)">son de ejemplo</span>'
            : (propios ? propios + ' cargados por ustedes' : 'ninguno todavía'));
  h += tarjeta('', 'Espacio usado', espacioUsado(), '', 'KB de unos 5.000 disponibles');
  h += tarjeta('', 'Dónde están', '—', '',
    'En este navegador, en esta computadora. <b>No se comparten.</b>');
  h += '</div>';

  /* --- explicación honesta --- */
  h += '<div class="titulo-seccion">Cómo funciona hoy</div>';
  h += '<div class="marco" style="padding:18px 20px;font-size:12.5px;line-height:1.65">' +
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
        'restaurar o para pasarle los datos a otra persona.</p>') + '</div>';

  /* --- acciones --- */
  h += '<div class="titulo-seccion">Copia de seguridad</div>';
  h += '<div class="marco" style="padding:18px 20px">' +
    '<div style="display:flex;gap:22px;flex-wrap:wrap">' +

    '<div style="flex:1;min-width:230px">' +
    '<div style="font-weight:600;font-size:13px;margin-bottom:5px">Bajar una copia</div>' +
    '<div style="font-size:12px;color:var(--tinta-media);margin-bottom:11px">' +
    'Un archivo con todo: los días, los comentarios, los turnos, los sueldos y las metas.</div>' +
    '<button class="boton primario" onclick="bajarCopia()">Bajar copia</button></div>' +

    '<div style="flex:1;min-width:230px">' +
    '<div style="font-weight:600;font-size:13px;margin-bottom:5px">Restaurar o traer de otra computadora</div>' +
    '<div style="font-size:12px;color:var(--tinta-media);margin-bottom:11px">' +
    'Reemplaza lo que hay ahora por lo que traiga el archivo. Pide confirmación antes.</div>' +
    '<button class="boton" onclick="elegirCopia()">Elegir un archivo</button></div>' +

    '</div></div>';

  h += '<div class="caja gris" style="margin-top:16px">' +
    (enIngles()
      ? '<strong>To work as two people:</strong> have one person enter the days, download the ' +
        'backup when finished and pass it to the other. Not convenient, but it works. The proper ' +
        'fix is the database — explained in <code>docs/08-pasos-para-publicar.md</code>.'
      : '<strong>Para trabajar de a dos:</strong> que una sola persona cargue los días, baje la ' +
        'copia al terminar y se la pase a la otra. No es cómodo, pero funciona. La forma buena de ' +
        'resolverlo es la base de datos — está explicado en <code>docs/08-pasos-para-publicar.md</code>.') +
    '</div>';

  /* --- empezar de cero --- */
  if (typeof bloqueLimpiarViejos === 'function') h += bloqueLimpiarViejos();

  h += '<div class="titulo-seccion">Empezar de cero</div>';
  h += '<div class="marco" style="padding:18px 20px">' +
    '<div style="font-size:12.5px;color:var(--tinta-media);margin-bottom:13px">' +
    (enIngles()
      ? 'Deletes everything entered and leaves the system empty to start with real data. ' +
        (propios ? '<strong style="color:var(--mal)">You have ' + propios + ' of your own days ' +
                   'entered: download a backup first.</strong>' : '')
      : 'Borra todo lo cargado y deja el sistema vacío para arrancar con datos reales. ' +
        (propios ? '<strong style="color:var(--mal)">Tenés ' + propios + ' días propios cargados: ' +
                   'bajá una copia antes.</strong>' : '')) + '</div>' +
    '<div class="acciones" style="border:none;margin:0">' +
    '<button class="boton' + (ejemplo ? ' primario' : '') + '" onclick="empezarVacio()">Empezar de cero</button>' +
    '<button class="boton" onclick="volverDemo()">Volver a los datos de ejemplo</button>' +
    '</div></div>';

  /* --- historial --- */
  if (E.historial.length) {
    h += '<div class="titulo-seccion">' +
      (enIngles() ? 'Latest activity' : 'Últimos movimientos') + '</div>';
    h += '<div class="marco"><table><thead><tr><th style="width:150px">' +
      (enIngles() ? 'When' : 'Cuándo') + '</th>' +
      '<th>' + (enIngles() ? 'What happened' : 'Qué pasó') + '</th></tr></thead><tbody>';
    E.historial.slice(0, 15).forEach(function (x) {
      var f = new Date(x.cuando);
      h += '<tr><td style="color:var(--tinta-suave);font-size:11.5px">' +
        f.toLocaleString(enIngles() ? 'en-AU' : 'es-AR',
          { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) + '</td>' +
        '<td><strong>' + esc(T(x.que)) + '</strong> ' +
        '<span style="color:var(--tinta-media)">' + esc(x.detalle ? T(x.detalle) : '') + '</span></td></tr>';
    });
    h += '</tbody></table></div>';
  }

  return h;
}
