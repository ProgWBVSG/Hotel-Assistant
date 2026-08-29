/* ==========================================================================
   Cargar el día a mano.

   Idea: que se tipee lo mínimo. Cubiertos, comida, bebida y descuentos.
   El total, el ticket promedio y el "todo el día" los calcula el sistema,
   igual que las fórmulas del Excel.
   ========================================================================== */

/* Qué se carga en cada área. Sale de mirar cómo está armado el reporte. */
var ESTRUCTURA = {
  'Penny Blue': {
    servicios: ['Breakfast', 'Lunch', 'Dinner'],
    campos: ['Covers', 'Food', 'Beverage', 'Discounts'],
    extra: { Dinner: ['Misc/Banquets'] }
  },
  'Exchange Lane': {
    servicios: ['Breakfast', 'Lunch', 'Dinner'],
    campos: ['Covers', 'Food', 'Beverage', 'Discounts'],
    extra: {}
  },
  'In Room Dining': {
    servicios: ['Breakfast', 'Lunch', 'Dinner', 'Overnight'],
    campos: ['Covers', 'Food', 'Beverage', 'Delivery Charge', 'Discounts'],
    extra: {}
  }
};

var NOMBRE_SERVICIO = {
  'Breakfast':'Desayuno', 'Lunch':'Almuerzo', 'Dinner':'Cena', 'Overnight':'Madrugada'
};
var NOMBRE_CAMPO = {
  'Covers':'Cubiertos', 'Food':'Comida', 'Beverage':'Bebida',
  'Delivery Charge':'Delivery', 'Discounts':'Descuentos', 'Misc/Banquets':'Banquetes'
};

var FORM = null;

/* ------------------------------------------------------------ arranque -- */

function nuevoFormulario(fecha, editando) {
  var f = fecha || new Date().toISOString().slice(0, 10);
  FORM = {
    fecha: f,
    area: 'Penny Blue',
    valores: {},        /* "Area|Servicio|Campo" -> número */
    comentarios: {},    /* "Area" -> texto */
    turnos: [],
    editando: !!editando,
    guardado: false
  };

  if (editando) {
    var d = dia(f);
    if (d) {
      AREAS_ORDEN.forEach(function (a) {
        var sv = (d.areas || {})[a];
        if (!sv) return;
        for (var s in sv) {
          if (String(s).toLowerCase().replace(/\s/g, '') === 'allday') continue;
          for (var c in sv[s]) {
            if (c === 'Total' || c === 'AV Check') continue;
            FORM.valores[a + '|' + s + '|' + c] = sv[s][c];
          }
        }
      });
      (d.comentarios || []).forEach(function (c) {
        var k = c.area || 'General';
        FORM.comentarios[k] = (FORM.comentarios[k] ? FORM.comentarios[k] + '\n' : '') + c.texto;
      });
      FORM.turnos = JSON.parse(JSON.stringify(d.turnos || []));
    }
  }
  VISTA = 'cargardia';
  pintar();
}

function val(area, serv, campo) {
  var v = FORM.valores[area + '|' + serv + '|' + campo];
  return typeof v === 'number' ? v : 0;
}
function setVal(area, serv, campo, texto) {
  var k = area + '|' + serv + '|' + campo;
  var t = String(texto).trim();
  /* si escribió una cuenta ("300+120") se resuelve al salir del casillero */
  var n = /[+\-*/]/.test(t.replace(/^-/, '')) ? null : limpiarNumero(t);
  if (n === null || n === undefined) delete FORM.valores[k];
  else FORM.valores[k] = n;
  refrescarTotales();
}

/* --- derivados: lo que el sistema calcula solo --- */
function totalServicio(area, serv) {
  var e = ESTRUCTURA[area];
  var t = val(area, serv, 'Food') + val(area, serv, 'Beverage');
  if (e.campos.indexOf('Delivery Charge') !== -1) t += val(area, serv, 'Delivery Charge');
  if ((e.extra[serv] || []).indexOf('Misc/Banquets') !== -1) t += val(area, serv, 'Misc/Banquets');
  return Math.round(t * 100) / 100;
}
function ticketServicio(area, serv) {
  var c = val(area, serv, 'Covers');
  return c ? Math.round((totalServicio(area, serv) / c) * 100) / 100 : 0;
}
function totalAreaForm(area) {
  return Math.round(ESTRUCTURA[area].servicios.reduce(function (a, s) {
    return a + totalServicio(area, s);
  }, 0) * 100) / 100;
}
function cubiertosArea(area) {
  return ESTRUCTURA[area].servicios.reduce(function (a, s) { return a + val(area, s, 'Covers'); }, 0);
}
function totalFormulario() {
  return Math.round(AREAS_ORDEN.reduce(function (a, x) { return a + totalAreaForm(x); }, 0) * 100) / 100;
}
function areaCargada(area) {
  return ESTRUCTURA[area].servicios.some(function (s) {
    return ESTRUCTURA[area].campos.some(function (c) {
      return FORM.valores[area + '|' + s + '|' + c] !== undefined;
    });
  });
}

