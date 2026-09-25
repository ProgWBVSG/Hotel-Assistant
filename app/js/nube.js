/* ==========================================================================
   La conexión con Supabase.

   Dos reglas que ordenan todo lo de acá:

   1. LOCAL PRIMERO. Cargar el día sigue escribiendo en el navegador al
      instante, igual que antes. La nube se actualiza atrás. Si se cae el
      wifi en el hotel, se sigue trabajando y cuando vuelve la conexión se
      manda lo que quedó pendiente. Un sistema que se cuelga sin internet no
      sirve en un salón lleno.

   2. SIN LIBRERÍAS. Supabase tiene API REST, así que alcanza con fetch. El
      sistema sigue abriendo con doble clic y sin instalar nada.

   La clave de abajo es la "publishable": está pensada para viajar al
   navegador, cualquiera que abra la aplicación la ve. Lo que protege los
   datos son las políticas RLS de la base y tener apagado el registro
   público. Sin sesión, la base no devuelve una sola fila.
   ========================================================================== */

var NUBE = {
  url:   'https://ncwjyssdpknewyhahksd.supabase.co',
  clave: 'sb_publishable_HlqNyLpoZPwZQ0DELSFQ4Q_-xJuXZGj'
};

/* El hotel. Es una sola propiedad, con un id fijo: no hace falta buscarlo. */
var PROPIEDAD = '00000000-0000-0000-0000-000000000001';

var SESION = null;          /* { access_token, refresh_token, expira, usuario } */
var CLAVE_SESION = 'reporte_diario_sesion';
var PENDIENTES = [];        /* lo que falta mandar */
var CLAVE_COLA = 'reporte_diario_cola';
var NUBE_ESTADO = 'apagada'; /* apagada | entrando | lista | sinRed | error */

function nubeConfigurada() {
  return !!(NUBE.url && NUBE.clave && NUBE.url.indexOf('supabase.co') !== -1);
}

/* ------------------------------------------------------------- llamadas -- */

function pedir(camino, opciones) {
  var o = opciones || {};
  var cab = {
    'apikey': NUBE.clave,
    'Content-Type': 'application/json'
  };
  if (SESION && SESION.access_token) {
    cab['Authorization'] = 'Bearer ' + SESION.access_token;
  }
  if (o.cabeceras) for (var k in o.cabeceras) cab[k] = o.cabeceras[k];

  return fetch(NUBE.url + camino, {
    method: o.metodo || 'GET',
    headers: cab,
    body: o.cuerpo ? JSON.stringify(o.cuerpo) : undefined
  }).then(function (r) {
    /* Un DELETE o un POST sin "return=representation" contestan sin cuerpo.
       Hay que leer el texto y recien ahi intentar interpretarlo: pedirle
       json() a una respuesta vacia revienta. */
    return r.text().then(function (txt) {
      var j = null;
      if (txt) { try { j = JSON.parse(txt); } catch (e) { j = null; } }
      if (!r.ok) {
        var msg = (j && (j.message || j.error_description || j.msg)) ||
                  txt.slice(0, 200) || ('HTTP ' + r.status);
        var e2 = new Error(msg);
        e2.status = r.status;
        throw e2;
      }
      return j;
    });
  });
}

/* Igual que pedir(), pero si el token venció lo renueva y reintenta una vez. */
function pedirConSesion(camino, opciones) {
  return pedir(camino, opciones).catch(function (e) {
    if (e.status !== 401 || !SESION || !SESION.refresh_token) throw e;
    return renovarSesion().then(function () { return pedir(camino, opciones); });
  });
}

/* --------------------------------------------------------------- sesión -- */

function guardarSesion(s) {
  SESION = s;
  try {
    if (s) localStorage.setItem(CLAVE_SESION, JSON.stringify(s));
    else localStorage.removeItem(CLAVE_SESION);
  } catch (e) {}
}

