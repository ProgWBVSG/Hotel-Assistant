/* ==========================================================================
   La pantalla del plantel.

   Antes era una tabla larga: para encontrar a alguien había que bajar hasta
   verlo. Con treinta nombres eso no se puede usar.

   Ahora hay un buscador que filtra al escribir sin repintar la pantalla (si
   repintara, el cursor se saldría del campo en cada tecla), filtros por
   estado y por equipo, y un índice de letras para saltar directo.

   Cada persona se abre en su propia ficha, ahí mismo en la lista: equipo,
   nivel, valor propio y plazo de trabajo.
   ========================================================================== */

var BUSCA_PLANTEL = '';
var FILTRO_PLANTEL = 'trabajan';   /* trabajan | todos | bajas | sinvalor */
var EQUIPO_PLANTEL = '';
var PERSONA_ABIERTA = null;

function vistaPlantel() {
  var EN = enIngles();
  var h = cab(EN ? 'The team' : 'El plantel',
    EN ? 'Who works here, from when to when, and what each hour costs'
       : 'Quién trabaja, desde cuándo hasta cuándo, y cuánto cuesta cada hora');

  var todos = plantel();
  var cuenta = {
    todos: todos.length,
    trabajan: todos.filter(function (g) { return g.estado.activa; }).length,
    bajas: todos.filter(function (g) { return !g.estado.activa; }).length,
    sinvalor: todos.filter(function (g) { return g.estado.activa && !g.valor; }).length
  };

  /* ---------- alta ---------- */
  h += '<div class="acciones" style="border:none;margin-bottom:14px">' +
    '<button class="boton primario" onclick="abrirAlta()">' +
    (EN ? '+ Add someone' : '+ Agregar a alguien') + '</button>' +
    '<span style="font-size:11.5px;color:var(--tinta-suave)">' +
    (EN ? 'people also appear on their own when a shift is entered'
        : 'también aparecen solas cuando se les carga un turno') + '</span></div>';

  if (ALTA_ABIERTA) h += formularioAlta();

  /* ---------- buscador y filtros ---------- */
  h += '<div class="buscador">';
  h += '<div class="buscador-fila">' +
    '<div class="lupa">' + iconoLupa() +
      '<input type="search" id="busca-plantel" placeholder="' +
      (EN ? 'Search by name…' : 'Buscar por nombre…') + '" ' +
      'value="' + esc(BUSCA_PLANTEL) + '" oninput="filtrarPlantel(this.value)" ' +
      'autocomplete="off">' +
      '<button class="lupa-limpiar" onclick="limpiarBusqueda()" ' +
      'aria-label="' + (EN ? 'Clear' : 'Limpiar') + '">&times;</button>' +
    '</div>' +
    '<select class="filtro" onchange="EQUIPO_PLANTEL=this.value;pintar()">' +
      '<option value="">' + (EN ? 'All teams' : 'Todos los equipos') + '</option>' +
      equipos().map(function (eq) {
        return '<option value="' + eq.id + '"' + (EQUIPO_PLANTEL === eq.id ? ' selected' : '') +
          '>' + esc(eq.nombre) + '</option>';
      }).join('') +
      '<option value="_sin"' + (EQUIPO_PLANTEL === '_sin' ? ' selected' : '') + '>' +
      (EN ? 'No team' : 'Sin equipo') + '</option>' +
    '</select>' +
  '</div>';

  h += '<div class="chips-filtro">' +
    [['trabajan', EN ? 'Working' : 'Trabajan', cuenta.trabajan],
     ['todos',    EN ? 'Everyone' : 'Todos',   cuenta.todos],
     ['bajas',    EN ? 'No longer' : 'Ya no trabajan', cuenta.bajas],
     ['sinvalor', EN ? 'No rate' : 'Sin valor', cuenta.sinvalor]
    ].map(function (c) {
      if (c[0] === 'sinvalor' && !c[2]) return '';
      return '<button class="chip' + (FILTRO_PLANTEL === c[0] ? ' puesto' : '') +
        (c[0] === 'sinvalor' ? ' chip-aviso' : '') + '" ' +
        'onclick="FILTRO_PLANTEL=\'' + c[0] + '\';pintar()">' + c[1] +
        '<span class="chip-n">' + c[2] + '</span></button>';
    }).join('') + '</div>';
  h += '</div>';

  /* ---------- la lista ---------- */
  var lista = todos.filter(function (g) {
    if (FILTRO_PLANTEL === 'trabajan' && !g.estado.activa) return false;
    if (FILTRO_PLANTEL === 'bajas' && g.estado.activa) return false;
    if (FILTRO_PLANTEL === 'sinvalor' && (g.valor || !g.estado.activa)) return false;
    if (EQUIPO_PLANTEL === '_sin' && g.equipo) return false;
    if (EQUIPO_PLANTEL && EQUIPO_PLANTEL !== '_sin' && g.equipo !== EQUIPO_PLANTEL) return false;
    return true;
  });

  if (!todos.length) {
    return h + '<div class="vacio"><h3>' +
      (EN ? 'Nobody on the team yet' : 'Todavía no hay nadie en el plantel') + '</h3>' +
      '<p>' + (EN ? 'Add someone, or load a day with shifts.'
                  : 'Agregá a alguien, o cargá un día con turnos.') + '</p></div>';
  }

  /* índice de letras: para saltar sin bajar */
  var letras = {};
  lista.forEach(function (g) { letras[g.quien.charAt(0).toUpperCase()] = 1; });
  var ls = Object.keys(letras).sort();
  if (ls.length > 4) {
    h += '<div class="indice-letras">' + ls.map(function (l) {
      return '<button onclick="irALetra(\'' + l + '\')">' + l + '</button>';
    }).join('') + '</div>';
  }

  h += '<div class="lista-plantel" id="lista-plantel">';
  lista.forEach(function (g) { h += filaPersona(g); });
  h += '</div>';

  h += '<div class="sin-resultado" id="sin-resultado" hidden>' +
    (EN ? 'Nobody matches that name.' : 'Ningún nombre coincide.') + '</div>';

  return h;
}

