# 07 — Envío por mail

> **Estado: a medias, a propósito.** Lo que anda hoy funciona sin servidor.
> El envío automático necesita Supabase y todavía no está desplegado.

---

## 1. Lo que anda hoy, sin instalar nada

En la pestaña **Enviar**:

| Botón | Qué hace |
|---|---|
| **Abrir el mail** | Abre Outlook (o el programa de correo que uses) con el destinatario, el asunto y el reporte entero ya escrito. Lo revisás y le das enviar. |
| **Copiar el texto** | Copia el reporte al portapapeles para pegarlo donde quieras. |
| **Bajar en JSON** | Baja el archivo que después se le va a mandar al servidor. |

Los destinatarios quedan guardados para la próxima vez.

**Por qué el envío no es automático hoy** — y por qué eso está bien:

El programa es un archivo HTML que se abre en el navegador. No tiene servidor detrás, así que no
hay forma de que mande un mail por su cuenta. Podría haberlo forzado con algún servicio externo,
pero eso significaría meter una clave de API dentro de un archivo que cualquiera puede abrir con el
bloc de notas. Eso no se hace.

Y hay una razón de fondo: **el día que un número salga mal, es mejor que lo vea la gerente antes que
su jefe.** Que haya un paso humano entre el sistema y el mail no es una limitación, es un seguro.

---

## 2. El JSON

Es lo que genera el botón "Bajar en JSON" y lo que va a recibir el servidor. Ya está definido para
no tener que rehacerlo después.

```json
{
  "version": 1,
  "generado": "2026-08-27T09:12:44.000Z",
  "propiedad": "hotel-demo",
  "moneda": "AUD",
  "fecha": "2026-08-24",

  "dia": {
    "total": 21474,
    "cubiertos": 578,
    "comida": 14677,
    "bebida": 6470,
    "descuentos": 2319,
    "esEvento": true,
    "incompleto": [],
    "areas": [
      { "area": "Penny Blue",     "total": 12507, "servicios": { } },
      { "area": "Exchange Lane",  "total": 6604,  "servicios": { } },
      { "area": "In Room Dining", "total": 2364,  "servicios": { } }
    ]
  },

  "mes": {
    "periodo": "2026-08",
    "acumulado": 147993,
    "diasCargados": 10,
    "diasDelMes": 31,
    "meta": 420000,
    "proyeccion": { "base": 469890, "piso": 396000, "techo": 536276, "eventosPrevistos": 6 }
  },

  "personal": {
    "personas": 6, "horas": 47, "costo": 1731,
    "pesoCosto": 8, "estado": "normal"
  },

  "comentarios": [
    { "area": "Exchange Lane", "texto": "The bar got extremely busy between 18:00 - 21:30…" }
  ],

  "destinatarios": ["jefe@hotel.com"]
}
```

**Cosas que importan del formato:**

- `version` está para poder cambiar el formato más adelante sin romper lo viejo.
- `incompleto` trae la lista de áreas que no reportaron. Si viene con algo, el mail lo avisa arriba.
- `proyeccion` puede venir en `null` si no hay días suficientes. El mail tiene que soportarlo.
- `costo` viene en `null` si todavía no se cargaron los valores de hora.
- No se manda ningún dato personal: los turnos van como cantidad y horas, sin nombres.

---

## 3. Lo que falta para que salga solo

Ya está escrita la función, sin desplegar, en
`supabase/functions/enviar-reporte/index.ts`. Recibe ese JSON y arma el mail en HTML.

**Faltan cuatro cosas, y ninguna la puedo hacer yo:**

1. **Crear el proyecto de Supabase** (necesita tu cuenta).
2. **Una cuenta de envío de mails.** La función está escrita para [Resend](https://resend.com)
   porque es la más simple: se verifica un dominio y listo. Sirve igual SendGrid o Postmark
   cambiando unas líneas.
3. **Verificar el dominio del remitente.** Si el mail sale desde una dirección sin verificar, va a
   terminar en spam. Es el paso que más suele demorar.
4. **Decidir cuándo se manda.** Ver abajo.

### Cuándo mandarlo

| Opción | Cómo | Qué tener en cuenta |
|---|---|---|
| **Un botón "Enviar ahora"** | La app llama a la función | La gerente controla cuándo sale. **Es lo que recomiendo para empezar.** |
| Programado a una hora | `pg_cron` en Supabase | Si el día no se cargó todavía, manda un reporte vacío. Hay que contemplarlo. |
| Cuando se guarda el día | Trigger en la base | Si después se corrige el día, ya se mandó el número viejo. |

La segunda y la tercera parecen mejores porque son automáticas, pero las dos tienen el mismo
problema: **mandan sin que nadie mire**. Arrancar por la primera y recién automatizar cuando haya
confianza en los números.

---

## 4. Seguridad del envío

Anotado ahora para no olvidarlo después:

- La función pide una clave propia (`CLAVE_ENVIO`) en el encabezado `x-clave`. Sin eso, cualquiera
  que encuentre la URL podría mandar mails desde el dominio del hotel.
- La clave de Resend vive **solo** en las variables de entorno de Supabase. Nunca en el navegador.
- Los destinatarios se guardan en la base, no se pasan por la URL.
- Cada envío queda registrado en la tabla `envios` con su estado.
- El mail **no lleva datos personales**: ni nombres del personal, ni números de habitación de los
  comentarios. Si los comentarios traen `Room 1306`, hay que limpiarlos antes de mandarlos afuera.

> ⚠️ **Ese último punto está pendiente.** Los comentarios del reporte mencionan habitaciones y mesas.
> Antes de que salgan por mail hay que decidir si se limpian. Está en `02-preguntas.md` P0-9.

---

## 5. Cómo probarlo cuando exista

```bash
supabase functions deploy enviar-reporte
supabase secrets set RESEND_API_KEY=... MAIL_REMITENTE=... CLAVE_ENVIO=...
```

Y para probar sin gastar un envío: **si `RESEND_API_KEY` no está configurada, la función devuelve
el HTML del mail sin mandarlo.** Así se puede ver cómo queda antes de conectar nada.

```bash
curl -X POST "$SUPABASE_URL/functions/v1/enviar-reporte" \
  -H "Content-Type: application/json" \
  -H "x-clave: $CLAVE_ENVIO" \
  -d @reporte-2026-08-24.json
```

El archivo `reporte-2026-08-24.json` es exactamente el que baja el botón de la app.
