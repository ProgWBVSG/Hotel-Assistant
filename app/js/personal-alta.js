/* ==========================================================================
   El plantel: quién trabaja hoy, quién ya no, y cuánto cobra cada uno.

   Hasta ahora las personas no existían por sí solas: salían de los turnos
   cargados. El que trabajó una vez en marzo quedaba en la lista para
   siempre, y no había forma de sacarlo ni de dar de alta a alguien antes de
   su primer turno.

   Ahora hay un registro propio. Cada persona tiene:
     - un estado: trabaja / ya no trabaja
     - un plazo, opcional: desde cuándo y hasta cuándo (las pasantías tienen
       fecha de fin, y cuando llega, la persona sale sola de la lista)
     - un nivel dentro de su equipo, porque un cocinero nivel 1 y uno nivel 2
       no cobran lo mismo aunque estén en el mismo equipo

   El valor de la hora se decide en este orden, del más específico al más
   general:
     1. valor propio de la persona
     2. valor del nivel que tiene dentro de su equipo
     3. valor del equipo
     4. valor general
   ========================================================================== */

function fichaDe(nombre) {
  if (!E.personas) E.personas = {};
  if (!E.personas[nombre]) {
    E.personas[nombre] = { equipo:null, nivel:null, valorHora:null,
                           desde:null, hasta:null, baja:false, nota:'' };
  }
  var f = E.personas[nombre];
  if (f.baja === undefined) f.baja = false;
  if (f.nivel === undefined) f.nivel = null;
  return f;
}

/* ------------------------------------------------------------ vigencia -- */

/* Está trabajando hoy? Tres motivos para que no: se le dio de baja a mano,
   todavía no empezó, o se le venció el plazo. */
function estadoPersona(nombre, hoy) {
  var f = (E.personas || {})[nombre] || {};
  var d = hoy || new Date().toISOString().slice(0, 10);

  if (f.baja) return { activa:false, motivo:'baja' };
  if (f.desde && d < f.desde) return { activa:false, motivo:'todavia-no', fecha:f.desde };
  if (f.hasta && d > f.hasta) return { activa:false, motivo:'vencio', fecha:f.hasta };
  if (f.hasta) {
    var faltan = Math.round((Date.parse(f.hasta) - Date.parse(d)) / 86400000);
    if (faltan <= 14) return { activa:true, motivo:'por-vencer', dias:faltan, fecha:f.hasta };
    return { activa:true, motivo:'con-plazo', dias:faltan, fecha:f.hasta };
  }
  return { activa:true, motivo:'sin-plazo' };
}

function textoEstado(est) {
  var EN = enIngles();
  switch (est.motivo) {
    case 'baja':       return EN ? 'No longer working' : 'Ya no trabaja';
    case 'todavia-no': return (EN ? 'Starts ' : 'Empieza el ') + fechaCorta(est.fecha);
    case 'vencio':     return (EN ? 'Ended ' : 'Terminó el ') + fechaCorta(est.fecha);
    case 'por-vencer': return est.dias <= 0
                          ? (EN ? 'Last day today' : 'Último día hoy')
                          : (EN ? est.dias + ' days left' : 'Le quedan ' + est.dias + ' días');
    case 'con-plazo':  return (EN ? 'Until ' : 'Hasta el ') + fechaCorta(est.fecha);
    default:           return EN ? 'Working' : 'Trabaja';
  }
}

/* -------------------------------------------------------------- niveles -- */

/* Los niveles viven dentro del equipo: "Cocina · nivel 2". Un nivel sin
   valor propio cae al valor del equipo. */
function nivelesDe(idEquipo) {
  var eq = equipoPorId(idEquipo);
  if (!eq) return [];
  if (!eq.niveles) eq.niveles = [];
  return eq.niveles;
}
function nivelPorId(idEquipo, idNivel) {
  var ns = nivelesDe(idEquipo);
  for (var i = 0; i < ns.length; i++) if (ns[i].id === idNivel) return ns[i];
  return null;
}
function agregarNivel(idEquipo) {
  var eq = equipoPorId(idEquipo);
  if (!eq) return;
  var n = prompt(T('¿Cómo se llama el nivel? Por ejemplo: Nivel 2'));
  if (!n || !n.trim()) return;
  nivelesDe(idEquipo).push({ id:'n' + Date.now().toString(36), nombre:n.trim(), valorHora:0 });
  anotar('Agregó un nivel', eq.nombre + ' · ' + n.trim());
  guardarTodo(); pintar();
}
function setValorNivel(idEquipo, idNivel, v) {
  var n = nivelPorId(idEquipo, idNivel);
  if (!n) return;
  n.valorHora = parseFloat(String(v).replace(',', '.')) || 0;
  guardarTodo(); pintar();
}
function setNombreNivel(idEquipo, idNivel, v) {
  var n = nivelPorId(idEquipo, idNivel);
  if (n && String(v).trim()) n.nombre = String(v).trim().slice(0, 30);
  guardarTodo(); pintar();
}
function borrarNivel(idEquipo, idNivel) {
  var eq = equipoPorId(idEquipo);
  if (!eq) return;
  var usan = Object.keys(E.personas || {}).filter(function (q) {
    return E.personas[q].equipo === idEquipo && E.personas[q].nivel === idNivel;
  });
  if (usan.length && !confirm(T('Hay {} personas en este nivel. Van a quedar con el valor del equipo. ¿Seguir?')
      .replace('{}', usan.length))) return;
  usan.forEach(function (q) { E.personas[q].nivel = null; });
  eq.niveles = nivelesDe(idEquipo).filter(function (x) { return x.id !== idNivel; });
  guardarTodo(); pintar();
}

