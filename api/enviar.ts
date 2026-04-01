import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const ALLOWED_ORIGIN = 'https://olimpiadasmatematicasudec.web.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { destinatario, asunto, cuerpoHtml } = req.body ?? {};

  if (!destinatario || !asunto || !cuerpoHtml) {
    return res.status(400).json({ error: 'Faltan campos: destinatario, asunto, cuerpoHtml' });
  }

  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    return res.status(500).json({ error: 'API key no configurada' });
  }

  const resend = new Resend(apiKey);
  const to: string[] = Array.isArray(destinatario) ? destinatario : [destinatario];

  const { error } = await resend.emails.send({
    // Actualiza el remitente una vez verifiques el dominio en resend.com
    from: 'Olimpiadas Matemáticas UCSU <onboarding@resend.dev>',
    to,
    subject: asunto,
    html: cuerpoHtml,
  });

  if (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