/* Referencia: el último día parecido, para que no se cargue a ciegas. */
function diaReferencia(fecha) {
  var dow = new Date(fecha + 'T00:00:00Z').getUTCDay();
  var previos = E.dias.filter(function (x) { return x.fecha < fecha && totalDia(x) > 0; })
    .sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
  var mismo = previos.filter(function (x) {
    return new Date(x.fecha + 'T00:00:00Z').getUTCDay() === dow;
  });
  return mismo[0] || previos[0] || null;
}
function refServicio(ref, area, serv, campo) {
  if (!ref || !ref.areas || !ref.areas[area]) return null;
  var sv = ref.areas[area];
  for (var k in sv) {
    if (String(k).toLowerCase().replace(/\s/g, '') === String(serv).toLowerCase().replace(/\s/g, '')) {
      var v = sv[k][campo];
      return typeof v === 'number' ? v : null;
    }
  }
  return null;
}

/* ================================================================ VISTA == */

function vistaCargarDia() {
  if (!FORM) nuevoFormulario();

  var yaExiste = dia(FORM.fecha) && !FORM.editando;
  var ref = diaReferencia(FORM.fecha);

  var h = cab(FORM.editando ? 'Corregir el día' : 'Cargar el día',
    fechaLegible(FORM.fecha));

  /* --- fecha y estado --- */
  h += '<div class="acciones">' +
    '<div style="display:flex;gap:8px;align-items:center">' +
    '<label style="font-size:12px;color:var(--tinta-media)">Fecha</label>' +
    '<input type="date" class="filtro" value="' + FORM.fecha + '" ' +
    'onchange="cambiarFechaForm(this.value)"></div>' +
    '<button class="boton chico" onclick="cambiarFechaForm(hoyISO())">Hoy</button>' +
    '<button class="boton chico" onclick="cambiarFechaForm(ayerISO())">Ayer</button>' +
    '<span class="sep"></span>' +
    (FORM.editando ? '' :
      '<button class="boton" onclick="if(confirm(\'¿Borrar lo que cargaste?\')){nuevoFormulario(FORM.fecha);}">Limpiar</button>') +
    '<button class="boton primario" onclick="guardarDiaCargado()">' +
      (FORM.editando ? 'Guardar los cambios' : 'Guardar el día') + '</button></div>';

  if (yaExiste) {
    h += '<div class="caja aviso"><strong>Ese día ya está cargado.</strong> ' +
      'Si guardás, se reemplaza lo que había. ' +
      '<span class="link" onclick="nuevoFormulario(FORM.fecha, true)">Mejor abrí el día para corregirlo</span> ' +
      'y así arrancás con los números que ya están.</div>';
  }

  /* --- total en vivo --- */
  h += '<div class="tarjetas" style="margin-bottom:18px">';
  var tot = totalFormulario();
  h += tarjeta('acento', 'Total del día', tot, 'grande',
    tot ? 'Se actualiza mientras cargás' : 'Todavía no cargaste nada');
  AREAS_ORDEN.forEach(function (a) {
    var t = totalAreaForm(a);
    var cub = cubiertosArea(a);
    h += tarjeta(areaCargada(a) ? '' : 'aviso', a, t, '',
      areaCargada(a)
        ? (cub ? cub + ' cubiertos · ticket ' + plata(cub ? t / cub : 0) : 'sin cubiertos cargados')
        : '<span style="color:var(--aviso)">falta cargar</span>');
  });
  h += '</div>';

  /* --- pestañas de área --- */
  h += '<div class="acciones" style="border:none;padding-bottom:0">';
  AREAS_ORDEN.forEach(function (a) {
    var act = FORM.area === a;
    h += '<button class="boton' + (act ? ' primario' : '') + '" onclick="FORM.area=\'' + a + '\';pintar()">' +
      a + (areaCargada(a) ? ' ✓' : '') + '</button>';
  });
  h += '<span class="sep"></span></div>';
  h += '<div style="font-size:11.5px;color:var(--tinta-suave);margin:0 0 12px;text-align:center">' +
    (enIngles()
      ? 'Tab moves across · Enter moves down · you can paste a block copied from Excel · ' +
        'you can type sums like <b>300+120</b>'
      : 'Tab pasa al de al lado · Enter baja · se puede pegar un bloque copiado de Excel · ' +
        'se pueden escribir cuentas como <b>300+120</b>') + '</div>';

  h += grillaArea(FORM.area, ref);

  /* --- comentario del área --- */
  h += '<div class="titulo-seccion">Qué pasó en ' + FORM.area + '</div>';
  h += '<div class="marco" style="padding:14px 16px">' +
    '<textarea id="com-' + FORM.area.replace(/ /g, '') + '" ' +
    'style="width:100%;min-height:90px;padding:10px;border:1px solid var(--linea-fuerte);' +
    'border-radius:3px;font-family:inherit;font-size:12.5px;line-height:1.55" ' +
    'placeholder="Lo mismo que se escribe en el reporte: cómo estuvo el servicio, si hubo algún ' +
    'reclamo, si vino un grupo, si hubo demoras…" ' +
    'onchange="FORM.comentarios[\'' + FORM.area + '\']=this.value">' +
    esc(FORM.comentarios[FORM.area] || '') + '</textarea>' +
    '<div style="font-size:11px;color:var(--tinta-suave);margin-top:7px">' +
    'Esto después aparece en la presentación y queda buscable en Observaciones. ' +
    'Evitá poner números de habitación.</div></div>';

  /* --- turnos --- */
  h += '<div class="titulo-seccion">' +
    (enIngles() ? 'Who worked at ' : 'Quién trabajó en ') + FORM.area + '</div>';
  h += grillaTurnos();

  /* --- guardar abajo también --- */
  h += '<div class="acciones" style="border:none;margin-top:22px">' +
    '<span class="sep"></span>' +
    '<button class="boton primario" onclick="guardarDiaCargado()">' +
    (FORM.editando ? 'Guardar los cambios' : 'Guardar el día') + '</button></div>';

  return h;
}

