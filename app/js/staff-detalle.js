/* ==========================================================================
   El detalle del personal en la presentación y la pantalla de reglas de pago.
   ========================================================================== */

/* ------------------------------- staff detallado en la presentación ----- */

/*
   Antes la presentación decía "6 personas · 45 horas" y nada más. Para una
   reunión donde se habla de costos, eso no alcanza: hay que poder decir
   quién estuvo, cuánto, dónde y cuánto costó.
*/
function bloqueStaffPresentacion(d) {
  var turnos = d.turnos || [];
  if (!turnos.length) return '';
  var EN = enIngles();
  var M = E.moneda;
  var conPago = hayValores();
  var conReglas = conPago && (typeof hayRecargos === 'function') && hayRecargos();

  var h = '<div class="hoja-seccion">' +
    '<div class="hoja-titulo">' + (EN ? 'STAFF ON SHIFT' : 'PERSONAL DEL DÍA') + '</div>';

  var totalH = 0, totalC = 0, totalP = 0;

  /* Un grupo por área, y al final los que no tienen área cargada. Los sin
     área también van con nombre y horario: el dato existe igual, lo único
     que falta es dónde estuvieron. */
  var grupos = AREAS_ORDEN.map(function (a) {
    return { area: a, ts: turnos.filter(function (t) { return t.area === a; }) };
  });
  var sinArea = turnos.filter(function (t) { return AREAS_ORDEN.indexOf(t.area) === -1; });
  if (sinArea.length) {
    grupos.push({ area: EN ? 'No area assigned' : 'Sin área asignada', ts: sinArea, suelto: true });
  }

  grupos.forEach(function (g) {
    var area = g.area, ts = g.ts;
    if (!ts.length) return;

    var hA = ts.reduce(function (a, t) { return a + (t.horas || 0); }, 0);
    var cA = ts.reduce(function (a, t) {
      return a + (conReglas ? calcularPagoTurno(t, d.fecha).total : costoTurno(t));
    }, 0);
    totalH += hA; totalC += cA; totalP += ts.length;

    var vA = g.suelto ? null : totalArea(d, area);

    h += '<table class="hoja-staff"><thead><tr>' +
      '<th colspan="' + (conPago ? 4 : 3) + '" class="area">' + area +
      ' <span>· ' + personas(ts.length) +
      ' · ' + (Math.round(hA * 10) / 10) + ' h' +
      (conPago ? ' · ' + AUD(cA) : '') +
      (vA && conPago ? ' · ' + Math.round((cA / vA) * 100) + '% ' +
        (EN ? 'of sales' : 'de la venta') : '') +
      '</span></th></tr>' +
      '<tr><th>' + (EN ? 'Name' : 'Nombre') + '</th>' +
      '<th>' + (EN ? 'Shift' : 'Turno') + '</th>' +
      '<th class="num">' + (EN ? 'Hours' : 'Horas') + '</th>' +
      (conPago ? '<th class="num">' + (EN ? 'Cost' : 'Costo') + '</th>' : '') +
      '</tr></thead><tbody>';

    ts.slice().sort(function (a, b) { return (b.horas || 0) - (a.horas || 0); })
      .forEach(function (t) {
        var pago = conReglas ? calcularPagoTurno(t, d.fecha) : null;
        var extra = pago && (pago.recargoDia + pago.recargoNoche + pago.recargoCasual) > 0.5;
        h += '<tr><td>' + esc(t.quien || '—') + '</td>' +
          '<td class="hora">' + horaTexto(t.desde || 0) + '–' + horaTexto(t.hasta || 0) +
          (t.descanso ? ' <span class="desc">−' + t.descanso + '\'</span>' : '') + '</td>' +
          '<td class="num">' + (t.horas || 0) + '</td>' +
          (conPago ? '<td class="num">' + plata(pago ? pago.total : costoTurno(t)) +
            (extra ? '<span class="rec" title="' +
              (EN ? 'includes penalty rates' : 'incluye recargos') + '">*</span>' : '') +
            '</td>' : '') + '</tr>';
      });
    h += '</tbody></table>';
  });

  if (sinArea.length) {
    h += '<div class="hoja-nota" style="margin:2px 0 0;border:none;padding:0">' +
      (EN ? 'Assign the area on the day screen to see the cost of each outlet separately.'
          : 'Asignando el área en la pantalla del día se ve el costo de cada salón por separado.') +
      '</div>';
  }

  /* total */
  h += '<div class="hoja-staff-total">' +
    '<span>' + (EN ? 'Total' : 'Total') + ': <strong>' + personas(totalP) + '</strong> · <strong>' +
    (Math.round(totalH * 10) / 10) + ' h</strong>' +
    (conPago ? ' · <strong>' + AUD(totalC) + '</strong>' : '') + '</span>';
  var vTot = totalDia(d);
  if (conPago && vTot) {
    h += '<span>' + (EN ? 'Staff cost of sales: ' : 'Costo sobre venta: ') +
      '<strong>' + Math.round((totalC / vTot) * 100) + '%</strong></span>';
  }
  h += '</div>';

  if (conReglas) {
    h += '<div class="hoja-nota" style="margin-top:8px;border:none;padding:0">* ' +
      (EN ? 'includes evening, weekend or public holiday penalty rates'
          : 'incluye recargo por noche, fin de semana o feriado') + '</div>';
  }

  h += '</div>';
  return h;
}