/* ----------------------------------------------------- alta y baja ------ */

function altaPersona(nombre, opciones) {
  var q = String(nombre || '').trim();
  if (!q) return false;
  var f = fichaDe(q);
  var o = opciones || {};
  if (o.equipo !== undefined) f.equipo = o.equipo || null;
  if (o.nivel !== undefined) f.nivel = o.nivel || null;
  if (o.desde !== undefined) f.desde = o.desde || null;
  if (o.hasta !== undefined) f.hasta = o.hasta || null;
  if (o.valorHora !== undefined) {
    var n = parseFloat(String(o.valorHora).replace(',', '.'));
    f.valorHora = (isNaN(n) || n <= 0) ? null : n;
  }
  f.baja = false;
  anotar('Dio de alta a alguien', q);
  guardarTodo();
  return true;
}

function darDeBaja(nombre) {
  var f = fichaDe(nombre);
  f.baja = true;
  anotar('Dio de baja a alguien', nombre);
  guardarTodo(); pintar();
}
function reactivar(nombre) {
  var f = fichaDe(nombre);
  f.baja = false;
  if (f.hasta && f.hasta < new Date().toISOString().slice(0, 10)) f.hasta = null;
  anotar('Volvió a activar a alguien', nombre);
  guardarTodo(); pintar();
}

/* Borrar de verdad. Solo se puede si nunca trabajó: si tiene turnos
   cargados, borrarla dejaría el costo de esos días sin explicación. */
function tieneTurnos(nombre) {
  return E.dias.some(function (d) {
    return (d.turnos || []).some(function (t) { return t.quien === nombre; });
  });
}
function borrarPersona(nombre) {
  if (tieneTurnos(nombre)) {
    decir(T('Tiene turnos cargados, así que no se puede borrar. Se le puede dar de baja.'), 'mal');
    return;
  }
  if (!confirm(T('¿Borrar a {} de la lista?').replace('{}', nombre))) return;
  delete E.personas[nombre];
  anotar('Borró a alguien de la lista', nombre);
  guardarTodo(); pintar();
}

function setPlazo(nombre, cual, valor) {
  var f = fichaDe(nombre);
  f[cual] = valor || null;
  guardarTodo(); pintar();
}
function setNivelPersona(nombre, id) {
  fichaDe(nombre).nivel = id || null;
  guardarTodo(); pintar();
}

/* ------------------------------------------------------- el plantel ----- */

/*
   Todo el plantel: los que están dados de alta a mano más los que aparecen
   en algún turno. Cada uno con sus horas, su costo y su estado.
*/
function plantel() {
  var m = {};

  /* los que alguna vez trabajaron */
  E.dias.forEach(function (d) {
    (d.turnos || []).forEach(function (t) {
      if (!t.quien) return;
      var g = m[t.quien] = m[t.quien] || { quien:t.quien, turnos:0, horas:0, ultimo:null };
      g.turnos++; g.horas += t.horas || 0;
      if (!g.ultimo || d.fecha > g.ultimo) g.ultimo = d.fecha;
    });
  });

  /* los dados de alta que todavía no trabajaron */
  Object.keys(E.personas || {}).forEach(function (q) {
    if (!m[q]) m[q] = { quien:q, turnos:0, horas:0, ultimo:null };
  });

  return Object.keys(m).map(function (k) {
    var g = m[k];
    var f = (E.personas || {})[k] || {};
    g.horas = Math.round(g.horas * 10) / 10;
    var v = valorHoraDe(g.quien);
    g.valor = v.valor; g.origen = v.origen; g.detalle = v.detalle;
    g.costo = Math.round(g.horas * v.valor);
    g.equipo = f.equipo || null;
    g.nivel = f.nivel || null;
    g.estado = estadoPersona(g.quien);
    return g;
  }).sort(function (a, b) {
    /* primero quien trabaja, después por horas */
    if (a.estado.activa !== b.estado.activa) return a.estado.activa ? -1 : 1;
    return b.horas - a.horas;
  });
}

/* Los que están trabajando hoy. Es lo que se usa para sugerir nombres al
   cargar un turno: nadie quiere ver a los de la temporada pasada. */
function plantelActivo() {
  return plantel().filter(function (g) { return g.estado.activa; });
}
