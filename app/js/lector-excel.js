/* ==========================================================================
   Lector de archivos .xlsx — sin librerías externas.

   Un .xlsx es un ZIP con archivos XML adentro. Acá se hace todo a mano:
   se abre el ZIP, se descomprime con el descompresor que ya trae el navegador
   (DecompressionStream) y se leen los XML con DOMParser.

   No se envía nada a ningún servidor. El archivo se lee en la computadora.
   ========================================================================== */

/* ---------------------------------------------------------------- ZIP ---- */

function leerZip(buffer) {
  var dv = new DataView(buffer);
  var u8 = new Uint8Array(buffer);

  /* El índice del ZIP está al final. Se busca la firma hacia atrás. */
  var fin = -1;
  for (var i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { fin = i; break; }
  }
  if (fin < 0) throw new Error('El archivo no parece ser un .xlsx válido.');

  var cantidad = dv.getUint16(fin + 10, true);
  var inicio   = dv.getUint32(fin + 16, true);

  var entradas = [];
  var p = inicio;
  for (var n = 0; n < cantidad; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    var metodo   = dv.getUint16(p + 10, true);
    var compSize = dv.getUint32(p + 20, true);
    var origSize = dv.getUint32(p + 24, true);
    var lenNom   = dv.getUint16(p + 28, true);
    var lenExtra = dv.getUint16(p + 30, true);
    var lenCom   = dv.getUint16(p + 32, true);
    var offset   = dv.getUint32(p + 42, true);
    var nombre   = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + lenNom));
    entradas.push({ nombre:nombre, metodo:metodo, compSize:compSize, origSize:origSize, offset:offset });
    p += 46 + lenNom + lenExtra + lenCom;
  }

  /* Los datos reales están más arriba, después de la cabecera local. */
  entradas.forEach(function (e) {
    var lenNom   = dv.getUint16(e.offset + 26, true);
    var lenExtra = dv.getUint16(e.offset + 28, true);
    e.datos = u8.subarray(e.offset + 30 + lenNom + lenExtra,
                          e.offset + 30 + lenNom + lenExtra + e.compSize);
  });

  return entradas;
}

function descomprimir(entrada) {
  if (entrada.metodo === 0) {
    return Promise.resolve(new TextDecoder().decode(entrada.datos));
  }
  if (typeof DecompressionStream === 'undefined') {
    return Promise.reject(new Error(
      'Tu navegador no puede descomprimir el archivo. Probá con Chrome o Edge actualizado.'));
  }
  var ds = new DecompressionStream('deflate-raw');
  var w = ds.writable.getWriter();
  w.write(entrada.datos); w.close();
  return new Response(ds.readable).arrayBuffer().then(function (b) {
    return new TextDecoder().decode(b);
  });
}

/* --------------------------------------------------------------- XLSX ---- */

function colALetraNumero(ref) {
  var m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) return null;
  var col = 0;
  for (var i = 0; i < m[1].length; i++) col = col * 26 + (m[1].charCodeAt(i) - 64);
  return { fila: parseInt(m[2], 10), col: col };
}

/* Excel guarda las fechas como número de días desde el 30/12/1899. */
function serialAFecha(n) {
  if (typeof n !== 'number' || n < 20000 || n > 80000) return null;
  var ms = Math.round((n - 25569) * 86400000);
  var d = new Date(ms);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0, 10);
}

