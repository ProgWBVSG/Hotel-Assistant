/* ==========================================================================
   Atajos para cargar el día más rápido.

   1. Pegar desde Excel directo en la grilla (Ctrl+V sobre un casillero).
   2. Enter baja, Tab pasa al de al lado.
   3. Escribir cuentas en el casillero: "1200+340" da 1540.
   4. Autocompletado de nombres del personal.
   5. Plantillas de turno que se aprenden solas del histórico.
   6. Traer la estructura del último día parecido con un botón.
   ========================================================================== */

/* ------------------------------------------------ pegar desde Excel ---- */

/*
   Cuando se copia un bloque de celdas en Excel, el portapapeles trae las
   columnas separadas por tabulaciones y las filas por saltos de línea.
   Se pega tal cual a partir del casillero donde está el cursor.
*/
function pegarEnGrilla(e, area, servIdx, campoIdx) {
  var texto = (e.clipboardData || window.clipboardData).getData('text');
  if (!texto || texto.indexOf('\t') === -1 && texto.indexOf('\n') === -1) return; /* un solo valor: comportamiento normal */
  e.preventDefault();

  var est = ESTRUCTURA[area];
  var columnas = columnasDe(area);
  var filas = texto.replace(/\r/g, '').split('\n').filter(function (f) { return f.trim() !== ''; });

  var puestos = 0, ignorados = 0;
  filas.forEach(function (fila, i) {
    var celdas = fila.split('\t');
    var s = est.servicios[servIdx + i];
    if (!s) { ignorados += celdas.length; return; }
    celdas.forEach(function (celda, j) {
      var c = columnas[campoIdx + j];
      if (!c) { ignorados++; return; }
      if (!aplicaCampo(area, s, c)) { ignorados++; return; }
      var n = limpiarNumero(celda);
      if (n === null) { if (celda.trim()) ignorados++; return; }
      FORM.valores[area + '|' + s + '|' + c] = n;
      puestos++;
    });
  });

  pintar();
  decir(puestos + ' ' + T('valores pegados') +
        (ignorados ? ' · ' + ignorados + ' ' + T('sin ubicar') : ''), puestos ? 'ok' : 'mal');
}

function columnasDe(area) {
  var e = ESTRUCTURA[area];
  var cols = e.campos.slice();
  e.servicios.forEach(function (s) {
    (e.extra[s] || []).forEach(function (c) { if (cols.indexOf(c) === -1) cols.push(c); });
  });
  return cols;
}
function aplicaCampo(area, serv, campo) {
  var e = ESTRUCTURA[area];
  if (e.campos.indexOf(campo) !== -1) return true;
  return (e.extra[serv] || []).indexOf(campo) !== -1;
}

/* Acepta "1.234,50", "$ 1,234.50", "1234", y también cuentas: "300+120". */
function limpiarNumero(s) {
  if (s === null || s === undefined) return null;
  var t = String(s).trim();
  if (!t) return null;

  /* cuenta escrita a mano */
  if (/^[\d\s.,+\-*/()]+$/.test(t) && /[+\-*/]/.test(t.replace(/^-/, ''))) {
    var r = evaluarCuenta(t);
    if (r !== null) return r;
  }

  t = t.replace(/[^\d.,\-]/g, '');
  if (!t) return null;
  var coma = t.lastIndexOf(','), punto = t.lastIndexOf('.');
  if (coma > punto) t = t.replace(/\./g, '').replace(',', '.');
  else t = t.replace(/,/g, '');
  var n = parseFloat(t);
  return isNaN(n) ? null : Math.round(n * 100) / 100;
}

/* Suma/resta simple, sin usar eval. */
function evaluarCuenta(t) {
  var limpio = t.replace(/\s/g, '').replace(/,/g, '.');
  if (!/^[\d.+\-*/()]+$/.test(limpio)) return null;
  try {
    var r = new Function('return (' + limpio + ')')();
    if (typeof r !== 'number' || !isFinite(r)) return null;
    return Math.round(r * 100) / 100;
  } catch (e) { return null; }
}

/* ------------------------------------------------- teclado en grilla --- */

