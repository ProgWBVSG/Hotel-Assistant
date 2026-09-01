/* ==========================================================================
   Acumulado día a día · objetivo diario · horarios · personal
   ========================================================================== */

/* ---------------------------------------------- ACUMULADO DÍA A DÍA ----- */

/* Para cada día cargado del mes: cuánto entró ese día y cuánto venía de antes.
   Es lo que pidió la gerente: "si es el día 3, lo que juntó el 1 y el 2". */
function serieAcumulada(mes) {
  var ds = diasDelMes(mes);
  var run = 0;
  return ds.map(function (d, i) {
    var t = totalDia(d);
    var antes = run;
    run += t;
    return {
      fecha: d.fecha, dia: +d.fecha.slice(8), total: t,
      antesDeHoy: Math.round(antes * 100) / 100,
      acumulado: Math.round(run * 100) / 100,
      nDia: i + 1
    };
  });
}

/* ------------------------------------ OBJETIVO DIARIO Y SEMÁFORO -------- */

/*
   El objetivo de un día sale, en este orden:
     1. La meta del mes, repartida según cómo rinde cada tipo de día.
     2. Si no hay meta, la mediana de los días ya cargados del mismo tipo.

   Los días de evento tienen objetivo propio: compararlos contra un día
   normal no dice nada.
*/
function objetivoDiario(mes, esDeEvento) {
  var meta = (typeof metaTotal === 'function') ? metaTotal(mes) : E.meta[mes];
  var corte = corteEvento(mes);
  var ds = diasDelMes(mes);

  var normales = [], eventos = [];
  ds.forEach(function (d) {
    var t = totalDia(d);
    if (t <= 0) return;
    (esEvento(d, corte) ? eventos : normales).push(t);
  });

  var medN = normales.length ? mediana(normales) : 0;
  var medE = eventos.length ? mediana(eventos) : medN;

  if (meta) {
    var totalDiasMes = cantidadDiasMes(mes);
    var propEventos = ds.length ? eventos.length / ds.length : 0;
    var diasEvento = Math.round(propEventos * totalDiasMes);
    var diasNormal = totalDiasMes - diasEvento;
    var estimado = medN * diasNormal + medE * diasEvento;
    var factor = estimado > 0 ? meta / estimado : 1;
    return Math.round((esDeEvento ? medE : medN) * factor);
  }

  if (esDeEvento && eventos.length) return Math.round(medE);
  if (normales.length) return Math.round(medN);
  return 0;
}

/*
   Semáforo del calendario.

     verde    = llegó al objetivo, dentro de lo esperable
     rojo     = no llegó
     amarillo = se pasó bastante

   Lo de amarillo es a propósito. Pasarse parece bueno, pero si ese número se
   toma como referencia se termina planificando con algo que el negocio no
   repite. Amarillo quiere decir "esto no es tu piso, fijate por qué pasó".
*/
function semaforoDia(d, mes) {
  var m = mes || mesDe(d.fecha);
  var t = totalDia(d);
  if (!t) return { color:'sin', texto:'Sin movimiento', obj:0, dif:0, pct:0 };

  var corte = corteEvento(m);
  var ev = esEvento(d, corte);
  var obj = objetivoDiario(m, ev);
  if (!obj) return { color:'sin', texto:'Sin referencia', obj:0, dif:0, pct:0 };

  var pct = Math.round((t / obj) * 100);
  var dif = Math.round(t - obj);

  var EN = enIngles();
  if (pct >= 120) return { color:'amarillo', obj:obj, dif:dif, pct:pct, evento:ev,
    texto: EN ? 'Well above' : 'Muy por encima' };
  if (pct >= 95)  return { color:'verde', obj:obj, dif:dif, pct:pct, evento:ev,
    texto: EN ? 'On target' : 'En objetivo' };
  return { color:'rojo', obj:obj, dif:dif, pct:pct, evento:ev,
    texto: EN ? 'Below target' : 'Abajo del objetivo' };
}

