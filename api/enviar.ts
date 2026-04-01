import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as nodemailer from 'nodemailer';

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

  const gmailUser = process.env['GMAIL_USER'];
  const gmailPass = process.env['GMAIL_APP_PASSWORD'];

  if (!gmailUser || !gmailPass) {
    return res.status(500).json({ error: 'Credenciales de correo no configuradas' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  const to = Array.isArray(destinatario) ? destinatario.join(',') : destinatario;

  try {
    await transporter.sendMail({
      from: `"Olimpiadas Matemáticas UCSU" <${gmailUser}>`,
      to,
      subject: asunto,
      html: cuerpoHtml,
    });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Nodemailer error:', error);
    return res.status(500).json({ error: error.message });
  }
}
