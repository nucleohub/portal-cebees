import nodemailer, { type Transporter } from 'nodemailer';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let cached: Transporter | null = null;

export function getMailer(): Transporter {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth:
      env.smtp.user && env.smtp.pass
        ? { user: env.smtp.user, pass: env.smtp.pass }
        : undefined,
  });
  return cached;
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const info = await getMailer().sendMail({
    from: env.smtp.from,
    to: payload.to,
    subject: payload.subject,
    text: payload.body,
    html: payload.html,
    attachments: payload.attachments,
  });
  logger.info(
    { messageId: info.messageId, to: payload.to, subject: payload.subject },
    'email sent',
  );
}