function leerXlsx(buffer) {
  var entradas = leerZip(buffer);
  var porNombre = {};
  entradas.forEach(function (e) { porNombre[e.nombre] = e; });

  function texto(nombre) {
    if (!porNombre[nombre]) return Promise.resolve(null);
    return descomprimir(porNombre[nombre]);
  }

  var parser = new DOMParser();
  var resultado = { hojas: [] };

  return texto('xl/sharedStrings.xml').then(function (ss) {
    /* tabla de textos compartidos */
    resultado.textos = [];
    if (ss) {
      var doc = parser.parseFromString(ss, 'application/xml');
      var sis = doc.getElementsByTagName('si');
      for (var i = 0; i < sis.length; i++) {
        var ts = sis[i].getElementsByTagName('t');
        var s = '';
        for (var j = 0; j < ts.length; j++) s += ts[j].textContent;
        resultado.textos.push(s);
      }
    }
    return texto('xl/_rels/workbook.xml.rels');
  }).then(function (rels) {
    var mapaRel = {};
    if (rels) {
      var doc = parser.parseFromString(rels, 'application/xml');
      var rs = doc.getElementsByTagName('Relationship');
      for (var i = 0; i < rs.length; i++) {
        var t = rs[i].getAttribute('Target').replace(/^\/?xl\//, '').replace(/^\//, '');
        mapaRel[rs[i].getAttribute('Id')] = 'xl/' + t;
      }
    }
    return texto('xl/workbook.xml').then(function (wbx) {
      var lista = [];
      if (wbx) {
        var doc = parser.parseFromString(wbx, 'application/xml');
        var hs = doc.getElementsByTagName('sheet');
        for (var i = 0; i < hs.length; i++) {
          var rid = hs[i].getAttribute('r:id') ||
                    hs[i].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
          lista.push({ nombre: hs[i].getAttribute('name'), archivo: mapaRel[rid] });
        }
      }
      /* si no se pudo mapear, se usan los sheetN.xml en orden */
      if (!lista.length || !lista[0].archivo) {
        lista = entradas.filter(function (e) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(e.nombre); })
          .map(function (e, i) { return { nombre: 'Hoja ' + (i + 1), archivo: e.nombre }; });
      }
      return lista;
    });
  }).then(function (lista) {
    /* leer cada hoja, una después de la otra */
    var cadena = Promise.resolve();
    lista.forEach(function (h) {
      cadena = cadena.then(function () {
        if (!h.archivo || !porNombre[h.archivo]) return;
        return texto(h.archivo).then(function (xml) {
          if (!xml) return;
          resultado.hojas.push(parsearHoja(parser, xml, h.nombre, resultado.textos));
        });
      });
    });
    return cadena.then(function () { return resultado; });
  });
}

function parsearHoja(parser, xml, nombre, textos) {
  var doc = parser.parseFromString(xml, 'application/xml');
  var celdas = {};       /* "fila,col" -> valor */
  var maxFila = 0, maxCol = 0;

  var cs = doc.getElementsByTagName('c');
  for (var i = 0; i < cs.length; i++) {
    var c = cs[i];
    var pos = colALetraNumero(c.getAttribute('r') || '');
    if (!pos) continue;
    var tipo = c.getAttribute('t');
    var valor = null;

    if (tipo === 'inlineStr') {
      var is = c.getElementsByTagName('t');
      var s = '';
      for (var k = 0; k < is.length; k++) s += is[k].textContent;
      valor = s;
    } else {
      var vs = c.getElementsByTagName('v');
      if (vs.length) {
        var raw = vs[0].textContent;
        if (tipo === 's') valor = textos[parseInt(raw, 10)];
        else if (tipo === 'str' || tipo === 'e') valor = raw;
        else { var n = parseFloat(raw); valor = isNaN(n) ? raw : n; }
      }
    }
    if (valor !== null && valor !== '') {
      celdas[pos.fila + ',' + pos.col] = valor;
      if (pos.fila > maxFila) maxFila = pos.fila;
      if (pos.col > maxCol) maxCol = pos.col;
    }
  }

  /* celdas combinadas: se copia el valor del ancla a todo el rango */
  var combinadas = [];
  var ms = doc.getElementsByTagName('mergeCell');
  for (var j = 0; j < ms.length; j++) {
    var ref = ms[j].getAttribute('ref');
    var partes = ref.split(':');
    var a = colALetraNumero(partes[0]), b = colALetraNumero(partes[1] || partes[0]);
    if (!a || !b) continue;
    combinadas.push({ f1:a.fila, c1:a.col, f2:b.fila, c2:b.col,
                      ancho: b.col - a.col + 1, alto: b.fila - a.fila + 1 });
    var v = celdas[a.fila + ',' + a.col];
    if (v === undefined) continue;
    for (var f = a.fila; f <= b.fila; f++)
      for (var co = a.col; co <= b.col; co++)
        if (celdas[f + ',' + co] === undefined) celdas[f + ',' + co] = v;
  }

  return { nombre:nombre, celdas:celdas, combinadas:combinadas, maxFila:maxFila, maxCol:maxCol };
}

/* ================================================================
   DETECCIÓN AUTOMÁTICA
   Reconoce el formato del reporte diario sin que nadie configure nada.
   ================================================================ */

var SINONIMOS_AREA = {
  'penny blue':'Penny Blue',
  'exchange lane':'Exchange Lane',
  'in room dining':'In Room Dining',
  'ird':'In Room Dining',
  'room service':'In Room Dining',
  'roomservice':'In Room Dining'
};

var SERVICIOS = ['breakfast','lunch','dinner','overnight','all day','allday',
                 'desayuno','almuerzo','cena'];

