/* ==========================================================================
   Pantallas
   ========================================================================== */

var VISTA = 'resumen';
var MES = null;
var DIA_SEL = null;

function iniciar() {
  cargarTodo();
  var ms = mesesDisponibles();
  MES = ms.length ? ms[ms.length - 1] : null;
  if (MES) {
    var ds = diasDelMes(MES);
    DIA_SEL = ds.length ? ds[ds.length - 1].fecha : null;
  }
  pintar();
}

function ir(v) { VISTA = v; pintar(); }

function pintar() {
  document.getElementById('tabs').innerHTML = [
    ['cargardia', '+ Cargar día'],
    ['resumen', 'Resumen del mes'],
    ['dia', 'Día'],
    ['proyeccion', 'Proyección'],
    ['horarios', 'Horarios'],
    ['personal', 'Personal'],
    ['presentacion', 'Presentación'],
    ['comentarios', 'Comentarios'],
    ['enviar', 'Enviar'],
    ['cargar', 'Cargar Excel'],
    ['equipos', 'Equipos y sueldos']
  ].map(function (t) {
    return '<a href="javascript:ir(\'' + t[0] + '\')" class="' + (VISTA === t[0] ? 'activo' : '') + '">' + t[1] + '</a>';
  }).join('');

  var si = document.getElementById('sel-idioma');
  if (si) si.value = E.idioma || 'es';

  var ms = mesesDisponibles();
  document.getElementById('sel-mes').innerHTML = ms.map(function (m) {
    return '<option value="' + m + '"' + (m === MES ? ' selected' : '') + '>' + nombreMes(m) + '</option>';
  }).join('');

  var cont = document.getElementById('principal');
  var fn = ({ cargardia:vistaCargarDia, resumen:vistaResumen, dia:vistaDia, proyeccion:vistaProyeccion,
              horarios:vistaHorarios, personal:vistaPersonal,
              presentacion:vistaPresentacion, comentarios:vistaComentarios,
              enviar:vistaEnviar, equipos:vistaEquipos,
              cargar:vistaCargar })[VISTA] || vistaResumen;
  cont.innerHTML = fn();
  if (typeof traducirPantalla === 'function') traducirPantalla();
  window.scrollTo(0, 0);
}

function cambiarMes(m) {
  MES = m;
  var ds = diasDelMes(MES);
  DIA_SEL = ds.length ? ds[ds.length - 1].fecha : null;
  pintar();
}

function decir(t, tipo) {
  var c = document.getElementById('flotantes');
  var d = document.createElement('div');
  d.className = 'flotante ' + (tipo || '');
  d.textContent = t;
  c.appendChild(d);
  setTimeout(function () { d.remove(); }, 2800);
}

