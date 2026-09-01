/* ==========================================================================
   Mandar el reporte por WhatsApp.

   WhatsApp usa marcas propias: *negrita*, _cursiva_, ```monoespaciado```.
   El texto del mail no sirve tal cual: hay que armarlo aparte, más corto y
   con lo importante en negrita, porque se lee en un teléfono.
   ========================================================================== */

var WA_NUMERO_BASE = '61401016063';   /* +61 401 016 063 */

function numeroWa() {
  var n = (E.mail && E.mail.whatsapp) ? E.mail.whatsapp : WA_NUMERO_BASE;
  return String(n).replace(/[^\d]/g, '');
}
function numeroWaLegible() {
  var n = numeroWa();
  if (n.indexOf('61') === 0 && n.length === 11) {
    return '+61 ' + n.slice(2, 5) + ' ' + n.slice(5, 8) + ' ' + n.slice(8);
  }
  return '+' + n;
}

/*
   El mensaje de WhatsApp.
   En negrita va solo lo que se mira primero: el total del día, el acumulado,
   la proyección y los avisos. Si se pone todo en negrita, no se destaca nada.
*/
function armarTextoWhatsapp(f) {
  var d = dia(f);
  if (!d) return '';
  var EN = enIngles();
  var cmp = compararDia(f);
  var p = proyectar(MES);
  var ac = acumulado(MES, f);
  var corte = corteEvento(MES);
  var ev = esEvento(d, corte);
  var falt = areasFaltantes(f);
  var M = E.moneda;
  var L = [];

  L.push('*' + (EN ? 'DAILY F&B REPORT' : 'REPORTE DIARIO F&B') + '*');
  L.push(fechaLegible(f));
  L.push('');

  /* --- lo primero que se mira --- */
  L.push((EN ? 'Day total: ' : 'Total del día: ') + '*' + AUD(cmp.total) + '*');
  if (cmp.variacionComparables !== null) {
    var arr = cmp.variacionComparables >= 0;
    L.push((EN ? 'Vs similar days: ' : 'Contra días parecidos: ') +
      (arr ? '▲ ' : '▼ ') + AUD(Math.abs(cmp.variacionComparables)));
  }
  L.push((EN ? 'Month to date: ' : 'Acumulado del mes: ') + '*' + AUD(ac.total) + '*' +
    ' (' + ac.dias + ' ' + (EN ? 'days of' : 'días de') + ' ' + cantidadDiasMes(MES) + ')');

  if (p.ok) {
    L.push((EN ? 'Forecast close: ' : 'Proyección de cierre: ') + '*' + AUD(p.cierre) + '*');
    var meta = (typeof metaTotal === 'function') ? metaTotal(MES) : p.meta;
    if (meta) {
      var dif = p.cierre - meta;
      L.push((EN ? 'Target: ' : 'Meta: ') + AUD(meta) + ' → ' +
        '*' + (dif >= 0 ? (EN ? 'above by ' : 'por encima ') : (EN ? 'short by ' : 'faltan ')) +
        plata(Math.abs(dif)).trim() + '*');
    }
  }

  /* --- por área --- */
  L.push('');
  L.push('*' + (EN ? 'BY AREA' : 'POR ÁREA') + '*');
  AREAS_ORDEN.forEach(function (a) {
    var v = totalArea(d, a);
    if (v === null) { L.push('• ' + a + ': _' + (EN ? 'not reported' : 'sin reportar') + '_'); return; }
    var sv = d.areas[a], ad = null;
    for (var k in sv) if (k.toLowerCase().replace(/\s/g, '') === 'allday') ad = sv[k];
    L.push('• ' + a + ': ' + AUD(v) +
      (ad && ad.Covers ? ' _(' + ad.Covers + ' ' + (EN ? 'covers' : 'cub.') + ')_' : ''));
  });

  /* --- avisos: van en negrita porque son lo accionable --- */
  var avisos = [];
  if (falt.length) {
    avisos.push('*' + (EN ? 'Incomplete day' : 'Día incompleto') + '*: ' +
      (EN ? 'no report from ' : 'no reportó ') + falt.join(', '));
  }
  if (ev) avisos.push('*' + (EN ? 'Event day' : 'Día de evento') + '* ' + (EN ? 'at' : 'en') + ' Penny Blue');
  if (ac.dias < cantidadDiasMes(MES)) {
    var faltanDias = cantidadDiasMes(MES) - ac.dias;
    if (faltanDias > 3) {
      avisos.push('_' + (EN ? 'The running total covers ' : 'El acumulado cubre ') + ac.dias +
        ' ' + (EN ? 'of' : 'de') + ' ' + cantidadDiasMes(MES) + ' ' + (EN ? 'days' : 'días') + '_');
    }
  }
  if (avisos.length) { L.push(''); avisos.forEach(function (a) { L.push('⚠️ ' + a); }); }

  /* --- personal --- */
  var ap = analisisPersonal(d, MES);
  if (!ap.sinDatos) {
    L.push('');
    L.push('*' + (EN ? 'STAFF' : 'PERSONAL') + '*');
    AREAS_ORDEN.forEach(function (a) {
      var ts = (d.turnos || []).filter(function (t) { return t.area === a; });
      if (!ts.length) return;
      var hs = ts.reduce(function (x, t) { return x + (t.horas || 0); }, 0);
      L.push('• ' + a + ': ' + personas(ts.length) +
        ' · ' + (Math.round(hs * 10) / 10) + ' h');
    });
    if (hayValores()) {
      var costo = (typeof costoDiaConReglas === 'function' && hayRecargos())
        ? costoDiaConReglas(d) : costoPersonalReal(d);
      L.push((EN ? 'Cost: ' : 'Costo: ') + AUD(costo) +
        (ap.pesoCosto !== null ? ' _(' + ap.pesoCosto + '% ' + (EN ? 'of sales' : 'de la venta') + ')_' : ''));
    }
    if (ap.estado !== 'normal') L.push('⚠️ ' + ap.mensaje);
  }

  /* --- observaciones: solo la primera, el resto no entra en un chat --- */
  if (d.comentarios && d.comentarios.length) {
    L.push('');
    L.push('*' + (EN ? 'NOTES' : 'OBSERVACIONES') + '*');
    d.comentarios.slice(0, 2).forEach(function (c) {
      var t = c.texto.length > 220 ? c.texto.slice(0, 217) + '…' : c.texto;
      L.push('_' + (c.area || (EN ? 'General' : 'General')) + '_: ' + t);
    });
    if (d.comentarios.length > 2) {
      L.push('_+' + (d.comentarios.length - 2) + ' ' +
        (EN ? 'more in the full report' : 'más en el reporte completo') + '_');
    }
  }

  return L.join('\n');
}