function hoyISO() { return new Date().toISOString().slice(0, 10); }
function ayerISO() { var d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }

function cambiarFechaForm(f) {
  if (!f) return;
  FORM.fecha = f;
  pintar();
}

/* --------------------------------------------------------- la grilla --- */

function grillaArea(area, ref) {
  var e = ESTRUCTURA[area];
  var campos = e.campos.slice();
  /* si algún servicio tiene campo extra, se agrega la columna */
  var extras = [];
  e.servicios.forEach(function (s) {
    (e.extra[s] || []).forEach(function (c) { if (extras.indexOf(c) === -1) extras.push(c); });
  });
  var todos = campos.concat(extras);

  var h = '<div class="marco"><table class="grilla"><thead><tr>' +
    '<th style="min-width:110px">Servicio</th>' +
    todos.map(function (c) {
      return '<th class="num">' + (NOMBRE_CAMPO[c] || c) + '</th>';
    }).join('') +
    '<th class="num">Total</th><th class="num">Ticket</th></tr></thead><tbody>';

  e.servicios.forEach(function (s) {
    var aplica = function (c) {
      if (campos.indexOf(c) !== -1) return true;
      return (e.extra[s] || []).indexOf(c) !== -1;
    };
    h += '<tr><td><strong>' + NOMBRE_SERVICIO[s] + '</strong></td>';
    todos.forEach(function (c) {
      if (!aplica(c)) { h += '<td class="num" style="background:var(--panel-alt)"></td>'; return; }
      var v = FORM.valores[area + '|' + s + '|' + c];
      var r = refServicio(ref, area, s, c);
      var si = e.servicios.indexOf(s), ci = todos.indexOf(c);
      h += '<td class="num"><input type="text" inputmode="decimal" class="celda" ' +
        'id="c-' + si + '-' + ci + '" ' +
        'value="' + (v === undefined ? '' : v) + '" ' +
        'placeholder="' + (r !== null ? r : '') + '" ' +
        'title="' + (r !== null ? 'El ' + fechaCorta(ref.fecha) + ' fue ' + r : 'Sin referencia') + '" ' +
        'onpaste="pegarEnGrilla(event,\'' + area + '\',' + si + ',' + ci + ')" ' +
        'onkeydown="teclaEnGrilla(event,\'' + area + '\',' + si + ',' + ci + ')" ' +
        'onkeypress="soloNumeros(event)" ' +
        'onblur="resolverCuenta(this,\'' + area + '\',\'' + s + '\',\'' + c + '\');revisarCasillero(this,\'' + area + '\',\'' + s + '\',\'' + c + '\')" ' +
        'oninput="limpiarSiSobra(this);setVal(\'' + area + '\',\'' + s + '\',\'' + c + '\',this.value)"></td>';
    });
    h += '<td class="num calc" id="tot-' + s + '">' + plata(totalServicio(area, s)) + '</td>' +
      '<td class="num calc" id="tk-' + s + '">' + (ticketServicio(area, s) ? plata(ticketServicio(area, s)) : '—') + '</td></tr>';
  });

  /* fila de todo el día */
  h += '<tr class="total"><td>Todo el día</td>';
  todos.forEach(function (c) {
    var suma = e.servicios.reduce(function (a, s) {
      var aplica = campos.indexOf(c) !== -1 || (e.extra[s] || []).indexOf(c) !== -1;
      return a + (aplica ? val(area, s, c) : 0);
    }, 0);
    h += '<td class="num" id="ad-' + c.replace(/[^a-z]/gi, '') + '">' +
      (c === 'Covers' ? (suma || '—') : (suma ? plata(suma) : '—')) + '</td>';
  });
  var ta = totalAreaForm(area), ca = cubiertosArea(area);
  h += '<td class="num" id="ad-total">' + plata(ta) + '</td>' +
    '<td class="num" id="ad-ticket">' + (ca ? plata(ta / ca) : '—') + '</td></tr>';

  h += '</tbody></table></div>';

  h += '<div style="font-size:11.5px;color:var(--tinta-suave);margin-top:9px;text-align:center">' +
    (ref
      ? 'En gris claro, lo que se hizo el <strong>' + fechaCorta(ref.fecha) + '</strong> (' +
        diaSemana(ref.fecha) + '), para tener una referencia. No se guarda solo: hay que escribirlo.'
      : 'Todavía no hay un día anterior para comparar.') + '</div>';
  return h;
}

