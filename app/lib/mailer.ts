import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP environment variables are not fully configured.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

export async function sendMail(options: {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}) {
  const from = process.env.CONTACT_FROM_EMAIL ?? process.env.SMTP_USER;

  if (!from) {
    throw new Error("CONTACT_FROM_EMAIL or SMTP_USER must be configured.");
  }

  await getTransporter().sendMail({
    from,
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