/* ------------------------------------------------------- HORARIOS ------ */

/* Los ingresos vienen por servicio, no por hora. Estas son las franjas que se
   usan para poder cruzarlos con los turnos del personal. */
var FRANJAS_BASE = [
  { id:'Breakfast', es:'Desayuno',  en:'Breakfast', desde:6*60,  hasta:11*60 },
  { id:'Lunch',     es:'Almuerzo',  en:'Lunch',     desde:12*60, hasta:15*60 },
  { id:'Dinner',    es:'Cena',      en:'Dinner',    desde:17*60, hasta:23*60 },
  { id:'Overnight', es:'Madrugada', en:'Overnight', desde:23*60, hasta:30*60 }
];

/* El nombre de la franja se arma segun el idioma: es un dato que se muestra,
   no un texto fijo de la pantalla. */
Object.defineProperty(window, 'FRANJAS', {
  get: function () {
    var en = (typeof enIngles === 'function') && enIngles();
    return FRANJAS_BASE.map(function (f) {
      return { id:f.id, nombre: en ? f.en : f.es, desde:f.desde, hasta:f.hasta };
    });
  }
});

function horaTexto(min) {
  var h = Math.floor((min % (24 * 60)) / 60), m = min % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

/* Ingresos de un área abiertos por servicio. */
function porServicio(d, area) {
  if (!d || !d.areas || !d.areas[area]) return [];
  var sv = d.areas[area];
  var out = [];
  FRANJAS.forEach(function (f) {
    var m = null;
    for (var k in sv) {
      if (String(k).toLowerCase().replace(/\s/g, '') === f.id.toLowerCase()) m = sv[k];
    }
    if (!m) return;
    var total = m.Total;
    if (typeof total !== 'number') {
      total = (m.Food || 0) + (m.Beverage || 0) +
              (m['Delivery Charge'] || 0) + (m['Misc/Banquets'] || 0);
    }
    out.push({
      franja: f, total: Math.round(total * 100) / 100,
      cubiertos: m.Covers || 0, comida: m.Food || 0, bebida: m.Beverage || 0,
      ticket: m['AV Check'] || (m.Covers ? total / m.Covers : 0)
    });
  });
  return out;
}

/* Cuánta gente hay trabajando en cada hora del día. */
function coberturaPorHora(d, area) {
  var horas = [];
  for (var h = 0; h < 24; h++) horas.push({ hora:h, gente:0, nombres:[] });
  (d.turnos || []).forEach(function (t) {
    if (area && t.area && t.area !== area) return;
    for (var min = t.desde; min < t.hasta; min += 60) {
      var h2 = Math.floor((min % (24 * 60)) / 60);
      if (horas[h2].nombres.indexOf(t.quien) === -1) {
        horas[h2].gente++;
        horas[h2].nombres.push(t.quien);
      }
    }
  });
  return horas;
}

function horasTrabajadas(d, area) {
  return Math.round((d.turnos || []).filter(function (t) {
    return !area || !t.area || t.area === area;
  }).reduce(function (a, t) { return a + t.horas; }, 0) * 100) / 100;
}

function costoPersonal(d, area) {
  /* con recargos cargados se usa el cálculo del convenio (noche, fin de
     semana, feriado); si no, el valor por persona; si no, el general */
  if (typeof costoDiaConReglas === 'function' && typeof hayRecargos === 'function' &&
      typeof hayValores === 'function' && hayValores() && hayRecargos()) {
    return costoDiaConReglas(d, area);
  }
  if (typeof costoPersonalReal === 'function' && typeof hayValores === 'function' && hayValores()) {
    return costoPersonalReal(d, area);
  }
  return Math.round(horasTrabajadas(d, area) * (E.valorHora || 0));
}

/*
   Análisis del mes por franja, para un área.

   Cruza tres cosas: cuánta plata entra, cuántas horas de personal se pagan, y
   cuánto rinde cada hora. Ese último número es el que sirve para decidir.
*/
function analisisHorario(mes, area) {
  var ds = diasDelMes(mes).filter(function (d) { return totalDia(d) > 0; });
  if (!ds.length) return null;

  var acc = {};
  FRANJAS.forEach(function (f) {
    acc[f.id] = { franja:f, total:0, cubiertos:0, dias:0, valores:[], horas:0 };
  });

  ds.forEach(function (d) {
    porServicio(d, area).forEach(function (s) {
      var a = acc[s.franja.id];
      a.total += s.total; a.cubiertos += s.cubiertos;
      a.dias++; a.valores.push(s.total);
    });
    (d.turnos || []).forEach(function (t) {
      if (area && t.area && t.area !== area) return;
      FRANJAS.forEach(function (f) {
        var ini = Math.max(t.desde, f.desde);
        var fin = Math.min(t.hasta, f.hasta);
        if (fin > ini) acc[f.id].horas += (fin - ini) / 60;
      });
    });
  });

  var lista = FRANJAS.map(function (f) {
    var a = acc[f.id];
    if (!a.dias) return null;
    var costo = Math.round(a.horas * (E.valorHora || 0));
    return {
      franja: f,
      total: Math.round(a.total),
      promedioDia: Math.round(a.total / a.dias),
      mediana: Math.round(mediana(a.valores)),
      cubiertos: a.cubiertos,
      ticket: a.cubiertos ? Math.round((a.total / a.cubiertos) * 100) / 100 : 0,
      dias: a.dias,
      horas: Math.round(a.horas),
      costo: costo,
      porHora: a.horas >= 1 ? Math.round(a.total / a.horas) : null,
      pesoCosto: a.total ? Math.round((costo / a.total) * 100) : null
    };
  }).filter(Boolean);

  var totalMes = lista.reduce(function (a, x) { return a + x.total; }, 0);
  lista.forEach(function (x) { x.peso = totalMes ? Math.round((x.total / totalMes) * 100) : 0; });

  var conRend = lista.filter(function (x) { return x.porHora !== null && x.horas >= 3; })
    .sort(function (a, b) { return b.porHora - a.porHora; });

  return {
    area: area, mes: mes, dias: ds.length, lista: lista, total: totalMes,
    mejor: conRend[0] || null,
    peor: conRend.length > 1 ? conRend[conRend.length - 1] : null
  };
}

/* ------------------------------------------------------- PERSONAL ------ */

/*
   Dotación de un día.

   Compara las horas trabajadas contra lo habitual en días parecidos, y el
   rendimiento por hora contra lo habitual. No decide nada solo: marca la
   diferencia y deja que la gerente ponga el motivo.
*/
function analisisPersonal(d, mes) {
  var horas = horasTrabajadas(d);
  var total = totalDia(d);
  if (!horas) return { sinDatos:true, nota:(E.notasPersonal || {})[d.fecha] || '' };

  var costo = costoPersonal(d);
  var corte = corteEvento(mes || mesDe(d.fecha));
  var ev = esEvento(d, corte);

  var refs = E.dias.filter(function (x) {
    return x.fecha !== d.fecha && (x.turnos || []).length &&
           totalDia(x) > 0 && esEvento(x, corte) === ev;
  }).slice(-25);

  var horasRef = refs.map(function (x) { return horasTrabajadas(x); })
    .filter(function (v) { return v > 0; });
  var rendRef = refs.map(function (x) {
    var h = horasTrabajadas(x);
    return h ? totalDia(x) / h : 0;
  }).filter(function (v) { return v > 0; });

  var horasEsp = horasRef.length ? mediana(horasRef) : null;
  var rendEsp = rendRef.length ? mediana(rendRef) : null;
  var rendHoy = total / horas;

  var estado = 'normal', mensaje = '';
  var EN = (typeof enIngles === 'function') && enIngles();

  if (horasEsp && rendEsp && refs.length >= 3) {
    var dH = ((horas - horasEsp) / horasEsp) * 100;
    var dR = ((rendHoy - rendEsp) / rendEsp) * 100;
    var hs = Math.round(horas);

    if (dH > 15 && dR < -15) {
      estado = 'sobra';
      mensaje = EN
        ? hs + ' hours were paid, ' + Math.round(dH) + '% more than on similar days, and each hour ' +
          'returned ' + Math.abs(Math.round(dR)) + '% less. There may have been more people than needed.'
        : 'Se pagaron ' + hs + ' horas, un ' + Math.round(dH) + '% más que en días parecidos, y cada ' +
          'hora rindió un ' + Math.abs(Math.round(dR)) + '% menos. Puede haber habido más gente de la necesaria.';
    } else if (dH < -15 && dR > 15) {
      estado = 'falta';
      mensaje = EN
        ? hs + ' hours were paid, ' + Math.abs(Math.round(dH)) + '% fewer than on similar days, and ' +
          'each hour returned ' + Math.round(dR) + '% more. The team may have been short.'
        : 'Se pagaron ' + hs + ' horas, un ' + Math.abs(Math.round(dH)) + '% menos que en días ' +
          'parecidos, y cada hora rindió un ' + Math.round(dR) + '% más. El equipo pudo haber quedado corto.';
    } else if (dH > 25) {
      estado = 'sobra';
      mensaje = EN
        ? 'Considerably more hours than usual (' + Math.round(dH) + '% more), although revenue per hour held up.'
        : 'Bastantes más horas que lo habitual (' + Math.round(dH) + '% más), aunque el rendimiento por hora se sostuvo.';
    } else if (dH < -25) {
      estado = 'falta';
      mensaje = EN
        ? 'Considerably fewer hours than usual (' + Math.abs(Math.round(dH)) + '% less).'
        : 'Bastantes menos horas que lo habitual (' + Math.abs(Math.round(dH)) + '% menos).';
    } else {
      mensaje = EN ? 'Staffing was in line with similar days.'
                   : 'La dotación estuvo en línea con días parecidos.';
    }
  } else {
    mensaje = EN ? 'Not enough days with shifts entered to compare yet.'
                 : 'Todavía no hay suficientes días con turnos cargados para comparar.';
  }

  return {
    horas: horas, costo: costo, total: total,
    personas: (d.turnos || []).length,
    rendHora: Math.round(rendHoy),
    horasEsperadas: horasEsp ? Math.round(horasEsp) : null,
    rendEsperado: rendEsp ? Math.round(rendEsp) : null,
    pesoCosto: total ? Math.round((costo / total) * 100) : null,
    estado: estado, mensaje: mensaje, evento: ev,
    nota: (E.notasPersonal || {})[d.fecha] || ''
  };
}

/* Resumen de personal de todo el mes. */
function personalDelMes(mes) {
  var ds = diasDelMes(mes).filter(function (d) { return (d.turnos || []).length; });
  if (!ds.length) return null;

  var horas = 0, costo = 0, total = 0;
  var gente = {};
  ds.forEach(function (d) {
    horas += horasTrabajadas(d);
    costo += costoPersonal(d);
    total += totalDia(d);
    (d.turnos || []).forEach(function (t) {
      var g = gente[t.quien] = gente[t.quien] || { quien:t.quien, turnos:0, horas:0 };
      g.turnos++; g.horas += t.horas;
    });
  });

  var lista = Object.keys(gente).map(function (k) { return gente[k]; });
  lista.forEach(function (g) {
    g.horas = Math.round(g.horas * 10) / 10;
    g.costo = Math.round(g.horas * (E.valorHora || 0));
  });
  lista.sort(function (a, b) { return b.horas - a.horas; });

  return {
    dias: ds.length, horas: Math.round(horas), costo: Math.round(costo),
    total: Math.round(total),
    pesoCosto: total ? Math.round((costo / total) * 100) : null,
    rendHora: horas ? Math.round(total / horas) : 0,
    gente: lista
  };
}