/* ------------------------------------------ pantalla de reglas de pago -- */

function vistaPagos() {
  var EN = enIngles();
  var r = reglas();
  var h = cab(EN ? 'Pay rules' : 'Reglas de pago',
    EN ? 'How an hour is paid depending on when it was worked'
       : 'Cuánto vale una hora según cuándo se trabajó');

  var plano = !hayRecargos();
  h += '<div class="caja ' + (plano ? 'gris' : 'aviso') + '"><strong>' +
    (plano
      ? (EN ? 'Right now an hour is worth the same any day and at any time.'
            : 'Ahora mismo una hora vale lo mismo cualquier día y a cualquier hora.')
      : (EN ? 'There are loadings loaded: some hours are worth more than others.'
            : 'Hay recargos cargados: algunas horas valen más que otras.')) + '</strong> ' +
    (EN
      ? 'That is what the hotel reported. If it turns out that a night, a Sunday or a public ' +
        'holiday is paid differently, it gets set up here and the whole system recalculates &mdash; ' +
        'the days already loaded included. Nothing has to be entered again.'
      : 'Es lo que informó el hotel. Si resulta que una noche, un domingo o un feriado se paga ' +
        'distinto, se configura acá y el sistema recalcula todo &mdash; también los días que ya ' +
        'están cargados. No hay que volver a cargar nada.') + '</div>';

  h += '<div class="acciones" style="border:none;margin:0 0 20px">' +
    '<button class="boton' + (plano ? ' primario' : '') + '" onclick="ponerSinRecargos()">' +
    (EN ? 'No loadings' : 'Sin recargos') + '</button>' +
    '<button class="boton" onclick="ponerReglasConvenio()">' +
    (EN ? 'Load the award values' : 'Cargar los valores del convenio') + '</button>' +
    '<span style="font-size:11.5px;color:var(--tinta-suave)">' +
    (EN ? 'the award is the legal floor; many hotels have their own agreement'
        : 'el convenio es el piso legal; muchos hoteles tienen su propio acuerdo') + '</span></div>';

  /* --- multiplicador por día --- */
  h += '<div class="titulo-seccion">' + (EN ? 'By day of the week' : 'Según el día') + '</div>';
  h += '<div class="caja gris">' +
    (EN
      ? 'A multiplier on the base rate: 1 means the hour is worth the normal rate, 1.25 that it ' +
        'is worth 25% more. A casual has a <strong>separate column</strong>: if used, it already ' +
        'includes its own loading and the two are never multiplied together. Getting that wrong ' +
        'is the most common underpayment in hospitality.'
      : 'Un multiplicador sobre el valor base: 1 quiere decir que la hora vale lo normal, y 1,25 ' +
        'que vale un 25% más. El casual tiene <strong>su propia columna</strong>: si se usa, ya ' +
        'trae adentro su recargo y nunca se multiplica una cosa por la otra. Equivocarse en eso ' +
        'es el error que más sueldos mal liquidados genera en el rubro.') + '</div>';
  var vh0 = E.valorHora || 30;
  h += '<div class="marco tabla-ancha"><table><thead><tr><th>' + (EN ? 'Day' : 'Día') + '</th>' +
    '<th class="num" style="width:120px">' + (EN ? 'Permanent' : 'Permanente') + '</th>' +
    '<th class="num" style="width:140px">' + (EN ? 'An hour at ' : 'Una hora de ') + vh0 + '</th>' +
    '<th class="num" style="width:120px">' + (EN ? 'Casual' : 'Casual') + '</th>' +
    '<th class="num" style="width:140px">' + (EN ? 'An hour at ' : 'Una hora de ') + vh0 +
    '</th></tr></thead><tbody>';
  [['semana', EN ? 'Monday to Friday' : 'Lunes a viernes'],
   ['sabado', EN ? 'Saturday' : 'Sábado'],
   ['domingo', EN ? 'Sunday' : 'Domingo'],
   ['feriado', EN ? 'Public holiday' : 'Feriado']].forEach(function (x) {
    var m = r.dias[x[0]], mc = r.diasCasual[x[0]];
    h += '<tr><td><strong>' + x[1] + '</strong></td>' +
      '<td class="num"><input type="text" inputmode="decimal" class="celda" value="' + m + '" ' +
      'onkeypress="soloNumeros(event)" oninput="limpiarSiSobra(this)" ' +
      'onchange="setMultDia(\'' + x[0] + '\',this.value)"></td>' +
      '<td class="num">' + AUDc(vh0 * m) + '</td>' +
      '<td class="num"><input type="text" inputmode="decimal" class="celda" value="' + mc + '" ' +
      'onkeypress="soloNumeros(event)" oninput="limpiarSiSobra(this)" ' +
      'onchange="setMultDiaCasual(\'' + x[0] + '\',this.value)"></td>' +
      '<td class="num">' + AUDc(vh0 * mc) + '</td></tr>';
  });
  h += '</tbody></table></div>';

  /* --- franjas horarias --- */
  h += '<div class="titulo-seccion">' +
    (EN ? 'Loadings by time of day' : 'Recargos por franja horaria') + '</div>';
  h += '<div class="caja gris">' +
    (EN
      ? 'A <strong>fixed amount per hour</strong> &mdash; not a percentage &mdash; that is added ' +
        'on top of the day multiplier. Add the ones the hotel actually pays, and choose which ' +
        'days each one applies to: a loading can be worth only on Sundays, or only on holidays.'
      : 'Un <strong>monto fijo por hora</strong> &mdash; no un porcentaje &mdash; que se suma al ' +
        'multiplicador del día. Agregá las que el hotel realmente paga y elegí en qué días vale ' +
        'cada una: un recargo puede valer solo los domingos, o solo los feriados.') + '</div>';

  if (!r.nocturno.length) {
    h += '<div class="marco" style="padding:20px 18px;text-align:center">' +
      '<div style="font-size:12.5px;color:var(--tinta-suave);margin-bottom:12px">' +
      (EN ? 'No loading by time of day. Every hour of the shift is paid the same.'
          : 'No hay recargo por franja horaria. Todas las horas del turno se pagan igual.') +
      '</div><button class="boton" onclick="agregarBanda()">' +
      (EN ? '+ Add a band' : '+ Agregar una franja') + '</button></div>';
  } else {
    h += '<div class="marco tabla-ancha"><table><thead><tr>' +
      '<th>' + (EN ? 'What it is called' : 'Cómo se llama') + '</th>' +
      '<th style="width:110px">' + (EN ? 'From' : 'Desde') + '</th>' +
      '<th style="width:110px">' + (EN ? 'To' : 'Hasta') + '</th>' +
      '<th class="num" style="width:130px">' + (EN ? 'Extra per hour' : 'Extra por hora') +
      ' (' + E.moneda + ')</th>' +
      '<th style="width:230px">' + (EN ? 'Which days' : 'Qué días') + '</th>' +
      '<th style="width:40px"></th></tr></thead><tbody>';

    r.nocturno.forEach(function (b) {
      h += '<tr><td><input type="text" class="celda" value="' + esc(b.nombre) + '" ' +
        'onchange="setNombreBanda(\'' + b.id + '\',this.value)"></td>' +
        '<td><input type="time" class="celda" value="' + horaTexto(b.desde) + '" ' +
        'onchange="setHoraBanda(\'' + b.id + '\',\'desde\',this.value)"></td>' +
        '<td><input type="time" class="celda" value="' + horaTexto(b.hasta === 1440 ? 0 : b.hasta) + '" ' +
        'onchange="setHoraBanda(\'' + b.id + '\',\'hasta\',this.value)"></td>' +
        '<td class="num"><input type="text" inputmode="decimal" class="celda" ' +
        'value="' + (b.valor || '') + '" placeholder="0" ' +
        'onkeypress="soloNumeros(event)" oninput="limpiarSiSobra(this)" ' +
        'onchange="setRecargoNoche(\'' + b.id + '\',this.value)"></td><td>';
      TIPOS_DIA.forEach(function (t) {
        var puesto = !b.dias || b.dias.indexOf(t) !== -1;
        h += '<label class="chip-dia' + (puesto ? ' puesto' : '') + '" title="' +
          esc(nombreTipoDia(t)) + '">' +
          '<input type="checkbox"' + (puesto ? ' checked' : '') + ' ' +
          'onchange="alternarDiaBanda(\'' + b.id + '\',\'' + t + '\')"> ' +
          esc(abrevTipoDia(t)) + '</label>';
      });
      h += '</td><td><button class="boton chico" title="' +
        (EN ? 'Remove this band' : 'Quitar esta franja') + '" ' +
        'onclick="quitarBanda(\'' + b.id + '\')">&times;</button></td></tr>';
    });
    h += '</tbody></table></div>';
    h += '<div class="acciones" style="border:none;margin-top:10px">' +
      '<button class="boton" onclick="agregarBanda()">' +
      (EN ? '+ Add a band' : '+ Agregar una franja') + '</button></div>';
  }

  /* --- otros --- */
  h += '<div class="titulo-seccion">' + (EN ? 'Other' : 'Otros') + '</div>';
  h += '<div class="marco" style="padding:16px 18px"><div class="config-fila">' +
    '<div class="campo angosto"><label>' + (EN ? 'Paid break' : 'Descanso pago') + '</label>' +
    '<select onchange="setDescansoPago(this.value===\'1\')">' +
    '<option value="0"' + (!r.descansoPago ? ' selected' : '') + '>' +
      (EN ? 'No, it is deducted' : 'No, se descuenta') + '</option>' +
    '<option value="1"' + (r.descansoPago ? ' selected' : '') + '>' +
      (EN ? 'Yes, it is paid' : 'Sí, se paga') + '</option></select></div>' +
    '</div></div>';

  /* --- quién es casual --- */
  h += '<div class="titulo-seccion">' + (EN ? 'Who is casual' : 'Quién es casual') + '</div>';
  h += '<div class="caja gris">' +
    (EN ? 'Tick whoever is on a casual contract. Everyone else is paid with the permanent column.'
        : 'Marcá a quien esté contratado como casual. El resto se paga con la columna de ' +
          'permanente.') + '</div>';
  h += '<div class="marco" style="padding:16px 18px">';
  var gente = nombresConTurnos();
  if (!gente.length) {
    h += '<div style="font-size:12.5px;color:var(--tinta-suave)">' +
      (EN ? 'Nobody loaded yet. Names show up here once shifts are entered.'
          : 'Todavía no hay nadie cargado. Los nombres aparecen acá cuando se cargan turnos.') +
      '</div>';
  } else {
    h += '<div style="display:flex;gap:7px;flex-wrap:wrap">';
    gente.forEach(function (q) {
      var c = esContratoCasual(q);
      h += '<label class="chip-casual' + (c ? ' puesto' : '') + '">' +
        '<input type="checkbox"' + (c ? ' checked' : '') + ' ' +
        'onchange="marcarCasual(this.getAttribute(&quot;data-q&quot;),this.checked)" ' +
        'data-q="' + esc(q) + '"> ' + esc(q) + '</label>';
    });
    h += '</div>';
  }
  h += '</div>';

  /* --- feriados --- */
  h += '<div class="titulo-seccion">' + (EN ? 'Public holidays' : 'Feriados') + '</div>';
  h += '<div class="marco" style="padding:16px 18px">' +
    '<div class="acciones" style="border:none;margin:0 0 11px">' +
    '<input type="date" class="filtro" id="nuevo-feriado">' +
    '<button class="boton" onclick="agregarFeriado(document.getElementById(\'nuevo-feriado\').value)">' +
    (EN ? '+ Add' : '+ Agregar') + '</button></div>';
  if (!r.feriados.length) {
    h += '<div style="font-size:12.5px;color:var(--tinta-suave)">' +
      (EN ? 'None loaded. Public holidays vary by state in Australia.'
          : 'Ninguno cargado. Los feriados cambian según el estado en Australia.') + '</div>';
  } else {
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
    r.feriados.forEach(function (f) {
      h += '<span class="eti eti-acento" style="padding:4px 9px">' + fechaCorta(f) +
        ' <span style="cursor:pointer;font-weight:700" onclick="quitarFeriado(\'' + f + '\')">✕</span></span>';
    });
    h += '</div>';
  }
  h += '</div>';

  /* --- ejemplo, para ver si quedó bien --- */
  h += '<div class="titulo-seccion">' + (EN ? 'Check it with an example' : 'Comprobalo con un ejemplo') + '</div>';
  h += ejemploPago();

  /* --- qué cambió en el mes --- */
  if (hayValores()) {
    var g = desgloseMes(MES);
    if (g.total > 0) {
      h += '<div class="titulo-seccion">' + (EN ? 'Impact on ' : 'Impacto en ') + nombreMes(MES) + '</div>';
      h += '<div class="marco"><table><thead><tr><th>' + (EN ? 'Concept' : 'Concepto') + '</th>' +
        '<th class="num">' + E.moneda + '</th><th class="num">%</th></tr></thead><tbody>' +
        filaDesglose(EN ? 'Base hours' : 'Horas base', g.base, g.total) +
        filaDesglose(EN ? 'Day loading (weekend / holiday)' : 'Recargo por día (fin de semana / feriado)', g.recargoDia, g.total) +
        filaDesglose(EN ? 'Night loading' : 'Recargo nocturno', g.recargoNoche, g.total) +
        (g.recargoCasual ? filaDesglose(EN ? 'Casual loading' : 'Recargo de casual',
          g.recargoCasual, g.total) : '') +
        '<tr class="total"><td>' + (EN ? 'Total' : 'Total') + '</td>' +
        '<td class="num">' + plata(g.total) + '</td><td class="num">100%</td></tr>' +
        '</tbody></table></div>';
      var sinRec = g.base;
      if (g.total > sinRec) {
        h += '<div class="caja gris" style="margin-top:12px">' +
          (EN ? 'Penalty rates add ' : 'Los recargos suman ') +
          '<strong>' + AUD(g.total - sinRec) + '</strong> ' +
          (EN ? 'over the base, a ' : 'sobre la base, un ') +
          '<strong>' + Math.round(((g.total - sinRec) / sinRec) * 100) + '%</strong> ' +
          (EN ? 'more. Without them the cost would be understated.'
              : 'más. Sin contarlos, el costo queda corto.') + '</div>';
      }
    }
  }

  h += '<div class="acciones" style="border:none;margin-top:18px"><span class="sep"></span>' +
    '<button class="boton" onclick="restaurarReglas()">' +
    (EN ? 'Reset to starting values' : 'Volver a los valores de arranque') + '</button></div>';
  return h;
}

