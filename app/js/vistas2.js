/* ==========================================================================
   Pantallas nuevas: Horarios y Personal
   ========================================================================== */

var AREA_HORARIO = 'In Room Dining';

/* ==========================  HORARIOS  =================================== */

function vistaHorarios() {
  var a = analisisHorario(MES, AREA_HORARIO);
  var h = cab('En qué momento entra la plata',
    AREA_HORARIO + ' · ' + nombreMes(MES));

  h += '<div class="acciones"><span style="font-size:12px;color:var(--tinta-media)">Área:</span>' +
    '<select class="filtro" onchange="AREA_HORARIO=this.value;pintar()">' +
    AREAS_ORDEN.map(function (x) {
      return '<option value="' + x + '"' + (x === AREA_HORARIO ? ' selected' : '') + '>' + x + '</option>';
    }).join('') + '</select><span class="sep"></span>' +
    '<button class="boton" onclick="window.print()">Imprimir</button></div>';

  if (!a || !a.lista.length) {
    return h + '<div class="vacio"><h3>No hay datos de esta área en ' + nombreMes(MES) + '</h3>' +
      '<p>Probá con otro mes u otra área.</p></div>';
  }

  /* --- conclusión arriba de todo --- */
  if (a.mejor && a.peor && a.mejor.franja.id !== a.peor.franja.id) {
    var brecha = a.peor.porHora ? Math.round(a.mejor.porHora / a.peor.porHora * 10) / 10 : null;
    h += enIngles()
      ? '<div class="caja ok"><strong>Worth looking at:</strong> in ' +
        nombreMes(MES) + ', each staff hour at <strong>' + a.mejor.franja.nombre.toLowerCase() +
        '</strong> generated <strong>' + E.moneda + ' ' + plata(a.mejor.porHora) + '</strong>, ' +
        'against <strong>' + E.moneda + ' ' + plata(a.peor.porHora) + '</strong> at <strong>' +
        a.peor.franja.nombre.toLowerCase() + '</strong>' +
        (brecha ? ' — ' + brecha + ' times more' : '') + '. ' +
        'That is where there is most room to move people or push sales.</div>'
      : '<div class="caja ok"><strong>Lo que conviene mirar:</strong> en ' +
        nombreMes(MES) + ', cada hora de personal en <strong>' + a.mejor.franja.nombre.toLowerCase() +
        '</strong> generó <strong>' + E.moneda + ' ' + plata(a.mejor.porHora) + '</strong>, ' +
        'contra <strong>' + E.moneda + ' ' + plata(a.peor.porHora) + '</strong> en <strong>' +
        a.peor.franja.nombre.toLowerCase() + '</strong>' +
        (brecha ? ' — ' + brecha + ' veces más' : '') + '. ' +
        'Es donde más margen hay para mover gente o para empujar la venta.</div>';
  }

  /* --- tabla por franja --- */
  h += '<div class="titulo-seccion">Franja por franja</div>';
  h += '<div class="marco"><table><thead><tr>' +
    '<th>' + (enIngles() ? 'Slot' : 'Franja') + '</th>' +
    '<th>' + (enIngles() ? 'Time' : 'Horario') + '</th>' +
    '<th class="num">' + (enIngles() ? 'Days' : 'Días') + '</th>' +
    '<th class="num">Total del mes</th><th class="num">Promedio por día</th>' +
    '<th class="num">Peso</th><th class="num">Cubiertos</th><th class="num">Ticket</th>' +
    '</tr></thead><tbody>';
  a.lista.forEach(function (x) {
    h += '<tr><td><strong>' + x.franja.nombre + '</strong></td>' +
      '<td style="color:var(--tinta-suave);font-size:11.5px">' +
        horaTexto(x.franja.desde) + ' a ' + horaTexto(x.franja.hasta) + '</td>' +
      '<td class="num">' + x.dias + '</td>' +
      '<td class="num"><strong>' + plata(x.total) + '</strong></td>' +
      '<td class="num">' + plata(x.promedioDia) + '</td>' +
      '<td class="num">' + x.peso + '%</td>' +
      '<td class="num">' + (x.cubiertos || '—') + '</td>' +
      '<td class="num">' + (x.ticket ? plata(x.ticket) : '—') + '</td></tr>';
  });
  h += '</tbody></table></div>';

  /* --- barras de reparto --- */
  h += '<div class="marco" style="padding:16px 18px;margin-top:13px">';
  a.lista.forEach(function (x) {
    h += '<div style="margin-bottom:12px">' +
      '<div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px">' +
      '<span><b>' + x.franja.nombre + '</b> <span style="color:var(--tinta-suave)">' +
        horaTexto(x.franja.desde) + '–' + horaTexto(x.franja.hasta) + '</span></span>' +
      '<span><b>' + plata(x.promedioDia) + '</b> por día · ' + x.peso + '%</span></div>' +
      '<div class="mini"><span style="width:' + x.peso + '%;background:' + COLOR_AREA[AREA_HORARIO] + '"></span></div></div>';
  });
  h += '</div>';

  /* --- cruce con personal --- */
  var conHoras = a.lista.filter(function (x) { return x.horas > 0; });
  if (conHoras.length) {
    h += '<div class="titulo-seccion">Cuánto rinde cada hora de personal</div>';
    h += '<div class="caja gris">Se cruzan los ingresos de cada franja con las horas de ' +
      'personal que caen adentro de esa franja. El número que importa es el último: ' +
      '<strong>cuánta plata genera cada hora que se paga</strong>. Cuando es bajo, o sobra gente ' +
      'o falta venta en ese momento.</div>';

    h += '<div class="marco"><table><thead><tr><th>' +
      (enIngles() ? 'Slot' : 'Franja') + '</th>' +
      '<th class="num">Ingresos</th><th class="num">Horas pagadas</th>' +
      '<th class="num">Costo estimado</th><th class="num">Costo sobre venta</th>' +
      '<th class="num">Genera por hora</th><th></th></tr></thead><tbody>';

    var maxRend = Math.max.apply(null, conHoras.map(function (x) { return x.porHora || 0; }));
    conHoras.forEach(function (x) {
      var esMejor = a.mejor && x.franja.id === a.mejor.franja.id;
      var esPeor = a.peor && x.franja.id === a.peor.franja.id;
      var pct = maxRend ? Math.round((x.porHora / maxRend) * 100) : 0;
      h += '<tr><td><strong>' + x.franja.nombre + '</strong></td>' +
        '<td class="num">' + plata(x.total) + '</td>' +
        '<td class="num">' + x.horas + '</td>' +
        '<td class="num">' + (hayValores() ? plata(x.costo) : '<span style="color:var(--tinta-suave)">' +
          (enIngles() ? 'no rates yet' : 'sin valores') + '</span>') + '</td>' +
        '<td class="num">' + (x.pesoCosto !== null && hayValores()
            ? '<span style="color:' + (x.pesoCosto > 35 ? 'var(--mal)' : x.pesoCosto > 25 ? 'var(--aviso)' : 'var(--ok)') + '">' +
              x.pesoCosto + '%</span>' : '—') + '</td>' +
        '<td class="num"><strong>' + (x.porHora ? plata(x.porHora) : '—') + '</strong></td>' +
        '<td style="width:130px">' +
          (x.porHora ? '<div class="mini"><span style="width:' + pct + '%;background:' +
            (esPeor ? 'var(--mal)' : esMejor ? 'var(--ok)' : 'var(--tinta-suave)') + '"></span></div>' : '') +
        '</td></tr>';
    });
    h += '</tbody></table></div>';

    if (!hayValores()) {
      h += '<div class="caja aviso" style="margin-top:13px">' +
        (enIngles() ? 'To see the cost, set each person\'s hourly rate in '
                    : 'Para ver el costo, cargá el valor hora de cada persona en ') +
        '<span class="link" onclick="ir(\'plantel\')">' + (enIngles() ? 'The team' : 'El plantel') +
        '</span>.</div>';
    }

    var sinTurnos = a.lista.filter(function (x) { return x.total > 0 && x.horas === 0; });
    if (sinTurnos.length) {
      h += '<div class="caja gris" style="margin-top:13px"><strong>' +
        sinTurnos.map(function (x) { return x.franja.nombre.toLowerCase(); })
          .join(enIngles() ? ' and ' : ' y ') +
        (enIngles()
          ? (sinTurnos.length === 1 ? ' does not appear' : ' do not appear') +
            ' in the cross-check</strong> because there are no shifts entered for that slot in this ' +
            'area. There is revenue, but no record of who served it, so revenue per hour cannot be ' +
            'calculated.</div>'
          : (sinTurnos.length === 1 ? ' no aparece' : ' no aparecen') +
            ' en el cruce</strong> porque no hay turnos cargados en esa franja para esta área. ' +
            'Hay ingresos, pero no queda registrado quién los atendió, así que no se puede ' +
            'calcular el rendimiento por hora.</div>');
    }
  }

  /* --- curva de cobertura --- */
  var ds = diasDelMes(MES).filter(function (d) { return (d.turnos || []).length; });
  if (ds.length) {
    h += '<div class="titulo-seccion">A qué hora hay gente trabajando</div>';
    var suma = [];
    for (var i = 0; i < 24; i++) suma.push(0);
    ds.forEach(function (d) {
      coberturaPorHora(d, AREA_HORARIO === 'In Room Dining' ? null : AREA_HORARIO)
        .forEach(function (x, i) { suma[i] += x.gente; });
    });
    var prom = suma.map(function (v) { return Math.round((v / ds.length) * 10) / 10; });
    var maxP = Math.max.apply(null, prom) || 1;

    h += '<div class="marco" style="padding:18px">';
    h += '<div style="display:flex;align-items:flex-end;gap:2px;height:110px">';
    for (var hh = 0; hh < 24; hh++) {
      var alto = Math.round((prom[hh] / maxP) * 100);
      var dentro = FRANJAS.some(function (f) {
        var min = hh * 60;
        return (min >= f.desde && min < f.hasta) || (min + 24 * 60 >= f.desde && min + 24 * 60 < f.hasta);
      });
      h += '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%" ' +
        'title="' + hh + ':00 — ' + prom[hh] + ' personas en promedio">' +
        '<div style="height:' + alto + '%;background:' + (dentro ? COLOR_AREA[AREA_HORARIO] : 'var(--linea-fuerte)') +
        ';border-radius:2px 2px 0 0;min-height:' + (prom[hh] > 0 ? '3px' : '0') + '"></div></div>';
    }
    h += '</div><div style="display:flex;gap:2px;margin-top:5px">';
    for (var hj = 0; hj < 24; hj++) {
      h += '<div style="flex:1;text-align:center;font-size:9px;color:var(--tinta-suave)">' +
        (hj % 3 === 0 ? hj : '') + '</div>';
    }
    h += '</div><div style="font-size:11.5px;color:var(--tinta-suave);margin-top:11px;text-align:center">' +
      'Promedio de personas trabajando en cada hora, sobre ' + ds.length + ' días con turnos cargados. ' +
      'Las barras claras son horas fuera de las franjas de servicio.</div></div>';
  }

  /* --- método --- */
  h += '<div class="titulo-seccion">Cómo está calculado</div>';
  h += '<div class="marco" style="padding:16px 18px;font-size:12.5px;line-height:1.6">' +
    '<p><strong>Los ingresos vienen por servicio, no por hora.</strong> El reporte trae desayuno, ' +
    'almuerzo, cena y madrugada — no hay detalle hora por hora. Así que la mayor precisión posible ' +
    'con estos datos es la franja, no la hora exacta.</p>' +
    (enIngles()
      ? '<p><strong>The time slots are an assumption:</strong> ' +
        FRANJAS.map(function (f) { return f.nombre.toLowerCase() + ' ' + horaTexto(f.desde) + '–' + horaTexto(f.hasta); }).join(' · ') +
        '. If the hotel uses different ones, they must be corrected and the whole staff cross-check changes.</p>'
      : '<p><strong>Las franjas horarias son un supuesto:</strong> ' +
        FRANJAS.map(function (f) { return f.nombre.toLowerCase() + ' ' + horaTexto(f.desde) + '–' + horaTexto(f.hasta); }).join(' · ') +
        '. Si en el hotel son otras, hay que corregirlas y todo el cruce con el personal cambia.</p>') +
    '<p><strong>Los turnos sí tienen hora exacta</strong>, porque están escritos en el reporte ' +
    '(por ejemplo "16:00 - 23:00, 30 min break"). De ahí salen las horas pagadas, descontando el ' +
    'descanso. Los turnos que cruzan la medianoche se manejan bien.</p>' +
    '<p style="margin-bottom:0;color:var(--tinta-suave);border-top:1px solid var(--linea);padding-top:10px">' +
    '<strong>Cuidado con una conclusión apurada:</strong> que una franja rinda poco por hora no ' +
    'siempre significa que sobre gente. Puede que ese personal esté preparando el servicio ' +
    'siguiente. El número marca dónde mirar, no qué hacer.</p></div>';

  return h;
}