function abrirWhatsapp(f) {
  var texto = armarTextoWhatsapp(f);
  var url = 'https://wa.me/' + numeroWa() + '?text=' + encodeURIComponent(texto);
  if (url.length > 7500) {
    /* mensaje muy largo: se copia y se abre el chat vacío */
    copiarAlPortapapeles(texto);
    window.open('https://wa.me/' + numeroWa(), '_blank');
    decir(T('El mensaje es largo. Lo copié: pegalo en el chat.'), 'ok');
  } else {
    window.open(url, '_blank');
  }
  anotar('Abrió WhatsApp con el reporte', f);
  guardarTodo();
}

function copiarWhatsapp(f) {
  copiarAlPortapapeles(armarTextoWhatsapp(f));
  decir(T('Mensaje copiado'), 'ok');
}

function copiarAlPortapapeles(t) {
  if (navigator.clipboard) { navigator.clipboard.writeText(t); return; }
  var ta = document.createElement('textarea');
  ta.value = t; document.body.appendChild(ta); ta.select();
  document.execCommand('copy'); ta.remove();
}

function guardarNumeroWa(v) {
  if (!E.mail) E.mail = {};
  E.mail.whatsapp = String(v).replace(/[^\d+]/g, '');
  guardarTodo();
  decir(T('Número guardado'), 'ok');
}