var METRICAS = {
  'covers':'Covers', 'cover':'Covers', 'cubiertos':'Covers', 'pax':'Covers',
  'food':'Food', 'comida':'Food',
  'beverage':'Beverage', 'beverages':'Beverage', 'bebida':'Beverage', 'drinks':'Beverage',
  'total':'Total',
  'av check':'AV Check', 'avcheck':'AV Check', 'average check':'AV Check', 'ticket promedio':'AV Check',
  'discounts':'Discounts', 'discount':'Discounts', 'descuentos':'Discounts',
  'delivery charge':'Delivery Charge', 'delivery':'Delivery Charge',
  'misc/banquets':'Misc/Banquets', 'misc':'Misc/Banquets', 'banquets':'Misc/Banquets',
  'not inclusive':'Not Inclusive', 'platinum':'Platinum', 'kids':'Kids',
  'month to date':'Month to Date'
};

function limpiar(s) {
  return String(s == null ? '' : s).trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/* --- turnos del personal (columnas E, F, G) ---
   Vienen escritos a mano y con muchas variantes:
   "14:00 - 1:30" · "7:30- 15:30" · "06:00- 12.30" · "7:00 -11:30"     */
function parsearTurno(quien, horario, nota) {
  if (typeof horario !== 'string') return null;
  var limpio = horario.replace(/\s+/g, '').replace(/[–—]/g, '-');
  var m = /^(\d{1,2})[:.h](\d{2})-(\d{1,2})[:.h](\d{2})$/.exec(limpio);
  if (!m) return null;

  var h1 = +m[1], m1 = +m[2], h2 = +m[3], m2 = +m[4];
  if (h1 > 23 || h2 > 23 || m1 > 59 || m2 > 59) return null;

  var desde = h1 * 60 + m1;
  var hasta = h2 * 60 + m2;
  if (hasta <= desde) hasta += 24 * 60;      /* el turno cruza la medianoche */
  var dur = hasta - desde;
  if (dur <= 0 || dur > 16 * 60) return null;

  var descanso = 0;
  if (typeof nota === 'string') {
    var n = nota.toLowerCase();
    var mb = /(\d{2,3})\s*m/.exec(n);
    if (mb && n.indexOf('no break') === -1) descanso = +mb[1];
  }

  return { quien: String(quien).trim().slice(0, 28), desde: desde, hasta: hasta,
           descanso: descanso, horas: Math.round(((dur - descanso) / 60) * 100) / 100 };
}

function fechaDeNombre(nombre) {
  var s = String(nombre || '').replace(/\s*\(\d+\)\s*$/, '').replace(/\.{2,}/g, '.').trim();
  var m = /^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})$/.exec(s);
  if (!m) return null;
  var d = +m[1], mo = +m[2], y = +m[3];
  if (y < 100) y += 2000;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  var f = new Date(Date.UTC(y, mo - 1, d));
  if (f.getUTCDate() !== d || f.getUTCMonth() !== mo - 1) return null;
  return f.toISOString().slice(0, 10);
}

