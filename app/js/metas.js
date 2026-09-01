/* ==========================================================================
   La meta del mes se pone por área.

   Un solo número para todo el hotel no sirve para decidir: si el mes viene
   flojo, hay que saber cuál área está atrás. Ahora cada una tiene la suya y
   la meta del mes es la suma.
   ========================================================================== */

function metasDelMes(mes) {
  if (!E.metaArea) E.metaArea = {};
  if (!E.metaArea[mes]) E.metaArea[mes] = {};
  return E.metaArea[mes];
}

function metaDeArea(mes, area) {
  var m = metasDelMes(mes)[area];
  return (typeof m === 'number' && m > 0) ? m : 0;
}

/* La meta total: la suma de las áreas. Si no hay ninguna cargada, se usa el
   número general de antes, para no romper lo que ya estaba. */
function metaTotal(mes) {
  var suma = AREAS_ORDEN.reduce(function (a, x) { return a + metaDeArea(mes, x); }, 0);
  if (suma > 0) return suma;
  return E.meta[mes] || 0;
}

function hayMetasPorArea(mes) {
  return AREAS_ORDEN.some(function (a) { return metaDeArea(mes, a) > 0; });
}

function setMetaArea(mes, area, v) {
  var n = parseFloat(String(v).replace(/[^\d.,-]/g, '').replace(',', '.'));
  var m = metasDelMes(mes);
  if (isNaN(n) || n <= 0) delete m[area]; else m[area] = Math.round(n);
  /* la meta general queda sincronizada con la suma */
  var t = AREAS_ORDEN.reduce(function (a, x) { return a + metaDeArea(mes, x); }, 0);
  if (t > 0) E.meta[mes] = t; else delete E.meta[mes];
  anotar('Cambió la meta', area + ' ' + mes + ': ' + (m[area] || 'sin meta'));
  guardarTodo(); pintar();
}

/* Repartir una meta total entre las áreas, según cuánto aporta cada una.
   Es la forma rápida de arrancar: se pone el número del hotel y el sistema
   propone el reparto según el histórico. */
function repartirMeta(mes, total) {
  var n = parseFloat(String(total).replace(/[^\d.,-]/g, '').replace(',', '.'));
  if (isNaN(n) || n <= 0) return;

  var refs = E.dias.filter(function (d) { return mesDe(d.fecha) <= mes; }).slice(-60);
  var suma = {}, gran = 0;
  AREAS_ORDEN.forEach(function (a) { suma[a] = 0; });
  refs.forEach(function (d) {
    AREAS_ORDEN.forEach(function (a) {
      var v = totalArea(d, a);
      if (v !== null) { suma[a] += v; gran += v; }
    });
  });

  var m = metasDelMes(mes);
  if (!gran) {
    /* sin histórico: en partes iguales */
    AREAS_ORDEN.forEach(function (a) { m[a] = Math.round(n / AREAS_ORDEN.length); });
  } else {
    AREAS_ORDEN.forEach(function (a) { m[a] = Math.round(n * (suma[a] / gran)); });
  }
  E.meta[mes] = AREAS_ORDEN.reduce(function (a, x) { return a + (m[x] || 0); }, 0);
  anotar('Repartió la meta del mes', mes + ': ' + n);
  guardarTodo(); pintar();
  decir(T('Meta repartida según lo que aporta cada área'), 'ok');
}

/* ------------------------------------------------- avance por área ------ */

/* Cuánto lleva cada área y cómo viene contra su meta. */
function avanceAreas(mes) {
  var ds = diasDelMes(mes);
  var totalDias = cantidadDiasMes(mes);
  var p = proyectar(mes);

  return AREAS_ORDEN.map(function (a) {
    var acum = 0, dias = 0;
    ds.forEach(function (d) {
      var v = totalArea(d, a);
      if (v !== null) { acum += v; dias++; }
    });
    var meta = metaDeArea(mes, a);

    /* proyección del área: lo que ya entró más lo que falta, al ritmo propio */
    var proy = null;
    if (p.ok && dias) {
      var delArea = p.detalle.filter(function (x) { return x.area === a; });
      var resto = delArea.reduce(function (s, x) { return s + x.subtotal; }, 0);
      proy = Math.round(acum + resto);
    }

    return {
      area: a, acumulado: Math.round(acum), dias: dias, meta: meta,
      proyeccion: proy,
      pct: meta ? Math.round((acum / meta) * 100) : null,
      pctProy: (meta && proy) ? Math.round((proy / meta) * 100) : null,
      diferencia: (meta && proy) ? Math.round(proy - meta) : null,
      faltaPorDia: (meta && dias < totalDias)
        ? Math.round((meta - acum) / (totalDias - dias)) : null
    };
  });
}

/* La barrita de avance contra la meta. Verde cuando ya llegó. */
function barraAvance(pct) {
  var p = Math.max(0, Math.min(100, pct || 0));
  var color = p >= 100 ? 'var(--ok)' : (p >= 60 ? 'var(--acento)' : 'var(--linea-fuerte)');
  return '<div class="mini" title="' + Math.round(pct) + '%">' +
    '<span style="width:' + p + '%;background:' + color + '"></span></div>' +
    '<div style="font-size:10.5px;color:var(--tinta-suave);margin-top:2px">' +
    Math.round(pct) + '%</div>';
}

