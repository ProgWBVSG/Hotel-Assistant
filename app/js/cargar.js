/* ==========================================================================
   Cargar un Excel: el sistema lo lee, reconoce el formato y ubica todo solo.
   ========================================================================== */

var CARGA = { estado:'inicio', progreso:0, resultado:null, archivo:'' };

function vistaCargar() {
  var h = cab('Cargar el Excel', 'Arrastrá el archivo y el sistema acomoda todo solo');

  if (CARGA.estado === 'inicio') {
    h += '<div class="zona" id="zona" onclick="document.getElementById(\'archivo\').click()" ' +
      'ondragover="event.preventDefault();this.classList.add(\'encima\')" ' +
      'ondragleave="this.classList.remove(\'encima\')" ondrop="soltar(event)">' +
      '<div class="icono">↑</div><h3>Arrastrá el reporte acá</h3>' +
      '<p>o hacé clic para buscarlo · archivos .xlsx</p></div>' +
      '<input type="file" id="archivo" accept=".xlsx" style="display:none" ' +
      'onchange="if(this.files[0])procesar(this.files[0])">';

    h += '<div class="titulo-seccion">Qué hace cuando lo subís</div>';
    h += '<div class="marco" style="padding:18px 20px;font-size:12.5px;line-height:1.65">' +
      '<p><strong>1. Reconoce cada hoja como un día.</strong> Saca la fecha del nombre de la pestaña; ' +
      'si no puede, la busca adentro, en la celda que dice <em>Date</em>.</p>' +
      '<p><strong>2. Encuentra las tres áreas solo.</strong> Penny Blue, Exchange Lane e In Room Dining. ' +
      'Entiende que <em>IRD</em>, <em>In Room Dining</em> y <em>in room dining</em> son lo mismo.</p>' +
      '<p><strong>3. Resuelve las celdas combinadas.</strong> Cuando el nombre del área ocupa 30 filas, ' +
      'entiende que todas esas filas son de esa área.</p>' +
      '<p><strong>4. Ubica cada número en su lugar.</strong> Servicio (desayuno, almuerzo, cena, todo el día) ' +
      'y métrica (cubiertos, comida, bebida, total, ticket promedio, descuentos).</p>' +
      '<p><strong>5. Rescata los comentarios.</strong> Los reconoce porque son filas de texto que ocupan ' +
      'todo el ancho, y se acuerda debajo de qué área estaban.</p>' +
      '<p style="margin-bottom:0"><strong>6. Calcula lo que el Excel no tiene:</strong> el total del día ' +
      'sumando las tres áreas, y el acumulado del mes.</p></div>';

    h += '<div class="caja gris" style="margin-top:16px"><strong>El archivo no sale de tu computadora.</strong> ' +
      'Se abre y se lee acá adentro, en el navegador. No se sube a ningún lado.</div>';

    h += '<div class="acciones" style="border:none;margin-top:18px"><span class="sep"></span>' +
      '<button class="boton" onclick="volverDemo()">Volver a los datos de ejemplo</button></div>';
    return h;
  }

  if (CARGA.estado === 'leyendo') {
    h += '<div class="marco" style="padding:34px;text-align:center">' +
      '<div style="font-size:14px;font-weight:600;margin-bottom:6px">Leyendo ' + esc(CARGA.archivo) + '</div>' +
      '<div style="font-size:12.5px;color:var(--tinta-media)">' + esc(CARGA.mensaje || 'Abriendo el archivo…') + '</div>' +
      '<div class="progreso" style="max-width:380px;margin:18px auto 0"><span style="width:' + CARGA.progreso + '%"></span></div>' +
      '</div>';
    return h;
  }

  if (CARGA.estado === 'error') {
    h += '<div class="caja mal"><strong>No se pudo leer el archivo.</strong><br>' + esc(CARGA.mensaje) + '</div>';
    h += '<button class="boton primario" onclick="CARGA.estado=\'inicio\';pintar()">Probar con otro</button>';
    return h;
  }

  /* --- revisión antes de confirmar --- */
  var r = CARGA.resultado;
  var nuevos = r.dias.filter(function (d) { return !dia(d.fecha); });
  var repetidos = r.dias.filter(function (d) { return dia(d.fecha); });
  var conAviso = r.dias.filter(function (d) { return d.avisos && d.avisos.length; });

  h += '<div class="caja ok"><strong>Archivo leído: ' + esc(CARGA.archivo) + '</strong><br>' +
    'Se reconocieron <b>' + r.dias.length + ' días</b> de ' + r.totalHojas + ' hojas' +
    (r.fallaron.length ? ', y ' + r.fallaron.length + ' hojas no se pudieron interpretar' : '') + '.</div>';

  h += '<div class="tarjetas">';
  h += tarjeta('ok', 'Días nuevos', nuevos.length, '', 'Se van a agregar');
  h += tarjeta(repetidos.length ? 'aviso' : '', 'Ya estaban', repetidos.length, '',
    repetidos.length ? 'Elegí abajo qué hacer' : 'Ninguno repetido');
  h += tarjeta('', 'Comentarios', r.dias.reduce(function (a, d) { return a + d.comentarios.length; }, 0), '', 'Rescatados del reporte');
  h += tarjeta(r.fallaron.length ? 'mal' : '', 'Hojas sin leer', r.fallaron.length, '',
    r.fallaron.length ? 'Ver el detalle abajo' : 'Se leyeron todas');
  h += '</div>';

  if (repetidos.length) {
    h += '<div class="campo" style="max-width:420px;margin-top:18px"><label>Los días que ya estaban cargados</label>' +
      '<select id="que-hacer">' +
      '<option value="pisar">Reemplazarlos con lo que trae el archivo</option>' +
      '<option value="omitir">Dejarlos como están</option></select></div>';
  }

  if (conAviso.length) {
    h += '<div class="caja aviso"><strong>' + conAviso.length + ' hojas tienen la fecha de la pestaña ' +
      'distinta de la de adentro.</strong> Cuando la pestaña es una copia (termina en “(2)”) se usa la ' +
      'fecha de adentro; si no, la del nombre. ' +
      'Ejemplos: ' + conAviso.slice(0, 3).map(function (d) { return esc(d.hoja); }).join(', ') + '.</div>';
  }
  if (r.repetidas && r.repetidas.length) {
    h += '<div class="caja aviso"><strong>' + r.repetidas.length + ' fechas aparecían en dos hojas.</strong> ' +
      'Se quedó la que tenía más datos cargados. ' +
      r.repetidas.slice(0, 3).map(function (x) {
        return fechaCorta(x.fecha) + ' (' + x.hojas.map(esc).join(' y ') + ')';
      }).join(' · ') + '</div>';
  }

  /* muestra */
  h += '<div class="titulo-seccion">Así quedó interpretado</div>';
  h += '<div class="marco"><table><thead><tr><th>Hoja</th><th>Fecha</th>' +
    AREAS_ORDEN.map(function (a) { return '<th class="num">' + a + '</th>'; }).join('') +
    '<th class="num">Total</th><th class="num">Coment.</th><th></th></tr></thead><tbody>';
  r.dias.slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; }).slice(0, 25).forEach(function (d) {
    var fake = { fecha:d.fecha, areas:d.areas };
    h += '<tr><td style="color:var(--tinta-suave);font-size:11.5px">' + esc(d.hoja) + '</td>' +
      '<td>' + fechaCorta(d.fecha) + ' <span style="color:var(--tinta-suave);font-size:11px">' + diaSemana(d.fecha) + '</span></td>' +
      AREAS_ORDEN.map(function (a) {
        var v = totalArea(fake, a);
        return '<td class="num">' + (v === null ? '<span style="color:var(--tinta-suave)">—</span>' : plata(v)) + '</td>';
      }).join('') +
      '<td class="num"><strong>' + plata(totalDia(fake)) + '</strong></td>' +
      '<td class="num">' + (d.comentarios.length || '—') + '</td>' +
      '<td>' + (dia(d.fecha) ? '<span class="eti eti-aviso">ya estaba</span>' : '<span class="eti eti-ok">nuevo</span>') + '</td></tr>';
  });
  h += '</tbody></table></div>';
  if (r.dias.length > 25) h += '<div style="text-align:center;font-size:11.5px;color:var(--tinta-suave);margin-top:8px">' +
    'Mostrando 25 de ' + r.dias.length + ' días.</div>';

  if (r.fallaron.length) {
    h += '<div class="titulo-seccion">Hojas que no se pudieron leer</div>';
    h += '<div class="marco"><table><thead><tr><th>Hoja</th><th>Por qué</th></tr></thead><tbody>' +
      r.fallaron.map(function (f) {
        return '<tr><td>' + esc(f.hoja) + '</td><td style="color:var(--tinta-media)">' + esc(f.motivo) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div style="font-size:11.5px;color:var(--tinta-suave);margin-top:8px;text-align:center">' +
      'Suelen ser hojas de plantilla vacías o pestañas sin fecha. No pasa nada: se saltean.</div>';
  }

  h += '<div class="acciones" style="border:none;margin-top:20px">' +
    '<button class="boton" onclick="CARGA.estado=\'inicio\';pintar()">Cancelar</button><span class="sep"></span>' +
    '<button class="boton primario" onclick="confirmarCarga()">Cargar ' + r.dias.length + ' días</button></div>';
  return h;
}

function soltar(e) {
  e.preventDefault();
  document.getElementById('zona').classList.remove('encima');
  if (e.dataTransfer.files.length) procesar(e.dataTransfer.files[0]);
}

function procesar(f) {
  if (!/\.xlsx$/i.test(f.name)) {
    CARGA.estado = 'error';
    CARGA.mensaje = 'El archivo tiene que ser .xlsx. Si el tuyo es .xls, abrilo en Excel y guardalo como .xlsx.';
    pintar(); return;
  }
  if (f.size > 25 * 1024 * 1024) {
    CARGA.estado = 'error';
    CARGA.mensaje = 'El archivo pesa más de 25 MB.';
    pintar(); return;
  }

  CARGA.estado = 'leyendo'; CARGA.archivo = f.name;
  CARGA.progreso = 15; CARGA.mensaje = 'Abriendo el archivo…';
  pintar();

  var lector = new FileReader();
  lector.onload = function (ev) {
    CARGA.progreso = 45; CARGA.mensaje = 'Descomprimiendo y leyendo las hojas…';
    pintar();
    setTimeout(function () {
      procesarArchivo(ev.target.result).then(function (r) {
        CARGA.progreso = 100;
        CARGA.resultado = r;
        CARGA.estado = r.dias.length ? 'revision' : 'error';
        if (!r.dias.length) {
          CARGA.mensaje = 'Se abrió el archivo pero no se reconoció ningún día. ' +
            'Puede que el formato sea distinto al del reporte diario.';
        }
        pintar();
      }).catch(function (err) {
        CARGA.estado = 'error';
        CARGA.mensaje = err.message || String(err);
        pintar();
      });
    }, 60);
  };
  lector.onerror = function () {
    CARGA.estado = 'error'; CARGA.mensaje = 'No se pudo abrir el archivo.'; pintar();
  };
  lector.readAsArrayBuffer(f);
}

function confirmarCarga() {
  var r = CARGA.resultado;
  var sel = document.getElementById('que-hacer');
  var pisar = !sel || sel.value === 'pisar';
  var nuevos = 0, pisados = 0;

  r.dias.forEach(function (d) {
    var reg = { fecha:d.fecha, hoja:d.hoja, areas:d.areas, comentarios:d.comentarios };
    var existente = dia(d.fecha);
    if (existente) {
      if (!pisar) return;
      for (var i = 0; i < E.dias.length; i++) {
        if (E.dias[i].fecha === d.fecha) { E.dias[i] = reg; break; }
      }
      pisados++;
    } else {
      E.dias.push(reg);
      nuevos++;
    }
  });

  E.dias.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  anotar('Cargó un Excel', CARGA.archivo + ' — ' + nuevos + ' nuevos, ' + pisados + ' actualizados');
  guardarTodo();

  var ms = mesesDisponibles();
  MES = ms[ms.length - 1];
  var ds = diasDelMes(MES);
  DIA_SEL = ds.length ? ds[ds.length - 1].fecha : null;

  CARGA = { estado:'inicio', progreso:0, resultado:null, archivo:'' };
  VISTA = 'resumen';
  pintar();
  decir(nuevos + ' días cargados' + (pisados ? ', ' + pisados + ' actualizados' : ''), 'ok');
}

function volverDemo() {
  if (!confirm('Esto borra lo que hayas cargado y vuelve a los datos del Excel original. ¿Seguir?')) return;
  cargarDatosReales();
  var ms = mesesDisponibles();
  MES = ms[ms.length - 1];
  var ds = diasDelMes(MES);
  DIA_SEL = ds.length ? ds[ds.length - 1].fecha : null;
  VISTA = 'resumen'; pintar();
  decir('Datos originales restaurados');
}

/* ---------------------------------------------------------- exportar --- */

function exportarMes() {
  var ds = diasDelMes(MES);
  if (!ds.length) { decir('No hay datos para bajar', 'mal'); return; }

  var cols = ['Fecha','Día','Tipo'].concat(AREAS_ORDEN)
    .concat(['Total del día','Acumulado','Cubiertos','Comida','Bebida','Descuentos','Comentarios']);
  var filas = [];
  var run = 0;
  var corte = corteEvento(MES);

  ds.forEach(function (d) {
    var t = totalDia(d); run += t;
    filas.push([
      d.fecha, diaSemana(d.fecha), esEvento(d, corte) ? 'Evento' : 'Normal'
    ].concat(AREAS_ORDEN.map(function (a) {
      var v = totalArea(d, a); return v === null ? '' : v;
    })).concat([
      t, Math.round(run * 100) / 100, metricaDia(d, 'Covers'),
      metricaDia(d, 'Food'), metricaDia(d, 'Beverage'), metricaDia(d, 'Discounts'),
      (d.comentarios || []).map(function (c) { return c.texto; }).join(' || ')
    ]));
  });

  var p = proyectar(MES);
  filas.push([]);
  filas.push(['ACUMULADO DEL MES', '', '', '', '', '', acumulado(MES).total]);
  filas.push(['Días cargados', ds.length, 'de', cantidadDiasMes(MES)]);
  if (p.ok) {
    filas.push(['Proyección de cierre', '', '', '', '', '', p.cierre]);
    filas.push(['Rango', '', '', '', '', '', p.piso, p.techo]);
    if (p.meta) filas.push(['Meta del mes', '', '', '', '', '', p.meta]);
  }

  bajarXls('Reporte-' + MES, cols, filas);
  anotar('Bajó el resumen', nombreMes(MES));
  guardarTodo();
  decir('Archivo bajado', 'ok');
}

function bajarXls(nombre, cols, filas) {
  function celda(v) {
    if (typeof v === 'number') return '<Cell><Data ss:Type="Number">' + v + '</Data></Cell>';
    var s = String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return '<Cell><Data ss:Type="String">' + s + '</Data></Cell>';
  }
  var x = '<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
    'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n' +
    '<Styles><Style ss:ID="cab"><Font ss:Bold="1"/>' +
    '<Interior ss:Color="#EEECE8" ss:Pattern="Solid"/></Style></Styles>\n' +
    '<Worksheet ss:Name="' + nombre.slice(0, 30) + '"><Table>\n<Row>' +
    cols.map(function (c) { return '<Cell ss:StyleID="cab"><Data ss:Type="String">' + c + '</Data></Cell>'; }).join('') +
    '</Row>\n';
  filas.forEach(function (f) { x += '<Row>' + f.map(celda).join('') + '</Row>\n'; });
  x += '</Table></Worksheet></Workbook>';

  var b = new Blob([x], { type:'application/vnd.ms-excel' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = nombre + '.xls';
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 600);
}
