/* ==========================================================================
   Cálculos: totales del día, acumulado del mes y proyección de cierre.
   Todo lo de acá tiene que poder explicarse en una frase.
   ========================================================================== */

var AREAS_ORDEN = ['Penny Blue', 'Exchange Lane', 'In Room Dining'];
var COLOR_AREA  = { 'Penny Blue':'#1f4e5f', 'Exchange Lane':'#8a5a2b', 'In Room Dining':'#4a6741' };

var E = {
  dias: [],          /* días cargados, ordenados por fecha */
  meta: {},          /* "2026-08" -> monto */
  eventos: {},       /* "2026-08" -> cantidad de días de evento previstos */
  marcados: {},      /* "2026-08-15" -> true si gerencia lo marcó como evento */
  moneda: 'AUD',
  valorHora: 0,
  notasPersonal: {},
  idioma: 'es',
  equipos: [],
  personas: {},
  mail: {},
  historial: [],
  metaArea: {},       /* "2026-08" -> { "Penny Blue": monto, ... } */
  reglasPago: null,   /* multiplicadores, recargos y feriados */
  ui: {}              /* barra achicada, grupos cerrados */
};

/* Lo que NO se borra al vaciar el sistema: es cómo trabaja la persona,
   no datos del hotel. */
var CLAVES_DE_CONFIG = ['reglasPago', 'ui', 'idioma', 'equipos', 'personas', 'mail'];

var CLAVE_G = 'reporte_diario_v2';

/* ------------------------------------------------------------ guardado -- */

function guardarTodo() {
  if (typeof olvidarAreas === 'function') olvidarAreas();
  try {
    /* Se guarda todo lo que tenga E. Antes era una lista escrita a mano y
       cada cosa nueva que se agregaba se perdía al cerrar. */
    var g = {};
    for (var k in E) if (E.hasOwnProperty(k)) g[k] = E[k];
    g.historial = (E.historial || []).slice(0, 200);
    localStorage.setItem(CLAVE_G, JSON.stringify(g));
  } catch (e) {}
}

function cargarTodo() {
  var crudo = null;
  try { crudo = localStorage.getItem(CLAVE_G); } catch (e) {}
  if (crudo) {
    try {
      var d = JSON.parse(crudo);
      for (var k in d) if (E.hasOwnProperty(k)) E[k] = d[k];
      if (E.dias && E.dias.length) return;
    } catch (e) {}
  }
  cargarDatosReales();
}

function cargarDatosReales() {
  E.dias = JSON.parse(JSON.stringify(typeof DATOS_REALES !== 'undefined' ? DATOS_REALES : []));
  E.dias.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  E.meta = {}; E.metaArea = {}; E.eventos = {}; E.marcados = {};
  E.notasPersonal = {}; E.historial = [];
  guardarTodo();
}

function anotar(que, detalle) {
  E.historial.unshift({ cuando:new Date().toISOString(), que:que, detalle:detalle || '' });
  if (E.historial.length > 200) E.historial.length = 200;
}

/* --------------------------------------------------------------- días -- */

function dia(fecha) {
  for (var i = 0; i < E.dias.length; i++) if (E.dias[i].fecha === fecha) return E.dias[i];
  return null;
}

/* Total de un área en un día: se toma la fila "All Day → Total".
   Si no está, se suman los servicios individuales. */
function totalArea(d, area) {
  if (!d || !d.areas || !d.areas[area]) return null;
  var servicios = d.areas[area];
  for (var s in servicios) {
    if (s.toLowerCase().replace(/\s/g, '') === 'allday' && typeof servicios[s].Total === 'number') {
      return servicios[s].Total;
    }
  }
  var suma = 0, hubo = false;
  for (var s2 in servicios) {
    if (s2.toLowerCase().replace(/\s/g, '') === 'allday') continue;
    if (typeof servicios[s2].Total === 'number') { suma += servicios[s2].Total; hubo = true; }
  }
  return hubo ? Math.round(suma * 100) / 100 : null;
}

function totalDia(d) {
  if (!d) return 0;
  var t = 0;
  AREAS_ORDEN.forEach(function (a) { var v = totalArea(d, a); if (v !== null) t += v; });
  return Math.round(t * 100) / 100;
}

function areasDe(d) {
  if (!d || !d.areas) return [];
  return AREAS_ORDEN.filter(function (a) { return d.areas[a] !== undefined; });
}

