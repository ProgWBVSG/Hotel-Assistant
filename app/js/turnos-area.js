/* ==========================================================================
   Los turnos son de cada área, no del día entero.

   En Penny Blue no trabaja la misma gente que en In Room Dining. Antes todos
   los turnos iban juntos y al cambiar de área se veían mezclados. Ahora cada
   área tiene los suyos, y el sistema aprende solo quién suele trabajar dónde.
   ========================================================================== */

/* --------------------------------------------------- quién trabaja dónde -- */

/*
   No hay que configurar nada: se mira el histórico y se cuenta en qué área
   apareció cada persona. Con eso se ordenan las sugerencias.
*/
var _CACHE_AREAS = null;

function areasDeCadaPersona() {
  if (_CACHE_AREAS) return _CACHE_AREAS;
  var m = {};
  E.dias.forEach(function (d) {
    (d.turnos || []).forEach(function (t) {
      if (!t.quien) return;
      var p = m[t.quien] = m[t.quien] || { quien: t.quien, total: 0, conArea: 0, areas: {} };
      p.total++;
      if (t.area) { p.conArea++; p.areas[t.area] = (p.areas[t.area] || 0) + 1; }
    });
  });
  Object.keys(m).forEach(function (k) {
    var p = m[k];
    var mejor = null, max = 0;
    for (var a in p.areas) if (p.areas[a] > max) { max = p.areas[a]; mejor = a; }
    /* El porcentaje se mide sobre los turnos que SÍ tienen área anotada.
       Sobre el total daría un número engañoso: en el Excel real hay muchos
       turnos sin área, y alguien con 2 turnos anotados en un área parecería
       trabajar ahí solo el 3% del tiempo. */
    p.habitual = (max >= 2 || p.conArea === max) ? mejor : null;
    p.pesoHabitual = p.conArea ? Math.round((max / p.conArea) * 100) : 0;
    p.turnosHabitual = max;
  });
  _CACHE_AREAS = m;
  return m;
}
function olvidarAreas() { _CACHE_AREAS = null; }

/* Cuántas veces trabajó esta persona en esta área. */
function vecesEn(quien, area) {
  var p = areasDeCadaPersona()[quien];
  return p ? (p.areas[area] || 0) : 0;
}

/*
   Nombres para sugerir en un área: primero los que suelen trabajar ahí,
   después el resto. Así el autocompletado propone lo probable.
*/
function nombresDeArea(area) {
  var todos = areasDeCadaPersona();
  var lista = Object.keys(todos).map(function (k) { return todos[k]; });
  var propios = lista.filter(function (p) { return (p.areas[area] || 0) > 0; })
    .sort(function (a, b) { return (b.areas[area] || 0) - (a.areas[area] || 0); });
  var otros = lista.filter(function (p) { return !(p.areas[area] || 0); })
    .sort(function (a, b) { return b.total - a.total; });
  return { propios: propios, otros: otros };
}

/* Horarios que más se repiten EN ESA ÁREA. La cena de un restaurante no
   arranca a la misma hora que el turno de room service. */
function plantillasDeArea(area) {
  var m = {};
  E.dias.forEach(function (d) {
    (d.turnos || []).forEach(function (t) {
      if (t.area && t.area !== area) return;
      if (!t.desde && t.desde !== 0) return;
      var k = t.desde + '-' + t.hasta + '-' + (t.descanso || 0);
      m[k] = m[k] || { desde:t.desde, hasta:t.hasta, descanso:t.descanso || 0, veces:0, propias:0 };
      m[k].veces++;
      if (t.area === area) m[k].propias++;
    });
  });
  return Object.keys(m).map(function (k) { return m[k]; })
    .filter(function (x) { return x.veces >= 3; })
    .sort(function (a, b) { return (b.propias - a.propias) || (b.veces - a.veces); })
    .slice(0, 4)
    .map(function (x) {
      x.horas = Math.round((((x.hasta - x.desde) - x.descanso) / 60) * 100) / 100;
      x.nombre = horaTexto(x.desde) + ' – ' + horaTexto(x.hasta);
      return x;
    });
}

