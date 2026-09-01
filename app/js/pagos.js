/* ==========================================================================
   Cómo se paga una hora en Australia.

   En hotelería el sueldo no es "horas × valor". La misma hora vale distinto
   según cuándo se trabajó. El convenio del sector (Hospitality Industry
   (General) Award, MA000009) combina dos cosas:

     1. Un MULTIPLICADOR según el día. Y no es el mismo para un empleado
        permanente que para un casual: el casual tiene su propia columna,
        que YA incluye el 25% de casual loading. No se multiplica una cosa
        por la otra — ese es el error que más plata mal liquidada genera
        en el rubro.

                        permanente     casual
          entre semana      ×1,00      ×1,25
          sábado            ×1,25      ×1,50
          domingo           ×1,50      ×1,75
          feriado           ×2,25      ×2,50

     2. Un RECARGO FIJO POR HORA en la noche, que se SUMA al de arriba y
        NO es un porcentaje:

          19:00 a 00:00 (lunes a viernes)   + AUD 2,95 la hora
          00:00 a 07:00 (lunes a viernes)   + AUD 4,42 la hora

   Los dos se aplican juntos: un sábado a las 22:00 se cobra el valor base
   por 1,25 más el recargo nocturno de esa franja.

   Los valores cargados son los del período que arranca el 1 de julio de
   2026 (Fair Work los revisa cada julio). Están para cambiar desde la
   pantalla "Reglas de pago": si el hotel liquida distinto, o el convenio
   se actualiza, se corrigen ahí y todo el sistema recalcula.

   ⚠️ Antes de usar esto para liquidar, hay que confirmarlo contra un
   recibo de sueldo real. El nivel de cada persona (Level 1 a 6) cambia el
   valor hora, y eso el sistema no lo puede adivinar.
   ========================================================================== */

var REGLAS_BASE = {
  /* multiplicador del día, para empleado permanente */
  dias: {
    semana:  1.00,
    sabado:  1.25,
    domingo: 1.50,
    feriado: 2.25
  },
  /* la columna del casual: ya trae adentro el 25% de casual loading */
  diasCasual: {
    semana:  1.25,
    sabado:  1.50,
    domingo: 1.75,
    feriado: 2.50
  },
  /* recargo fijo por hora, se suma al multiplicador */
  nocturno: [
    { id:'tarde', nombre:'19:00 a 00:00', desde:19*60, hasta:24*60, valor:2.95 },
    { id:'noche', nombre:'00:00 a 07:00', desde:0,     hasta:7*60,  valor:4.42 },
  ],
  /* quiénes están contratados como casual (por nombre) */
  casuales: [],
  /* si el descanso se paga o se descuenta */
  descansoPago: false,
  feriados: []      /* fechas 'YYYY-MM-DD' */
};

function reglas() {
  if (!E.reglasPago) E.reglasPago = JSON.parse(JSON.stringify(REGLAS_BASE));
  /* por si viene de una versión anterior */
  var r = E.reglasPago;
  if (!r.dias) r.dias = JSON.parse(JSON.stringify(REGLAS_BASE.dias));
  if (!r.nocturno) r.nocturno = JSON.parse(JSON.stringify(REGLAS_BASE.nocturno));
  if (!r.feriados) r.feriados = [];
  if (!r.diasCasual) r.diasCasual = JSON.parse(JSON.stringify(REGLAS_BASE.diasCasual));
  if (!r.casuales) r.casuales = [];
  return r;
}

function tipoDeDia(fecha) {
  var r = reglas();
  if (r.feriados.indexOf(fecha) !== -1) return 'feriado';
  var d = new Date(fecha + 'T00:00:00Z').getUTCDay();
  if (d === 6) return 'sabado';
  if (d === 0) return 'domingo';
  return 'semana';
}
function nombreTipoDia(t) {
  var es = { semana:'Entre semana', sabado:'Sábado', domingo:'Domingo', feriado:'Feriado' };
  var en = { semana:'Weekday', sabado:'Saturday', domingo:'Sunday', feriado:'Public holiday' };
  return (typeof enIngles === 'function' && enIngles()) ? en[t] : es[t];
}

/* ¿Cuánto recargo nocturno corresponde a este minuto del día? */
function recargoNocturnoEn(minuto) {
  var m = ((minuto % 1440) + 1440) % 1440;
  var r = reglas();
  for (var i = 0; i < r.nocturno.length; i++) {
    var b = r.nocturno[i];
    if (m >= b.desde && m < b.hasta) return b.valor || 0;
  }
  return 0;
}

