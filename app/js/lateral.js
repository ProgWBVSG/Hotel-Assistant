/* ==========================================================================
   La barra lateral.

   Trece pestañas en una fila arriba no entran en ninguna pantalla y no dicen
   nada del orden del trabajo. Al costado entran todas, agrupadas por lo que
   se hace en cada momento del día: primero cargar, después mirar, después
   mandar, y al final la configuración, que se toca una vez y no se toca más.

   Se puede achicar a solo íconos con el botón de arriba, y cada grupo se
   abre y se cierra. Lo que quede abierto o cerrado se recuerda.
   ========================================================================== */

/* Los íconos son dibujos simples hechos acá mismo: sin librerías, para que
   la aplicación siga abriendo con doble clic y sin internet. */
var ICONOS = {
  cargardia:   'M12 5v14M5 12h14',
  resumen:     'M4 19V9M10 19V5M16 19v-7M22 19H2',
  dia:         'M3 8h18M7 3v3M17 3v3M4 6h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
  proyeccion:  'M3 17l6-6 4 4 8-8M15 7h6v6',
  horarios:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  personal:    'M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 20v-2a4 4 0 0 0-3-3.9M16.5 3.1a4 4 0 0 1 0 7.8',
  presentacion:'M5 3h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 8h8M8 12h8M8 16h4',
  comentarios: 'M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-5A8 8 0 1 1 21 12z',
  enviar:      'M22 3L11 14M22 3l-7 19-4-8-8-4 19-7z',
  cargar:      'M12 16V4M7 9l5-5 5 5M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2',
  equipos:     'M12 2l3 6 7 1-5 5 1 7-6-3.2L6 21l1-7-5-5 7-1 3-6z',
  pagos:       'M3 7h18a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM2 11h20M6 15h3',
  datos:       'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'
};

/* El menú, en el orden en que se usa durante el día. */
function MENU() {
  var EN = enIngles();
  return [
    { id:'operacion', titulo: EN ? 'Day to day' : 'El día a día',
      items: [
        ['cargardia',   EN ? 'Enter today'    : 'Cargar el día'],
        ['resumen',     EN ? 'Month summary'  : 'Resumen del mes'],
        ['dia',         EN ? 'One day'        : 'Un día'],
        ['comentarios', EN ? 'Notes'          : 'Comentarios']
      ] },
    { id:'analisis', titulo: EN ? 'What the numbers say' : 'Qué dicen los números',
      items: [
        ['proyeccion',  EN ? 'Forecast'       : 'Proyección'],
        ['horarios',    EN ? 'Hours'          : 'Horarios'],
        ['personal',    EN ? 'Staff'          : 'Personal']
      ] },
    { id:'reportes', titulo: EN ? 'To hand over' : 'Para entregar',
      items: [
        ['presentacion', EN ? 'Presentation'  : 'Presentación'],
        ['enviar',       EN ? 'Send'          : 'Enviar']
      ] },
    { id:'ajustes', titulo: EN ? 'Setup' : 'Configuración',
      items: [
        ['equipos',     EN ? 'Teams and pay'  : 'Equipos y sueldos'],
        ['pagos',       EN ? 'Pay rules'      : 'Reglas de pago'],
        ['cargar',      EN ? 'Import Excel'   : 'Cargar Excel'],
        ['datos',       EN ? 'The data'       : 'Los datos']
      ] }
  ];
}

/* --------------------------------------------------------- estado ------- */

function ui() {
  if (!E.ui) E.ui = {};
  if (!E.ui.grupos) E.ui.grupos = {};       /* grupos cerrados a mano */
  if (typeof E.ui.mini !== 'boolean') E.ui.mini = false;
  return E.ui;
}

/* Un grupo arranca abierto; se cierra sólo si la persona lo cerró. */
function grupoAbierto(id) { return ui().grupos[id] !== false; }

function alternarGrupo(id) {
  var u = ui();
  u.grupos[id] = !grupoAbierto(id);
  guardarTodo();
  pintarLateral();
}

/* El grupo donde está la pantalla actual se abre solo: si no, se toca algo
   del menú y parece que no pasó nada. */
function abrirGrupoDe(vista) {
  MENU().forEach(function (g) {
    if (g.items.some(function (i) { return i[0] === vista; })) ui().grupos[g.id] = true;
  });
}

function alternarMini() {
  var u = ui();
  u.mini = !u.mini;
  guardarTodo();
  pintarLateral();
}

/* En el teléfono la barra no achica: se abre encima y se cierra al elegir. */
function esTelefono() { return window.innerWidth <= 900; }

var _LATERAL_ABIERTA = false;
function alternarLateralMovil() {
  _LATERAL_ABIERTA = !_LATERAL_ABIERTA;
  pintarLateral();
}

/* ------------------------------------------------------- dibujo --------- */

function icono(id) {
  var d = ICONOS[id] || ICONOS.resumen;
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
}

function pintarLateral() {
  var lat = document.getElementById('lateral');
  if (!lat) return;
  var EN = enIngles();
  var mini = ui().mini && !esTelefono();

  var h = '<div class="lat-cabeza">' +
    '<div class="lat-marca"><span class="lat-logo">R</span>' +
    '<span class="lat-nombre"><b>' + (EN ? 'Daily Report' : 'Reporte Diario') + '</b>' +
    '<em>' + (EN ? 'Food &amp; Beverage' : 'Alimentos y Bebidas') + '</em></span></div>' +
    '<button class="lat-plegar" onclick="' +
      (esTelefono() ? 'alternarLateralMovil()' : 'alternarMini()') + '" ' +
      'title="' + (mini ? (EN ? 'Show the names' : 'Mostrar los nombres')
                        : (EN ? 'Hide the menu' : 'Esconder el menú')) + '" ' +
      'aria-label="' + (mini ? (EN ? 'Show the names' : 'Mostrar los nombres')
                             : (EN ? 'Hide the menu' : 'Esconder el menú')) + '">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' +
    '</button></div>';

  MENU().forEach(function (g) {
    var abierto = grupoAbierto(g.id) || mini;
    h += '<div class="lat-grupo' + (abierto ? '' : ' cerrado') + '">';
    if (!mini) {
      h += '<button class="lat-titulo" onclick="alternarGrupo(\'' + g.id + '\')" ' +
        'aria-expanded="' + abierto + '">' + g.titulo +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>';
    }
    h += '<div class="lat-items">';
    g.items.forEach(function (it) {
      var act = VISTA === it[0];
      h += '<a href="javascript:ir(\'' + it[0] + '\')" class="lat-item' + (act ? ' activo' : '') + '" ' +
        'title="' + esc(it[1]) + '">' + icono(it[0]) +
        '<span>' + esc(it[1]) + '</span></a>';
    });
    h += '</div></div>';
  });

  lat.innerHTML = h;
  lat.classList.toggle('mini', mini);
  lat.classList.toggle('abierta', _LATERAL_ABIERTA && esTelefono());

  var cap = document.getElementById('lat-capa');
  if (cap) cap.classList.toggle('puesta', _LATERAL_ABIERTA && esTelefono());
  document.body.classList.toggle('lat-mini', mini);
}

/* Al elegir una pantalla en el teléfono, la barra se cierra sola. */
function cerrarLateralSiTelefono() {
  if (esTelefono() && _LATERAL_ABIERTA) { _LATERAL_ABIERTA = false; }
}

window.addEventListener('resize', function () {
  if (!esTelefono()) _LATERAL_ABIERTA = false;
  pintarLateral();
});