function iconoLupa() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
}

/* ------------------------------------------------------------- una fila -- */

function filaPersona(g) {
  var EN = enIngles();
  var abierta = PERSONA_ABIERTA === g.quien;
  var est = g.estado;
  var clase = est.activa ? (est.motivo === 'por-vencer' ? 'por-vencer' : 'activa') : 'baja';

  var h = '<div class="fila-p ' + clase + (abierta ? ' abierta' : '') + '" ' +
    'data-nombre="' + esc(g.quien.toLowerCase()) + '" ' +
    'data-letra="' + esc(g.quien.charAt(0).toUpperCase()) + '">';

  h += '<button class="fila-p-cab" onclick="abrirPersona(\'' + escJs(g.quien) + '\')" ' +
    'aria-expanded="' + abierta + '">' +
    '<span class="punto-estado" title="' + esc(textoEstado(est)) + '"></span>' +
    '<span class="p-nombre">' + esc(g.quien) + '</span>' +
    '<span class="p-equipo">' + esc(descripcionPuesto(g)) + '</span>' +
    '<span class="p-estado">' + esc(textoEstado(est)) + '</span>' +
    '<span class="p-valor">' + (g.valor ? AUDc(g.valor) + '<small>/h</small>'
      : '<span class="p-sin">' + (EN ? 'no rate' : 'sin valor') + '</span>') + '</span>' +
    '<span class="p-flecha">' + (abierta ? '&minus;' : '+') + '</span>' +
    '</button>';

  if (abierta) h += fichaEditable(g);
  h += '</div>';
  return h;
}

function descripcionPuesto(g) {
  var eq = g.equipo ? equipoPorId(g.equipo) : null;
  if (!eq) return enIngles() ? 'No team' : 'Sin equipo';
  var niv = g.nivel ? nivelPorId(g.equipo, g.nivel) : null;
  return eq.nombre + (niv ? ' · ' + niv.nombre : '');
}

