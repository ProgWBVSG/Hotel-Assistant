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
    if (r.status === 204) return null;
    return r.json().then(function (j) {
      if (!r.ok) {
        var e = new Error((j && (j.message || j.error_description || j.msg)) || ('HTTP ' + r.status));
        e.status = r.status;
        throw e;
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
  return pedirConSesion('/rest/v1/usuarios?select=id,nombre,email,rol,propiedad_id&limit=1')
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
function miRol() { return haySesion() ? SESION.usuario.rol : null; }
function miPropiedad() { return haySesion() ? SESION.usuario.propiedad_id : null; }
function veSueldosEnNube() { return ['gerente', 'admin'].indexOf(miRol()) !== -1; }

/* ------------------------------------------------------- traer de la nube */

function bajarTodo() {
  if (!haySesion()) return Promise.resolve(false);
  var p = miPropiedad();

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

    E.dias = dias.map(function (d) {
      return {
        fecha: d.fecha, areas: d.areas || {}, comentarios: d.comentarios || [],
        hoja: d.hoja, turnos: porFecha[d.fecha] || []
      };
    });

    /* la configuración vuelve a su lugar en E */
    ajustes.forEach(function (a) {
      if (E.hasOwnProperty(a.clave)) E[a.clave] = a.valor;
    });

    if (personas.length) {
      E.personas = {};
      personas.forEach(function (x) {
        E.personas[x.nombre] = { equipo: x.equipo, valor: x.valor_hora ? parseFloat(x.valor_hora) : 0 };
      });
    }
    if (equipos.length) {
      E.equipos = equipos.map(function (x) {
        return { nombre: x.nombre, valor: x.valor_hora ? parseFloat(x.valor_hora) : 0 };
      });
    }

    guardarLocal();
    return true;
  });
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
  if (_VACIANDO || !PENDIENTES.length || !haySesion()) return Promise.resolve();
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
    NUBE_ESTADO = navigator.onLine ? 'error' : 'sinRed';
    marcaNube();
    /* no se descarta: se reintenta cuando vuelva la red */
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
        cargado_por: SESION.usuario.id,
        editado_en: new Date().toISOString()
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
        editado_en: new Date().toISOString()
      }]
    });
  }

  if (tarea.tipo === 'borrarDia') {
    return pedirConSesion('/rest/v1/dias?fecha=eq.' + tarea.datos.fecha, { metodo: 'DELETE' });
  }

  if (tarea.tipo === 'historial') {
    return pedirConSesion('/rest/v1/historial', {
      metodo: 'POST',
      cuerpo: [{
        propiedad_id: p, usuario_id: SESION.usuario.id,
        que: tarea.datos.que, detalle: tarea.datos.detalle || null
      }]
    });
  }

  return Promise.resolve();
}

/* Qué mandar cuando se guarda. Se comparan los días contra lo último que se
   subió para no mandar el mes entero cada vez que se toca una tecla. */
var _ULTIMO_SUBIDO = {};
function sincronizar() {
  if (!haySesion()) return;

  E.dias.forEach(function (d) {
    var huella = JSON.stringify([d.areas, d.turnos, d.comentarios]);
    if (_ULTIMO_SUBIDO[d.fecha] === huella) return;
    _ULTIMO_SUBIDO[d.fecha] = huella;
    encolar('dia', d);
  });

  ['meta', 'metaArea', 'eventos', 'marcados', 'reglasPago', 'valorHora',
   'notasPersonal', 'mail', 'moneda'].forEach(function (k) {
    var huella = JSON.stringify(E[k]);
    if (_ULTIMO_SUBIDO['@' + k] === huella) return;
    _ULTIMO_SUBIDO['@' + k] = huella;
    encolar('ajuste', { clave: k, valor: E[k] === undefined ? null : E[k] });
  });
}

/* ------------------------------------------------------------ en pantalla */

function marcaNube() {
  var el = document.getElementById('marca-nube');
  if (!el) return;
  var EN = enIngles();

  if (!haySesion()) { el.innerHTML = ''; return; }

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
    esc(SESION.usuario.nombre + ' · ' + SESION.usuario.rol) + '">' +
    '<span class="punto-nube"></span>' + esc(texto) + '</span>';
}

window.addEventListener('online', function () {
  NUBE_ESTADO = 'lista'; vaciarCola(); marcaNube();
});
window.addEventListener('offline', function () {
  NUBE_ESTADO = 'sinRed'; marcaNube();
});