function recuperarSesion() {
  try {
    var c = localStorage.getItem(CLAVE_SESION);
    if (c) SESION = JSON.parse(c);
  } catch (e) { SESION = null; }
  return SESION;
}

function entrar(email, contrasena) {
  NUBE_ESTADO = 'entrando';
  return pedir('/auth/v1/token?grant_type=password', {
    metodo: 'POST',
    cuerpo: { email: String(email).trim(), password: contrasena }
  }).then(function (r) {
    guardarSesion({
      access_token: r.access_token,
      refresh_token: r.refresh_token,
      expira: Date.now() + (r.expires_in || 3600) * 1000
    });
    return traerQuienSoy();
  });
}

function renovarSesion() {
  if (!SESION || !SESION.refresh_token) return Promise.reject(new Error('sin sesión'));
  return pedir('/auth/v1/token?grant_type=refresh_token', {
    metodo: 'POST',
    cuerpo: { refresh_token: SESION.refresh_token }
  }).then(function (r) {
    guardarSesion({
      access_token: r.access_token,
      refresh_token: r.refresh_token,
      expira: Date.now() + (r.expires_in || 3600) * 1000,
      usuario: SESION.usuario
    });
    return SESION;
  }).catch(function (e) {
    /* el refresh también venció: hay que volver a entrar */
    guardarSesion(null);
    throw e;
  });
}

/* Quién soy y a qué hotel pertenezco. Sin esta fila, RLS no devuelve nada:
   la cuenta existe en Supabase pero no está vinculada a ninguna propiedad. */
function traerQuienSoy() {
  /* Hay que traer MI fila, no una cualquiera: con varias cuentas en el hotel,
     pedir "la primera" podía devolver el rol de otra persona. El id propio
     está dentro del token de sesión (el campo "sub"). */
  var miId = idDeSesion();
  var filtro = miId ? '&id=eq.' + miId : '&limit=1';
  return pedirConSesion('/rest/v1/usuarios?select=id,nombre,email,rol,propiedad_id' + filtro)
    .then(function (filas) {
      if (!filas || !filas.length) {
        throw new Error('SIN_VINCULAR');
      }
      SESION.usuario = filas[0];
      guardarSesion(SESION);
      NUBE_ESTADO = 'lista';
      return SESION.usuario;
    });
}

/* El id del usuario, leído del token de sesión (JWT: el campo "sub"). */
function idDeSesion() {
  try {
    var t = SESION && SESION.access_token;
    if (!t) return null;
    var carga = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return carga.sub || null;
  } catch (e) { return null; }
}

function salir() {
  var s = SESION;
  guardarSesion(null);
  NUBE_ESTADO = 'apagada';
  if (s && s.access_token) {
    pedir('/auth/v1/logout', { metodo: 'POST' }).catch(function () {});
  }
  pintar();
}

function haySesion() { return !!(SESION && SESION.access_token && SESION.usuario); }

/* Se puede usar la nube sin cuenta. Quien entra con cuenta queda identificado
   en el historial; quien no, igual guarda. */
function puedeUsarNube() { return nubeConfigurada(); }
function miRol() { return haySesion() ? SESION.usuario.rol : 'gerente'; }
function miPropiedad() {
  return haySesion() ? SESION.usuario.propiedad_id : PROPIEDAD;
}
function quienSoyId() { return haySesion() ? SESION.usuario.id : null; }
function veSueldosEnNube() { return ['gerente', 'admin'].indexOf(miRol()) !== -1; }

/* ------------------------------------------------------- traer de la nube */

/* ¿Es un objeto simple {clave:valor}, no un array ni null? */
function esObjetoPlano(x) {
  return x && typeof x === 'object' && !Array.isArray(x);
}

/* Une dos objetos por clave sin perder nada. Una clave que está de un solo
   lado se conserva siempre. Si está en los dos con distinto valor, gana la
   nube solo cuando `nubeGana` es true (es igual o más nueva). Baja recursivo
   para metaArea, que es { mes: { área: monto } }. */