/* Métrica sumada de un día (cubiertos, comida, bebida, descuentos…) */
function metricaDia(d, metrica) {
  if (!d || !d.areas) return 0;
  var t = 0;
  AREAS_ORDEN.forEach(function (a) {
    var s = d.areas[a]; if (!s) return;
    for (var sv in s) {
      if (sv.toLowerCase().replace(/\s/g, '') !== 'allday') continue;
      if (typeof s[sv][metrica] === 'number') t += s[sv][metrica];
    }
  });
  return Math.round(t * 100) / 100;
}

/* ---------------------------------------------------------------- mes -- */

function mesDe(fecha) { return fecha.slice(0, 7); }

function diasDelMes(mes) {
  return E.dias.filter(function (d) { return mesDe(d.fecha) === mes; })
    .sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
}

function mesesDisponibles() {
  var s = {};
  E.dias.forEach(function (d) { s[mesDe(d.fecha)] = 1; });
  return Object.keys(s).sort();
}

function cantidadDiasMes(mes) {
  var p = mes.split('-');
  return new Date(+p[0], +p[1], 0).getDate();
}

var MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var MESES_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var MESC_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
var MESC_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var DIAS_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
var DIAS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var DIAC_ES = ['dom','lun','mar','mié','jue','vie','sáb'];
var DIAC_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function enIngles() { return (E.idioma || 'es') === 'en'; }

function nombreMes(mes) {
  var p = mes.split('-');
  if (enIngles()) return MESES_EN[+p[1] - 1] + ' ' + p[0];
  return MESES_ES[+p[1] - 1] + ' de ' + p[0];
}

/* Acumulado: suma solo los días que existen. Nunca se rellena. */
function acumulado(mes, hasta) {
  var ds = diasDelMes(mes).filter(function (d) { return !hasta || d.fecha <= hasta; });
  var t = 0;
  ds.forEach(function (d) { t += totalDia(d); });
  return { total: Math.round(t * 100) / 100, dias: ds.length, lista: ds };
}

/* --------------------------------------------------------- proyección -- */

/* Un día es "de evento" si Penny Blue supera el corte, o si lo marcaron a mano.
   El corte es el punto medio entre los dos grupos que se ven en los datos. */
function corteEvento(mes) {
  var ds = diasDelMes(mes);
  var vals = ds.map(function (d) { return totalArea(d, 'Penny Blue'); })
               .filter(function (v) { return v !== null && v > 0; });
  if (vals.length < 4) return 9000;
  vals.sort(function (a, b) { return a - b; });
  /* mayor salto entre valores consecutivos en el tercio central */
  var mejorCorte = vals[Math.floor(vals.length / 2)], mejorSalto = 0;
  for (var i = Math.floor(vals.length * 0.25); i < Math.floor(vals.length * 0.85); i++) {
    var salto = vals[i + 1] - vals[i];
    if (salto > mejorSalto) { mejorSalto = salto; mejorCorte = (vals[i] + vals[i + 1]) / 2; }
  }
  return mejorCorte;
}

function esEvento(d, corte) {
  if (E.marcados[d.fecha] !== undefined) return E.marcados[d.fecha];
  var pb = totalArea(d, 'Penny Blue');
  return pb !== null && pb >= corte;
}

function mediana(a) {
  if (!a.length) return 0;
  var b = a.slice().sort(function (x, y) { return x - y; });
  var m = Math.floor(b.length / 2);
  return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
}
function percentil(a, p) {
  if (!a.length) return 0;
  var b = a.slice().sort(function (x, y) { return x - y; });
  var i = Math.min(b.length - 1, Math.max(0, Math.round((p / 100) * (b.length - 1))));
  return b[i];
}

