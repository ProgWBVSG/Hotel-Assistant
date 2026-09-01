/* ==========================================================================
   Cuadrante de acumulado y leyenda del calendario
   ========================================================================== */

/* Cuánto se venía juntando antes de cada día.
   "Si es el día 3, lo que juntó el 1 y el 2." */
function cuadranteAcumulado(mes) {
  var serie = serieAcumulada(mes);
  if (!serie.length) {
    return '<div class="vacio"><h3>Todavía no hay días cargados de este mes</h3>' +
           '<p>Cuando entre el primero, acá va a aparecer cómo se va sumando.</p></div>';
  }

  var meta = E.meta[mes];
  var ultimo = serie[serie.length - 1];
  var tope = Math.max(meta || 0, ultimo.acumulado) || 1;

  /* resumen arriba */
  var h = '<div class="tarjetas" style="margin-bottom:14px">';
  h += tarjeta('acento', 'Lleva juntado', ultimo.acumulado, 'grande',
    'Al <b>día ' + ultimo.dia + '</b> · ' + serie.length + ' días cargados');
  h += tarjeta('', 'Traía de antes', ultimo.antesDeHoy, '',
    serie.length > 1
      ? 'Antes del día ' + ultimo.dia + ' ya había <b>' + plata(ultimo.antesDeHoy) + '</b>'
      : 'Es el primer día del mes: no había nada antes');
  h += tarjeta('', 'Entró ese día', ultimo.total, '',
    'El <b>' + fechaCorta(ultimo.fecha) + '</b> sumó esto');
  if (meta) {
    var falta = meta - ultimo.acumulado;
    h += tarjeta(falta <= 0 ? 'ok' : '', 'Falta para la meta',
      falta > 0 ? falta : 0, '',
      falta > 0 ? 'Va por el <b>' + Math.round((ultimo.acumulado / meta) * 100) + '%</b> de la meta'
                : '<b>Meta alcanzada</b>');
  }
  h += '</div>';

  /* tabla día por día */
  h += '<div class="marco"><table><thead><tr>' +
    '<th>Día</th><th class="num">Entró ese día</th>' +
    '<th class="num">Traía de antes</th><th class="num">Acumulado</th>' +
    '<th>Cómo se fue armando</th></tr></thead><tbody>';

  serie.forEach(function (x) {
    var pct = Math.round((x.acumulado / tope) * 100);
    var pctAntes = Math.round((x.antesDeHoy / tope) * 100);
    h += '<tr><td><span class="link" onclick="verDia(\'' + x.fecha + '\')">día ' + x.dia + '</span> ' +
      '<span style="color:var(--tinta-suave);font-size:11px">' + diaSemana(x.fecha) + '</span></td>' +
      '<td class="num"><strong>' + plata(x.total) + '</strong></td>' +
      '<td class="num" style="color:var(--tinta-suave)">' +
        (x.nDia === 1 ? '<em style="font-size:11px">arranca el mes</em>' : plata(x.antesDeHoy)) + '</td>' +
      '<td class="num"><strong>' + plata(x.acumulado) + '</strong></td>' +
      '<td style="width:210px"><div class="mini">' +
        '<span style="width:' + pctAntes + '%;background:var(--linea-fuerte)"></span>' +
        '<span style="width:' + Math.max(0, pct - pctAntes) + '%;background:var(--acento)"></span>' +
      '</div></td></tr>';
  });
  h += '</tbody></table></div>';

  h += '<div style="font-size:11.5px;color:var(--tinta-suave);margin-top:9px;text-align:center">' +
    'La barra clara es lo que ya traía de los días anteriores; la oscura, lo que sumó ese día' +
    (meta ? '. La barra completa sería la meta del mes.' : '.') + '</div>';
  return h;
}

/* Leyenda del calendario, con la explicación de por qué el amarillo no es bueno. */
function leyendaCalendario(mes, corte) {
  var objN = objetivoDiario(mes, false);
  var objE = objetivoDiario(mes, true);
  var hayMeta = !!((typeof metaTotal === 'function') ? metaTotal(mes) : E.meta[mes]);

  return '<div style="margin-top:14px;padding-top:13px;border-top:1px solid var(--linea)">' +
    '<div style="display:flex;gap:15px;flex-wrap:wrap;justify-content:center;font-size:11.5px;align-items:center">' +
    '<span><span class="punto sem-verde"></span> Llegó al objetivo</span>' +
    '<span><span class="punto sem-rojo"></span> No llegó</span>' +
    '<span><span class="punto sem-amarillo"></span> Se pasó bastante</span>' +
    '<span><span class="punto sem-sin"></span> Sin datos</span>' +
    '<span style="color:#a8862f">◆ día de evento</span></div>' +
    '<div style="font-size:11.5px;color:var(--tinta-suave);margin-top:11px;text-align:center;line-height:1.6;max-width:640px;margin-left:auto;margin-right:auto">' +
    'Objetivo de un día normal: <b>' + plata(objN) + '</b>' +
    (objE && objE !== objN ? ' · de un día de evento: <b>' + plata(objE) + '</b>' : '') +
    (hayMeta ? ' — sale de repartir la meta del mes.'
             : ' — es la mediana de los días ya cargados, porque todavía no hay meta cargada.') +
    '<br><br><b style="color:var(--tinta-media)">El amarillo no quiere decir que esté mal.</b> ' +
    'Quiere decir que el día se fue tanto por encima que no conviene tomarlo como referencia: ' +
    'si se usa de piso, las cuentas del mes salen infladas y después no se cumplen.' +
    '</div></div>';
}