/* ==========================  PERSONAL  =================================== */

function vistaPersonal() {
  var EN = enIngles();
  var mes = personalDelMes(MES);
  var ds = diasDelMes(MES);

  var h = cab(EN ? 'Staff' : 'Personal',
    (EN ? 'Hours worked, cost and staffing · ' : 'Horas trabajadas, costo y dotación · ') + nombreMes(MES));

  h += '<div class="caja gris">' + (EN
    ? 'The cost is calculated <strong>person by person</strong>, with the hourly rate each one has in ' +
      '<span class="link" onclick="ir(\'plantel\')">The team</span> or ' +
      '<span class="link" onclick="ir(\'equipos\')">Teams and pay</span>. There is no general rate: ' +
      'everyone is paid what their own rate says.'
    : 'El costo se calcula <strong>persona por persona</strong>, con el valor hora que tiene cada una en ' +
      '<span class="link" onclick="ir(\'plantel\')">El plantel</span> o ' +
      '<span class="link" onclick="ir(\'equipos\')">Equipos y sueldos</span>. No hay un valor general: ' +
      'cada uno cobra lo que dice su propio valor.') + '</div>';

  if (!mes) {
    return h + '<div class="vacio"><h3>' +
      (EN ? 'No shifts entered in ' : 'No hay turnos cargados en ') + nombreMes(MES) + '</h3>' +
      '<p>' + (EN ? 'Shifts are entered on the Enter today screen, area by area.'
                  : 'Los turnos se cargan en la pantalla Cargar el día, área por área.') + '</p></div>';
  }

  /* quién no tiene valor: sus horas no suman al costo */
  var sinValor = mes.gente.filter(function (g) { return !g.valor; });
  if (sinValor.length) {
    var nombres = sinValor.slice(0, 6).map(function (g) { return esc(g.quien); }).join(', ');
    h += '<div class="caja aviso"><strong>' + sinValor.length +
      (EN ? (sinValor.length === 1 ? ' person has no hourly rate' : ' people have no hourly rate')
          : (sinValor.length === 1 ? ' persona sin valor hora' : ' personas sin valor hora')) +
      '</strong> — ' + (EN ? 'their hours add nothing to the cost until it is set: '
                           : 'sus horas no suman al costo hasta que se les cargue: ') +
      nombres + (sinValor.length > 6 ? (EN ? ' and ' : ' y ') + (sinValor.length - 6) + (EN ? ' more' : ' más') : '') +
      '. <span class="link" onclick="ir(\'plantel\')">' + (EN ? 'Set them in The team' : 'Cargarlos en El plantel') +
      '</span></div>';
  }

  /* números del mes */
  h += '<div class="tarjetas">';
  h += tarjeta('acento', EN ? 'Hours this month' : 'Horas del mes', mes.horas, 'grande',
    '<b>' + mes.dias + (EN ? ' days' : ' días') + '</b> ' + (EN ? 'with shifts entered' : 'con turnos cargados'));
  h += tarjeta('', EN ? 'Staff cost' : 'Costo de personal', mes.costo, '',
    EN ? 'each person\'s hours × their own rate' : 'horas de cada persona × su propio valor');
  h += tarjeta(mes.pesoCosto === null ? '' : mes.pesoCosto > 35 ? 'mal' : mes.pesoCosto > 25 ? 'aviso' : 'ok',
    EN ? 'Cost over sales' : 'Costo sobre venta', mes.pesoCosto !== null ? mes.pesoCosto + '%' : '—', '',
    mes.pesoCosto !== null
      ? (EN ? 'Out of every 100 that comes in, ' + mes.pesoCosto + ' goes to wages'
            : 'De cada 100 que entran, ' + mes.pesoCosto + ' se van en sueldos') : '');
  h += tarjeta('', EN ? 'Revenue per hour' : 'Genera por hora', mes.rendHora, '',
    EN ? 'What each staff hour generated on average' : 'Lo que generó en promedio cada hora de personal');
  h += '</div>';

  /* día por día */
  h += '<div class="titulo-seccion">' + (EN ? 'Day by day' : 'Día por día') + '</div>';
  h += '<div class="caja gris">' + (EN
    ? 'Each day is compared against similar days: same conditions (event or normal), hours worked and ' +
      'what each hour brought in. When something is off it gets flagged — <strong>but no conclusion is ' +
      'drawn on its own</strong>. Write the reason in the last column: that is what explains the month later.'
    : 'El sistema compara cada día contra días parecidos: mismas condiciones (evento o normal), horas ' +
      'trabajadas y cuánto rindió cada hora. Cuando algo se sale de lo habitual lo marca — <strong>pero no ' +
      'saca conclusiones solo</strong>. Poné el motivo en la última columna: eso es lo que después explica el mes.') +
    '</div>';

  h += '<div class="marco tabla-muy-ancha"><table><thead><tr>' +
    '<th>' + (EN ? 'Date' : 'Fecha') + '</th>' +
    '<th class="num">' + (EN ? 'People' : 'Personas') + '</th>' +
    '<th class="num">' + (EN ? 'Hours' : 'Horas') + '</th>' +
    '<th class="num">' + (EN ? 'Cost' : 'Costo') + '</th>' +
    '<th class="num">' + (EN ? 'Sales' : 'Venta') + '</th>' +
    '<th class="num">' + (EN ? '% cost' : '% costo') + '</th>' +
    '<th class="num">' + (EN ? 'Per hour' : 'Por hora') + '</th>' +
    '<th>' + (EN ? 'Staffing' : 'Dotación') + '</th>' +
    '<th>' + (EN ? 'Your note' : 'Tu nota') + '</th></tr></thead><tbody>';

  ds.forEach(function (d) {
    var a = analisisPersonal(d, MES);
    if (a.sinDatos) {
      h += '<tr><td><span class="link" onclick="verDia(\'' + d.fecha + '\')">' + fechaCorta(d.fecha) + '</span></td>' +
        '<td colspan="7" style="color:var(--tinta-suave);font-size:11.5px">' +
        (EN ? 'No shifts entered' : 'Sin turnos cargados') + '</td>' +
        '<td>' + inputNota(d.fecha, a.nota) + '</td></tr>';
      return;
    }
    var eti = a.estado === 'sobra' ? '<span class="eti eti-aviso">' + (EN ? 'possibly overstaffed' : 'pudo sobrar gente') + '</span>'
            : a.estado === 'falta' ? '<span class="eti eti-mal">' + (EN ? 'possibly understaffed' : 'pudo faltar gente') + '</span>'
            : '<span class="eti eti-ok">normal</span>';
    h += '<tr' + (a.evento ? ' class="evento"' : '') + '>' +
      '<td><span class="link" onclick="verDia(\'' + d.fecha + '\')">' + fechaCorta(d.fecha) + '</span> ' +
      '<span style="color:var(--tinta-suave);font-size:11px">' + diaSemana(d.fecha) + '</span></td>' +
      '<td class="num">' + a.personas + '</td>' +
      '<td class="num">' + Math.round(a.horas) +
        (a.horasEsperadas ? '<span style="color:var(--tinta-suave);font-size:10.5px"> /' + a.horasEsperadas + '</span>' : '') + '</td>' +
      '<td class="num">' + plata(a.costo) + '</td>' +
      '<td class="num">' + plata(a.total) + '</td>' +
      '<td class="num">' + (a.pesoCosto !== null
          ? '<span style="color:' + (a.pesoCosto > 35 ? 'var(--mal)' : a.pesoCosto > 25 ? 'var(--aviso)' : 'var(--ok)') + '">' +
            a.pesoCosto + '%</span>' : '—') + '</td>' +
      '<td class="num">' + plata(a.rendHora) + '</td>' +
      '<td title="' + esc(a.mensaje) + '">' + eti + '</td>' +
      '<td>' + inputNota(d.fecha, a.nota) + '</td></tr>';
  });
  h += '</tbody></table></div>';
  h += '<div style="font-size:11.5px;color:var(--tinta-suave);margin-top:8px;text-align:center">' + (EN
    ? 'The Hours column shows the day\'s hours and, in small, the usual ones for a similar day. ' +
      'Hover over the staffing label to see the full explanation.'
    : 'La columna Horas muestra las del día y, en chico, las habituales para un día parecido. ' +
      'Pasá el mouse por la etiqueta de dotación para ver la explicación completa.') + '</div>';

  /* días marcados */
  var marcados = ds.map(function (d) { return { d:d, a:analisisPersonal(d, MES) }; })
    .filter(function (x) { return !x.a.sinDatos && x.a.estado !== 'normal'; });
  if (marcados.length) {
    h += '<div class="titulo-seccion">' + (EN ? 'Days worth reviewing' : 'Días que conviene revisar') + '</div>';
    marcados.forEach(function (x) {
      h += '<div class="caja ' + (x.a.estado === 'sobra' ? 'aviso' : 'mal') + '">' +
        '<strong>' + fechaLegible(x.d.fecha) + '</strong> — ' + esc(x.a.mensaje) +
        (x.a.nota ? '<br><em style="color:var(--tinta-media)">' + (EN ? 'Your note: ' : 'Tu nota: ') +
          esc(x.a.nota) + '</em>' : '') + '</div>';
    });
  }

  /* por persona: cada una con SU valor */
  h += '<div class="titulo-seccion">' + (EN ? 'By person' : 'Por persona') + '</div>';
  h += '<div class="marco tabla-ancha"><table><thead><tr>' +
    '<th>' + (EN ? 'Who' : 'Quién') + '</th>' +
    '<th class="num">' + (EN ? 'Shifts' : 'Turnos') + '</th>' +
    '<th class="num">' + (EN ? 'Hours' : 'Horas') + '</th>' +
    '<th class="num">' + (EN ? 'Hourly rate' : 'Valor hora') + '</th>' +
    '<th>' + (EN ? 'Rate comes from' : 'De dónde sale') + '</th>' +
    '<th class="num">' + (EN ? 'Cost' : 'Costo') + '</th>' +
    '<th class="num">' + (EN ? 'Avg per shift' : 'Promedio por turno') + '</th></tr></thead><tbody>';
  mes.gente.forEach(function (g) {
    h += '<tr' + (!g.valor ? ' style="background:var(--mal-fondo)"' : '') + '>' +
      '<td><strong>' + esc(g.quien) + '</strong></td>' +
      '<td class="num">' + g.turnos + '</td>' +
      '<td class="num">' + g.horas + '</td>' +
      '<td class="num">' + (g.valor ? AUDc(g.valor)
        : '<span class="link" style="color:var(--mal);font-weight:600" onclick="PERSONA_ABIERTA=\'' +
          esc(g.quien).replace(/'/g, "\\'") + '\';ir(\'plantel\')">' + (EN ? 'set rate' : 'cargar valor') + '</span>') + '</td>' +
      '<td>' + etiquetaOrigen(g.origen, g.detalle) + '</td>' +
      '<td class="num">' + (g.valor ? plata(g.costo) : '—') + '</td>' +
      '<td class="num">' + (g.turnos ? (Math.round((g.horas / g.turnos) * 10) / 10) + ' h' : '—') + '</td></tr>';
  });
  h += '<tr class="total"><td>Total</td><td class="num">' +
    mes.gente.reduce(function (a, g) { return a + g.turnos; }, 0) + '</td>' +
    '<td class="num">' + mes.horas + '</td><td></td><td></td>' +
    '<td class="num">' + plata(mes.costo) + '</td><td></td></tr>';
  h += '</tbody></table></div>';

  var porDia = mes.dias ? Math.round(mes.horas / mes.dias) : 0;
  var turnosDia = mes.dias
    ? Math.round((mes.gente.reduce(function (a, g) { return a + g.turnos; }, 0) / mes.dias) * 10) / 10 : 0;

  if (hayValores() && mes.pesoCosto !== null && mes.pesoCosto < 20) {
    h += '<div class="caja aviso" style="margin-top:16px">' + (EN
      ? '<strong>Careful: this cost may be partial.</strong> The report shows <b>' + turnosDia +
        ' people per day</b> on average (' + porDia + ' hours), which gives a cost of <b>' + mes.pesoCosto +
        '%</b> of sales. In hospitality that usually sits between 25% and 35%, so <strong>the report may not ' +
        'include the whole team</strong>. Useful to compare days, not as the real staff cost.'
      : '<strong>Ojo: este costo puede ser parcial.</strong> En el reporte se anotan <b>' + turnosDia +
        ' personas por día</b> en promedio (' + porDia + ' horas), y eso da un costo del <b>' + mes.pesoCosto +
        '%</b> sobre la venta. En gastronomía suele estar entre 25% y 35%, así que <strong>puede que el reporte ' +
        'no tenga a todo el equipo</strong>. Sirve para comparar días, no como costo real de personal.') + '</div>';
  }

  h += '<div class="caja gris" style="margin-top:16px">' + (EN
    ? '<strong>About the calculation.</strong> Hours come from the shifts entered, minus the break when it ' +
      'is noted. Shifts that cross midnight are handled correctly. The cost uses each person\'s own rate ' +
      '(their own, their level\'s or their team\'s) and, if pay rules are set, their loadings.'
    : '<strong>Sobre el cálculo.</strong> Las horas salen de los turnos cargados, descontando el descanso ' +
      'cuando está anotado. Los turnos que cruzan la medianoche se calculan bien. El costo usa el valor de ' +
      'cada persona (el propio, el de su nivel o el de su equipo) y, si hay reglas de pago, sus recargos.') +
    '</div>';

  return h;
}

function inputNota(fecha, valor) {
  return '<input class="filtro" style="width:100%;min-width:130px;height:26px;font-size:11.5px" ' +
    'placeholder="' + (enIngles() ? 'Reason…' : 'Motivo…') + '" value="' + esc(valor) + '" ' +
    'onchange="guardarNotaPersonal(\'' + fecha + '\',this.value)">';
}

function guardarNotaPersonal(fecha, texto) {
  if (!E.notasPersonal) E.notasPersonal = {};
  if (texto.trim()) E.notasPersonal[fecha] = texto.trim();
  else delete E.notasPersonal[fecha];
  anotar('Anotó sobre el personal', fecha + ': ' + texto);
  guardarTodo();
  decir(enIngles() ? 'Note saved' : 'Nota guardada', 'ok');
}