function filaDesglose(nombre, v, total) {
  if (!v) return '';
  return '<tr><td>' + nombre + '</td><td class="num">' + plata(v) + '</td>' +
    '<td class="num">' + Math.round((v / total) * 100) + '%</td></tr>';
}

/* Un turno de prueba, para ver el cálculo con los valores cargados. */
var EJ_TURNO = { desde: 19*60, hasta: 27*60, descanso: 30 };
var EJ_FECHA = null;

function ejemploPago() {
  var EN = enIngles();
  var f = EJ_FECHA || (E.dias.length ? E.dias[E.dias.length - 1].fecha
                                     : new Date().toISOString().slice(0, 10));
  var vh = E.valorHora || 30;
  var p = calcularPagoTurno(EJ_TURNO, f, vh);

  var h = '<div class="marco" style="padding:16px 18px">' +
    '<div class="config-fila" style="margin-bottom:14px">' +
    '<div class="campo angosto"><label>' + (EN ? 'Date' : 'Fecha') + '</label>' +
    '<input type="date" value="' + f + '" onchange="EJ_FECHA=this.value;pintar()"></div>' +
    '<div class="campo angosto"><label>' + (EN ? 'From' : 'Desde') + '</label>' +
    '<input type="time" value="' + horaTexto(EJ_TURNO.desde) + '" ' +
    'onchange="setEjemplo(\'desde\',this.value)"></div>' +
    '<div class="campo angosto"><label>' + (EN ? 'To' : 'Hasta') + '</label>' +
    '<input type="time" value="' + horaTexto(EJ_TURNO.hasta) + '" ' +
    'onchange="setEjemplo(\'hasta\',this.value)"></div>' +
    '<div class="campo angosto"><label>' + (EN ? 'Break' : 'Descanso') + '</label>' +
    '<select onchange="EJ_TURNO.descanso=+this.value;pintar()">' +
    [0,30,60,90].map(function (m) {
      return '<option value="' + m + '"' + (EJ_TURNO.descanso === m ? ' selected' : '') + '>' +
        (m ? m + ' min' : (EN ? 'none' : 'sin descanso')) + '</option>';
    }).join('') + '</select></div>' +
    '<div class="campo angosto"><label>' + (EN ? 'Base rate' : 'Valor base') + '</label>' +
    '<input type="text" inputmode="decimal" value="' + vh + '" ' +
    'onkeypress="soloNumeros(event)" oninput="limpiarSiSobra(this)" ' +
    'onchange="E.valorHora=+this.value||0;guardarTodo();pintar()"></div>' +
    '</div>';

  h += '<div style="font-size:12.5px;color:var(--tinta-media);margin-bottom:10px">' +
    nombreTipoDia(p.tipoDia) + ' · ' + p.horas + ' ' + (EN ? 'paid hours' : 'horas pagas') + '</div>';

  h += '<div class="calculo">';
  p.tramos.forEach(function (tr) {
    h += '<div class="calculo-linea"><div class="calculo-desc">' +
      '<b>' + horaTexto(tr.desde) + ' – ' + horaTexto(tr.hasta) + '</b>' +
      '<small>' + tr.horas + ' h · ' + nombreTipoDia(tr.tipo) + ' ×' + tr.multiplicador +
      (tr.recargoHora ? ' + ' + E.moneda + ' ' + tr.recargoHora + '/h' : '') + '</small></div>' +
      '<div class="calculo-monto">' + AUD(tr.importe) + '</div></div>';
  });
  if (p.recargoCasual > 0.5) {
    h += '<div class="calculo-linea"><div class="calculo-desc"><b>' +
      (EN ? 'Casual loading' : 'Recargo de casual') + '</b><small>' + reglas().casual + '%</small></div>' +
      '<div class="calculo-monto">' + AUD(p.recargoCasual) + '</div></div>';
  }
  h += '<div class="calculo-total"><span>' + (EN ? 'Total for this shift' : 'Total del turno') +
    '</span><span>' + AUD(p.total) + '</span></div>';
  h += '<div style="font-size:11.5px;color:var(--tinta-suave);margin-top:9px">' +
    (EN ? 'Without any loading it would be ' : 'Sin ningún recargo serían ') +
    AUD(p.horas * vh) +
    (p.total > p.horas * vh
      ? ' · +' + Math.round(((p.total / (p.horas * vh)) - 1) * 100) + '%' : '') + '</div>';
  h += '</div></div>';
  return h;
}

function setEjemplo(cual, valor) {
  var p = String(valor).split(':');
  if (p.length < 2) return;
  var m = (+p[0]) * 60 + (+p[1]);
  if (cual === 'hasta' && m <= EJ_TURNO.desde) m += 1440;
  EJ_TURNO[cual] = m;
  pintar();
}


/* Todos los nombres que alguna vez aparecieron en un turno. */
function nombresConTurnos() {
  var vistos = {}, out = [];
  E.dias.forEach(function (d) {
    (d.turnos || []).forEach(function (t) {
      var q = (t.quien || '').trim();
      if (!q || vistos[q.toLowerCase()]) return;
      vistos[q.toLowerCase()] = 1; out.push(q);
    });
  });
  return out.sort(function (a, b) { return a.localeCompare(b); });
}
