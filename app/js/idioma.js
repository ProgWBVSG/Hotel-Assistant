/* ==========================================================================
   Español / English

   La aplicación está escrita en español. Al terminar de dibujar cada pantalla
   se recorren los textos y se reemplazan por su versión en inglés.
   Así no hay que ensuciar todo el código con llamadas a una función de idioma.
   ========================================================================== */

var DIC = {
  /* --- barra y pestañas --- */
  'Reporte Diario':'Daily Report',
  'Alimentos y Bebidas':'Food & Beverage',
  '+ Cargar día':'+ Add day',
  'Resumen del mes':'Month summary',
  'Día':'Day',
  'Proyección':'Forecast',
  'Horarios':'Time of day',
  'Personal':'Staff',
  'Presentación':'Presentation',
  'Comentarios':'Comments',
  'Cargar Excel':'Import Excel',
  'Equipos y sueldos':'Teams & rates',
  'Enviar':'Send',

  /* --- resumen --- */
  'Resumen de':'Summary —',
  'Resumen':'Summary',
  'Buen día':'Good morning',
  'Acumulado del mes':'Month to date',
  'Último día cargado':'Last day loaded',
  'Proyección de cierre':'Month-end forecast',
  'Días que faltan':'Days remaining',
  'Cómo se fue juntando el mes':'How the month built up',
  'Día por día':'Day by day',
  'Detalle':'Detail',
  'De dónde viene la plata':'Where the money comes from',
  'Lleva juntado':'Collected so far',
  'Traía de antes':'Before that day',
  'Entró ese día':'Came in that day',
  'Falta para la meta':'Left to target',
  'Cómo se fue armando':'How it built up',
  'Fecha':'Date','Total del día':'Day total','Acumulado':'Running total',
  'Cubiertos':'Covers','Comida':'Food','Bebida':'Beverage','Descuentos':'Discounts',
  'Servicio':'Service','Total':'Total','Ticket':'Avg check','Todo el día':'All day',
  'Desayuno':'Breakfast','Almuerzo':'Lunch','Cena':'Dinner','Madrugada':'Overnight',
  'Área':'Area','Áreas':'Areas','Días':'Days','Peso':'Share','Horario':'Hours',
  'días cargados de':'days loaded of',
  'días cargados':'days loaded',
  'días del mes':'days in the month',
  'días':'days','día':'day',
  'promedio':'average','por día':'per day',
  'de los':'of the','de la':'of the','del mes':'of the month',
  'Total ':'Total ',
  'evento':'event','incompleto':'incomplete',
  'sin datos':'no data','arranca el mes':'month starts',
  'Bajar a Excel':'Download to Excel','Imprimir':'Print',
  '+ Cargar el día de hoy':'+ Add today',

  /* --- semáforo --- */
  'Llegó al objetivo':'Hit target',
  'No llegó':'Below target',
  'Se pasó bastante':'Well above',
  'Sin datos':'No data',
  'día de evento':'event day',
  'Objetivo de un día normal':'Normal day target',
  'de un día de evento':'event day target',
  'En objetivo':'On target',
  'Abajo del objetivo':'Below target',
  'Muy por encima':'Well above',
  'Sin movimiento':'No activity',
  'Sin referencia':'No reference',

  /* --- día --- */
  'Comida / Bebida':'Food / Beverage',
  'Consumo promedio':'Average spend',
  'por persona':'per person',
  'de la venta':'of sales',
  'del total':'of total',
  'Contra el día anterior':'Vs previous day',
  'Lo que pasó ese día':'What happened that day',
  'Marcar como evento':'Mark as event',
  'No es día de evento':'Not an event day',
  'Corregir':'Edit',
  'Ver presentación':'View presentation',
  'Día de evento.':'Event day.',
  'Día incompleto.':'Incomplete day.',
  'Hoja original':'Source sheet',

  /* --- proyección --- */
  'Meta del mes':'Month target',
  'Ya facturado':'Already billed',
  'Falta facturar':'Still to bill',
  'Contra la meta':'Vs target',
  'De dónde sale ese número':'Where that number comes from',
  'Cómo está calculado':'How it is calculated',
  'En una frase:':'In one sentence:',
  'Cierre proyectado':'Forecast close',
  'días normales':'normal days',
  'días de evento':'event days',
  'Días de evento que faltan en Penny Blue':'Remaining event days at Penny Blue',
  'Cargado por vos.':'Set by you.',
  'Se llega con margen':'Target met with room',

  /* --- horarios --- */
  'En qué momento entra la plata':'When the money comes in',
  'Franja por franja':'Slot by slot',
  'Cuánto rinde cada hora de personal':'Revenue per staff hour',
  'A qué hora hay gente trabajando':'When staff are on shift',
  'Total del mes':'Month total',
  'Promedio por día':'Daily average',
  'Ingresos':'Revenue',
  'Horas pagadas':'Paid hours',
  'Costo estimado':'Estimated cost',
  'Costo sobre venta':'Cost of sales',
  'Genera por hora':'Revenue per hour',
  'Lo que conviene mirar:':'Worth looking at:',
  'cargá el valor hora':'set the hourly rate',

  /* --- personal --- */
  'Horas del mes':'Month hours',
  'Costo de personal':'Staff cost',
  'Horas':'Hours','Costo':'Cost','Venta':'Sales','Personas':'People',
  'Por hora':'Per hour','Dotación':'Staffing','Tu nota':'Your note',
  'Quién':'Who','Turnos':'Shifts','Equipo':'Team',
  'Promedio por turno':'Average per shift',
  'Días que conviene revisar':'Days worth reviewing',
  'Por persona':'Per person',
  'pudo sobrar gente':'possibly overstaffed',
  'pudo faltar gente':'possibly understaffed',
  'normal':'normal',
  'Cuánto se paga la hora':'Hourly rate',
  'Moneda':'Currency',
  'Valor general':'Default rate',
  'Valor propio':'Own rate',
  'Sin equipo asignado':'No team assigned',
  'Salón':'Floor','Cocina':'Kitchen','Barra':'Bar','Supervisión':'Supervision',
  'Motivo…':'Reason…',

  /* --- carga del día --- */
  'Cargar el día':'Add the day',
  'Corregir el día':'Edit the day',
  'Hoy':'Today','Ayer':'Yesterday','Limpiar':'Clear',
  'Guardar el día':'Save day',
  'Guardar los cambios':'Save changes',
  'Quién trabajó':'Who worked',
  'Qué pasó en':'What happened at',
  '+ Agregar persona':'+ Add person',
  'Nombre':'Name','Entrada':'Start','Salida':'End','Descanso':'Break',
  'sin descanso':'no break','min':'min',
  'falta cargar':'not entered yet',
  'sin cubiertos cargados':'no covers entered',
  'Se actualiza mientras cargás':'Updates as you type',
  'Todavía no cargaste nada':'Nothing entered yet',
  'Banquetes':'Banquets','Delivery':'Delivery',
  'personas':'people',

  /* --- comentarios --- */
  'Observaciones':'Observations',
  'Buscar en las observaciones…':'Search observations…',
  'General':'General',
  'comentarios registrados en':'comments recorded across',

  /* --- importar --- */
  'Arrastrá el reporte acá':'Drop the report here',
  'Días nuevos':'New days',
  'Ya estaban':'Already loaded',
  'Hojas sin leer':'Sheets not read',
  'Así quedó interpretado':'How it was read',
  'Cancelar':'Cancel','Guardar':'Save','Cerrar':'Close',
  'nuevo':'new','ya estaba':'already there',
  'Volver a los datos de ejemplo':'Reset to sample data',

  /* --- presentación --- */
  'Resumen del día':'Daily summary',
  'Reporte diario de ingresos':'Daily revenue report',
  'Imprimir o guardar en PDF':'Print or save as PDF',
  'Observaciones del turno':'Shift observations',
  'sin meta':'no target',
  'Cargar en Proyección':'Set in Forecast',
  'Meta':'Target',

  /* --- generales --- */
  'Sin datos cargados':'No data loaded',
  'Ojo con este número: es parcial.':'Careful: this number is partial.',
  'Ojo: este costo es parcial.':'Careful: this cost is partial.',
  'Sobre el cálculo.':'About the calculation.',
  'Sobre estos números.':'About these numbers.',
  'sin turnos cargados':'no shifts entered',
  'Sin turnos cargados':'No shifts entered',
  'Ya está todo asignado':'Everything is already assigned',
  'personas asignadas':'people assigned',
  '¿Cómo se llama el equipo?':'What is the team called?',
  '¿Borrar el equipo':'Delete team',
  'Nota guardada':'Note saved',
  'Día guardado':'Day saved',
  'Copiados':'Copied',
  'Ajustá lo que haga falta.':'Adjust as needed.'
};

