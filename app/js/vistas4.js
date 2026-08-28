/* ==========================================================================
   Equipos y sueldos · Enviar el reporte
   ========================================================================== */

/* =====================  EQUIPOS Y SUELDOS  ============================== */

function vistaEquipos() {
  var h = cab('Equipos y sueldos', 'Cuánto se paga la hora, por equipo y por persona');

  h += '<div class="caja gris">El valor que se aplica a cada persona sale en este orden: ' +
    '<b>1)</b> si tiene un valor propio, ese · <b>2)</b> si no, el de su equipo · ' +
    '<b>3)</b> si no, el valor general. Así se carga una vez por equipo y solo se ajustan ' +
    'las excepciones.</div>';

  /* --- valor general y moneda --- */
  h += '<div class="marco" style="padding:16px 18px;margin-bottom:18px">' +
    '<div class="config-fila">' +
    '<div class="campo ancho"><label>Valor general por hora</label>' +
    '<input type="number" step="0.5" value="' + (E.valorHora || '') + '" placeholder="Ej: 32" ' +
    'onchange="E.valorHora=this.value?+this.value:0;guardarTodo();pintar()">' +
    '<div class="pista">Se usa para quien no tenga equipo ni valor propio.</div></div>' +
    '<div class="campo angosto"><label>Moneda</label>' +
    '<select onchange="E.moneda=this.value;guardarTodo();pintar()">' +
    ['AUD','USD','NZD','GBP','EUR'].map(function (m) {
      return '<option value="' + m + '"' + (m === E.moneda ? ' selected' : '') + '>' + m + '</option>';
    }).join('') + '</select></div>' +
    '<div class="campo angosto"><label>Idioma</label>' +
    '<select onchange="cambiarIdioma(this.value)">' +
    '<option value="es"' + ((E.idioma || 'es') === 'es' ? ' selected' : '') + '>Español</option>' +
    '<option value="en"' + (E.idioma === 'en' ? ' selected' : '') + '>English</option>' +
    '</select></div>' +
    '</div></div>';

  /* --- equipos --- */
  h += '<div class="titulo-seccion">Equipos</div>';
  h += '<div class="marco"><table><thead><tr>' +
    '<th>Equipo</th><th class="num" style="width:150px">Valor por hora</th>' +
    '<th class="num" style="width:90px">Personas</th>' +
    '<th style="width:210px"></th></tr></thead><tbody>';

  var gente = gentePorTurnos();
  equipos().forEach(function (eq) {
    var n = gente.filter(function (g) { return g.equipo === eq.id; }).length;
    h += '<tr><td><strong>' + esc(eq.nombre) + '</strong></td>' +
      '<td class="num"><input type="text" inputmode="decimal" class="celda" onkeypress="soloNumeros(event)" oninput="limpiarSiSobra(this)" ' +
      'value="' + (eq.valorHora || '') + '" placeholder="' + (E.valorHora || 'sin valor') + '" ' +
      'onchange="setValorEquipo(\'' + eq.id + '\',this.value)"></td>' +
      '<td class="num">' + (n || '—') + '</td>' +
      '<td><div class="acciones-celda">' +
      '<button class="boton chico" onclick="asignarPorNombre(\'' + eq.id + '\')" ' +
      'title="Pone en este equipo a todos los que todavía no tienen uno">Asignar sueltos</button>' +
      '<button class="boton chico" onclick="borrarEquipo(\'' + eq.id + '\')" ' +
      'title="Borrar el equipo">✕</button></div></td></tr>';
  });
  h += '</tbody></table></div>';
  h += '<div class="acciones" style="border:none;margin-top:11px">' +
    '<button class="boton" onclick="nuevoEquipo()">+ Nuevo equipo</button></div>';

  /* --- personas --- */
  h += '<div class="titulo-seccion">Personas</div>';

  var sinValor = genteSinValor();
  if (sinValor.length) {
    var quienes = sinValor.slice(0, 6).map(function (g) { return esc(g.quien); }).join(', ');
    h += enIngles()
      ? '<div class="caja aviso"><strong>' + sinValor.length + ' people without an hourly rate.</strong> ' +
        'Their hours do not add to the cost, so the total will fall short. ' +
        'Assign them a team or set an own rate: ' + quienes +
        (sinValor.length > 6 ? ' and ' + (sinValor.length - 6) + ' more' : '') + '.</div>'
      : '<div class="caja aviso"><strong>' + sinValor.length + ' personas sin valor por hora.</strong> ' +
        'Sus horas no suman al costo, así que el total va a quedar corto. ' +
        'Asignales un equipo o poneles un valor propio: ' + quienes +
        (sinValor.length > 6 ? ' y ' + (sinValor.length - 6) + ' más' : '') + '.</div>';
  }

  if (!gente.length) {
    h += '<div class="vacio"><h3>Todavía no hay turnos cargados</h3>' +
      '<p>Las personas aparecen solas cuando se cargan turnos, desde el Excel o a mano.</p></div>';
    return h;
  }

  h += '<div class="marco tabla-ancha"><table><thead><tr>' +
    '<th>Persona</th><th style="width:190px">Equipo</th>' +
    '<th class="num" style="width:150px">Valor propio</th>' +
    '<th class="num">Se aplica</th><th>De dónde sale</th>' +
    '<th class="num">Turnos</th><th class="num">Horas</th><th class="num">Costo</th>' +
    '</tr></thead><tbody>';

  gente.forEach(function (g) {
    var f = (E.personas || {})[g.quien] || {};
    h += '<tr' + (!g.valor ? ' style="background:var(--mal-fondo)"' : '') + '>' +
      '<td><strong>' + esc(g.quien) + '</strong></td>' +
      '<td><select class="celda" style="text-align:left" onchange="setEquipoPersona(\'' +
        esc(g.quien).replace(/'/g, "\\'") + '\',this.value)">' +
        '<option value="">— sin equipo —</option>' +
        equipos().map(function (eq) {
          return '<option value="' + eq.id + '"' + (f.equipo === eq.id ? ' selected' : '') + '>' +
            esc(eq.nombre) + '</option>';
        }).join('') + '</select></td>' +
      '<td class="num"><input type="text" inputmode="decimal" class="celda" onkeypress="soloNumeros(event)" oninput="limpiarSiSobra(this)" ' +
        'value="' + (f.valorHora || '') + '" placeholder="—" ' +
        'onchange="setValorPersona(\'' + esc(g.quien).replace(/'/g, "\\'") + '\',this.value)"></td>' +
      '<td class="num"><strong>' + (g.valor ? plata(g.valor) : '<span style="color:var(--mal)">0</span>') + '</strong></td>' +
      '<td>' + etiquetaOrigen(g.origen, g.detalle) + '</td>' +
      '<td class="num">' + g.turnos + '</td>' +
      '<td class="num">' + g.horas + '</td>' +
      '<td class="num">' + (g.valor ? plata(g.costo) : '—') + '</td></tr>';
  });

  var totH = gente.reduce(function (a, g) { return a + g.horas; }, 0);
  var totC = gente.reduce(function (a, g) { return a + g.costo; }, 0);
  h += '<tr class="total"><td colspan="5">Total del histórico</td>' +
    '<td class="num">' + gente.reduce(function (a, g) { return a + g.turnos; }, 0) + '</td>' +
    '<td class="num">' + Math.round(totH) + '</td>' +
    '<td class="num">' + plata(totC) + '</td></tr>';
  h += '</tbody></table></div>';

  /* --- resumen por equipo del mes --- */
  var porEq = equiposDelMes(MES);
  if (porEq.length) {
    h += '<div class="titulo-seccion">Costo por equipo — ' + nombreMes(MES) + '</div>';
    var totalEq = porEq.reduce(function (a, x) { return a + x.costo; }, 0) || 1;
    h += '<div class="marco"><table><thead><tr><th>Equipo</th>' +
      '<th class="num">Personas</th><th class="num">Horas</th>' +
      '<th class="num">Costo</th><th>Peso</th></tr></thead><tbody>';
    porEq.forEach(function (x) {
      var pct = Math.round((x.costo / totalEq) * 100);
      h += '<tr><td><strong>' + esc(x.equipo.nombre) + '</strong></td>' +
        '<td class="num">' + x.personas + '</td>' +
        '<td class="num">' + x.horas + '</td>' +
        '<td class="num">' + plata(x.costo) + '</td>' +
        '<td style="width:180px"><div class="mini"><span style="width:' + pct + '%;background:' +
          (x.equipo.id === '_sin' ? 'var(--mal)' : 'var(--acento)') + '"></span></div></td></tr>';
    });
    h += '</tbody></table></div>';
  }

  return h;
}

function etiquetaOrigen(origen, detalle) {
  if (origen === 'persona') return '<span class="eti eti-acento">valor propio</span>';
  if (origen === 'equipo') return '<span class="eti eti-ok">' + esc(detalle) + '</span>';
  if (origen === 'general') return '<span class="eti eti-neutro">valor general</span>';
  return '<span class="eti eti-mal">sin valor</span>';
}

/* =========================  ENVIAR  ===================================== */

function vistaEnviar() {
  var ds = diasDelMes(MES);
  var f = (DIA_SEL && dia(DIA_SEL)) ? DIA_SEL : (ds.length ? ds[ds.length - 1].fecha : null);

  var h = cab('Enviar el reporte', f ? fechaLegible(f) : '');

  if (!f) return h + '<div class="vacio"><h3>No hay días cargados</h3></div>';

  h += '<div class="acciones">' +
    '<select class="filtro" onchange="DIA_SEL=this.value;pintar()">' +
    ds.map(function (x) {
      return '<option value="' + x.fecha + '"' + (x.fecha === f ? ' selected' : '') + '>' +
        fechaLegible(x.fecha) + '</option>';
    }).join('') + '</select></div>';

  /* --- destinatarios --- */
  h += '<div class="marco" style="padding:16px 18px;margin-bottom:18px">' +
    '<div class="campo" style="margin:0"><label>A quién se le manda</label>' +
    '<input type="text" value="' + esc((E.mail || {}).para || '') + '" ' +
    'placeholder="jefe@hotel.com, gerencia@hotel.com" ' +
    'onchange="guardarMail(\'para\',this.value)">' +
    '<div class="pista">Separá con comas. Se guarda para la próxima.</div></div></div>';

  /* --- vista previa --- */
  var texto = armarTextoReporte(f);
  h += '<div class="titulo-seccion">Así va a llegar</div>';
  h += '<div class="marco" style="padding:16px 18px">' +
    '<pre style="white-space:pre-wrap;font-family:inherit;font-size:12.5px;line-height:1.6;margin:0">' +
    esc(texto) + '</pre></div>';

  h += '<div class="acciones" style="border:none;margin-top:18px">' +
    '<button class="boton primario" onclick="abrirMail(\'' + f + '\')">Abrir el mail</button>' +
    '<button class="boton" onclick="copiarReporte(\'' + f + '\')">Copiar el texto</button>' +
    '<button class="boton" onclick="bajarJson(\'' + f + '\')">Bajar en JSON</button>' +
    '<span class="sep"></span>' +
    '<button class="boton" onclick="ir(\'presentacion\')">Ver la presentación</button></div>';

  /* --- explicación honesta --- */
  h += '<div class="titulo-seccion">Cómo funciona el envío</div>';
  h += '<div class="caja aviso"><strong>Hoy el mail no sale solo.</strong> ' +
    'El botón <b>Abrir el mail</b> abre tu programa de correo con el destinatario, el asunto y ' +
    'todo el reporte ya escrito. Vos lo revisás y le das enviar. ' +
    'Eso es a propósito: el día que un número salga mal, es mejor que lo veas antes de que lo lea tu jefe.</div>';

  h += '<div class="marco" style="padding:16px 18px;font-size:12.5px;line-height:1.6">' +
    '<p><strong>Para que salga automático hace falta un servidor.</strong> ' +
    'Este programa es un archivo que se abre en el navegador: no tiene forma de mandar un mail por ' +
    'su cuenta. Cuando esté armado el Supabase, se le puede agregar un envío programado ' +
    '(por ejemplo, todas las mañanas a las 8).</p>' +
    '<p><strong>El JSON ya está listo</strong> para ese momento. El botón "Bajar en JSON" genera ' +
    'exactamente lo que se le va a mandar al servidor cuando exista. Está documentado en ' +
    '<code>docs/07-envio-por-mail.md</code>.</p>' +
    '<p style="margin-bottom:0;color:var(--tinta-suave)">Nada de esto manda información a ningún lado ' +
    'todavía. El JSON se baja a tu computadora.</p></div>';

  return h;
}

function guardarMail(campo, valor) {
  if (!E.mail) E.mail = {};
  E.mail[campo] = valor;
  guardarTodo();
}

/* Texto del reporte, listo para pegar en un mail. */
function armarTextoReporte(f) {
  var d = dia(f);
  if (!d) return '';
  var cmp = compararDia(f);
  var p = proyectar(MES);
  var ac = acumulado(MES, f);
  var corte = corteEvento(MES);
  var ev = esEvento(d, corte);
  var falt = areasFaltantes(f);
  var M = E.moneda;
  var L = [];

  var EN = (E.idioma || 'es') === 'en';
  var R = EN ? {
    tit:'DAILY REVENUE REPORT — FOOD & BEVERAGE', res:'SUMMARY', area:'BY AREA',
    obs:'SHIFT OBSERVATIONS', per:'STAFF', avisos:'ALERTS', general:'General',
    total:'Day total', comp:'Vs similar days', acum:'Month to date',
    proy:'Forecast close', meta:'Month target',
    entre:'between', dias:'days entered of',
    incompleto:'Incomplete day: no report from', eventoDia:'Event day at Penny Blue.',
    cub:'covers', ticket:'avg check', comida:'Food', bebida:'Beverage', desc:'Discounts',
    personas:'people', horas:'hours', costo:'cost', deVenta:'of sales',
    sinRep:'not reported', arriba:'above ', abajo:'below ',
    pie1:'The running total only adds the days entered. The forecast is statistical, based on',
    pie2:'what has already been billed, and excludes bookings held for the remaining days.'
  } : {
    tit:'REPORTE DIARIO DE INGRESOS — ALIMENTOS Y BEBIDAS', res:'RESUMEN', area:'POR ÁREA',
    obs:'OBSERVACIONES DEL TURNO', per:'PERSONAL', avisos:'AVISOS', general:'General',
    total:'Total del día', comp:'Contra días parecidos', acum:'Acumulado del mes',
    proy:'Proyección de cierre', meta:'Meta del mes',
    entre:'entre', dias:'días cargados de',
    incompleto:'Día incompleto: no reportó', eventoDia:'Día de evento en Penny Blue.',
    cub:'cubiertos', ticket:'ticket', comida:'Comida', bebida:'Bebida', desc:'Descuentos',
    personas:'personas', horas:'horas', costo:'costo', deVenta:'de la venta',
    sinRep:'sin reportar', arriba:'por encima ', abajo:'por debajo ',
    pie1:'El acumulado suma solo los días cargados. La proyección es estadística sobre lo ya',
    pie2:'facturado y no incluye reservas tomadas para los días que faltan.'
  };

  L.push(R.tit);
  L.push(fechaLegible(f));
  L.push('');
  L.push(R.res);
  L.push('  ' + pad(R.total, 24) + ' ' + M + ' ' + plata(cmp.total));
  if (cmp.variacionComparables !== null) {
    L.push('  ' + pad(R.comp, 24) + ' ' + plata(cmp.variacionComparables, true) +
           ' (' + cmp.comparables + ' ' + (EN ? 'days' : 'días') + ')');
  }
  L.push('  ' + pad(R.acum, 24) + ' ' + M + ' ' + plata(ac.total) +
         '   (' + ac.dias + ' ' + R.dias + ' ' + cantidadDiasMes(MES) + ')');
  if (p.ok) {
    L.push('  ' + pad(R.proy, 24) + ' ' + M + ' ' + plata(p.cierre) +
           '   (' + R.entre + ' ' + plata(p.piso) + ' y ' + plata(p.techo) + ')');
    if (p.meta) {
      L.push('  ' + pad(R.meta, 24) + ' ' + M + ' ' + plata(p.meta) +
             '   → ' + (p.diferencia >= 0 ? R.arriba : R.abajo) + plata(Math.abs(p.diferencia)));
    }
  }
  L.push('');
  L.push(R.area);
  AREAS_ORDEN.forEach(function (a) {
    var v = totalArea(d, a);
    if (v === null) { L.push('  ' + pad(a, 20) + ' ' + R.sinRep); return; }
    var sv = d.areas[a], ad = null;
    for (var k in sv) if (k.toLowerCase().replace(/\s/g, '') === 'allday') ad = sv[k];
    L.push('  ' + pad(a, 20) + M + ' ' + padIzq(plata(v), 10) +
      (ad && ad.Covers ? '   ' + ad.Covers + ' ' + R.cub + ' · ' + R.ticket + ' ' + plata(v / ad.Covers) : ''));
  });
  L.push('  ' + pad('TOTAL', 20) + M + ' ' + padIzq(plata(cmp.total), 10) +
    (cmp.cubiertos ? '   ' + cmp.cubiertos + ' ' + R.cub + ' · ' + R.ticket + ' ' + plata(cmp.total / cmp.cubiertos) : ''));
  L.push('');
  L.push('  ' + R.comida + ' ' + plata(cmp.comida) + '  ·  ' + R.bebida + ' ' + plata(cmp.bebida) +
         '  ·  ' + R.desc + ' ' + plata(cmp.descuentos));

  if (falt.length || ev) {
    L.push('');
    L.push(R.avisos);
    if (falt.length) L.push('  · ' + R.incompleto + ' ' + falt.join(', ') + '.');
    if (ev) L.push('  · ' + R.eventoDia);
  }

  if (d.comentarios && d.comentarios.length) {
    L.push('');
    L.push(R.obs);
    d.comentarios.forEach(function (c) {
      L.push('  [' + (c.area || R.general) + ']');
      L.push('  ' + partirTexto(c.texto, 74, '  '));
    });
  }

  var ap = analisisPersonal(d, MES);
  if (!ap.sinDatos) {
    L.push('');
    L.push(R.per);
    L.push('  ' + ap.personas + ' ' + R.personas + ' · ' + Math.round(ap.horas) + ' horas' +
      (hayValores() ? ' · ' + R.costo + ' ' + M + ' ' + plata(costoPersonalReal(d)) +
        (ap.pesoCosto !== null ? ' (' + ap.pesoCosto + '% ' + R.deVenta + ')' : '') : ''));
    if (ap.estado !== 'normal') L.push('  ' + ap.mensaje);
  }

  L.push('');
  L.push('---');
  L.push(R.pie1);
  L.push(R.pie2);
  return L.join('\n');
}

function pad(s, n) { s = String(s); return s + new Array(Math.max(1, n - s.length + 1)).join(' '); }
function padIzq(s, n) { s = String(s); return new Array(Math.max(1, n - s.length + 1)).join(' ') + s; }
function partirTexto(t, ancho, sangria) {
  var palabras = String(t).split(/\s+/), linea = '', out = [];
  palabras.forEach(function (p) {
    if ((linea + ' ' + p).trim().length > ancho) { out.push(linea.trim()); linea = p; }
    else linea += ' ' + p;
  });
  if (linea.trim()) out.push(linea.trim());
  return out.join('\n' + sangria);
}

function abrirMail(f) {
  var para = ((E.mail || {}).para || '').trim();
  var asunto = 'Reporte diario F&B — ' + fechaLegible(f);
  var cuerpo = armarTextoReporte(f);
  var url = 'mailto:' + encodeURIComponent(para) +
            '?subject=' + encodeURIComponent(asunto) +
            '&body=' + encodeURIComponent(cuerpo);
  if (url.length > 1900) {
    copiarReporte(f);
    decir('El reporte es largo para el mail. Lo copié: pegalo en el mensaje.', 'ok');
    window.location.href = 'mailto:' + encodeURIComponent(para) + '?subject=' + encodeURIComponent(asunto);
    return;
  }
  window.location.href = url;
  anotar('Abrió el mail del reporte', f);
  guardarTodo();
}

function copiarReporte(f) {
  var t = armarTextoReporte(f);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(t).then(function () { decir('Reporte copiado', 'ok'); });
  } else {
    var ta = document.createElement('textarea');
    ta.value = t; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
    decir('Reporte copiado', 'ok');
  }
}

/* El JSON que se le va a mandar al servidor cuando exista. */
function armarJsonReporte(f) {
  var d = dia(f);
  var cmp = compararDia(f);
  var p = proyectar(MES);
  var ac = acumulado(MES, f);
  var ap = analisisPersonal(d, MES);
  var corte = corteEvento(MES);

  return {
    version: 1,
    generado: new Date().toISOString(),
    propiedad: 'hotel-demo',
    moneda: E.moneda,
    fecha: f,
    dia: {
      total: cmp.total,
      cubiertos: cmp.cubiertos,
      comida: cmp.comida,
      bebida: cmp.bebida,
      descuentos: cmp.descuentos,
      esEvento: esEvento(d, corte),
      incompleto: areasFaltantes(f),
      areas: AREAS_ORDEN.map(function (a) {
        return { area:a, total:totalArea(d, a), servicios:(d.areas[a] || null) };
      }).filter(function (x) { return x.total !== null; })
    },
    mes: {
      periodo: MES,
      acumulado: ac.total,
      diasCargados: ac.dias,
      diasDelMes: cantidadDiasMes(MES),
      meta: p.meta || null,
      proyeccion: p.ok ? { base:p.cierre, piso:p.piso, techo:p.techo,
                           eventosPrevistos:p.eventosPrevistos } : null
    },
    personal: ap.sinDatos ? null : {
      personas: ap.personas, horas: ap.horas,
      costo: hayValores() ? costoPersonalReal(d) : null,
      pesoCosto: ap.pesoCosto, estado: ap.estado
    },
    comentarios: (d.comentarios || []).map(function (c) {
      return { area:c.area || null, texto:c.texto };
    }),
    destinatarios: (((E.mail || {}).para || '').split(',')
      .map(function (x) { return x.trim(); }).filter(Boolean))
  };
}

function bajarJson(f) {
  var j = JSON.stringify(armarJsonReporte(f), null, 2);
  var b = new Blob([j], { type:'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = 'reporte-' + f + '.json';
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 600);
  decir('JSON bajado', 'ok');
}