/* Recalcula los derivados sin volver a dibujar toda la pantalla,
   para que no se pierda el foco mientras se tipea. */
function refrescarTotales() {
  var area = FORM.area;
  var e = ESTRUCTURA[area];

  e.servicios.forEach(function (s) {
    var t = document.getElementById('tot-' + s);
    if (t) t.textContent = plata(totalServicio(area, s));
    var k = document.getElementById('tk-' + s);
    if (k) k.textContent = ticketServicio(area, s) ? plata(ticketServicio(area, s)) : '—';
  });

  var campos = e.campos.slice();
  var extras = [];
  e.servicios.forEach(function (s) {
    (e.extra[s] || []).forEach(function (c) { if (extras.indexOf(c) === -1) extras.push(c); });
  });
  campos.concat(extras).forEach(function (c) {
    var celda = document.getElementById('ad-' + c.replace(/[^a-z]/gi, ''));
    if (!celda) return;
    var suma = e.servicios.reduce(function (a, s) {
      var aplica = e.campos.indexOf(c) !== -1 || (e.extra[s] || []).indexOf(c) !== -1;
      return a + (aplica ? val(area, s, c) : 0);
    }, 0);
    celda.textContent = (c === 'Covers' ? (suma || '—') : (suma ? plata(suma) : '—'));
  });

  var ta = totalAreaForm(area), ca = cubiertosArea(area);
  var adt = document.getElementById('ad-total');   if (adt) adt.textContent = plata(ta);
  var adk = document.getElementById('ad-ticket');  if (adk) adk.textContent = ca ? plata(ta / ca) : '—';

  /* tarjetas de arriba */
  var tarjetas = document.querySelectorAll('.tarjetas .t-numero');
  if (tarjetas.length >= 4) {
    tarjetas[0].innerHTML = '<span class="mon">' + E.moneda + '</span>' + plata(totalFormulario());
    AREAS_ORDEN.forEach(function (a, i) {
      if (tarjetas[i + 1]) {
        var t = totalAreaForm(a);
        tarjetas[i + 1].innerHTML = (t > 999 ? '<span class="mon">' + E.moneda + '</span>' : '') + plata(t);
      }
    });
  }
}

/* ---------------------------------------------------------- turnos ----- */

/* grillaTurnos() vive en turnos-area.js: los turnos son por área */

function setHoraTurno(i, cual, valor) {
  var p = String(valor).split(':');
  if (p.length < 2) return;
  FORM.turnos[i][cual] = (+p[0]) * 60 + (+p[1]);
  recalcTurno(i);
}
function recalcTurno(i) {
  var t = FORM.turnos[i];
  var desde = t.desde, hasta = t.hasta;
  if (hasta <= desde) hasta += 24 * 60;      /* cruza la medianoche */
  var h = (hasta - desde - (t.descanso || 0)) / 60;
  t.horas = Math.max(0, Math.round(h * 100) / 100);
  var celda = document.getElementById('hrs-' + i);
  if (celda) celda.textContent = t.horas + ' h';
}

