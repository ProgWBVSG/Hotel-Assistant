/* ==========================================================================
   Tuco, el ayudante.

   Un círculo abajo a la izquierda con la cara del perro. Al tocarlo explica
   la pantalla en la que se está, no un recorrido de trece pasos que nadie
   termina. Aparece solo tres veces: la primera vez que se abre el sistema,
   al cargar el primer día, y al llegar a la meta del mes. El resto del
   tiempo es un círculo quieto esperando que lo toquen.

   Reglas para que no moleste:
     - nunca tapa un campo donde se está escribiendo
     - nunca aparece solo mientras se está cargando un día
     - lo que se cerró no vuelve a aparecer solo
   ========================================================================== */

var TUCO_ABIERTO = false;
var CLAVE_TUCO = 'reporte_diario_tuco';

function estadoTuco() {
  if (!E.tuco) E.tuco = { vistoBienvenida: false, vistoPrimerDia: false, vistoMeta: {} };
  return E.tuco;
}

/* El texto según la pantalla. Corto: tres o cuatro renglones, no un manual. */
function textoTuco(vista) {
  var EN = enIngles();
  var T = {
    cargardia: {
      es: ['Acá cargás lo que entró hoy. Escribí los números y el total de cada área se suma solo — no hace falta calcular nada.',
           'Apretá Enter para saltar a la siguiente celda, y si copiás una fila de Excel la podés pegar directo en la grilla.',
           'Los turnos van más abajo, en esta misma pantalla, y son por área: no es la misma gente en Penny Blue que en In Room Dining.'],
      en: ['This is where you enter what came in today. Type the numbers and each area\'s total adds itself up — nothing to calculate by hand.',
           'Press Enter to jump to the next box, and if you copy a row from Excel you can paste it straight into the grid.',
           'Shifts are further down this same screen, and they\'re per area: the people who work Penny Blue aren\'t the same as In Room Dining.']
    },
    resumen: {
      es: ['Este es el pantallazo del mes: cuánto lleva juntado el hotel y cómo viene contra el objetivo.',
           'El calendario de abajo pinta cada día: verde llegó a la meta, rojo no llegó, amarillo se pasó tanto que no conviene usarlo de referencia.',
           'Tocá cualquier día del calendario para ver el detalle.'],
      en: ['This is the month at a glance: how much the hotel has brought in so far, and how it\'s tracking against target.',
           'The calendar below colors each day: green hit the target, red fell short, yellow went so far over it\'s not a good baseline.',
           'Tap any day on the calendar to see its detail.']
    },
    dia: {
      es: ['Acá está el detalle completo de un solo día: cada área, cada turno de comida, y cómo se compara contra días parecidos.',
           'Sirve para entender POR QUÉ se movió un número, no solo que se movió.'],
      en: ['This is the full detail of one day: every area, every meal period, and how it compares against similar days.',
           'It answers WHY a number moved, not just that it moved.']
    },
    comentarios: {
      es: ['Todos los comentarios que se fueron dejando en cada día, juntos en un solo lugar.',
           'Filtrá por área para encontrar rápido lo que se anotó de un salón en particular.'],
      en: ['Every comment left on any day, all together in one place.',
           'Filter by area to quickly find what was noted about one particular room.']
    },
    proyeccion: {
      es: ['Acá se ve cómo va a cerrar el mes, recalculado todos los días.',
           'La meta es por área: Penny Blue, Exchange Lane e In Room Dining tienen cada una la suya, y la del mes es la suma. Así se ve cuál área viene atrás, no solo que "el mes viene atrás".',
           'Hay un botón para repartir una meta total entre las tres según lo que suele aportar cada una.'],
      en: ['This shows how the month is projected to close, recalculated every day.',
           'The target is per area: Penny Blue, Exchange Lane and In Room Dining each have their own, and the month target is the sum. That way you see which area is behind, not just "the month is behind".',
           'There\'s a button to split one total target across the three, based on what each usually brings in.']
    },
    horarios: {
      es: ['Muestra en qué franja horaria se genera más plata en cada área.',
           'Te dice, en una frase, cuál horario rinde más por hora de personal contra cuál rinde menos.'],
      en: ['Shows which time slot brings in the most money in each area.',
           'It tells you, in one sentence, which slot earns the most per staff-hour versus which earns the least.']
    },
    personal: {
      es: ['Compara cuánta gente trabajó contra lo que un día así suele necesitar, y cuánto costó ese personal sobre la venta del día.',
           'Si un día tuvo de más o de menos, el sistema lo marca solo.'],
      en: ['Compares how many people worked against what a day like this usually needs, and what that staff cost as a share of the day\'s sales.',
           'If a day ran over- or under-staffed, the system flags it on its own.']
    },
    presentacion: {
      es: ['La hoja de una página lista para el jefe: el total del día, el acumulado, la proyección y el detalle por área.',
           'El personal sale con nombre, horario y área de cada uno — no solo "6 personas, 45 horas".',
           'Se imprime directo desde el navegador.'],
      en: ['The one-page sheet ready for the boss: the day\'s total, the running total, the forecast, and the detail per area.',
           'Staff comes with each person\'s name, shift time and area — not just "6 people, 45 hours".',
           'Prints straight from the browser.']
    },
    enviar: {
      es: ['Manda el reporte por mail o por WhatsApp. Nada sale solo: siempre lo revisás antes.',
           'El botón de WhatsApp abre el chat con el mensaje ya escrito y lo importante en negrita — vos lo mandás desde tu teléfono.'],
      en: ['Sends the report by email or WhatsApp. Nothing goes out on its own: you always review it first.',
           'The WhatsApp button opens the chat with the message already written and the important parts in bold — you send it from your own phone.']
    },
    equipos: {
      es: ['Acá se cargan los valores por hora, por equipo o por persona. El de la persona manda si los dos están cargados.',
           'También se marca quién está contratado como casual.'],
      en: ['This is where hourly rates go, by team or by person. The person\'s rate wins if both are set.',
           'This is also where someone gets marked as a casual contract.']
    },
    pagos: {
      es: ['Define cómo se paga una hora según el día y el horario. Arranca sin ningún recargo: una hora vale lo mismo siempre, hasta que se diga lo contrario.',
           'Se pueden agregar franjas con un monto extra por hora, y elegir en qué días vale cada una.',
           'Cualquier cambio acá recalcula todos los días ya cargados.'],
      en: ['Sets how an hour is paid depending on the day and the time. It starts with no loadings at all: an hour is worth the same always, until told otherwise.',
           'You can add time bands with an extra amount per hour, and choose which days each one applies to.',
           'Any change here recalculates every day already loaded.']
    },
    cargar: {
      es: ['Subí un Excel y el sistema detecta solo las áreas, los turnos de comida y los números — no hace falta una plantilla exacta.',
           'Si algo no se entiende, lo avisa en vez de perderlo en silencio.'],
      en: ['Upload an Excel file and the system detects the areas, meal periods and numbers on its own — no exact template needed.',
           'If something doesn\'t make sense, it flags it instead of silently losing it.']
    },
    datos: {
      es: ['Acá vive todo lo que el sistema guardó. Se puede bajar una copia en cualquier momento, y restaurarla si hace falta.',
           'Vaciar el sistema borra todo — se usa una sola vez, antes de cargar los datos reales.'],
      en: ['This is where everything the system has saved lives. You can download a backup any time, and restore it if needed.',
           'Emptying the system deletes everything — used once, before loading real data.']
    }
  };
  var t = T[vista];
  if (!t) return null;
  return EN ? t.en : t.es;
}