/*
   Proyección de cierre de mes.

   Se calcula por área, no sobre el total, porque las tres se comportan distinto.
   Penny Blue se separa en días normales y días de evento: promediarlos daría un
   número que no pasa nunca.
*/
function proyectar(mes) {
  var ds = diasDelMes(mes);
  var totalDias = cantidadDiasMes(mes);
  var acum = acumulado(mes);
  var corte = corteEvento(mes);

  if (!ds.length) {
    return { ok:false, motivo:'No hay días cargados en este mes.' };
  }

  var faltan = totalDias - ds.length;

  /* --- referencia histórica: este mes + los 2 anteriores --- */
  var refs = [];
  var todos = E.dias.slice().sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  var idx = todos.map(function (d) { return d.fecha; });
  var mesesPrevios = mesesDisponibles().filter(function (m) { return m <= mes; }).slice(-3);
  todos.forEach(function (d) { if (mesesPrevios.indexOf(mesDe(d.fecha)) !== -1) refs.push(d); });
  if (refs.length < 5) refs = todos.slice(-20);

  var detalle = [];
  var proyBase = 0, proyPiso = 0, proyTecho = 0;

  /* --- áreas estables --- */
  ['Exchange Lane', 'In Room Dining'].forEach(function (area) {
    var vals = refs.map(function (d) { return totalArea(d, area); })
                   .filter(function (v) { return v !== null && v > 0; });
    if (!vals.length) return;
    var med = mediana(vals);
    proyBase  += med * faltan;
    proyPiso  += percentil(vals, 25) * faltan;
    proyTecho += percentil(vals, 75) * faltan;
    detalle.push({ area:area, tipo:'estable', dias:faltan, valor:med,
                   subtotal:med * faltan, n:vals.length });
  });

  /* --- Penny Blue: normales y de evento --- */
  var pbNormal = [], pbEvento = [];
  refs.forEach(function (d) {
    var v = totalArea(d, 'Penny Blue');
    if (v === null || v <= 0) return;
    (esEvento(d, corte) ? pbEvento : pbNormal).push(v);
  });

  var eventosPrevistos = E.eventos[mes];
  var eventosSupuestos = false;
  if (eventosPrevistos === undefined || eventosPrevistos === null || eventosPrevistos === '') {
    var pasados = ds.filter(function (d) { return esEvento(d, corte); }).length;
    var proporcion = ds.length ? pasados / ds.length : 0;
    eventosPrevistos = Math.round(proporcion * faltan);
    eventosSupuestos = true;
  }
  eventosPrevistos = Math.max(0, Math.min(faltan, +eventosPrevistos));
  var normalesFaltan = faltan - eventosPrevistos;

  if (pbNormal.length) {
    var medN = mediana(pbNormal);
    proyBase  += medN * normalesFaltan;
    proyPiso  += percentil(pbNormal, 25) * normalesFaltan;
    proyTecho += percentil(pbNormal, 75) * normalesFaltan;
    detalle.push({ area:'Penny Blue', tipo:'normal', dias:normalesFaltan, valor:medN,
                   subtotal:medN * normalesFaltan, n:pbNormal.length });
  }
  if (pbEvento.length && eventosPrevistos > 0) {
    var medE = mediana(pbEvento);
    proyBase  += medE * eventosPrevistos;
    proyPiso  += percentil(pbEvento, 25) * eventosPrevistos;
    proyTecho += percentil(pbEvento, 75) * eventosPrevistos;
    detalle.push({ area:'Penny Blue', tipo:'evento', dias:eventosPrevistos, valor:medE,
                   subtotal:medE * eventosPrevistos, n:pbEvento.length });
  }

  /* piso y techo mueven además un día de evento */
  if (pbEvento.length && pbNormal.length) {
    var difEvento = mediana(pbEvento) - mediana(pbNormal);
    if (eventosPrevistos > 0) proyPiso  -= difEvento;
    if (normalesFaltan  > 0) proyTecho += difEvento;
  }

  var cierre = acum.total + proyBase;
  var meta = (typeof metaTotal === 'function' ? metaTotal(mes) : (E.meta[mes] || 0)) || null;

  return {
    ok: true, mes: mes,
    acumulado: acum.total, diasCargados: ds.length, diasDelMes: totalDias, faltan: faltan,
    resto: Math.round(proyBase),
    cierre: Math.round(cierre),
    piso:  Math.round(acum.total + proyPiso),
    techo: Math.round(acum.total + proyTecho),
    detalle: detalle,
    corte: Math.round(corte),
    eventosPrevistos: eventosPrevistos,
    eventosSupuestos: eventosSupuestos,
    eventosPasados: ds.filter(function (d) { return esEvento(d, corte); }).length,
    meta: meta,
    diferencia: meta ? Math.round(cierre - meta) : null,
    porDia: faltan > 0 ? Math.round(proyBase / faltan) : 0,
    necesarioPorDia: (meta && faltan > 0) ? Math.round((meta - acum.total) / faltan) : null,
    ritmoActual: ds.length ? Math.round(acum.total / ds.length) : 0
  };
}

