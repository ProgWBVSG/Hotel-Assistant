/* ==========================================================================
   La pantalla de entrada.

   Mientras no haya sesión no se muestra nada del hotel. Pero el sistema
   también tiene que poder usarse sin cuenta, guardando solo en esta
   computadora: es como funcionó hasta ahora y es lo que permite probarlo
   sin depender de nadie.
   ========================================================================== */

var MODO_LOCAL = false;     /* eligió trabajar solo en esta computadora */
var CLAVE_LOCAL = 'reporte_diario_solo_local';
var ENTRANDO = false;
var ERROR_ENTRAR = null;

/* Login obligatorio: sin sesión no se muestra nada del hotel. Cada persona
   entra con su cuenta y su rol. Los datos no se pierden — al entrar, lo que
   ya estaba en la computadora se fusiona con la nube. */
function necesitaEntrar() {
  if (!nubeConfigurada()) return false;   /* sin nube configurada, uso local */
  return !haySesion();
}

function seguirSoloLocal() {
  MODO_LOCAL = true;
  try { localStorage.setItem(CLAVE_LOCAL, '1'); } catch (e) {}
  pintar();
}

function volverAEntrar() {
  MODO_LOCAL = false;
  try { localStorage.removeItem(CLAVE_LOCAL); } catch (e) {}
  pintar();
}

function intentarEntrar() {
  var em = document.getElementById('e-mail');
  var pw = document.getElementById('e-clave');
  if (!em || !pw || !em.value || !pw.value) {
    ERROR_ENTRAR = T('Falta el mail o la contraseña');
    pintar(); return;
  }
  ENTRANDO = true; ERROR_ENTRAR = null; pintar();

  entrar(em.value, pw.value).then(function () {
    ENTRANDO = false;
    MODO_LOCAL = false;
    try { localStorage.removeItem(CLAVE_LOCAL); } catch (e) {}
    return bajarTodo();
  }).then(function () {
    var ms = mesesDisponibles();
    MES = ms.length ? ms[ms.length - 1] : new Date().toISOString().slice(0, 7);
    VISTA = 'resumen';
    pintar();
    /* subir lo que esta computadora tenía y la nube no (fusionado, sin pisar) */
    if (typeof sincronizar === 'function') sincronizar();
    if (typeof vaciarCola === 'function') vaciarCola();
    if (typeof tucoAlIniciar === 'function') tucoAlIniciar();
    decir(T('Hola de nuevo'), 'ok');
  }).catch(function (e) {
    ENTRANDO = false;
    ERROR_ENTRAR = mensajeDeError(e);
    pintar();
  });
}

/* Los errores de Supabase vienen en inglés y en jerga. Se traducen a algo
   que diga qué hacer. */
function mensajeDeError(e) {
  var m = String(e && e.message || e);
  if (m === 'SIN_VINCULAR') {
    return T('La cuenta existe pero todavía no está asignada al hotel. ' +
             'Hay que agregarla en la tabla de usuarios.');
  }
  if (/Invalid login|invalid_grant|credentials/i.test(m)) {
    return T('El mail o la contraseña no coinciden');
  }
  if (/Email not confirmed/i.test(m)) {
    return T('La cuenta todavía no está confirmada');
  }
  if (/Failed to fetch|NetworkError/i.test(m)) {
    return T('No hay conexión con el servidor');
  }
  return m;
}

/* ------------------------------------------------------------- pantalla -- */

function vistaEntrar() {
  var EN = enIngles();
  var h = '<div class="entrada">';

  h += '<div class="entrada-caja">';
  h += '<div class="entrada-marca"><span class="lat-logo">R</span></div>';
  h += '<h1>' + (EN ? 'Daily Report' : 'Reporte Diario') + '</h1>';
  h += '<p class="entrada-sub">' +
    (EN ? 'Food &amp; Beverage' : 'Alimentos y Bebidas') + '</p>';

  h += '<div class="campo"><label for="e-mail">' +
    (EN ? 'Email' : 'Mail') + '</label>' +
    '<input type="email" id="e-mail" autocomplete="username" ' +
    'onkeydown="if(event.key===\'Enter\')document.getElementById(\'e-clave\').focus()"></div>';

  h += '<div class="campo"><label for="e-clave">' +
    (EN ? 'Password' : 'Contraseña') + '</label>' +
    '<input type="password" id="e-clave" autocomplete="current-password" ' +
    'onkeydown="if(event.key===\'Enter\')intentarEntrar()"></div>';

  if (ERROR_ENTRAR) {
    h += '<div class="caja mal" style="margin:4px 0 14px">' + esc(ERROR_ENTRAR) + '</div>';
  }

  h += '<button class="boton primario ancho" onclick="intentarEntrar()"' +
    (ENTRANDO ? ' disabled' : '') + '>' +
    (ENTRANDO ? (EN ? 'Checking…' : 'Comprobando…') : (EN ? 'Come in' : 'Entrar')) +
    '</button>';

  h += '<p class="entrada-pie">' +
    (EN ? 'Enter with the account the hotel gave you. Your data is safe — nothing is lost when you sign in.'
        : 'Entrá con la cuenta que te dieron. Tus datos están a salvo — al entrar no se pierde nada.') + '</p>';

  h += '</div></div>';
  return h;
}