/* -------------------------------------------------------------- eventos -- */

function abrirTuco() {
  TUCO_ABIERTO = true;
  pintarTuco('explica');
}
function cerrarTuco() {
  TUCO_ABIERTO = false;
  pintarTuco();
}
function alternarTuco() {
  if (TUCO_ABIERTO) cerrarTuco(); else abrirTuco();
}

/* Se llama una vez, al arrancar. */
function tucoAlIniciar() {
  var e = estadoTuco();
  if (!e.vistoBienvenida) {
    e.vistoBienvenida = true;
    guardarTodo();
    TUCO_ABIERTO = true;
    pintarTuco('saludo');
  }
}

/* Se llama cuando se guarda un día por primera vez. */
function tucoPrimerDia() {
  var e = estadoTuco();
  if (e.vistoPrimerDia) return;
  e.vistoPrimerDia = true;
  guardarTodo();
  TUCO_ABIERTO = true;
  pintarTuco('festejo-dia');
}

/* Se llama cuando se llega a la meta del mes. Una vez por mes. */
function tucoMeta(mes) {
  var e = estadoTuco();
  if (e.vistoMeta[mes]) return;
  e.vistoMeta[mes] = true;
  guardarTodo();
  TUCO_ABIERTO = true;
  pintarTuco('festejo-meta');
}