/*
   Calcula lo que se paga por un turno, minuto a minuto.

   Un turno de 17:00 a 01:00 de un sábado no es "8 horas de sábado": las
   primeras dos son sábado sin recargo, después entra el recargo de la tarde,
   y pasada la medianoche el día cambia a domingo con otro multiplicador.
   Por eso se recorre por tramos y no se aplica una sola tarifa.
*/
function calcularPagoTurno(t, fecha, valorHora) {
  var r = reglas();
  var vh = (typeof valorHora === 'number') ? valorHora : valorHoraDe(t.quien).valor;

  var esCasual = esContratoCasual(t.quien);

  var desde = t.desde || 0;
  var hasta = t.hasta || 0;
  if (hasta <= desde) hasta += 1440;
  var span = hasta - desde;                       /* minutos de punta a punta */
  if (span <= 0 || !vh) {
    return { horas: t.horas || 0, base: 0, recargoDia: 0, recargoNoche: 0,
             recargoCasual: 0, total: 0, tramos: [], valorHora: vh };
  }

  var descanso = r.descansoPago ? 0 : (t.descanso || 0);
  var pagados = Math.max(0, span - descanso);
  /* el descanso se reparte proporcionalmente entre los tramos */
  var factor = span ? pagados / span : 0;

  var tipoHoy = tipoDeDia(fecha);
  var f2 = new Date(fecha + 'T00:00:00Z');
  f2.setUTCDate(f2.getUTCDate() + 1);
  var tipoManana = tipoDeDia(f2.toISOString().slice(0, 10));

  /* se agrupa por (tipo de día + recargo nocturno) para no listar 480 minutos */
  var acc = {};
  for (var m = desde; m < hasta; m++) {
    var tipo = (m >= 1440) ? tipoManana : tipoHoy;
    var rec = recargoNocturnoEn(m);
    var k = tipo + '|' + rec;
    acc[k] = acc[k] || { tipo: tipo, recargo: rec, minutos: 0, desde: m, hasta: m };
    acc[k].minutos++;
    if (m < acc[k].desde) acc[k].desde = m;
    if (m + 1 > acc[k].hasta) acc[k].hasta = m + 1;
  }

  var base = 0, recDia = 0, recNoche = 0;
  var tramos = [];
  Object.keys(acc).forEach(function (k) {
    var a = acc[k];
    var horas = (a.minutos / 60) * factor;
    var mult = (esCasual ? r.diasCasual[a.tipo] : r.dias[a.tipo]) || 1;
    var b = horas * vh;
    var rd = horas * vh * (mult - 1);
    var rn = horas * (a.recargo || 0);
    base += b; recDia += rd; recNoche += rn;
    tramos.push({
      tipo: a.tipo, multiplicador: mult, recargoHora: a.recargo || 0,
      horas: Math.round(horas * 100) / 100,
      desde: a.desde, hasta: a.hasta,
      importe: Math.round((b + rd + rn) * 100) / 100
    });
  });
  tramos.sort(function (a, b) { return a.desde - b.desde; });

  var subtotal = base + recDia + recNoche;
  /* el casual ya está adentro del multiplicador; se informa aparte sólo
     para poder mostrar cuánto de la cuenta viene de ahí */
  var recCasual = 0;
  if (esCasual) {
    var sinCasual = 0;
    tramos.forEach(function (x) {
      sinCasual += x.horas * (vh * (r.dias[x.tipo] || 1) + (x.recargoHora || 0));
    });
    recCasual = subtotal - sinCasual;
  }

  return {
    horas: Math.round((pagados / 60) * 100) / 100,
    base: Math.round(base * 100) / 100,
    recargoDia: Math.round(recDia * 100) / 100,
    recargoNoche: Math.round(recNoche * 100) / 100,
    recargoCasual: Math.round(recCasual * 100) / 100,
    total: Math.round(subtotal * 100) / 100,
    casual: esCasual,
    tramos: tramos,
    valorHora: vh,
    tipoDia: tipoHoy
  };
}

/* ¿Hay alguna regla cargada, o todo está en cero? */
function esContratoCasual(quien) {
  if (!quien) return false;
  var c = reglas().casuales || [];
  var q = String(quien).trim().toLowerCase();
  return c.some(function (x) { return String(x).trim().toLowerCase() === q; });
}

function marcarCasual(quien, si) {
  var r = reglas();
  var q = String(quien).trim();
  var i = r.casuales.map(function (x) { return String(x).toLowerCase(); })
                    .indexOf(q.toLowerCase());
  if (si && i === -1) r.casuales.push(q);
  if (!si && i !== -1) r.casuales.splice(i, 1);
  anotar(si ? 'Marcó como casual' : 'Marcó como permanente', q);
  guardarTodo(); pintar();
}