function fusionarPorClave(local, nube, nubeGana) {
  var out = {};
  for (var k in local) if (local.hasOwnProperty(k)) out[k] = local[k];
  for (var j in nube) {
    if (!nube.hasOwnProperty(j)) continue;
    if (!(j in out)) { out[j] = nube[j]; continue; }
    if (esObjetoPlano(out[j]) && esObjetoPlano(nube[j])) {
      out[j] = fusionarPorClave(out[j], nube[j], nubeGana);
    } else if (out[j] !== nube[j] && nubeGana) {
      out[j] = nube[j];
    }
  }
  return out;
}

/* Une dos listas de equipos por id. Un equipo que está de un solo lado se
   conserva; si está en los dos, se fusionan sus campos y sus niveles, y en
   conflicto de valor gana el lado más reciente. Así configurar un equipo o
   un nivel en una computadora no borra lo que se hizo en otra. */
function fusionarEquipos(local, nube, nubeGana) {
  var porId = {};
  (local || []).forEach(function (e) { if (e && e.id) porId[e.id] = e; });
  (nube || []).forEach(function (e) {
    if (!e || !e.id) return;
    if (!porId[e.id]) { porId[e.id] = e; return; }
    var o = porId[e.id];
    o.nombre = nubeGana ? (e.nombre || o.nombre) : (o.nombre || e.nombre);
    if (typeof e.valorHora === 'number' && (nubeGana || !(o.valorHora > 0))) o.valorHora = e.valorHora;
    o.niveles = fusionarNiveles(o.niveles || [], e.niveles || [], nubeGana);
  });
  return Object.keys(porId).map(function (k) { return porId[k]; });
}
function fusionarNiveles(local, nube, nubeGana) {
  var porId = {};
  local.forEach(function (n) { if (n && n.id) porId[n.id] = n; });
  nube.forEach(function (n) {
    if (!n || !n.id) return;
    if (!porId[n.id]) { porId[n.id] = n; return; }
    var o = porId[n.id];
    o.nombre = nubeGana ? (n.nombre || o.nombre) : (o.nombre || n.nombre);
    if (typeof n.valorHora === 'number' && (nubeGana || !(o.valorHora > 0))) o.valorHora = n.valorHora;
  });
  return Object.keys(porId).map(function (k) { return porId[k]; });
}

