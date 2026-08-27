/* ==========================================================================
   Valores hora: por defecto, por equipo y por persona.

   Cómo se decide cuánto vale una hora, en este orden:
     1. Si la persona tiene un valor propio, se usa ese.
     2. Si no, el del equipo al que pertenece.
     3. Si no, el valor general.
   ========================================================================== */

/* E.equipos     -> [{id, nombre, valorHora}]
   E.personas    -> { "Nombre": {equipo:"id", valorHora:null} }
   E.valorHora   -> valor general de respaldo                                */

var EQUIPOS_BASE = [
  { id:'salon',   nombre:'Salón',       valorHora:0 },
  { id:'cocina',  nombre:'Cocina',      valorHora:0 },
  { id:'barra',   nombre:'Barra',       valorHora:0 },
  { id:'super',   nombre:'Supervisión', valorHora:0 }
];

function equipos() {
  if (!E.equipos || !E.equipos.length) E.equipos = JSON.parse(JSON.stringify(EQUIPOS_BASE));
  return E.equipos;
}
function equipoPorId(id) {
  var es = equipos();
  for (var i = 0; i < es.length; i++) if (es[i].id === id) return es[i];
  return null;
}
function fichaPersona(nombre) {
  if (!E.personas) E.personas = {};
  if (!E.personas[nombre]) E.personas[nombre] = { equipo:null, valorHora:null };
  return E.personas[nombre];
}

/* El valor que efectivamente se aplica, y de dónde salió. */
function valorHoraDe(nombre) {
  var f = (E.personas || {})[nombre];
  if (f && typeof f.valorHora === 'number' && f.valorHora > 0) {
    return { valor:f.valorHora, origen:'persona', detalle:'valor propio' };
  }
  if (f && f.equipo) {
    var eq = equipoPorId(f.equipo);
    if (eq && eq.valorHora > 0) {
      return { valor:eq.valorHora, origen:'equipo', detalle:eq.nombre };
    }
  }
  if (E.valorHora > 0) return { valor:E.valorHora, origen:'general', detalle:'valor general' };
  return { valor:0, origen:'ninguno', detalle:'sin cargar' };
}

/* Costo de un turno concreto. */
function costoTurno(t) {
  return Math.round((t.horas || 0) * valorHoraDe(t.quien).valor * 100) / 100;
}

/* Costo de un día, sumando turno por turno con el valor de cada persona. */
function costoPersonalReal(d, area) {
  return Math.round((d.turnos || []).filter(function (t) {
    return !area || !t.area || t.area === area;
  }).reduce(function (a, t) { return a + costoTurno(t); }, 0));
}

/* ¿Hay algún valor cargado? */
function hayValores() {
  if (E.valorHora > 0) return true;
  if ((E.equipos || []).some(function (e) { return e.valorHora > 0; })) return true;
  var p = E.personas || {};
  for (var k in p) if (p[k].valorHora > 0) return true;
  return false;
}

/* Toda la gente que aparece en los turnos cargados. */
function gentePorTurnos() {
  var m = {};
  E.dias.forEach(function (d) {
    (d.turnos || []).forEach(function (t) {
      if (!t.quien) return;
      var g = m[t.quien] = m[t.quien] || { quien:t.quien, turnos:0, horas:0, ultimo:null };
      g.turnos++; g.horas += t.horas || 0;
      if (!g.ultimo || d.fecha > g.ultimo) g.ultimo = d.fecha;
    });
  });
  var lista = Object.keys(m).map(function (k) {
    var g = m[k];
    g.horas = Math.round(g.horas * 10) / 10;
    var v = valorHoraDe(g.quien);
    g.valor = v.valor; g.origen = v.origen; g.detalle = v.detalle;
    g.costo = Math.round(g.horas * v.valor);
    g.equipo = (E.personas || {})[g.quien] ? E.personas[g.quien].equipo : null;
    return g;
  });
  lista.sort(function (a, b) { return b.horas - a.horas; });
  return lista;
}

/* Personas sin valor asignado: las que hacen que el costo quede corto. */
function genteSinValor() {
  return gentePorTurnos().filter(function (g) { return !g.valor; });
}

/* Resumen por equipo del mes. */
function equiposDelMes(mes) {
  var ds = diasDelMes(mes);
  var m = {};
  equipos().forEach(function (eq) {
    m[eq.id] = { equipo:eq, horas:0, costo:0, personas:{} };
  });
  m['_sin'] = { equipo:{ id:'_sin', nombre:'Sin equipo asignado', valorHora:0 }, horas:0, costo:0, personas:{} };

  ds.forEach(function (d) {
    (d.turnos || []).forEach(function (t) {
      if (!t.quien) return;
      var f = (E.personas || {})[t.quien];
      var id = (f && f.equipo && m[f.equipo]) ? f.equipo : '_sin';
      m[id].horas += t.horas || 0;
      m[id].costo += costoTurno(t);
      m[id].personas[t.quien] = 1;
    });
  });

  return Object.keys(m).map(function (k) {
    var x = m[k];
    return {
      equipo: x.equipo,
      horas: Math.round(x.horas * 10) / 10,
      costo: Math.round(x.costo),
      personas: Object.keys(x.personas).length
    };
  }).filter(function (x) { return x.horas > 0; })
    .sort(function (a, b) { return b.costo - a.costo; });
}

/* ---------------------------------------------------- edición rápida --- */

function setValorEquipo(id, v) {
  var eq = equipoPorId(id);
  if (!eq) return;
  eq.valorHora = parseFloat(v) || 0;
  anotar('Cambió el valor hora de un equipo', eq.nombre + ': ' + eq.valorHora);
  guardarTodo(); pintar();
}
function setEquipoPersona(nombre, id) {
  fichaPersona(nombre).equipo = id || null;
  guardarTodo(); pintar();
}
function setValorPersona(nombre, v) {
  var n = parseFloat(v);
  fichaPersona(nombre).valorHora = (isNaN(n) || n <= 0) ? null : n;
  anotar('Cambió el valor hora de una persona', nombre + ': ' + (n || 'sin valor propio'));
  guardarTodo(); pintar();
}
function nuevoEquipo() {
  var n = prompt(T('¿Cómo se llama el equipo?'));
  if (!n || !n.trim()) return;
  equipos().push({ id:'eq' + Date.now().toString(36), nombre:n.trim(), valorHora:0 });
  guardarTodo(); pintar();
}
function borrarEquipo(id) {
  var eq = equipoPorId(id);
  if (!eq) return;
  if (!confirm(T('¿Borrar el equipo') + ' "' + eq.nombre + '"?')) return;
  E.equipos = equipos().filter(function (x) { return x.id !== id; });
  var p = E.personas || {};
  for (var k in p) if (p[k].equipo === id) p[k].equipo = null;
  guardarTodo(); pintar();
}

/* Asignar equipo a varias personas de una: por lo que suele hacer cada una. */
function asignarPorNombre(id) {
  var sin = gentePorTurnos().filter(function (g) { return !g.equipo; });
  if (!sin.length) { decir(T('Ya está todo asignado')); return; }
  sin.forEach(function (g) { fichaPersona(g.quien).equipo = id; });
  anotar('Asignó equipo', sin.length + ' personas a ' + (equipoPorId(id) || {}).nombre);
  guardarTodo(); pintar();
  decir(sin.length + ' ' + T('personas asignadas'), 'ok');
}