function teclaEnGrilla(e, area, servIdx, campoIdx) {
  if (e.key === 'Enter') {
    e.preventDefault();
    moverFoco(area, servIdx + (e.shiftKey ? -1 : 1), campoIdx);
  }
  if (e.key === 'ArrowDown') { e.preventDefault(); moverFoco(area, servIdx + 1, campoIdx); }
  if (e.key === 'ArrowUp')   { e.preventDefault(); moverFoco(area, servIdx - 1, campoIdx); }
}

function moverFoco(area, servIdx, campoIdx) {
  var id = 'c-' + servIdx + '-' + campoIdx;
  var el = document.getElementById(id);
  if (el) { el.focus(); el.select(); }
}

/* Al salir del casillero, si escribió una cuenta la resuelve. */
function resolverCuenta(el, area, serv, campo) {
  var v = el.value;
  if (!/[+\-*/]/.test(String(v).replace(/^-/, ''))) return;
  var n = evaluarCuenta(v);
  if (n === null) return;
  el.value = n;
  setVal(area, serv, campo, n);
}

/* --------------------------------------------- traer día de referencia - */

/*
   No copia los números: copia la estructura y deja los importes en blanco,
   con la referencia como pista. Copiar los importes de otro día es la forma
   más fácil de guardar un día equivocado.
*/
function traerEstructura() {
  var ref = diaReferencia(FORM.fecha);
  if (!ref) { decir(T('No hay un día anterior para tomar de referencia'), 'mal'); return; }
  FORM.turnos = JSON.parse(JSON.stringify(ref.turnos || []));
  pintar();
  decir(T('Turnos traídos del') + ' ' + fechaCorta(ref.fecha) + '. ' +
        T('Los importes se cargan a mano.'), 'ok');
}

/* --------------------------------------------- nombres del personal ---- */

function nombresConocidos() {
  var m = {};
  E.dias.forEach(function (d) {
    (d.turnos || []).forEach(function (t) { if (t.quien) m[t.quien] = (m[t.quien] || 0) + 1; });
  });
  return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; });
}

/* ------------------------------------------- plantillas de turno ------- */

/*
   Se arman solas: se buscan los horarios que más se repiten en el histórico
   y se ofrecen como botones. No hay que configurar nada.
*/
function plantillasTurno() {
  var m = {};
  E.dias.forEach(function (d) {
    (d.turnos || []).forEach(function (t) {
      if (!t.desde && t.desde !== 0) return;
      var k = t.desde + '-' + t.hasta + '-' + (t.descanso || 0);
      m[k] = m[k] || { desde:t.desde, hasta:t.hasta, descanso:t.descanso || 0, veces:0 };
      m[k].veces++;
    });
  });
  return Object.keys(m).map(function (k) { return m[k]; })
    .filter(function (x) { return x.veces >= 3; })
    .sort(function (a, b) { return b.veces - a.veces; })
    .slice(0, 5)
    .map(function (x) {
      var dur = x.hasta - x.desde;
      x.horas = Math.round(((dur - x.descanso) / 60) * 100) / 100;
      x.nombre = horaTexto(x.desde) + ' – ' + horaTexto(x.hasta);
      return x;
    });
}

function agregarTurnoPlantilla(i) {
  var p = plantillasTurno()[i];
  if (!p) return;
  FORM.turnos.push({ quien:'', desde:p.desde, hasta:p.hasta, descanso:p.descanso, horas:p.horas });
  pintar();
  setTimeout(function () {
    var inputs = document.querySelectorAll('input[list="nombres-staff"]');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }, 60);
}

/* --------------------------------------------------- revisión rápida --- */

/*
   Mientras se carga, marca los casilleros que quedaron muy lejos del día de
   referencia. No bloquea: solo pinta el borde para que se note.
*/
function revisarCasillero(el, area, serv, campo) {
  var ref = diaReferencia(FORM.fecha);
  var r = refServicio(ref, area, serv, campo);
  var v = FORM.valores[area + '|' + serv + '|' + campo];
  el.classList.remove('sospechoso');
  if (r === null || v === undefined || !r || !v) return;
  if (v > r * 4 || v < r / 4) {
    el.classList.add('sospechoso');
    el.title = T('Muy distinto al') + ' ' + fechaCorta(ref.fecha) + ' (' + r + ')';
  }
}