/* Compara el total de un día contra los días parecidos anteriores. */
function compararDia(fecha) {
  var d = dia(fecha);
  if (!d) return null;
  var t = totalDia(d);
  var corte = corteEvento(mesDe(fecha));
  var evento = esEvento(d, corte);

  var previos = E.dias.filter(function (x) { return x.fecha < fecha; })
    .sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });

  var anterior = previos[0] || null;

  /* comparables: mismos días de la semana, mismo tipo (evento o no) */
  var dow = new Date(fecha + 'T00:00:00Z').getUTCDay();
  var comparables = previos.filter(function (x) {
    return new Date(x.fecha + 'T00:00:00Z').getUTCDay() === dow &&
           esEvento(x, corte) === evento;
  }).slice(0, 4);
  if (comparables.length < 2) {
    comparables = previos.filter(function (x) { return esEvento(x, corte) === evento; }).slice(0, 4);
  }

  var promComparables = comparables.length
    ? Math.round(comparables.reduce(function (a, x) { return a + totalDia(x); }, 0) / comparables.length)
    : null;

  return {
    total: t, evento: evento,
    anterior: anterior ? { fecha:anterior.fecha, total:totalDia(anterior) } : null,
    variacionAnterior: anterior ? Math.round(t - totalDia(anterior)) : null,
    comparables: comparables.length,
    promComparables: promComparables,
    variacionComparables: promComparables !== null ? Math.round(t - promComparables) : null,
    cubiertos: metricaDia(d, 'Covers'),
    comida: metricaDia(d, 'Food'),
    bebida: metricaDia(d, 'Beverage'),
    descuentos: metricaDia(d, 'Discounts')
  };
}

/* ¿Falta alguna área en este día? */
function areasFaltantes(fecha) {
  var d = dia(fecha);
  if (!d) return [];
  var previos = E.dias.filter(function (x) { return x.fecha < fecha; })
    .sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; }).slice(0, 7);
  var esperadas = {};
  previos.forEach(function (p) { areasDe(p).forEach(function (a) { esperadas[a] = 1; }); });
  var tiene = areasDe(d);
  return Object.keys(esperadas).filter(function (a) { return tiene.indexOf(a) === -1; });
}

/* ------------------------------------------------------------- textos -- */

function plata(n, conSigno) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  var s = Math.abs(Math.round(n)).toLocaleString('es-AR');
  var signo = conSigno ? (n > 0 ? '+' : n < 0 ? '−' : '') : (n < 0 ? '−' : '');
  return signo + ' ' + s;
}
/* El monto con la moneda adelante, para texto corrido.
   plata() deja un espacio reservado para el signo, que en una tabla alinea
   bien pero en una frase se lee como un error de tipeo. */
function AUD(n) {
  var v = plata(n);
  if (v === '—') return v;
  return E.moneda + ' ' + v.replace(/^([+−]?)\s*/, '$1');
}
/* "1 personas" queda mal en una hoja que se le muestra al gerente. */
/* Con centavos. En la pantalla de reglas la diferencia entre 27,08 y 27
   es justamente lo que se está configurando. */
function AUDc(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return E.moneda + ' ' + (n < 0 ? '−' : '') +
    Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function personas(n) {
  if (enIngles()) return n + (n === 1 ? ' person' : ' people');
  return n + (n === 1 ? ' persona' : ' personas');
}
function fechaLegible(f) {
  var d = new Date(f + 'T00:00:00Z');
  if (enIngles()) {
    return DIAS_EN[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' +
           MESES_EN[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }
  return DIAS_ES[d.getUTCDay()] + ' ' + d.getUTCDate() + ' de ' +
         MESES_ES[d.getUTCMonth()] + ' de ' + d.getUTCFullYear();
}
function fechaCorta(f) {
  var d = new Date(f + 'T00:00:00Z');
  return d.getUTCDate() + ' ' + (enIngles() ? MESC_EN : MESC_ES)[d.getUTCMonth()];
}
function diaSemana(f) {
  return (enIngles() ? DIAC_EN : DIAC_ES)[new Date(f + 'T00:00:00Z').getUTCDay()];
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