function bajarTodo() {
  if (!puedeUsarNube()) return Promise.resolve(false);

  return Promise.all([
    pedirConSesion('/rest/v1/dias?select=*&order=fecha.asc'),
    pedirConSesion('/rest/v1/turnos?select=*'),
    pedirConSesion('/rest/v1/ajustes?select=*'),
    pedirConSesion('/rest/v1/personas?select=*').catch(function () { return []; }),
    pedirConSesion('/rest/v1/equipos?select=*').catch(function () { return []; })
  ]).then(function (r) {
    var dias = r[0] || [], turnos = r[1] || [], ajustes = r[2] || [];
    var personas = r[3] || [], equipos = r[4] || [];

    /* los turnos vuelven a su día */
    var porFecha = {};
    turnos.forEach(function (t) {
      (porFecha[t.fecha] = porFecha[t.fecha] || []).push({
        quien: t.quien, area: t.area, desde: t.desde, hasta: t.hasta,
        descanso: t.descanso, horas: t.horas ? parseFloat(t.horas) : 0
      });
    });

    var deLaNube = dias.map(function (d) {
      return {
        fecha: d.fecha, areas: d.areas || {}, comentarios: d.comentarios || [],
        hoja: d.hoja, turnos: porFecha[d.fecha] || [],
        editado_en: d.editado_en
      };
    });

    /* Si lo que hay en pantalla son los dias de ejemplo, se descartan: lo de
       la nube es lo real. Unirlos dejaria numeros inventados adentro. */
    var locales = (typeof sonDatosDeEjemplo === 'function' && sonDatosDeEjemplo())
      ? [] : (E.dias || []);
    E.dias = unirDias(locales, deLaNube);

    /* Ajustes que son un objeto por mes (o por fecha): la meta, la meta por
       área, los días de evento, los días marcados, las notas. Estos se
       FUSIONAN, no se pisan: lo que una computadora fijó para un mes se
       conserva aunque la otra sincronice una versión que no lo tenía. Solo
       si las dos tocaron exactamente el mismo mes gana el más reciente.
       Antes se reemplazaba el bloque entero y por eso "se le cambiaba solo"
       lo que la hermana había puesto. */
    var CLAVES_POR_MES = ['meta', 'metaArea', 'eventos', 'marcados', 'notasPersonal', 'personas'];
    ajustes.forEach(function (a) {
      if (!E.hasOwnProperty(a.clave)) return;
      if (a.valor === null || a.valor === undefined) return;
      var localMs = Date.parse((E.ajustesEditados || {})[a.clave] || 0) || 0;
      var nubeMs = a.editado_en ? Date.parse(a.editado_en) : 0;
      if (CLAVES_POR_MES.indexOf(a.clave) !== -1 && esObjetoPlano(a.valor) && esObjetoPlano(E[a.clave])) {
        /* la nube gana los conflictos solo si es igual o más nueva */
        E[a.clave] = fusionarPorClave(E[a.clave], a.valor, nubeMs >= localMs);
      } else if (a.clave === 'equipos' && Array.isArray(a.valor) && Array.isArray(E.equipos)) {
        E.equipos = fusionarEquipos(E.equipos, a.valor, nubeMs >= localMs);
      } else {
        /* escalares (valor hora, moneda, reglas de pago, corte): gana el más reciente */
        if (localMs && localMs > nubeMs) return;
        E[a.clave] = a.valor;
      }
    });

    /* recién ahora, con el corte ya aplicado desde la nube, se podan los
       días viejos de esta computadora */
    if (typeof aplicarCorteHistorial === 'function') aplicarCorteHistorial();

    /* Los equipos, niveles y personas viajan completos como ajuste (arriba),
       no desde las tablas viejas: así se sincronizan los valores por hora,
       los niveles y los plazos, que antes quedaban solo en una computadora. */

    guardarLocal();
    /* Se marca como "ya subido" SOLO lo que quedó idéntico a la nube. Un día
       que esta computadora tiene y la nube no (porque la subida se trabó
       alguna vez) queda sin marca, así se resube y no se pierde. */
    reconciliarHuellas(deLaNube);
    return true;
  });
}

/*
   Unir lo de esta computadora con lo de la nube.

   La regla es una sola: NADA SE BORRA. Un día que está de un solo lado se
   conserva tal cual. Un día que está de los dos se fusiona campo por campo,
   así lo que cargó una hermana no tapa lo que cargó la otra. Cuando los dos
   lados tienen el mismo dato distinto, gana el que se editó más tarde.
*/
function unirDias(locales, remotos) {
  var mapa = {};
  locales.forEach(function (d) { mapa[d.fecha] = d; });

  remotos.forEach(function (r) {
    var l = mapa[r.fecha];
    if (!l) { mapa[r.fecha] = r; return; }
    mapa[r.fecha] = fusionarDia(l, r);
  });

  return Object.keys(mapa).sort().map(function (f) { return mapa[f]; });
}