function cab(t, sub) {
  return '<div class="cabecera"><h1>' + esc(t) + '</h1>' +
    (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div>';
}

/* =========================  RESUMEN DEL MES  ============================= */

function vistaResumen() {
  if (!MES) return cab('Sin datos') + '<div class="vacio"><h3>Todavía no hay nada cargado</h3>' +
    '<p>Subí el Excel del reporte y el sistema arma todo solo.</p>' +
    '<button class="boton primario" onclick="ir(\'cargar\')">Cargar Excel</button></div>';

  var ds = diasDelMes(MES);
  var acum = acumulado(MES);
  var p = proyectar(MES);
  var total = cantidadDiasMes(MES);
  var corte = corteEvento(MES);

  var h = cab('Resumen de ' + nombreMes(MES),
    acum.dias + ' días cargados de ' + total + ' · ' + E.moneda);

  /* --- números principales --- */
  h += '<div class="tarjetas">';
  h += tarjeta('acento', 'Acumulado del mes', acum.total, 'grande',
    '<b>' + acum.dias + ' días</b> cargados · promedio <b>' + plata(acum.dias ? acum.total / acum.dias : 0) + '</b> por día');

  var ult = ds.length ? ds[ds.length - 1] : null;
  if (ult) {
    var cmp = compararDia(ult.fecha);
    h += tarjeta('', 'Último día cargado — ' + fechaCorta(ult.fecha), totalDia(ult), '',
      cmp && cmp.variacionComparables !== null
        ? (cmp.variacionComparables >= 0 ? '<b style="color:var(--ok)">' : '<b style="color:var(--mal)">') +
          plata(cmp.variacionComparables, true) + '</b> contra días parecidos'
        : diaSemana(ult.fecha));
  }

  if (p.ok) {
    var clase = p.meta ? (p.cierre >= p.meta ? 'ok' : 'mal') : '';
    h += tarjeta(clase, 'Proyección de cierre', p.cierre, '',
      p.meta ? (p.diferencia >= 0 ? 'Supera la meta por <b>' + plata(p.diferencia) + '</b>'
                                  : 'Faltan <b>' + plata(Math.abs(p.diferencia)) + '</b> para la meta')
             : '<span class="link" onclick="ir(\'proyeccion\')">Cargá la meta del mes</span>');
    h += tarjeta('', 'Días que faltan', p.faltan, '',
      'A <b>' + plata(p.porDia) + '</b> por día según lo proyectado');
  }
  h += '</div>';

  /* --- avisos --- */
  var incompletos = ds.filter(function (d) { return areasFaltantes(d.fecha).length > 0; });
  if (incompletos.length) {
    h += '<div class="caja aviso" style="margin-top:16px"><strong>' + incompletos.length +
      ' días tienen alguna área sin reportar.</strong> Están marcados en la tabla. ' +
      'No se usan como referencia para la proyección.</div>';
  }

  /* --- calendario --- */
  h += '<div class="titulo-seccion">Día por día</div>';
  h += calendarioMes(MES, corte);

  /* --- tabla --- */
  h += '<div class="titulo-seccion">Detalle</div>';
  h += '<div class="acciones no-imprimir">' +
    '<button class="boton primario" onclick="nuevoFormulario()">+ Cargar el día de hoy</button>' +
    '<span class="sep"></span>' +
    '<button class="boton" onclick="exportarMes()">Bajar a Excel</button>' +
    '<button class="boton" onclick="window.print()">Imprimir</button></div>';

  h += '<div class="marco"><table><thead><tr>' +
    '<th>Fecha</th><th></th>' +
    AREAS_ORDEN.map(function (a) { return '<th class="num">' + a + '</th>'; }).join('') +
    '<th class="num">Total del día</th><th class="num">Acumulado</th><th class="num">Cubiertos</th></tr></thead><tbody>';

  var run = 0;
  ds.forEach(function (d) {
    var t = totalDia(d);
    run += t;
    var ev = esEvento(d, corte);
    var falt = areasFaltantes(d.fecha);
    h += '<tr class="' + (ev ? 'evento' : '') + '">' +
      '<td><span class="link" onclick="verDia(\'' + d.fecha + '\')">' + fechaCorta(d.fecha) + '</span> ' +
      '<span style="color:var(--tinta-suave);font-size:11px">' + diaSemana(d.fecha) + '</span></td>' +
      '<td>' + (ev ? '<span class="eti eti-aviso">evento</span>' : '') +
              (falt.length ? ' <span class="eti eti-mal" title="Falta ' + falt.join(', ') + '">incompleto</span>' : '') + '</td>' +
      AREAS_ORDEN.map(function (a) {
        var v = totalArea(d, a);
        return '<td class="num">' + (v === null ? '<span style="color:var(--tinta-suave)">—</span>' : plata(v)) + '</td>';
      }).join('') +
      '<td class="num"><strong>' + plata(t) + '</strong></td>' +
      '<td class="num" style="color:var(--tinta-media)">' + plata(run) + '</td>' +
      '<td class="num">' + (metricaDia(d, 'Covers') || '—') + '</td></tr>';
  });

  h += '<tr class="total"><td colspan="2">Total ' + nombreMes(MES) + '</td>' +
    AREAS_ORDEN.map(function (a) {
      var s = 0; ds.forEach(function (d) { var v = totalArea(d, a); if (v) s += v; });
      return '<td class="num">' + plata(s) + '</td>';
    }).join('') +
    '<td class="num">' + plata(acum.total) + '</td><td></td>' +
    '<td class="num">' + ds.reduce(function (a, d) { return a + metricaDia(d, 'Covers'); }, 0) + '</td></tr>';
  h += '</tbody></table></div>';

  /* --- reparto por área --- */
  h += '<div class="titulo-seccion">De dónde viene la plata</div>';
  h += '<div class="marco" style="padding:16px 18px">';
  var totalMes = acum.total || 1;
  AREAS_ORDEN.forEach(function (a) {
    var s = 0, n = 0;
    ds.forEach(function (d) { var v = totalArea(d, a); if (v !== null) { s += v; n++; } });
    if (!n) return;
    var pct = (s / totalMes) * 100;
    h += '<div style="margin-bottom:13px">' +
      '<div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px">' +
      '<span><b>' + a + '</b> <span style="color:var(--tinta-suave)">· ' + n + ' días · promedio ' + plata(s / n) + '</span></span>' +
      '<span style="font-variant-numeric:tabular-nums"><b>' + plata(s) + '</b> · ' + pct.toFixed(0) + '%</span></div>' +
      '<div class="mini"><span style="width:' + pct + '%;background:' + COLOR_AREA[a] + '"></span></div></div>';
  });
  h += '</div>';

  return h;
}

function tarjeta(clase, rotulo, valor, tam, pie) {
  return '<div class="tarjeta ' + clase + '"><div class="t-rotulo">' + esc(rotulo) + '</div>' +
    '<div class="t-numero ' + (tam || '') + ' ' + (clase === 'mal' ? 'mal' : clase === 'ok' ? 'ok' : '') + '">' +
    (typeof valor === 'number' && valor > 999 ? '<span class="mon">' + E.moneda + '</span>' : '') +
    (typeof valor === 'number' ? plata(valor) : esc(valor)) + '</div>' +
    (pie ? '<div class="t-pie">' + pie + '</div>' : '') + '</div>';
}

function calendarioMes(mes, corte) {
  var total = cantidadDiasMes(mes);
  var p = mes.split('-');
  var primero = new Date(Date.UTC(+p[0], +p[1] - 1, 1)).getUTCDay();
  var offset = (primero + 6) % 7;   /* semana empieza lunes */
  var hoy = new Date().toISOString().slice(0, 10);

  var h = '<div class="marco" style="padding:14px"><div class="calendario">';
  ['lun','mar','mié','jue','vie','sáb','dom'].forEach(function (d) { h += '<div class="cal-dow">' + d + '</div>'; });
  for (var i = 0; i < offset; i++) h += '<div class="cal-dia vacio"></div>';

  for (var n = 1; n <= total; n++) {
    var f = mes + '-' + String(n).padStart(2, '0');
    var d = dia(f);
    if (!d) {
      h += '<div class="cal-dia sin" title="Sin datos cargados"><div class="cal-num">' + n + '</div>' +
           '<div class="cal-monto" style="color:var(--tinta-suave)">sin datos</div></div>';
    } else {
      var t = totalDia(d);
      var ev = esEvento(d, corte);
      var sem = semaforoDia(d, mes);
      var tit = fechaLegible(f) + ' - ' + plata(t) +
                (sem.obj ? '  |  objetivo ' + plata(sem.obj) + ' (' + sem.pct + '%) - ' + sem.texto : '');
      h += '<div class="cal-dia sem-' + sem.color + (ev ? ' evento' : '') + (f === hoy ? ' hoy' : '') +
           '" onclick="verDia(\'' + f + '\')" title="' + esc(tit) + '">' +
           '<div class="cal-num">' + n + (ev ? ' <span style="color:#a8862f">&#9670;</span>' : '') + '</div>' +
           '<div class="cal-monto">' + plata(t) + '</div>' +
           (sem.obj ? '<div class="cal-pct">' + sem.pct + '%</div>' : '') + '</div>';
    }
  }
  h += '</div>' + leyendaCalendario(mes, corte) + '</div>';
  return h;
}

function verDia(f) { DIA_SEL = f; VISTA = 'dia'; pintar(); }

/* ==============================  DÍA  ==================================== */

function vistaDia() {
  var ds = diasDelMes(MES);
  if (!ds.length) return cab('Sin días en este mes');
  if (!DIA_SEL || !dia(DIA_SEL)) DIA_SEL = ds[ds.length - 1].fecha;

  var d = dia(DIA_SEL);
  var cmp = compararDia(DIA_SEL);
  var corte = corteEvento(MES);
  var ev = esEvento(d, corte);
  var falt = areasFaltantes(DIA_SEL);

  var h = cab(fechaLegible(DIA_SEL), 'Hoja original: ' + (d.hoja || '—'));

  h += '<div class="acciones no-imprimir">' +
    '<select class="filtro" onchange="DIA_SEL=this.value;pintar()">' +
    ds.map(function (x) {
      return '<option value="' + x.fecha + '"' + (x.fecha === DIA_SEL ? ' selected' : '') + '>' +
        fechaCorta(x.fecha) + ' · ' + diaSemana(x.fecha) + ' · ' + plata(totalDia(x)) + '</option>';
    }).join('') + '</select>' +
    '<span class="sep"></span>' +
    '<button class="boton" onclick="marcarEvento(\'' + DIA_SEL + '\',' + (!ev) + ')">' +
    (ev ? 'No es día de evento' : 'Marcar como evento') + '</button>' +
    '<button class="boton" onclick="nuevoFormulario(\'' + DIA_SEL + '\', true)">Corregir</button>' +
    '<button class="boton" onclick="ir(\'presentacion\')">Ver presentación</button></div>';

  if (falt.length) h += '<div class="caja mal"><strong>Día incompleto.</strong> ' +
    'No reportó: <b>' + falt.join(', ') + '</b>. El total está por debajo de lo real y este día no se usa como referencia.</div>';
  if (ev) h += '<div class="caja aviso"><strong>Día de evento.</strong> Penny Blue hizo ' +
    plata(totalArea(d, 'Penny Blue')) + ', muy por encima de un día normal. Suma al acumulado, pero no se usa como referencia para proyectar días normales.</div>';

  /* números del día */
  h += '<div class="tarjetas">';
  h += tarjeta('acento', 'Total del día', cmp.total, 'grande',
    cmp.variacionComparables !== null
      ? (cmp.variacionComparables >= 0 ? '<b style="color:var(--ok)">' : '<b style="color:var(--mal)">') +
        plata(cmp.variacionComparables, true) + '</b> contra el promedio de ' + cmp.comparables + ' días parecidos'
      : 'Sin días comparables todavía');
  h += tarjeta('', 'Cubiertos', cmp.cubiertos, '',
    cmp.cubiertos ? 'Consumo promedio <b>' + plata(cmp.total / cmp.cubiertos) + '</b> por persona' : '');
  h += tarjeta('', 'Comida / Bebida', '', '',
    '<b>' + plata(cmp.comida) + '</b> comida<br><b>' + plata(cmp.bebida) + '</b> bebida' +
    (cmp.total ? ' · bebida ' + Math.round((cmp.bebida / cmp.total) * 100) + '% del total' : ''));
  h += tarjeta(cmp.descuentos > cmp.total * 0.08 ? 'aviso' : '', 'Descuentos', cmp.descuentos, '',
    cmp.total ? Math.round((cmp.descuentos / cmp.total) * 100) + '% de la venta' : '');
  h += '</div>';

  /* comparación */
  if (cmp.anterior) {
    h += '<div class="caja gris" style="margin-top:16px">' +
      '<strong>Contra el día anterior</strong> (' + fechaCorta(cmp.anterior.fecha) + ', ' + diaSemana(cmp.anterior.fecha) + '): ' +
      plata(cmp.variacionAnterior, true) + '. ' +
      (cmp.comparables ? 'Contra el promedio de los últimos ' + cmp.comparables + ' ' + diaSemana(DIA_SEL) +
        (cmp.evento ? ' de evento' : '') + ': <strong>' + plata(cmp.variacionComparables, true) + '</strong>. ' +
        'Esta segunda comparación es la que vale: un lunes contra un domingo siempre da mal.' : '') +
      '</div>';
  }

  /* detalle por área */
  AREAS_ORDEN.forEach(function (area) {
    var servicios = d.areas[area];
    if (!servicios) return;
    h += '<div class="titulo-seccion">' + area + '</div>';

    var orden = ['Breakfast','Lunch','Dinner','Overnight','All Day'];
    var claves = Object.keys(servicios).sort(function (a, b) {
      var ia = orden.indexOf(a), ib = orden.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    var metricas = [];
    claves.forEach(function (s) {
      Object.keys(servicios[s]).forEach(function (m) { if (metricas.indexOf(m) === -1) metricas.push(m); });
    });
    var ordenMet = ['Covers','Food','Beverage','Delivery Charge','Misc/Banquets','Total','AV Check','Discounts'];
    metricas.sort(function (a, b) {
      var ia = ordenMet.indexOf(a), ib = ordenMet.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });

    h += '<div class="marco"><table><thead><tr><th>Servicio</th>' +
      metricas.map(function (m) { return '<th class="num">' + m + '</th>'; }).join('') + '</tr></thead><tbody>';
    claves.forEach(function (s) {
      var esTotal = s.toLowerCase().replace(/\s/g, '') === 'allday';
      h += '<tr class="' + (esTotal ? 'total' : '') + '"><td>' + esc(esTotal ? 'Todo el día' : s) + '</td>' +
        metricas.map(function (m) {
          var v = servicios[s][m];
          return '<td class="num">' + (v === undefined ? '' :
            (m === 'Covers' ? v : plata(v))) + '</td>';
        }).join('') + '</tr>';
    });
    h += '</tbody></table></div>';
  });

  /* comentarios del día */
  if (d.comentarios && d.comentarios.length) {
    h += '<div class="titulo-seccion">Lo que pasó ese día</div>';
    d.comentarios.forEach(function (c) {
      h += '<div class="coment"><div class="coment-alto">' +
        '<span><b>' + esc(c.area || 'General') + '</b></span></div>' +
        '<div class="coment-texto">' + esc(c.texto) + '</div></div>';
    });
  }

  return h;
}

function marcarEvento(f, valor) {
  E.marcados[f] = valor;
  anotar('Marcó un día', f + (valor ? ' como evento' : ' como día normal'));
  guardarTodo(); pintar();
  decir(valor ? 'Marcado como día de evento' : 'Marcado como día normal', 'ok');
}

/* ==========================  PROYECCIÓN  ================================= */

function vistaProyeccion() {
  var p = proyectar(MES);
  if (!p.ok) return cab('Proyección') + '<div class="vacio"><h3>' + esc(p.motivo) + '</h3></div>';

  var h = cab('Proyección de cierre — ' + nombreMes(MES),
    'Basada en ' + p.diasCargados + ' días cargados · se recalcula con cada día nuevo');

  /* configuración */
  h += '<div class="marco no-imprimir" style="padding:16px 18px;margin-bottom:18px">' +
    '<div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-end">' +
    '<div class="campo" style="margin:0;flex:1;min-width:190px"><label>Meta del mes</label>' +
    '<input type="number" value="' + (E.meta[MES] || '') + '" placeholder="Sin meta cargada" ' +
    'onchange="E.meta[MES]=this.value?+this.value:null;guardarTodo();pintar()"></div>' +
    '<div class="campo" style="margin:0;flex:1;min-width:190px"><label>Días de evento que faltan en Penny Blue</label>' +
    '<input type="number" min="0" max="' + p.faltan + '" value="' + p.eventosPrevistos + '" ' +
    'onchange="E.eventos[MES]=this.value===\'\'?null:+this.value;guardarTodo();pintar()">' +
    '<div class="pista">' + (p.eventosSupuestos
      ? 'Lo estoy suponiendo por la proporción de los días ya cargados. Si sabés el número real, cargalo.'
      : 'Cargado por vos.') + '</div></div>' +
    '</div></div>';

  /* resultado */
  h += '<div class="tarjetas">';
  h += tarjeta(p.meta ? (p.cierre >= p.meta ? 'ok' : 'mal') : 'acento',
    'Cierre proyectado', p.cierre, 'grande',
    'Entre <b>' + plata(p.piso) + '</b> y <b>' + plata(p.techo) + '</b>');
  h += tarjeta('', 'Ya facturado', p.acumulado, '',
    '<b>' + p.diasCargados + '</b> días cargados de ' + p.diasDelMes);
  h += tarjeta('', 'Falta facturar', p.resto, '',
    '<b>' + p.faltan + '</b> días · ' + plata(p.porDia) + ' por día');
  if (p.meta) {
    h += tarjeta(p.diferencia >= 0 ? 'ok' : 'mal', 'Contra la meta', p.diferencia, '',
      p.diferencia >= 0 ? 'Se llega con margen'
        : 'Hacen falta <b>' + plata(p.necesarioPorDia) + '</b> por día. Vienen haciendo ' + plata(p.ritmoActual) + '.');
  }
  h += '</div>';

  if (p.meta && p.diferencia < 0) {
    h += '<div class="caja mal" style="margin-top:16px"><strong>No se llega al ritmo actual.</strong> ' +
      'Para alcanzar la meta hay que hacer <b>' + plata(p.necesarioPorDia) + ' por día</b> en los ' + p.faltan +
      ' días que faltan. El promedio de los días cargados es <b>' + plata(p.ritmoActual) + '</b>.</div>';
  }

  /* el cálculo, paso a paso */
  h += '<div class="titulo-seccion">De dónde sale ese número</div>';
  h += '<div class="calculo">';
  h += '<div class="calculo-linea"><div class="calculo-desc"><b>Ya facturado</b>' +
    '<small>Suma de los ' + p.diasCargados + ' días cargados del mes</small></div>' +
    '<div class="calculo-monto">' + plata(p.acumulado) + '</div></div>';

  p.detalle.forEach(function (x) {
    var etiqueta = x.tipo === 'evento' ? ' — días de evento' : x.tipo === 'normal' ? ' — días normales' : '';
    h += '<div class="calculo-linea"><div class="calculo-desc">' +
      '<b>' + x.area + etiqueta + '</b>' +
      '<small>' + x.dias + ' días × ' + plata(x.valor) + ' (mediana de ' + x.n + ' días de referencia)</small></div>' +
      '<div class="calculo-monto">' + plata(x.subtotal) + '</div></div>';
  });

  h += '<div class="calculo-total"><span>Cierre proyectado</span><span>' +
    E.moneda + ' ' + plata(p.cierre) + '</span></div>';
  h += '</div>';

  /* explicación en palabras */
  h += '<div class="caja gris" style="margin-top:16px">' +
    '<strong>En una frase:</strong> si los ' + p.faltan + ' días que faltan se parecen a los que ya pasaron ' +
    '—con ' + p.eventosPrevistos + ' día' + (p.eventosPrevistos === 1 ? '' : 's') + ' de evento en Penny Blue— ' +
    'el mes cierra alrededor de <strong>' + plata(p.cierre) + '</strong>.' +
    '</div>';

  /* método */
  h += '<div class="titulo-seccion">Cómo está calculado</div>';
  h += '<div class="marco" style="padding:16px 18px;font-size:12.5px;line-height:1.6">' +
    '<p><strong>Se proyecta área por área, no sobre el total.</strong> Las tres se comportan distinto: ' +
    'Exchange Lane e In Room Dining son estables, Penny Blue no.</p>' +
    '<p><strong>Penny Blue se separa en dos.</strong> Tiene días normales (alrededor de ' +
    plata(medianaPB(MES, false)) + ') y días de evento (alrededor de ' + plata(medianaPB(MES, true)) + '). ' +
    'Promediarlos daría un número que no ocurre nunca. El corte está en ' + plata(p.corte) + '.</p>' +
    '<p><strong>El piso y el techo</strong> salen de la dispersión real de los días de referencia ' +
    '(percentil 25 y 75), más o menos un día de evento. No son supuestos: son lo que ya pasó.</p>' +
    '<p><strong>El acumulado solo suma los días que existen.</strong> Nunca se rellena un día faltante ' +
    'con un estimado. Si faltan días, el acumulado va a estar por debajo del real y se avisa.</p>' +
    '<p style="color:var(--tinta-suave);border-top:1px solid var(--linea);padding-top:10px;margin-bottom:0">' +
    '<strong>Lo que esto NO es:</strong> una proyección estadística sobre lo ya facturado. ' +
    '<strong>No incluye reservas tomadas para los días que faltan</strong>, porque el sistema no las ve. ' +
    'Si hay eventos grandes ya confirmados, cargalos arriba y el número mejora bastante.</p></div>';

  return h;
}

function medianaPB(mes, evento) {
  var corte = corteEvento(mes);
  var vals = [];
  var meses = mesesDisponibles().filter(function (m) { return m <= mes; }).slice(-3);
  E.dias.forEach(function (d) {
    if (meses.indexOf(mesDe(d.fecha)) === -1) return;
    var v = totalArea(d, 'Penny Blue');
    if (v === null || v <= 0) return;
    if (esEvento(d, corte) === evento) vals.push(v);
  });
  return mediana(vals);
}

/* =========================  PRESENTACIÓN  =============================== */

function vistaPresentacion() {
  var ds = diasDelMes(MES);
  if (!ds.length) return cab('Presentación') + '<div class="vacio"><h3>No hay días en este mes</h3></div>';
  var f = (DIA_SEL && dia(DIA_SEL)) ? DIA_SEL : ds[ds.length - 1].fecha;
  var d = dia(f);
  var cmp = compararDia(f);
  var p = proyectar(MES);
  var acum = acumulado(MES, f);
  var corte = corteEvento(MES);
  var ev = esEvento(d, corte);
  var falt = areasFaltantes(f);

  var h = '<div class="acciones no-imprimir">' +
    '<select class="filtro" onchange="DIA_SEL=this.value;pintar()">' +
    ds.map(function (x) {
      return '<option value="' + x.fecha + '"' + (x.fecha === f ? ' selected' : '') + '>' + fechaLegible(x.fecha) + '</option>';
    }).join('') + '</select><span class="sep"></span>' +
    '<button class="boton primario" onclick="window.print()">Imprimir o guardar en PDF</button></div>';

  h += '<div class="hoja">';
  h += '<div class="hoja-alto"><div class="hotel">Reporte diario de ingresos · Alimentos y Bebidas</div>' +
    '<h2>Resumen del día</h2><div class="fecha">' + fechaLegible(f) + '</div></div>';

  /* resumen ejecutivo en dos líneas */
  var frase = 'El día cerró en <strong>' + E.moneda + ' ' + plata(cmp.total) + '</strong>';
  if (cmp.variacionComparables !== null) {
    frase += cmp.variacionComparables >= 0
      ? ', <strong>' + plata(cmp.variacionComparables) + ' por encima</strong> del promedio de días parecidos'
      : ', <strong>' + plata(Math.abs(cmp.variacionComparables)) + ' por debajo</strong> del promedio de días parecidos';
  }
  frase += '. El acumulado del mes es de <strong>' + E.moneda + ' ' + plata(acum.total) + '</strong> sobre ' +
    acum.dias + ' días cargados';
  if (p.ok) {
    frase += ', y la proyección de cierre está en <strong>' + E.moneda + ' ' + plata(p.cierre) + '</strong>';
    if (p.meta) frase += p.diferencia >= 0
      ? ', <strong>por encima de la meta</strong>'
      : ', <strong>' + plata(Math.abs(p.diferencia)) + ' por debajo de la meta</strong>';
  }
  frase += '.';
  h += '<div class="hoja-resumen">' + frase + '</div>';

  /* KPIs */
  h += '<div class="hoja-kpis">';
  h += kpiHoja('Total del día', E.moneda + ' ' + plata(cmp.total),
    cmp.variacionComparables !== null
      ? '<span style="color:' + (cmp.variacionComparables >= 0 ? 'var(--ok)' : 'var(--mal)') + '">' +
        plata(cmp.variacionComparables, true) + ' vs. días parecidos</span>' : '');
  h += kpiHoja('Acumulado del mes', E.moneda + ' ' + plata(acum.total), acum.dias + ' días cargados');
  h += kpiHoja('Proyección de cierre', p.ok ? E.moneda + ' ' + plata(p.cierre) : '—',
    p.ok ? plata(p.piso) + ' a ' + plata(p.techo) : '');
  h += kpiHoja('Contra la meta',
    p.meta ? (p.diferencia >= 0 ? '+' : '−') + ' ' + plata(Math.abs(p.diferencia)) : 'sin meta',
    p.meta ? 'Meta ' + plata(p.meta) : 'Cargar en Proyección');
  h += '</div>';

  /* desglose */
  h += '<div class="hoja-tabla"><table><thead><tr><th>Área</th><th class="num">Cubiertos</th>' +
    '<th class="num">Comida</th><th class="num">Bebida</th><th class="num">Total</th>' +
    '<th class="num">Consumo prom.</th></tr></thead><tbody>';
  AREAS_ORDEN.forEach(function (a) {
    if (!d.areas[a]) return;
    var sv = d.areas[a];
    var allday = null;
    for (var k in sv) if (k.toLowerCase().replace(/\s/g, '') === 'allday') allday = sv[k];
    if (!allday) return;
    var t = totalArea(d, a);
    h += '<tr><td><strong>' + a + '</strong></td>' +
      '<td class="num">' + (allday.Covers || '—') + '</td>' +
      '<td class="num">' + plata(allday.Food || 0) + '</td>' +
      '<td class="num">' + plata(allday.Beverage || 0) + '</td>' +
      '<td class="num"><strong>' + plata(t) + '</strong></td>' +
      '<td class="num">' + (allday['AV Check'] ? plata(allday['AV Check']) : '—') + '</td></tr>';
  });
  h += '<tr class="total"><td>Total del día</td><td class="num">' + cmp.cubiertos + '</td>' +
    '<td class="num">' + plata(cmp.comida) + '</td><td class="num">' + plata(cmp.bebida) + '</td>' +
    '<td class="num">' + plata(cmp.total) + '</td>' +
    '<td class="num">' + (cmp.cubiertos ? plata(cmp.total / cmp.cubiertos) : '—') + '</td></tr>';
  h += '</tbody></table></div>';

  /* avisos */
  if (falt.length) h += '<div class="caja mal">Día incompleto: no reportó <strong>' + falt.join(', ') + '</strong>.</div>';
  if (ev) h += '<div class="caja aviso">Día de evento en Penny Blue.</div>';

  /* comentarios */
  if (d.comentarios && d.comentarios.length) {
    h += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;' +
      'color:var(--tinta-suave);margin:20px 0 9px">Observaciones del turno</div>';
    d.comentarios.forEach(function (c) {
      h += '<div style="font-size:12px;line-height:1.55;margin-bottom:9px;padding-left:11px;' +
        'border-left:2px solid var(--linea-fuerte)">' +
        (c.area ? '<strong>' + esc(c.area) + ':</strong> ' : '') + esc(c.texto) + '</div>';
    });
  }

  h += '<div class="hoja-nota">' +
    'Acumulado calculado sobre ' + acum.dias + ' días cargados de ' + cantidadDiasMes(MES) + '. ' +
    (p.ok ? 'Proyección basada en la mediana de los días de referencia, con ' + p.eventosPrevistos +
      ' día(s) de evento previsto(s) en Penny Blue. ' : '') +
    '<strong>La proyección no incluye reservas tomadas para los días que faltan.</strong>' +
    '</div>';

  h += '</div>';
  return h;
}

function kpiHoja(rot, val, comp) {
  return '<div class="hoja-kpi"><div class="rot">' + rot + '</div>' +
    '<div class="val">' + val + '</div>' +
    (comp ? '<div class="comp">' + comp + '</div>' : '') + '</div>';
}

/* =========================  COMENTARIOS  ================================ */

var FILTRO_COM = '';

function vistaComentarios() {
  var todos = [];
  E.dias.forEach(function (d) {
    (d.comentarios || []).forEach(function (c) {
      todos.push({ fecha:d.fecha, area:c.area, texto:c.texto });
    });
  });
  todos.sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });

  var q = FILTRO_COM.toLowerCase();
  var lista = q ? todos.filter(function (c) {
    return c.texto.toLowerCase().indexOf(q) !== -1 ||
           (c.area || '').toLowerCase().indexOf(q) !== -1;
  }) : todos;

  var h = cab('Observaciones', todos.length + ' comentarios registrados en ' +
    Object.keys(todos.reduce(function (a, c) { a[c.fecha] = 1; return a; }, {})).length + ' días');

  h += '<div class="caja gris">Son los comentarios que vienen en el reporte. Hoy quedan dentro de la ' +
    'hoja del día y nadie los vuelve a leer. Acá están todos juntos y se pueden buscar: es donde ' +
    'aparecen los problemas que se repiten.</div>';

  h += '<div class="acciones"><input class="filtro" style="width:280px" placeholder="Buscar en las observaciones…" ' +
    'value="' + esc(FILTRO_COM) + '" oninput="FILTRO_COM=this.value;pintar();var i=document.getElementById(\'bq\');i.focus();i.setSelectionRange(i.value.length,i.value.length)" id="bq">';
  ['steak','delay','complaint','busy','wine','room','group'].forEach(function (t) {
    h += '<button class="boton chico" onclick="FILTRO_COM=\'' + t + '\';pintar()">' + t + '</button>';
  });
  if (FILTRO_COM) h += '<button class="boton chico" onclick="FILTRO_COM=\'\';pintar()">Limpiar</button>';
  h += '<span class="sep"></span><span style="font-size:12px;color:var(--tinta-media)">' +
    lista.length + ' de ' + todos.length + '</span></div>';

  if (!lista.length) return h + '<div class="vacio"><h3>Nada con esa búsqueda</h3></div>';

  var porMes = {};
  lista.forEach(function (c) { (porMes[mesDe(c.fecha)] = porMes[mesDe(c.fecha)] || []).push(c); });
  Object.keys(porMes).sort().reverse().forEach(function (m) {
    h += '<div class="titulo-seccion">' + nombreMes(m) + ' · ' + porMes[m].length + '</div>';
    porMes[m].forEach(function (c) {
      var t = esc(c.texto);
      if (q) t = t.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'),
        '<mark style="background:#fbeeba">$1</mark>');
      h += '<div class="coment"><div class="coment-alto">' +
        '<span><b>' + esc(c.area || 'General') + '</b> · ' +
        '<span class="link" onclick="verDia(\'' + c.fecha + '\')">' + fechaLegible(c.fecha) + '</span></span>' +
        '<span>' + diaSemana(c.fecha) + '</span></div>' +
        '<div class="coment-texto">' + t + '</div></div>';
    });
  });
  return h;
}