/* Frases largas: se traducen enteras porque no se pueden partir. */
var DIC_FRASES = {};

/* ==========================================================================
   Traducción de la pantalla.

   Se traduce por BLOQUE COMPLETO, nunca palabra por palabra: reemplazar
   palabras sueltas dentro de una frase mezcla los dos idiomas y queda peor
   que dejarlo sin traducir.

   Lo que no está en el diccionario queda en español, entero y legible.
   ========================================================================== */

function T(s) {
  if ((E.idioma || 'es') === 'es') return s;
  var r = traducirFrase(s);
  return r === null ? s : r;
}

/* Bloques que llevan texto propio. Se traducen de afuera hacia adentro:
   si el padre está en el diccionario, no hace falta mirar los hijos. */
var SEL_BLOQUES = 'div.caja,div.pista,div.t-rotulo,div.t-pie,div.titulo-seccion,' +
  'div.vacio h3,div.vacio p,p,td,th,h1,h2,h3,label,button,option,' +
  'div.calculo-desc,div.calculo-total,div.hoja-resumen,div.hoja-nota,' +
  'div.cal-num,div.cal-monto,span.eti,strong,em,small,li,' +
  'div.calculo-linea>div,div.ficha-meta>span,div:not([class]),span:not([class])';

function traducirPantalla() {
  if ((E.idioma || 'es') === 'es') return;

  [document.getElementById('principal'),
   document.getElementById('tabs'),
   document.querySelector('.marca'),
   document.querySelector('.franja')].forEach(traducirZona);
}