/* ------------------------------------------------------- pantalla ------- */

function bloqueMetas(mes) {
  var EN = enIngles();
  var av = avanceAreas(mes);
  var total = metaTotal(mes);
  var hay = hayMetasPorArea(mes);

  var h = '<div class="titulo-seccion">' +
    (EN ? 'Target by area' : 'Meta por área') + '</div>';

  h += '<div class="caja gris">' +
    (EN
      ? 'A single number for the whole hotel does not help to decide. With a target per area you ' +
        'can see which one is behind. The month target is the sum.'
      : 'Un solo número para todo el hotel no ayuda a decidir. Con una meta por área se ve cuál ' +
        'viene atrás. La meta del mes es la suma.') + '</div>';

  h += '<div class="marco tabla-ancha"><table><thead><tr>' +
    '<th>' + (EN ? 'Area' : 'Área') + '</th>' +
    '<th class="num" style="width:150px">' + (EN ? 'Target' : 'Meta') + '</th>' +
    '<th class="num">' + (EN ? 'So far' : 'Lleva') + '</th>' +
    '<th class="num">' + (EN ? 'Forecast' : 'Proyección') + '</th>' +
    '<th class="num">' + (EN ? 'Vs target' : 'Contra la meta') + '</th>' +
    '<th style="width:170px">' + (EN ? 'Progress' : 'Avance') + '</th>' +
    '<th class="num">' + (EN ? 'Needed per day' : 'Falta por día') + '</th>' +
    '</tr></thead><tbody>';

  av.forEach(function (x) {
    var color = x.diferencia === null ? '' :
      (x.diferencia >= 0 ? 'var(--ok)' : 'var(--mal)');
    h += '<tr><td><strong>' + x.area + '</strong>' +
      '<div style="font-size:11px;color:var(--tinta-suave)">' + x.dias + ' ' +
      (EN ? 'days' : 'días') + '</div></td>' +
      '<td class="num"><input type="text" inputmode="decimal" class="celda" ' +
        'value="' + (x.meta || '') + '" placeholder="' + (EN ? 'no target' : 'sin meta') + '" ' +
        'onkeypress="soloNumeros(event)" oninput="limpiarSiSobra(this)" ' +
        'onchange="setMetaArea(\'' + mes + '\',\'' + x.area + '\',this.value)"></td>' +
      '<td class="num">' + plata(x.acumulado) + '</td>' +
      '<td class="num">' + (x.proyeccion !== null ? plata(x.proyeccion) : '—') + '</td>' +
      '<td class="num">' + (x.diferencia !== null
        ? '<strong style="color:' + color + '">' + plata(x.diferencia, true) + '</strong>' : '—') + '</td>' +
      '<td>' + (x.pct !== null ? barraAvance(Math.min(100, x.pct)) : '—') + '</td>' +
      '<td class="num">' + (x.faltaPorDia !== null && x.faltaPorDia > 0
        ? plata(x.faltaPorDia) : '—') + '</td></tr>';
  });

  var acumTotal = av.reduce(function (a, x) { return a + x.acumulado; }, 0);
  var proyTotal = av.reduce(function (a, x) { return a + (x.proyeccion || 0); }, 0);
  h += '<tr class="total"><td>' + (EN ? 'Month total' : 'Total del mes') + '</td>' +
    '<td class="num">' + (total ? plata(total) : '—') + '</td>' +
    '<td class="num">' + plata(acumTotal) + '</td>' +
    '<td class="num">' + (proyTotal ? plata(proyTotal) : '—') + '</td>' +
    '<td class="num">' + (total && proyTotal
      ? '<strong style="color:' + (proyTotal >= total ? 'var(--ok)' : 'var(--mal)') + '">' +
        plata(proyTotal - total, true) + '</strong>' : '—') + '</td>' +
    '<td colspan="2"></td></tr>';
  h += '</tbody></table></div>';

  /* repartir una meta total entre las áreas */
  h += '<div class="acciones" style="border:none;margin-top:12px">' +
    '<span style="font-size:12.5px;color:var(--tinta-media)">' +
    (EN ? 'Or set a total and split it:' : 'O poné un total y repartilo:') + '</span>' +
    '<input type="text" inputmode="decimal" class="filtro" id="meta-total" style="width:140px" ' +
    'placeholder="' + (EN ? 'e.g. 500000' : 'Ej: 500000') + '" ' +
    'onkeypress="soloNumeros(event)" oninput="limpiarSiSobra(this)">' +
    '<button class="boton" onclick="repartirMeta(\'' + mes + '\',document.getElementById(\'meta-total\').value)">' +
    (EN ? 'Split by area' : 'Repartir por área') + '</button>' +
    '<span style="font-size:11.5px;color:var(--tinta-suave)">' +
    (EN ? 'splits it according to what each area usually brings in'
        : 'lo reparte según lo que suele aportar cada área') + '</span></div>';

  if (!hay) {
    h += '<div class="caja aviso" style="margin-top:12px">' +
      (EN ? 'No target set for any area yet. Without it, the forecast has nothing to compare against.'
          : 'Todavía no hay meta en ninguna área. Sin eso, la proyección no tiene contra qué compararse.') +
      '</div>';
  }
  return h;
}