/* ---------------------------------------------------------- guardar ---- */

function guardarDiaCargado() {
  var cargadas = AREAS_ORDEN.filter(areaCargada);
  if (!cargadas.length) {
    decir('Todavía no cargaste ningún número', 'mal');
    return;
  }

  var faltan = AREAS_ORDEN.filter(function (a) { return !areaCargada(a); });
  if (faltan.length) {
    if (!confirm('No cargaste ' + faltan.join(' ni ') + '.\n\n' +
      'El día va a quedar marcado como incompleto y no se va a usar como ' +
      'referencia para la proyección.\n\n¿Guardar igual?')) return;
  }

  /* --- avisar si algún número quedó muy fuera de lo normal --- */
  var ref = diaReferencia(FORM.fecha);
  if (ref) {
    var raros = [];
    cargadas.forEach(function (a) {
      var t = totalAreaForm(a);
      var r = totalArea(ref, a);
      if (r && t && (t > r * 4 || t < r / 4)) {
        raros.push(a + ': ' + plata(t) + ' contra ' + plata(r) + ' del ' + fechaCorta(ref.fecha));
      }
    });
    if (raros.length) {
      if (!confirm('Estos números quedaron muy lejos del día de referencia:\n\n' +
        raros.join('\n') + '\n\n¿Están bien?')) return;
    }
  }

  /* --- armar el día con la misma forma que trae el Excel --- */
  var areas = {};
  cargadas.forEach(function (a) {
    var e = ESTRUCTURA[a];
    areas[a] = {};
    e.servicios.forEach(function (s) {
      var tieneAlgo = e.campos.concat(e.extra[s] || []).some(function (c) {
        return FORM.valores[a + '|' + s + '|' + c] !== undefined;
      });
      if (!tieneAlgo) return;
      var m = {};
      e.campos.concat(e.extra[s] || []).forEach(function (c) {
        var v = FORM.valores[a + '|' + s + '|' + c];
        if (v !== undefined) m[c] = v;
      });
      m.Total = totalServicio(a, s);
      if (val(a, s, 'Covers')) m['AV Check'] = ticketServicio(a, s);
      areas[a][s] = m;
    });

    /* fila "All Day": es la que leen todos los cálculos del sistema */
    var ad = {};
    var listaCampos = e.campos.slice();
    e.servicios.forEach(function (s) {
      (e.extra[s] || []).forEach(function (c) { if (listaCampos.indexOf(c) === -1) listaCampos.push(c); });
    });
    listaCampos.forEach(function (c) {
      var suma = e.servicios.reduce(function (acc, s) { return acc + val(a, s, c); }, 0);
      if (suma) ad[c] = Math.round(suma * 100) / 100;
    });
    ad.Total = totalAreaForm(a);
    var cub = cubiertosArea(a);
    if (cub) ad['AV Check'] = Math.round((ad.Total / cub) * 100) / 100;
    areas[a]['All Day'] = ad;
  });

  var comentarios = [];
  Object.keys(FORM.comentarios).forEach(function (k) {
    var t = String(FORM.comentarios[k] || '').trim();
    if (t) comentarios.push({ texto: t, area: k === 'General' ? null : k });
  });

  var turnos = FORM.turnos.filter(function (t) { return t.quien && t.quien.trim() && t.horas > 0; })
    .map(function (t) {
      return { quien:t.quien.trim(), desde:t.desde, hasta:t.hasta,
               descanso:t.descanso || 0, horas:t.horas, area:t.area || null };
    });

  var registro = {
    fecha: FORM.fecha,
    hoja: FORM.editando ? (dia(FORM.fecha) || {}).hoja || 'Carga manual' : 'Carga manual',
    areas: areas, comentarios: comentarios, turnos: turnos,
    manual: true
  };

  var existente = dia(FORM.fecha);
  if (existente) {
    for (var i = 0; i < E.dias.length; i++) {
      if (E.dias[i].fecha === FORM.fecha) { E.dias[i] = registro; break; }
    }
    anotar('Corrigió un día', FORM.fecha + ' — total ' + plata(totalFormulario()));
  } else {
    E.dias.push(registro);
    anotar('Cargó un día a mano', FORM.fecha + ' — total ' + plata(totalFormulario()));
  }

  E.dias.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  guardarTodo();

  MES = mesDe(FORM.fecha);
  DIA_SEL = FORM.fecha;
  var total = totalFormulario();
  FORM = null;
  VISTA = 'dia';
  pintar();
  decir('Día guardado: ' + E.moneda + ' ' + plata(total), 'ok');
}