function hayRecargos() {
  var r = reglas();
  if ((r.casuales || []).length) return true;
  if (r.nocturno.some(function (b) { return (b.valor || 0) > 0; })) return true;
  for (var k in r.dias) if (r.dias[k] !== 1) return true;
  return false;
}

/* Costo de un día con las reglas aplicadas. */
function costoDiaConReglas(d, area) {
  return Math.round((d.turnos || []).filter(function (t) {
    return !area || !t.area || t.area === area;
  }).reduce(function (a, t) {
    return a + calcularPagoTurno(t, d.fecha).total;
  }, 0));
}

/* Desglose del mes: cuánto es base y cuánto son recargos. */
function desgloseMes(mes) {
  var ds = diasDelMes(mes);
  var out = { horas:0, base:0, recargoDia:0, recargoNoche:0, recargoCasual:0, total:0,
              porTipo:{}, personas:{} };
  ds.forEach(function (d) {
    (d.turnos || []).forEach(function (t) {
      var p = calcularPagoTurno(t, d.fecha);
      out.horas += p.horas; out.base += p.base;
      out.recargoDia += p.recargoDia; out.recargoNoche += p.recargoNoche;
      out.recargoCasual += p.recargoCasual; out.total += p.total;
      p.tramos.forEach(function (tr) {
        var x = out.porTipo[tr.tipo] = out.porTipo[tr.tipo] || { horas:0, importe:0 };
        x.horas += tr.horas; x.importe += tr.importe;
      });
      if (t.quien) {
        var q = out.personas[t.quien] = out.personas[t.quien] ||
          { quien:t.quien, horas:0, total:0, turnos:0, areas:{} };
        q.horas += p.horas; q.total += p.total; q.turnos++;
        if (t.area) q.areas[t.area] = (q.areas[t.area] || 0) + p.horas;
      }
    });
  });
  ['horas','base','recargoDia','recargoNoche','recargoCasual','total'].forEach(function (k) {
    out[k] = Math.round(out[k] * 100) / 100;
  });
  return out;
}

/* --------------------------------------------------- edición de reglas -- */

function setMultDia(tipo, v) {
  reglas().dias[tipo] = parseFloat(v) || 1;
  anotar('Cambió el multiplicador del día', nombreTipoDia(tipo) + ': ' + String(v));
  guardarTodo(); pintar();
}
function setRecargoNoche(id, v) {
  var b = reglas().nocturno.filter(function (x) { return x.id === id; })[0];
  if (b) { b.valor = parseFloat(v) || 0; anotar('Cambió el recargo nocturno', b.nombre + ': ' + v); }
  guardarTodo(); pintar();
}
function setHoraBanda(id, cual, valor) {
  var b = reglas().nocturno.filter(function (x) { return x.id === id; })[0];
  if (!b) return;
  var p = String(valor).split(':');
  if (p.length < 2) return;
  var min = (+p[0]) * 60 + (+p[1]);
  b[cual] = (cual === 'hasta' && min === 0) ? 1440 : min;
  b.nombre = horaTexto(b.desde) + ' a ' + horaTexto(b.hasta === 1440 ? 0 : b.hasta);
  guardarTodo(); pintar();
}
function setMultDiaCasual(tipo, v) {
  var r = reglas();
  r.diasCasual[tipo] = parseFloat(String(v).replace(',', '.')) || 1;
  anotar('Cambió el multiplicador del día (casual)', nombreTipoDia(tipo) + ': ' + String(v));
  guardarTodo(); pintar();
}
function setDescansoPago(v) {
  reglas().descansoPago = !!v;
  guardarTodo(); pintar();
}
function agregarFeriado(f) {
  if (!f) return;
  var r = reglas();
  if (r.feriados.indexOf(f) === -1) r.feriados.push(f);
  r.feriados.sort();
  anotar('Agregó un feriado', f);
  guardarTodo(); pintar();
}
function quitarFeriado(f) {
  var r = reglas();
  r.feriados = r.feriados.filter(function (x) { return x !== f; });
  guardarTodo(); pintar();
}
function restaurarReglas() {
  if (!confirm(T('¿Volver a los valores de arranque?'))) return;
  E.reglasPago = JSON.parse(JSON.stringify(REGLAS_BASE));
  guardarTodo(); pintar();
  decir(T('Reglas restauradas'), 'ok');
}
