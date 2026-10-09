// Sends email through any SMTP account (HostPinnacle/cPanel mailbox, Gmail app
// password, Brevo, etc.). Configured with SMTP_* variables; when they are not
// set, mailConfigured() is false and callers fall back gracefully.
import nodemailer from "nodemailer";

export const mailConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export async function sendMail(opts: { to: string; subject: string; text: string; html: string }) {
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM || `Murang'a TTI <${process.env.SMTP_USER}>`,
    ...opts,
  });
}
