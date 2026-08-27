/*
  Envío del reporte diario por mail.

  NO ESTÁ DESPLEGADA. Es el punto de partida para cuando exista el proyecto de
  Supabase. No se probó contra ningún servicio real.

  Recibe el mismo JSON que genera el botón "Bajar en JSON" de la aplicación.
  Ver docs/07-envio-por-mail.md
*/

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const REMITENTE       = Deno.env.get('MAIL_REMITENTE') ?? 'reportes@ejemplo.com';
const CLAVE_INTERNA   = Deno.env.get('CLAVE_ENVIO');

interface Reporte {
  version: number;
  fecha: string;
  moneda: string;
  propiedad: string;
  dia: {
    total: number; cubiertos: number; comida: number; bebida: number;
    descuentos: number; esEvento: boolean; incompleto: string[];
    areas: { area: string; total: number }[];
  };
  mes: {
    periodo: string; acumulado: number; diasCargados: number; diasDelMes: number;
    meta: number | null;
    proyeccion: { base: number; piso: number; techo: number } | null;
  };
  personal: { personas: number; horas: number; costo: number | null;
              pesoCosto: number | null; estado: string } | null;
  comentarios: { area: string | null; texto: string }[];
  destinatarios: string[];
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Solo POST' }, 405);
  }

  /* Quien llama tiene que traer la clave. Sin esto, cualquiera podría
     mandar mails desde acá. */
  if (CLAVE_INTERNA && req.headers.get('x-clave') !== CLAVE_INTERNA) {
    return json({ error: 'No autorizado' }, 401);
  }

  let r: Reporte;
  try {
    r = await req.json();
  } catch {
    return json({ error: 'El cuerpo no es JSON válido' }, 400);
  }

  if (!r.fecha || !r.dia || !Array.isArray(r.destinatarios) || !r.destinatarios.length) {
    return json({ error: 'Faltan fecha, datos del día o destinatarios' }, 400);
  }

  if (!RESEND_API_KEY) {
    /* Sin clave configurada devuelve el HTML sin mandar nada.
       Sirve para probar el armado sin gastar envíos. */
    return json({ enviado: false, motivo: 'Falta RESEND_API_KEY', html: armarHtml(r) });
  }

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: REMITENTE,
      to: r.destinatarios,
      subject: `Daily F&B Report — ${r.fecha}`,
      html: armarHtml(r)
    })
  });

  if (!resp.ok) {
    return json({ enviado: false, error: await resp.text() }, 502);
  }
  return json({ enviado: true, destinatarios: r.destinatarios });
});

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}

function plata(n: number | null, moneda: string) {
  if (n === null || n === undefined) return '—';
  return moneda + ' ' + Math.round(n).toLocaleString('en-AU');
}

function armarHtml(r: Reporte) {
  const m = r.moneda;
  const p = r.mes.proyeccion;

  const filas = r.dia.areas.map(a =>
    `<tr><td style="padding:6px 10px;border-bottom:1px solid #e4e1db">${escapar(a.area)}</td>
         <td style="padding:6px 10px;border-bottom:1px solid #e4e1db;text-align:right">
           ${plata(a.total, m)}</td></tr>`).join('');

  const avisos: string[] = [];
  if (r.dia.incompleto?.length) {
    avisos.push(`Día incompleto: no reportó ${r.dia.incompleto.join(', ')}.`);
  }
  if (r.dia.esEvento) avisos.push('Día de evento.');
  if (r.mes.diasCargados < r.mes.diasDelMes) {
    avisos.push(`El acumulado cubre ${r.mes.diasCargados} de ${r.mes.diasDelMes} días del mes.`);
  }

  const comentarios = (r.comentarios || []).map(c =>
    `<p style="margin:0 0 10px"><b>${escapar(c.area ?? 'General')}</b><br>${escapar(c.texto)}</p>`
  ).join('');

  return `<!doctype html><html><body style="margin:0;padding:22px;background:#f2f1ee;
    font-family:'Segoe UI',Arial,sans-serif;color:#1f2225">
    <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #dedbd5;padding:26px">

      <div style="text-align:center;border-bottom:2px solid #1c2b33;padding-bottom:13px;margin-bottom:20px">
        <div style="font-size:10px;letter-spacing:.14em;color:#878c91;text-transform:uppercase">
          ${escapar(r.propiedad)}</div>
        <h2 style="margin:6px 0 3px;font-size:18px">Reporte diario de ingresos</h2>
        <div style="font-size:12px;color:#575c61">${escapar(r.fecha)}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr>
          <td style="width:33%;text-align:center;padding:12px;border:1px solid #dedbd5">
            <div style="font-size:9px;letter-spacing:.07em;color:#878c91;text-transform:uppercase">Total del día</div>
            <div style="font-size:19px;font-weight:700;margin-top:5px">${plata(r.dia.total, m)}</div>
          </td>
          <td style="width:33%;text-align:center;padding:12px;border:1px solid #dedbd5">
            <div style="font-size:9px;letter-spacing:.07em;color:#878c91;text-transform:uppercase">Acumulado</div>
            <div style="font-size:19px;font-weight:700;margin-top:5px">${plata(r.mes.acumulado, m)}</div>
          </td>
          <td style="width:33%;text-align:center;padding:12px;border:1px solid #dedbd5">
            <div style="font-size:9px;letter-spacing:.07em;color:#878c91;text-transform:uppercase">Proyección</div>
            <div style="font-size:19px;font-weight:700;margin-top:5px">${p ? plata(p.base, m) : '—'}</div>
          </td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px">
        <thead><tr>
          <th style="text-align:left;padding:7px 10px;background:#f8f7f4;font-size:10px;
              text-transform:uppercase;letter-spacing:.05em;color:#575c61">Área</th>
          <th style="text-align:right;padding:7px 10px;background:#f8f7f4;font-size:10px;
              text-transform:uppercase;letter-spacing:.05em;color:#575c61">Total</th>
        </tr></thead>
        <tbody>${filas}
          <tr><td style="padding:8px 10px;font-weight:700;border-top:2px solid #c2beb6">TOTAL</td>
              <td style="padding:8px 10px;font-weight:700;text-align:right;border-top:2px solid #c2beb6">
                ${plata(r.dia.total, m)}</td></tr>
        </tbody>
      </table>

      ${avisos.length ? `<div style="background:#f7efd8;border-left:3px solid #8f6c18;
        padding:11px 14px;font-size:12.5px;margin-bottom:18px">
        ${avisos.map(a => escapar(a)).join('<br>')}</div>` : ''}

      ${comentarios ? `<div style="margin-bottom:18px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;
             color:#575c61;margin-bottom:8px">Observaciones del turno</div>
        <div style="font-size:12.5px;line-height:1.55">${comentarios}</div></div>` : ''}

      <div style="font-size:10.5px;color:#878c91;border-top:1px solid #dedbd5;padding-top:12px;line-height:1.5">
        El acumulado suma solo los días cargados. La proyección es estadística sobre lo ya
        facturado y no incluye reservas tomadas para los días que faltan.
      </div>
    </div></body></html>`;
}

function escapar(s: string) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
