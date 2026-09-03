/* ==========================================================================
   Sacar los días viejos.

   El histórico arrastra días de hace más de un año que ya no sirven para
   nada: ensucian los promedios, hacen más lenta la sincronización y llenan
   la lista de gente que hace rato no trabaja.

   Borrar días es irreversible, así que esta pantalla no borra por su cuenta:
   muestra exactamente cuántos días y cuánta facturación se van a ir, y
   recién ahí aparece el botón.
   ========================================================================== */

var CORTE_LIMPIEZA = '';

function bloqueLimpiarViejos() {
  var EN = enIngles();
  if (!E.dias.length) return '';

  var fechas = E.dias.map(function (d) { return d.fecha; }).sort();
  var primera = fechas[0], ultima = fechas[fechas.length - 1];

  /* Propuesta: dejar los últimos doce meses contados desde el último día
     cargado. Es lo que sirve para comparar contra el año pasado. */
  if (!CORTE_LIMPIEZA) {
    var f = new Date(ultima + 'T00:00:00Z');
    f.setUTCFullYear(f.getUTCFullYear() - 1);
    var sugerido = f.toISOString().slice(0, 10);
    CORTE_LIMPIEZA = sugerido > primera ? sugerido : primera;
  }

  var seVan = E.dias.filter(function (d) { return d.fecha < CORTE_LIMPIEZA; });
  var quedan = E.dias.length - seVan.length;
  var plataQueSeVa = seVan.reduce(function (a, d) { return a + (totalDia(d) || 0); }, 0);

  var h = '<div class="titulo-seccion">' +
    (EN ? 'Remove old days' : 'Sacar los días viejos') + '</div>';

  h += '<div class="caja gris">' +
    (EN ? 'Days from a long time ago drag down the averages and make everything slower. '
        + 'Pick a cut-off date: everything before it goes, everything from that day on stays. '
        + '<strong>Download a backup first</strong> — this cannot be undone.'
        : 'Los días de hace mucho ensucian los promedios y hacen todo más lento. '
        + 'Elegí una fecha de corte: se va todo lo anterior y queda todo lo de esa fecha en '
        + 'adelante. <strong>Bajá una copia antes</strong> — esto no se puede deshacer.') +
    '</div>';

  h += '<div class="marco" style="padding:18px">';
  h += '<div class="corte-fila">' +
    '<div class="campo" style="margin:0">' +
    '<label>' + (EN ? 'Keep from' : 'Dejar desde el') + '</label>' +
    '<input type="date" value="' + CORTE_LIMPIEZA + '" min="' + primera + '" max="' + ultima + '" ' +
    'onchange="CORTE_LIMPIEZA=this.value;pintar()"></div>' +
    '<div class="corte-atajos">' +
    ['12', '6', '3'].map(function (m) {
      return '<button class="boton chico" onclick="corteMeses(' + m + ')">' +
        (EN ? 'Last ' + m + ' months' : 'Últimos ' + m + ' meses') + '</button>';
    }).join('') + '</div>' +
    '</div>';

  h += '<div class="corte-balance">' +
    '<div class="corte-lado se-va">' +
      '<div class="corte-n">' + seVan.length + '</div>' +
      '<div class="corte-rot">' + (EN ? 'days removed' : 'días que se van') + '</div>' +
      (seVan.length ? '<div class="corte-det">' + fechaCorta(seVan[0].fecha) + ' – ' +
        fechaCorta(seVan[seVan.length - 1].fecha) + '<br>' + AUD(plataQueSeVa) + '</div>' : '') +
    '</div>' +
    '<div class="corte-lado se-queda">' +
      '<div class="corte-n">' + quedan + '</div>' +
      '<div class="corte-rot">' + (EN ? 'days kept' : 'días que quedan') + '</div>' +
      (quedan ? '<div class="corte-det">' + fechaCorta(CORTE_LIMPIEZA) + ' – ' +
        fechaCorta(ultima) + '</div>' : '') +
    '</div>' +
  '</div>';

  if (!seVan.length) {
    h += '<div class="pista" style="text-align:center;margin-top:12px">' +
      (EN ? 'Nothing to remove with that date.' : 'Con esa fecha no se va nada.') + '</div>';
  } else {
    h += '<div class="acciones" style="border:none;margin-top:16px;justify-content:center">' +
      '<button class="boton" onclick="bajarCopia()">' +
      (EN ? '1. Download a backup' : '1. Bajar una copia') + '</button>' +
      '<button class="boton peligro" onclick="borrarAnteriores()">' +
      (EN ? '2. Remove those ' : '2. Sacar esos ') + seVan.length +
      (EN ? ' days' : ' días') + '</button></div>';
  }
  h += '</div>';
  return h;
}

function corteMeses(n) {
  var fechas = E.dias.map(function (d) { return d.fecha; }).sort();
  var f = new Date(fechas[fechas.length - 1] + 'T00:00:00Z');
  f.setUTCMonth(f.getUTCMonth() - n);
  CORTE_LIMPIEZA = f.toISOString().slice(0, 10);
  pintar();
}

function borrarAnteriores() {
  var EN = enIngles();
  var seVan = E.dias.filter(function (d) { return d.fecha < CORTE_LIMPIEZA; });
  if (!seVan.length) return;

  var aviso = (EN
    ? 'This removes ' + seVan.length + ' days, from ' + fechaCorta(seVan[0].fecha) + ' to ' +
      fechaCorta(seVan[seVan.length - 1].fecha) + '.\n\nIt cannot be undone. Continue?'
    : 'Se van ' + seVan.length + ' días, del ' + fechaCorta(seVan[0].fecha) + ' al ' +
      fechaCorta(seVan[seVan.length - 1].fecha) + '.\n\nNo se puede deshacer. ¿Seguir?');
  if (!confirm(aviso)) return;

  var fechasQueSeVan = seVan.map(function (d) { return d.fecha; });
  E.dias = E.dias.filter(function (d) { return d.fecha >= CORTE_LIMPIEZA; });

  /* los meses que ya no existen no tienen por qué guardar su meta */
  var mesesQueQuedan = {};
  E.dias.forEach(function (d) { mesesQueQuedan[mesDe(d.fecha)] = 1; });
  [E.meta, E.metaArea, E.eventos].forEach(function (obj) {
    if (!obj) return;
    Object.keys(obj).forEach(function (m) { if (!mesesQueQuedan[m]) delete obj[m]; });
  });
  if (E.marcados) {
    Object.keys(E.marcados).forEach(function (f) {
      if (f < CORTE_LIMPIEZA) delete E.marcados[f];
    });
  }

  /* el corte queda registrado y se sincroniza: las demás computadoras
     tambien se limpian al bajarlo, en vez de resubir los dias viejos */
  if (!E.corteHistorial || CORTE_LIMPIEZA > E.corteHistorial) E.corteHistorial = CORTE_LIMPIEZA;
  anotar('Sacó los días viejos', fechasQueSeVan.length + ' días anteriores al ' + CORTE_LIMPIEZA);
  guardarTodo();

  /* que se vayan también de la nube, si no vuelven en la próxima bajada */
  if (typeof encolar === 'function' && typeof puedeUsarNube === 'function' && puedeUsarNube()) {
    fechasQueSeVan.forEach(function (f) { encolar('borrarDia', { fecha: f }); });
  }

  var ms = mesesDisponibles();
  MES = ms.length ? ms[ms.length - 1] : MES;
  DIA_SEL = null;
  pintar();
  decir(T('Listo. Quedaron {} días.').replace('{}', E.dias.length), 'ok');
}