function traducirZona(raiz) {
  if (!raiz) return;

  var listos = [];
  raiz.querySelectorAll(SEL_BLOQUES).forEach(function (el) {
    /* si un ancestro ya se tradujo, este bloque vino adentro */
    for (var i = 0; i < listos.length; i++) if (listos[i].contains(el)) return;
    if (el.querySelector('input,select,textarea')) return;

    var t = traducirFrase(el.innerHTML);
    if (t !== null) { el.innerHTML = t; listos.push(el); }
  });

  /* nodos de texto sueltos que no cayeron en ningún bloque */
  var it = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null);
  var nodos = [], n;
  while ((n = it.nextNode())) nodos.push(n);
  nodos.forEach(function (nodo) {
    var crudo = nodo.nodeValue;
    if (!crudo || !crudo.trim() || crudo.trim().length < 3) return;
    var t = traducirFrase(crudo.trim());
    if (t !== null) nodo.nodeValue = crudo.replace(crudo.trim(), t);
  });

  /* atributos */
  raiz.querySelectorAll('[placeholder]').forEach(function (el) {
    var t = traducirFrase('@@PH@@' + el.getAttribute('placeholder'));
    if (t !== null) el.setAttribute('placeholder', t.replace('@@PH@@', ''));
  });
  raiz.querySelectorAll('[title]').forEach(function (el) {
    var t = traducirFrase('@@TI@@' + el.getAttribute('title'));
    if (t !== null) el.setAttribute('title', t.replace('@@TI@@', ''));
  });
  raiz.querySelectorAll('option').forEach(function (o) {
    var t = traducirFrase(o.textContent.trim());
    if (t !== null) o.textContent = t;
  });
}

function cambiarIdioma(v) {
  E.idioma = v;
  guardarTodo();
  pintar();
}