/* ------------------------------------------------ turnos del formulario -- */

function turnosDe(area) {
  return (FORM.turnos || []).filter(function (t) { return t.area === area; });
}
/* La posición real dentro de FORM.turnos, para poder editarlo. */
function indiceReal(area, i) {
  var n = -1;
  for (var j = 0; j < FORM.turnos.length; j++) {
    if (FORM.turnos[j].area === area) { n++; if (n === i) return j; }
  }
  return -1;
}

function agregarTurnoArea() {
  var p = plantillasDeArea(FORM.area)[0];
  FORM.turnos.push(p
    ? { quien:'', desde:p.desde, hasta:p.hasta, descanso:p.descanso, horas:p.horas, area:FORM.area }
    : { quien:'', desde:17*60, hasta:23*60, descanso:30, horas:5.5, area:FORM.area });
  pintar();
  enfocarUltimoNombre();
}

function agregarPlantillaArea(i) {
  var p = plantillasDeArea(FORM.area)[i];
  if (!p) return;
  FORM.turnos.push({ quien:'', desde:p.desde, hasta:p.hasta,
                     descanso:p.descanso, horas:p.horas, area:FORM.area });
  pintar();
  enfocarUltimoNombre();
}

/* Agregar a alguien que suele trabajar acá, con su horario más frecuente. */
function agregarConocido(quien) {
  var suyos = [];
  E.dias.forEach(function (d) {
    (d.turnos || []).forEach(function (t) {
      if (t.quien === quien && t.area === FORM.area) suyos.push(t);
    });
  });
  var base = suyos.length ? suyos[suyos.length - 1] : plantillasDeArea(FORM.area)[0];
  FORM.turnos.push(base
    ? { quien:quien, desde:base.desde, hasta:base.hasta,
        descanso:base.descanso || 0,
        horas: Math.round((((base.hasta - base.desde) - (base.descanso || 0)) / 60) * 100) / 100,
        area:FORM.area }
    : { quien:quien, desde:17*60, hasta:23*60, descanso:30, horas:5.5, area:FORM.area });
  pintar();
}

function enfocarUltimoNombre() {
  setTimeout(function () {
    var i = document.querySelectorAll('input.nombre-turno');
    if (i.length) { i[i.length - 1].focus(); }
  }, 60);
}

function copiarTurnosArea(fecha) {
  var d = dia(fecha);
  if (!d) return;
  var traidos = (d.turnos || []).filter(function (t) { return t.area === FORM.area; });
  if (!traidos.length) {
    decir(T('Ese día no tiene turnos de') + ' ' + FORM.area, 'mal');
    return;
  }
  FORM.turnos = FORM.turnos.filter(function (t) { return t.area !== FORM.area; })
    .concat(JSON.parse(JSON.stringify(traidos)));
  pintar();
  decir(traidos.length + ' ' + T('turnos traídos'), 'ok');
}

function borrarTurno(area, i) {
  var real = indiceReal(area, i);
  if (real >= 0) { FORM.turnos.splice(real, 1); pintar(); }
}
function setNombreTurno(area, i, v) {
  var real = indiceReal(area, i);
  if (real >= 0) FORM.turnos[real].quien = v;
}
function setHoraTurnoArea(area, i, cual, valor) {
  var real = indiceReal(area, i);
  if (real < 0) return;
  var p = String(valor).split(':');
  if (p.length < 2) return;
  FORM.turnos[real][cual] = (+p[0]) * 60 + (+p[1]);
  recalcTurno(real);
  actualizarFilaTurno(area, i, real);
}
function setDescansoTurno(area, i, v) {
  var real = indiceReal(area, i);
  if (real < 0) return;
  FORM.turnos[real].descanso = +v;
  recalcTurno(real);
  actualizarFilaTurno(area, i, real);
}
function actualizarFilaTurno(area, i, real) {
  var celda = document.getElementById('hrs-' + i);
  if (celda) celda.textContent = FORM.turnos[real].horas + ' h';
  var tot = document.getElementById('tot-horas-area');
  if (tot) {
    var suma = turnosDe(area).reduce(function (a, t) { return a + (t.horas || 0); }, 0);
    tot.textContent = Math.round(suma * 10) / 10 + ' h';
  }
}

