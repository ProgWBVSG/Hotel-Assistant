/* ==========================================================================
   Que se vea que quedó guardado.

   El problema: se escribía un número en la meta o en el valor hora y no
   pasaba nada visible. No había forma de saber si se había guardado, así que
   la duda quedaba flotando y se volvía a escribir lo mismo por las dudas.

   Ahora cada campo de configuración muestra su estado, y el estado se
   mantiene: si el campo tiene valor, queda en verde SIEMPRE, también al
   volver a entrar a la pantalla. Verde no quiere decir "recién guardado",
   quiere decir "esto está guardado".
   ========================================================================== */

/* Envuelve un input de configuración. `id` tiene que ser único en la pantalla. */
function campoConGuardado(id, etiqueta, inputHtml, pista, tieneValor) {
  var EN = enIngles();
  return '<div class="campo-g' + (tieneValor ? ' guardado' : '') + '" id="cg-' + id + '">' +
    '<div class="campo-g-cab">' +
      '<label for="' + id + '">' + etiqueta + '</label>' +
      '<span class="sello" aria-live="polite">' +
        '<span class="sello-guardando">' + iconoReloj() +
          (EN ? 'Saving' : 'Guardando') + '</span>' +
        '<span class="sello-listo">' + iconoTick() +
          (EN ? 'Saved' : 'Guardado') + '</span>' +
      '</span>' +
    '</div>' +
    inputHtml +
    (pista ? '<div class="pista">' + pista + '</div>' : '') +
    '</div>';
}

function iconoTick() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
}
function iconoReloj() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
    'stroke-linecap="round"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/></svg>';
}

/*
   Se llama desde el onchange del input. Guarda, muestra "Guardando" un
   instante y lo deja en verde.

   El instante es a propósito: si el tick apareciera en el mismo frame que la
   tecla, no se llega a ver y no comunica nada.
*/
var _RELOJES_GUARDADO = {};
function avisarGuardado(id, hayValor) {
  var el = document.getElementById('cg-' + id);
  if (!el) return;
  clearTimeout(_RELOJES_GUARDADO[id]);

  el.classList.remove('guardado');
  el.classList.add('guardando');

  _RELOJES_GUARDADO[id] = setTimeout(function () {
    var e2 = document.getElementById('cg-' + id);
    if (!e2) return;
    e2.classList.remove('guardando');
    if (hayValor !== false) e2.classList.add('guardado');
  }, 480);
}

/* Guardar + avisar, en un solo lugar. `fn` hace el cambio en E. */
function guardarCampo(id, fn, hayValor) {
  fn();
  guardarTodo();
  avisarGuardado(id, hayValor);
}