/* --------------------------------------------------------------- dibujo -- */

/* pose: 'explica' (según la pantalla), 'saludo', 'festejo-dia', 'festejo-meta',
   o null para redibujar con lo que ya estaba. */
var _POSE_TUCO = 'explica';

function pintarTuco(pose) {
  var cont = document.getElementById('tuco');
  if (!cont) return;
  var EN = enIngles();
  if (pose) _POSE_TUCO = pose;

  var boton = '<button class="tuco-boton" onclick="alternarTuco()" ' +
    'title="' + (EN ? 'Help' : 'Ayuda') + '" aria-label="' + (EN ? 'Help' : 'Ayuda') + '">' +
    '<img src="assets/tuco/icono.png" alt=""></button>';

  if (!TUCO_ABIERTO) { cont.innerHTML = boton; return; }

  var imagen, lineas, boton2 = '';
  if (_POSE_TUCO === 'saludo') {
    imagen = 'saludo.png';
    lineas = EN
      ? ['Hi, I\'m Tuco. Tap this circle any time and I\'ll explain the screen you\'re on.',
         'I only show up on my own three times: right now, the first day you enter, and when the month hits its target. The rest of the time I just wait here.']
      : ['Hola, soy Tuco. Tocá este círculo cuando quieras y te explico la pantalla en la que estás.',
         'Aparezco solo tres veces: ahora, cuando cargues el primer día, y cuando el mes llegue a la meta. El resto del tiempo espero acá quieto.'];
  } else if (_POSE_TUCO === 'festejo-dia') {
    imagen = 'festejo.png';
    lineas = EN
      ? ['First day loaded! You\'ll find it in Month summary and in Presentation, already totaled.']
      : ['¡Cargaste el primer día! Ya lo vas a ver en Resumen del mes y en Presentación, con el total hecho solo.'];
  } else if (_POSE_TUCO === 'festejo-meta') {
    imagen = 'festejo.png';
    lineas = EN
      ? ['Target reached for this month. Nice work.']
      : ['Llegaste a la meta de este mes. Bien ahí.'];
  } else {
    var t = textoTuco(VISTA);
    if (!t) { imagen = 'reposo.png'; lineas = []; }
    else { imagen = 'explica.png'; lineas = t; }
  }

  var esFestejo = (_POSE_TUCO === 'festejo-dia' || _POSE_TUCO === 'festejo-meta');
  cont.innerHTML =
    '<div class="tuco-globo"' + (esFestejo ? ' data-pose="festejo"' : '') + '>' +
      '<button class="tuco-cerrar" onclick="cerrarTuco()" aria-label="' + (EN ? 'Close' : 'Cerrar') + '">&times;</button>' +
      '<img class="tuco-figura" src="assets/tuco/' + imagen + '" alt="Tuco">' +
      '<div class="tuco-texto">' +
        lineas.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') +
      '</div>' +
    '</div>' +
    boton;
}

/* Cambiar de pantalla, o de idioma, actualiza lo que dice si está abierto. */
var _TUCO_VISTA_ANT = null;
function tucoSiguioLaVista() {
  if (VISTA !== _TUCO_VISTA_ANT) {
    _TUCO_VISTA_ANT = VISTA;
    if (TUCO_ABIERTO && (_POSE_TUCO === 'explica')) pintarTuco('explica');
  }
}