/* ------------------------------------------------------------ pantalla --- */

function grillaTurnos() {
  var area = FORM.area;
  var mios = turnosDe(area);
  var EN = enIngles();

  var h = '<div class="marco tabla-ancha"><table><thead><tr>' +
    '<th style="min-width:150px">Nombre</th><th style="width:110px">Entrada</th>' +
    '<th style="width:110px">Salida</th><th style="width:130px">Descanso</th>' +
    '<th class="num" style="width:80px">Horas</th><th style="width:56px"></th></tr></thead><tbody>';

  if (!mios.length) {
    h += '<tr><td colspan="6" style="text-align:center;color:var(--tinta-suave);padding:20px">' +
      (EN ? 'No shifts entered for ' : 'Todavía no cargaste turnos de ') + '<strong>' + area + '</strong>.</td></tr>';
  }

  mios.forEach(function (t, i) {
    var conocido = t.quien && vecesEn(t.quien, area) > 0;
    var ajeno = t.quien && !conocido && areasDeCadaPersona()[t.quien];
    h += '<tr><td><input class="celda nombre-turno" style="text-align:left" ' +
      'list="nombres-' + area.replace(/\s/g, '') + '" value="' + esc(t.quien || '') + '" ' +
      'placeholder="' + (EN ? 'Name' : 'Nombre') + '" ' +
      'oninput="setNombreTurno(\'' + area + '\',' + i + ',this.value)">' +
      (ajeno ? '<div style="font-size:10.5px;color:var(--aviso);margin-top:3px">' +
        (EN ? 'usually works at ' : 'suele estar en ') +
        esc(areasDeCadaPersona()[t.quien].habitual || '—') + '</div>' : '') + '</td>' +
      '<td><input type="time" class="celda" value="' + horaTexto(t.desde || 0) + '" ' +
      'onchange="setHoraTurnoArea(\'' + area + '\',' + i + ',\'desde\',this.value)"></td>' +
      '<td><input type="time" class="celda" value="' + horaTexto(t.hasta || 0) + '" ' +
      'onchange="setHoraTurnoArea(\'' + area + '\',' + i + ',\'hasta\',this.value)"></td>' +
      '<td><select class="celda" onchange="setDescansoTurno(\'' + area + '\',' + i + ',this.value)">' +
      [0, 30, 60, 90].map(function (m) {
        return '<option value="' + m + '"' + ((t.descanso || 0) === m ? ' selected' : '') + '>' +
          (m ? m + ' min' : (EN ? 'no break' : 'sin descanso')) + '</option>';
      }).join('') + '</select></td>' +
      '<td class="num calc" id="hrs-' + i + '">' + (t.horas || 0) + ' h</td>' +
      '<td><button class="boton chico" onclick="borrarTurno(\'' + area + '\',' + i + ')">✕</button></td></tr>';
  });

  var totalH = mios.reduce(function (a, t) { return a + (t.horas || 0); }, 0);
  if (mios.length) {
    h += '<tr class="total"><td colspan="4">' + mios.length + ' ' + (EN ? 'people at ' : 'personas en ') +
      area + '</td><td class="num" id="tot-horas-area">' + Math.round(totalH * 10) / 10 + ' h</td>' +
      '<td></td></tr>';
  }
  h += '</tbody></table></div>';

  /* sugerencias: quién suele trabajar acá */
  var nn = nombresDeArea(area);
  h += '<datalist id="nombres-' + area.replace(/\s/g, '') + '">' +
    nn.propios.concat(nn.otros).map(function (p) {
      return '<option value="' + esc(p.quien) + '">';
    }).join('') + '</datalist>';

  /* botones */
  h += '<div class="acciones" style="border:none;margin-top:11px">' +
    '<button class="boton" onclick="agregarTurnoArea()">' +
    (EN ? '+ Add person' : '+ Agregar persona') + '</button>';
  plantillasDeArea(area).forEach(function (p, i) {
    h += '<button class="boton chico" title="' +
      (EN ? 'Used ' + p.veces + ' times' : 'Se repite ' + p.veces + ' veces') + '" ' +
      'onclick="agregarPlantillaArea(' + i + ')">+ ' + p.nombre + '</button>';
  });
  var ref = diaReferencia(FORM.fecha);
  var refArea = ref ? (ref.turnos || []).filter(function (t) { return t.area === area; }) : [];
  if (refArea.length && !mios.length) {
    h += '<button class="boton" onclick="copiarTurnosArea(\'' + ref.fecha + '\')">' +
      (EN ? 'Copy from ' : 'Copiar los del ') + fechaCorta(ref.fecha) +
      ' (' + refArea.length + ')</button>';
  }
  h += '<span class="sep"></span>';
  if (hayValores() && totalH) {
    var costoF = mios.reduce(function (a, t) { return a + costoTurno(t); }, 0);
    h += '<span style="font-size:12.5px;color:var(--tinta-media)">' +
      (EN ? 'Estimated cost: ' : 'Costo estimado: ') +
      '<strong>' + E.moneda + ' ' + plata(costoF) + '</strong></span>';
  }
  h += '</div>';

  /* la gente habitual del área, para agregarla de un clic */
  if (nn.propios.length) {
    var faltan = nn.propios.filter(function (p) {
      return !mios.some(function (t) { return t.quien === p.quien; });
    }).slice(0, 10);
    if (faltan.length) {
      h += '<div style="margin-top:14px">' +
        '<div style="font-size:11.5px;color:var(--tinta-media);margin-bottom:7px">' +
        (EN ? 'Usually work at ' : 'Suelen trabajar en ') + '<strong>' + area + '</strong> — ' +
        (EN ? 'click to add with their usual hours' : 'clic para agregarlos con su horario habitual') +
        '</div><div style="display:flex;gap:6px;flex-wrap:wrap">';
      faltan.forEach(function (p) {
        h += '<button class="boton chico" title="' + p.areas[area] + ' ' +
          (EN ? 'shifts here' : 'turnos acá') + '" ' +
          'onclick="agregarConocido(\'' + esc(p.quien).replace(/'/g, "\\'") + '\')">+ ' +
          esc(p.quien) + '</button>';
      });
      h += '</div></div>';
    }
  }

  /* resumen de las otras áreas, para no perder de vista el total */
  var otras = AREAS_ORDEN.filter(function (a) { return a !== area; });
  var hayOtras = otras.some(function (a) { return turnosDe(a).length; });
  if (hayOtras || FORM.turnos.length) {
    h += '<div class="caja gris" style="margin-top:16px;display:flex;gap:18px;flex-wrap:wrap;align-items:center">' +
      '<span style="font-weight:600">' + (EN ? 'Shifts by area:' : 'Turnos por área:') + '</span>';
    AREAS_ORDEN.forEach(function (a) {
      var n = turnosDe(a).length;
      var hs = turnosDe(a).reduce(function (x, t) { return x + (t.horas || 0); }, 0);
      h += '<span' + (a === area ? ' style="font-weight:700;color:var(--acento)"' : '') + '>' +
        a + ': <strong>' + n + '</strong>' + (n ? ' · ' + (Math.round(hs * 10) / 10) + ' h' : '') + '</span>';
    });
    var sinArea = (FORM.turnos || []).filter(function (t) { return !t.area; }).length;
    if (sinArea) {
      h += '<span style="color:var(--aviso)">' + (EN ? 'no area: ' : 'sin área: ') + sinArea + '</span>';
    }
    h += '</div>';
  }

  return h;
}