function fusionarDia(local, remoto) {
  var lMs = local.editado_en ? Date.parse(local.editado_en) : 0;
  var rMs = remoto.editado_en ? Date.parse(remoto.editado_en) : 0;
  var mandaRemoto = rMs > lMs;

  var out = {
    fecha: local.fecha,
    hoja: local.hoja || remoto.hoja,
    editado_en: (rMs > lMs ? remoto.editado_en : local.editado_en) || null
  };

  /* Áreas: se juntan las dos. Si un área está de los dos lados con distinto
     contenido, se queda la del lado que se editó más tarde. */
  out.areas = {};
  var todas = {};
  Object.keys(local.areas || {}).forEach(function (a) { todas[a] = 1; });
  Object.keys(remoto.areas || {}).forEach(function (a) { todas[a] = 1; });
  Object.keys(todas).forEach(function (a) {
    var la = (local.areas || {})[a], ra = (remoto.areas || {})[a];
    if (!la) { out.areas[a] = ra; return; }
    if (!ra) { out.areas[a] = la; return; }
    out.areas[a] = mandaRemoto ? ra : la;
  });

  /* Turnos: se juntan por persona y horario, sin repetir. */
  out.turnos = juntarSinRepetir(local.turnos || [], remoto.turnos || [], function (t) {
    return [t.quien, t.area, t.desde, t.hasta].join('|');
  });

  /* Comentarios: se juntan por texto, sin repetir. */
  out.comentarios = juntarSinRepetir(local.comentarios || [], remoto.comentarios || [], function (c) {
    return (c.area || '') + '|' + (c.texto || '').slice(0, 80);
  });

  return out;
}

function juntarSinRepetir(a, b, clave) {
  var visto = {}, out = [];
  a.concat(b).forEach(function (x) {
    var k = clave(x);
    if (visto[k]) return;
    visto[k] = 1; out.push(x);
  });
  return out;
}

/* -------------------------------------------------------- mandar a la nube */

/* Lo que se guarda se encola. Si no hay red, queda esperando. */
function encolar(tipo, datos) {
  PENDIENTES.push({ tipo: tipo, datos: datos, cuando: Date.now() });
  try { localStorage.setItem(CLAVE_COLA, JSON.stringify(PENDIENTES.slice(-500))); } catch (e) {}
  vaciarCola();
}

function recuperarCola() {
  try {
    var c = localStorage.getItem(CLAVE_COLA);
    PENDIENTES = c ? JSON.parse(c) : [];
  } catch (e) { PENDIENTES = []; }
}

var _VACIANDO = false;
function vaciarCola() {
  if (_VACIANDO || !PENDIENTES.length || !puedeUsarNube()) return Promise.resolve();
  if (!navigator.onLine) { NUBE_ESTADO = 'sinRed'; return Promise.resolve(); }
  _VACIANDO = true;

  var tarea = PENDIENTES[0];
  return mandar(tarea).then(function () {
    PENDIENTES.shift();
    try { localStorage.setItem(CLAVE_COLA, JSON.stringify(PENDIENTES)); } catch (e) {}
    _VACIANDO = false;
    NUBE_ESTADO = 'lista';
    if (PENDIENTES.length) return vaciarCola();
    marcaNube();
  }).catch(function (e) {
    _VACIANDO = false;
    /* Un error 4xx quiere decir que ESA tarea esta mal armada: reintentarla
       eternamente bloquea todo lo que viene atras. Se descarta y se sigue.
       Un error de red si se reintenta, que para eso esta la cola. */
    var esDelDato = e.status >= 400 && e.status < 500;
    if (esDelDato) {
      var mala = PENDIENTES.shift();
      try { localStorage.setItem(CLAVE_COLA, JSON.stringify(PENDIENTES)); } catch (x) {}
      if (window.console) console.warn('Descartado de la cola:', mala && mala.tipo, e.message);
      NUBE_ESTADO = 'lista';
      marcaNube();
      if (PENDIENTES.length) return vaciarCola();
      return;
    }
    NUBE_ESTADO = navigator.onLine ? 'error' : 'sinRed';
    marcaNube();
  });
}