/* Lee una hoja del reporte y devuelve el día ya armado. */
function detectarDia(hoja) {
  var cel = function (f, c) { return hoja.celdas[f + ',' + c]; };
  var aviso = [];

  /* --- fecha: primero el nombre de la pestaña, después la celda "Date" --- */
  var fecha = fechaDeNombre(hoja.nombre);
  var fechaInterna = null;
  for (var f = 1; f <= Math.min(15, hoja.maxFila); f++) {
    for (var c = 1; c <= 3; c++) {
      if (limpiar(cel(f, c)) === 'date' || limpiar(cel(f, c)) === 'fecha') {
        for (var c2 = c + 1; c2 <= c + 3; c2++) {
          var v = cel(f, c2);
          if (typeof v === 'number') {
            fechaInterna = serialAFecha(v);
            if (!fechaInterna) {
              var s = String(Math.round(v));
              if (s.length === 7 || s.length === 8) {
                s = s.length === 7 ? '0' + s : s;
                var dd = +s.slice(0,2), mm2 = +s.slice(2,4), yy = +s.slice(4);
                if (mm2 >= 1 && mm2 <= 12 && dd >= 1 && dd <= 31)
                  fechaInterna = yy + '-' + String(mm2).padStart(2,'0') + '-' + String(dd).padStart(2,'0');
              }
            }
          } else if (typeof v === 'string') {
            var fn = fechaDeNombre(v);
            if (fn) fechaInterna = fn;
            else if (/^\d{4}-\d{2}-\d{2}/.test(v)) fechaInterna = v.slice(0, 10);
          }
          if (fechaInterna) break;
        }
        break;
      }
    }
    if (fechaInterna) break;
  }

  if (!fecha && fechaInterna) fecha = fechaInterna;

  /* Una pestaña llamada "24.08.2026 (2)" es una copia. Si la fecha de adentro
     es otra, esa es casi seguro la del día nuevo: al duplicar la hoja se
     cambió el contenido pero quedó el nombre viejo con el (2). */
  var esCopia = /\(\d+\)\s*$/.test(String(hoja.nombre || ''));
  if (esCopia && fechaInterna && fecha !== fechaInterna) {
    aviso.push('La pestaña "' + hoja.nombre + '" es una copia y adentro dice ' + fechaInterna +
               '. Se usó la fecha de adentro.');
    fecha = fechaInterna;
  } else if (fecha && fechaInterna && fecha !== fechaInterna) {
    aviso.push('La pestaña dice ' + fecha + ' y la celda de fecha dice ' + fechaInterna +
               '. Se usó la de la pestaña.');
  }
  if (!fecha) return { ok:false, motivo:'No se encontró la fecha', hoja:hoja.nombre };

  /* --- filas que ocupan todo el ancho: son los comentarios --- */
  var filasComentario = {};
  hoja.combinadas.forEach(function (m) {
    if (m.ancho >= 5) {
      var v = hoja.celdas[m.f1 + ',' + m.c1];
      if (typeof v === 'string' && v.trim().length > 25) filasComentario[m.f1] = v.trim();
    }
  });

  /* --- recorrido: columna A = área, B = servicio, C = métrica, D = número --- */
  var areas = {};
  var comentarios = [];
  var turnos = [];
  var ordenAreas = [];
  var areaActual = null, servActual = null;
  var filasLeidas = 0;

  for (var r = 1; r <= hoja.maxFila; r++) {
    if (filasComentario[r] !== undefined) {
      comentarios.push({ texto: filasComentario[r], area: areaActual, fila: r });
      continue;
    }
    var a = limpiar(cel(r, 1));
    var b = limpiar(cel(r, 2));
    var cc = limpiar(cel(r, 3));
    var d = cel(r, 4);

    if (SINONIMOS_AREA[a]) {
      areaActual = SINONIMOS_AREA[a];
      if (ordenAreas.indexOf(areaActual) === -1) ordenAreas.push(areaActual);
    }
    if (b && SERVICIOS.indexOf(b) !== -1) {
      servActual = String(cel(r, 2)).trim();
    }
    if (areaActual && servActual && cc && typeof d === 'number') {
      var met = METRICAS[cc] || String(cel(r, 3)).trim();
      if (!areas[areaActual]) areas[areaActual] = {};
      if (!areas[areaActual][servActual]) areas[areaActual][servActual] = {};
      areas[areaActual][servActual][met] = Math.round(d * 100) / 100;
      filasLeidas++;
    }

    /* columnas E, F, G: quién trabajó, en qué horario y si tuvo descanso */
    var eV = cel(r, 5), fV = cel(r, 6), gV = cel(r, 7);
    if (typeof eV === 'string' && eV.trim() && eV.trim().length < 30) {
      var t = parsearTurno(eV, fV, gV);
      if (t) { t.area = areaActual; turnos.push(t); }
    }
  }

  if (!ordenAreas.length) {
    return { ok:false, motivo:'No se reconoció ninguna área', hoja:hoja.nombre };
  }

  return { ok:true, fecha:fecha, hoja:hoja.nombre, areas:areas,
           comentarios:comentarios, turnos:turnos,
           filasLeidas:filasLeidas, avisos:aviso };
}

/* Procesa un archivo completo. Devuelve días detectados y los que no se pudo. */
function procesarArchivo(buffer) {
  return leerXlsx(buffer).then(function (libro) {
    var ok = [], fallaron = [];
    libro.hojas.forEach(function (h) {
      var d = detectarDia(h);
      if (d.ok) ok.push(d); else fallaron.push(d);
    });

    /* Si dos hojas caen en la misma fecha, gana la que tenga más datos cargados.
       Suele pasar cuando quedó una copia a medio completar. */
    var porFecha = {}, repetidas = [];
    ok.forEach(function (d) {
      var previa = porFecha[d.fecha];
      if (!previa) { porFecha[d.fecha] = d; return; }
      repetidas.push({ fecha:d.fecha, hojas:[previa.hoja, d.hoja] });
      if (d.filasLeidas > previa.filasLeidas) porFecha[d.fecha] = d;
    });

    var unicos = Object.keys(porFecha).sort().map(function (f) { return porFecha[f]; });
    return { dias: unicos, fallaron: fallaron, repetidas: repetidas,
             totalHojas: libro.hojas.length };
  });
}
