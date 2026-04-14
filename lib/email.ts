import nodemailer from "nodemailer";

type Transporter = ReturnType<typeof nodemailer.createTransport>;
let cached: Transporter | null = null;

function getTransport(): Transporter | null {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cached;
}

export type SendMailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendMail(input: SendMailInput): Promise<boolean> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured, skipping send:", input.subject);
    return false;
  }
  const from = process.env.MAIL_FROM || "IT Ticketing <no-reply@example.com>";
  try {
    await transport.sendMail({ from, ...input });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

export function htmlLayout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;background:#f1f5f9;padding:24px;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;">
    <h2 style="margin:0 0 16px 0;color:#1e3a8a;">${title}</h2>
    ${bodyHtml}
    <p style="margin-top:28px;font-size:12px;color:#64748b;">IT Ticketing Information System</p>
  </div></body></html>`;
}