function mandar(tarea) {
  var p = miPropiedad();

  if (tarea.tipo === 'dia') {
    var d = tarea.datos;
    return pedirConSesion('/rest/v1/dias', {
      metodo: 'POST',
      cabeceras: { 'Prefer': 'resolution=merge-duplicates' },
      cuerpo: [{
        propiedad_id: p, fecha: d.fecha,
        areas: d.areas || {}, comentarios: d.comentarios || [],
        hoja: d.hoja || null, origen: d.origen || 'manual',
        cargado_por: quienSoyId(),
        editado_en: d.editado_en || new Date().toISOString()
      }]
    }).then(function () {
      /* los turnos de ese día se reemplazan enteros: es lo más simple y no
         deja turnos viejos colgados cuando se borra uno */
      return pedirConSesion('/rest/v1/turnos?fecha=eq.' + d.fecha, { metodo: 'DELETE' });
    }).then(function () {
      var ts = (d.turnos || []).map(function (t) {
        return {
          propiedad_id: p, fecha: d.fecha, quien: t.quien, area: t.area || null,
          desde: t.desde, hasta: t.hasta, descanso: t.descanso || 0, horas: t.horas || 0
        };
      });
      if (!ts.length) return null;
      return pedirConSesion('/rest/v1/turnos', { metodo: 'POST', cuerpo: ts });
    });
  }

  if (tarea.tipo === 'ajuste') {
    return pedirConSesion('/rest/v1/ajustes', {
      metodo: 'POST',
      cabeceras: { 'Prefer': 'resolution=merge-duplicates' },
      cuerpo: [{
        propiedad_id: p, clave: tarea.datos.clave, valor: tarea.datos.valor,
        editado_en: tarea.datos.editado_en || new Date().toISOString()
      }]
    });
  }

  if (tarea.tipo === 'borrarDia') {
    return pedirConSesion('/rest/v1/turnos?fecha=eq.' + tarea.datos.fecha, { metodo: 'DELETE' })
      .then(function () {
        return pedirConSesion('/rest/v1/dias?fecha=eq.' + tarea.datos.fecha, { metodo: 'DELETE' });
      });
  }

  if (tarea.tipo === 'historial') {
    return pedirConSesion('/rest/v1/historial', {
      metodo: 'POST',
      cuerpo: [{
        propiedad_id: p, usuario_id: quienSoyId(),
        que: tarea.datos.que, detalle: tarea.datos.detalle || null
      }]
    });
  }

  return Promise.resolve();
}

/* Qué mandar cuando se guarda. Se comparan los días contra lo último que se
   subió para no mandar el mes entero cada vez que se toca una tecla. */
/* Que se subio y con que contenido. Se guarda en el navegador: si viviera
   solo en memoria, cada vez que se abre el sistema volveria a mandar el mes
   entero a la nube. */
var _ULTIMO_SUBIDO = {};
var CLAVE_HUELLAS = 'reporte_diario_huellas';

function recuperarHuellas() {
  try {
    var c = localStorage.getItem(CLAVE_HUELLAS);
    _ULTIMO_SUBIDO = c ? JSON.parse(c) : {};
  } catch (e) { _ULTIMO_SUBIDO = {}; }
}
var _GUARDAR_HUELLAS;
function guardarHuellas() {
  clearTimeout(_GUARDAR_HUELLAS);
  _GUARDAR_HUELLAS = setTimeout(function () {
    try { localStorage.setItem(CLAVE_HUELLAS, JSON.stringify(_ULTIMO_SUBIDO)); } catch (e) {}
  }, 400);
}

/* Lo que acaba de bajar de la nube ya esta alla: no hay que devolverlo. */
/* Huella estable de un día: ordena turnos y comentarios para que dos copias
   con el mismo contenido den la misma cadena, aunque estén en distinto orden.
   Sin esto, la nube y lo local nunca coincidían y se resubía todo. */
function huellaDia(d) {
  var t = (d.turnos || []).map(function (x) {
    return [x.quien || '', x.area || '', x.desde || 0, x.hasta || 0, x.descanso || 0, x.horas || 0];
  }).sort(function (a, b) { return (a[0] + '|' + a[2]) < (b[0] + '|' + b[2]) ? -1 : 1; });
  var c = (d.comentarios || []).map(function (x) {
    return [x.area || '', x.texto || ''];
  }).sort(function (a, b) { return (a[0] + '|' + a[1]) < (b[0] + '|' + b[1]) ? -1 : 1; });
  return JSON.stringify([d.areas || {}, t, c]);
}