function escJs(s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

/* ------------------------------------------------------ ficha editable -- */

function fichaEditable(g) {
  var EN = enIngles();
  var f = fichaDe(g.quien);
  var q = escJs(g.quien);
  var v = valorHoraDe(g.quien);

  var h = '<div class="ficha-p">';

  /* --- puesto --- */
  h += '<div class="ficha-grid">';
  h += '<div class="campo"><label>' + (EN ? 'Team' : 'Equipo') + '</label>' +
    '<select onchange="setEquipoPersona(\'' + q + '\',this.value)">' +
    '<option value="">' + (EN ? '— none —' : '— sin equipo —') + '</option>' +
    equipos().map(function (eq) {
      return '<option value="' + eq.id + '"' + (f.equipo === eq.id ? ' selected' : '') + '>' +
        esc(eq.nombre) + '</option>';
    }).join('') + '</select></div>';

  var ns = f.equipo ? nivelesDe(f.equipo) : [];
  h += '<div class="campo"><label>' + (EN ? 'Level' : 'Nivel') + '</label>';
  if (!f.equipo) {
    h += '<div class="campo-nota">' +
      (EN ? 'Pick a team first' : 'Elegí un equipo primero') + '</div>';
  } else if (!ns.length) {
    h += '<div class="campo-nota">' +
      (EN ? 'This team has no levels yet — add them in Teams and pay'
          : 'Este equipo no tiene niveles — se agregan en Equipos y sueldos') + '</div>';
  } else {
    h += '<select onchange="setNivelPersona(\'' + q + '\',this.value)">' +
      '<option value="">' + (EN ? '— team rate —' : '— valor del equipo —') + '</option>' +
      ns.map(function (n) {
        return '<option value="' + n.id + '"' + (f.nivel === n.id ? ' selected' : '') + '>' +
          esc(n.nombre) + (n.valorHora ? ' · ' + AUDc(n.valorHora) : '') + '</option>';
      }).join('') + '</select>';
  }
  h += '</div>';

  h += '<div class="campo"><label>' + (EN ? 'Own rate' : 'Valor propio') + '</label>' +
    '<input type="text" inputmode="decimal" value="' + (f.valorHora || '') + '" ' +
    'placeholder="' + (EN ? 'uses the level' : 'usa el del nivel') + '" ' +
    'onkeypress="soloNumeros(event)" oninput="limpiarSiSobra(this)" ' +
    'onchange="setValorPersona(\'' + q + '\',this.value)">' +
    '<div class="pista">' + (EN ? 'only if this person is an exception'
                                : 'solo si esta persona es una excepción') + '</div></div>';
  h += '</div>';

  /* --- de dónde sale el valor --- */
  h += '<div class="ficha-resuelto">' +
    (EN ? 'Pays ' : 'Cobra ') + '<strong>' + (v.valor ? AUDc(v.valor) : '—') + '</strong>' +
    (EN ? ' per hour' : ' la hora') +
    ' <span class="eti eti-' + (v.origen === 'ninguno' ? 'mal' : 'neutro') + '">' +
    esc(v.detalle) + '</span></div>';

  /* --- plazo --- */
  h += '<div class="ficha-sub">' + (EN ? 'Working period' : 'Plazo de trabajo') + '</div>';
  h += '<div class="caja gris" style="margin-bottom:10px">' +
    (EN ? 'Leave it empty for permanent staff. For an internship or a season, set the end date '
        + 'and the person leaves the list on their own when it arrives — no need to remember.'
        : 'Dejalo vacío para el personal de planta. Para una pasantía o una temporada, poné la '
        + 'fecha de fin y la persona sale sola de la lista cuando llega — no hay que acordarse.') +
    '</div>';
  h += '<div class="ficha-grid">' +
    '<div class="campo"><label>' + (EN ? 'From' : 'Desde') + '</label>' +
    '<input type="date" value="' + (f.desde || '') + '" ' +
    'onchange="setPlazo(\'' + q + '\',\'desde\',this.value)"></div>' +
    '<div class="campo"><label>' + (EN ? 'Until' : 'Hasta') + '</label>' +
    '<input type="date" value="' + (f.hasta || '') + '" ' +
    'onchange="setPlazo(\'' + q + '\',\'hasta\',this.value)"></div>' +
    '</div>';

  if (f.desde && f.hasta) h += barraPlazo(f.desde, f.hasta);

  /* --- historia y acciones --- */
  h += '<div class="ficha-pie">';
  h += '<div class="ficha-datos">' +
    '<span><strong>' + g.turnos + '</strong> ' + (EN ? 'shifts' : 'turnos') + '</span>' +
    '<span><strong>' + g.horas + '</strong> h</span>' +
    (g.costo ? '<span><strong>' + AUD(g.costo) + '</strong> ' +
      (EN ? 'total' : 'en total') + '</span>' : '') +
    (g.ultimo ? '<span>' + (EN ? 'last shift ' : 'último turno ') +
      fechaCorta(g.ultimo) + '</span>' : '') +
    '</div>';

  h += '<div class="ficha-botones">';
  if (g.estado.activa) {
    h += '<button class="boton chico" onclick="darDeBaja(\'' + q + '\')">' +
      (EN ? 'No longer works here' : 'Ya no trabaja acá') + '</button>';
  } else {
    h += '<button class="boton chico primario" onclick="reactivar(\'' + q + '\')">' +
      (EN ? 'Works here again' : 'Vuelve a trabajar') + '</button>';
  }
  if (!g.turnos) {
    h += '<button class="boton chico" onclick="borrarPersona(\'' + q + '\')">' +
      (EN ? 'Delete' : 'Borrar') + '</button>';
  }
  h += '</div></div>';

  h += '</div>';
  return h;
}

/* La barra del plazo: cuánto lleva y cuánto le queda. Para una pasantía es
   el dato que importa. */
function barraPlazo(desde, hasta) {
  var EN = enIngles();
  var hoy = new Date().toISOString().slice(0, 10);
  var a = Date.parse(desde), b = Date.parse(hasta), n = Date.parse(hoy);
  if (isNaN(a) || isNaN(b) || b <= a) return '';
  var pct = Math.max(0, Math.min(100, ((n - a) / (b - a)) * 100));
  var faltan = Math.round((b - n) / 86400000);
  return '<div class="plazo">' +
    '<div class="plazo-barra"><span style="width:' + pct + '%"></span></div>' +
    '<div class="plazo-pie"><span>' + fechaCorta(desde) + '</span>' +
    '<strong>' + (faltan > 0
      ? (EN ? faltan + ' days left' : 'faltan ' + faltan + ' días')
      : (EN ? 'finished' : 'terminó')) + '</strong>' +
    '<span>' + fechaCorta(hasta) + '</span></div></div>';
}

/* ---------------------------------------------------------- interacción -- */

function abrirPersona(q) {
  PERSONA_ABIERTA = (PERSONA_ABIERTA === q) ? null : q;
  pintar();
}

/* Filtra sin repintar: si repintara, el cursor saldría del buscador en cada
   tecla y no se podría escribir un nombre entero. */
function filtrarPlantel(v) {
  BUSCA_PLANTEL = v;
  var q = String(v || '').trim().toLowerCase();
  var lista = document.getElementById('lista-plantel');
  if (!lista) return;
  var visibles = 0;
  Array.prototype.forEach.call(lista.children, function (fila) {
    var n = fila.getAttribute('data-nombre') || '';
    var ok = !q || n.indexOf(q) !== -1;
    fila.hidden = !ok;
    if (ok) visibles++;
  });
  var vacio = document.getElementById('sin-resultado');
  if (vacio) vacio.hidden = visibles > 0;
  var lupa = document.querySelector('.lupa');
  if (lupa) lupa.classList.toggle('con-texto', !!q);
}

function limpiarBusqueda() {
  BUSCA_PLANTEL = '';
  var i = document.getElementById('busca-plantel');
  if (i) { i.value = ''; i.focus(); }
  filtrarPlantel('');
}

function irALetra(l) {
  var lista = document.getElementById('lista-plantel');
  if (!lista) return;
  for (var i = 0; i < lista.children.length; i++) {
    var f = lista.children[i];
    if (!f.hidden && f.getAttribute('data-letra') === l) {
      f.scrollIntoView({ behavior:'smooth', block:'center' });
      f.classList.add('resaltada');
      setTimeout(function () { f.classList.remove('resaltada'); }, 1200);
      return;
    }
  }
}

/* --------------------------------------------------------------- alta ---- */

var ALTA_ABIERTA = false;
function abrirAlta() { ALTA_ABIERTA = !ALTA_ABIERTA; pintar(); }

function formularioAlta() {
  var EN = enIngles();
  var hoy = new Date().toISOString().slice(0, 10);
  var h = '<div class="marco alta" style="padding:18px;margin-bottom:18px">';
  h += '<div class="titulo-chico">' + (EN ? 'New person' : 'Alguien nuevo') + '</div>';
  h += '<div class="ficha-grid">' +
    '<div class="campo"><label>' + (EN ? 'Name' : 'Nombre') + '</label>' +
    '<input type="text" id="alta-nombre" placeholder="' +
    (EN ? 'As it appears on the roster' : 'Como figura en el turnero') + '" ' +
    'onkeydown="if(event.key===\'Enter\')confirmarAlta()"></div>' +
    '<div class="campo"><label>' + (EN ? 'Team' : 'Equipo') + '</label>' +
    '<select id="alta-equipo" onchange="pintarNivelesAlta()">' +
    '<option value="">' + (EN ? '— none —' : '— sin equipo —') + '</option>' +
    equipos().map(function (eq) {
      return '<option value="' + eq.id + '">' + esc(eq.nombre) + '</option>';
    }).join('') + '</select></div>' +
    '<div class="campo"><label>' + (EN ? 'Level' : 'Nivel') + '</label>' +
    '<span id="alta-nivel-caja"><select id="alta-nivel" disabled>' +
    '<option value="">' + (EN ? '— pick a team —' : '— elegí un equipo —') + '</option>' +
    '</select></span></div>' +
    '</div>';

  h += '<div class="ficha-sub">' + (EN ? 'Working period' : 'Plazo de trabajo') +
    ' <span class="opcional">' + (EN ? 'optional' : 'opcional') + '</span></div>';
  h += '<div class="ficha-grid">' +
    '<div class="campo"><label>' + (EN ? 'From' : 'Desde') + '</label>' +
    '<input type="date" id="alta-desde" value="' + hoy + '"></div>' +
    '<div class="campo"><label>' + (EN ? 'Until' : 'Hasta') + '</label>' +
    '<input type="date" id="alta-hasta">' +
    '<div class="pista">' + (EN ? 'for internships and seasons'
                                : 'para pasantías y temporadas') + '</div></div>' +
    '<div class="campo"><label>' + (EN ? 'Own rate' : 'Valor propio') + '</label>' +
    '<input type="text" id="alta-valor" inputmode="decimal" placeholder="' +
    (EN ? 'uses the team' : 'usa el del equipo') + '" ' +
    'onkeypress="soloNumeros(event)" oninput="limpiarSiSobra(this)"></div>' +
    '</div>';

  h += '<div class="acciones" style="border:none;margin-top:14px">' +
    '<button class="boton primario" onclick="confirmarAlta()">' +
    (EN ? 'Add to the team' : 'Agregar al plantel') + '</button>' +
    '<button class="boton" onclick="abrirAlta()">' + (EN ? 'Cancel' : 'Cancelar') + '</button>' +
    '</div></div>';
  return h;
}

function pintarNivelesAlta() {
  var EN = enIngles();
  var eq = document.getElementById('alta-equipo').value;
  var caja = document.getElementById('alta-nivel-caja');
  if (!caja) return;
  var ns = eq ? nivelesDe(eq) : [];
  if (!eq) {
    caja.innerHTML = '<select id="alta-nivel" disabled><option>' +
      (EN ? '— pick a team —' : '— elegí un equipo —') + '</option></select>';
  } else if (!ns.length) {
    caja.innerHTML = '<select id="alta-nivel" disabled><option>' +
      (EN ? 'no levels in this team' : 'sin niveles en este equipo') + '</option></select>';
  } else {
    caja.innerHTML = '<select id="alta-nivel"><option value="">' +
      (EN ? '— team rate —' : '— valor del equipo —') + '</option>' +
      ns.map(function (n) {
        return '<option value="' + n.id + '">' + esc(n.nombre) +
          (n.valorHora ? ' · ' + AUDc(n.valorHora) : '') + '</option>';
      }).join('') + '</select>';
  }
}

function confirmarAlta() {
  var nom = (document.getElementById('alta-nombre') || {}).value || '';
  if (!nom.trim()) {
    decir(T('Falta el nombre'), 'mal');
    var i = document.getElementById('alta-nombre'); if (i) i.focus();
    return;
  }
  if ((E.personas || {})[nom.trim()]) {
    decir(T('Ya hay alguien con ese nombre'), 'mal');
    return;
  }
  var nivEl = document.getElementById('alta-nivel');
  altaPersona(nom, {
    equipo: (document.getElementById('alta-equipo') || {}).value,
    nivel: (nivEl && !nivEl.disabled) ? nivEl.value : null,
    desde: (document.getElementById('alta-desde') || {}).value,
    hasta: (document.getElementById('alta-hasta') || {}).value,
    valorHora: (document.getElementById('alta-valor') || {}).value
  });
  ALTA_ABIERTA = false;
  PERSONA_ABIERTA = nom.trim();
  FILTRO_PLANTEL = 'trabajan';
  pintar();
  decir(T('{} quedó en el plantel').replace('{}', nom.trim()), 'ok');
}