function reconciliarHuellas(deLaNube) {
  var enNube = {};
  (deLaNube || []).forEach(function (d) {
    enNube[d.fecha] = huellaDia(d);
  });
  E.dias.forEach(function (d) {
    var huella = huellaDia(d);
    if (enNube[d.fecha] === huella) {
      _ULTIMO_SUBIDO[d.fecha] = huella;      /* está igual en la nube: nada que subir */
    } else {
      delete _ULTIMO_SUBIDO[d.fecha];        /* difiere o no está: hay que subirlo */
    }
  });
  guardarHuellas();
}

function sincronizar() {
  if (!puedeUsarNube()) return;
  /* Los dias de ejemplo NO se suben. Si alguien abre el sistema por primera
     vez ve datos de muestra: si esos viajaran a la nube se mezclarian con los
     reales del hotel y no habria forma de distinguirlos despues. */
  if (typeof sonDatosDeEjemplo === 'function' && sonDatosDeEjemplo()) return;

  E.dias.forEach(function (d) {
    if (E.corteHistorial && d.fecha < E.corteHistorial) return;  /* podado */
    var huella = huellaDia(d);
    if (_ULTIMO_SUBIDO[d.fecha] === huella) return;
    _ULTIMO_SUBIDO[d.fecha] = huella;
    guardarHuellas();
    encolar('dia', d);
  });

  if (!E.ajustesEditados) E.ajustesEditados = {};
  ['meta', 'metaArea', 'eventos', 'marcados', 'reglasPago', 'valorHora',
   'notasPersonal', 'mail', 'moneda', 'corteHistorial',
   'equipos', 'personas'].forEach(function (k) {
    var huella = JSON.stringify(E[k]);
    if (_ULTIMO_SUBIDO['@' + k] === huella) return;
    _ULTIMO_SUBIDO['@' + k] = huella;
    /* cuándo se tocó, para que el que baja sepa si su copia es más vieja */
    var cuando = new Date().toISOString();
    E.ajustesEditados[k] = cuando;
    guardarHuellas();
    if (E[k] === undefined || E[k] === null) return;   /* la base no acepta vacio */
    encolar('ajuste', { clave: k, valor: E[k], editado_en: cuando });
  });
}

/* ------------------------------------------------------------ en pantalla */

function marcaNube() {
  var el = document.getElementById('marca-nube');
  if (!el) return;
  var EN = enIngles();

  if (!puedeUsarNube()) { el.innerHTML = ''; return; }

  var pend = PENDIENTES.length;
  var texto, clase;
  if (NUBE_ESTADO === 'sinRed') {
    clase = 'sin-red';
    texto = EN ? 'No connection · ' + pend + ' pending' : 'Sin conexión · ' + pend + ' sin mandar';
  } else if (pend) {
    clase = 'mandando';
    texto = EN ? 'Saving… ' + pend : 'Guardando… ' + pend;
  } else if (NUBE_ESTADO === 'error') {
    clase = 'mal';
    texto = EN ? 'Could not save' : 'No se pudo guardar';
  } else {
    clase = 'ok';
    texto = EN ? 'Saved' : 'Guardado';
  }

  el.innerHTML = '<span class="nube ' + clase + '" title="' +
    esc(haySesion() ? (SESION.usuario.nombre + ' \u00b7 ' + SESION.usuario.rol)
                    : (EN ? 'Saved for everyone' : 'Se guarda para todas')) + '">' +
    '<span class="punto-nube"></span>' + esc(texto) + '</span>';
}

window.addEventListener('online', function () {
  NUBE_ESTADO = 'lista'; vaciarCola(); marcaNube();
});
window.addEventListener('offline', function () {
  NUBE_ESTADO = 'sinRed'; marcaNube();
});
