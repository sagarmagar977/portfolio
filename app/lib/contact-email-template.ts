type ContactEmailTemplateInput = {
  receiverName: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildContactEmailTemplate(input: ContactEmailTemplateInput) {
  const safeReceiverName = escapeHtml(input.receiverName);
  const safeSenderName = escapeHtml(input.senderName);
  const safeSenderEmail = escapeHtml(input.senderEmail);
  const safeSubject = escapeHtml(input.subject);
  const safeMessage = escapeHtml(input.message).replace(/\n/g, "<br />");
  const normalizedSenderEmail = input.senderEmail.trim();
  const replyHref = `mailto:${normalizedSenderEmail}?subject=${encodeURIComponent(`Re: ${input.subject}`)}`;

  const html = `
    <div style="margin:0;padding:24px 12px;font-family:Segoe UI,Arial,sans-serif;color:#d8e6df;">
      <div style="max-width:720px;margin:0 auto;background:#0b4148;border:1px solid rgba(224,247,128,0.18);border-radius:22px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.22);">
        <div style="padding:34px 36px;background:linear-gradient(135deg,#0c4d55,#08353a);border-bottom:1px solid rgba(224,247,128,0.15);">
          <p style="margin:0 0 12px;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#dff780;font-weight:700;">New Portfolio Inquiry</p>
          <h1 style="margin:0;font-size:38px;line-height:1.18;color:#f1f6e2;font-weight:800;">Hello ${safeReceiverName},</h1>
          <p style="margin:14px 0 0;font-size:18px;line-height:1.7;color:#c4d7d5;">You received a new contact message from your portfolio website.</p>
        </div>
        <div style="padding:34px 36px;">
          <div style="margin-bottom:22px;padding:24px;border-radius:18px;background:#083840;border:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0 0 10px;font-size:14px;color:#8fb0b4;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Sender Details</p>
            <p style="margin:0 0 10px;font-size:20px;line-height:1.5;color:#eef3db;"><strong>Name:</strong> ${safeSenderName}</p>
            <p style="margin:0;font-size:20px;line-height:1.5;color:#eef3db;">
              <strong>Email:</strong>
              <a href="mailto:${normalizedSenderEmail}" style="color:#7dcfff;text-decoration:none;">${safeSenderEmail}</a>
            </p>
          </div>
          <div style="margin-bottom:22px;padding:24px;border-radius:18px;background:#083840;border:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0 0 10px;font-size:14px;color:#8fb0b4;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Subject</p>
            <p style="margin:0;font-size:22px;line-height:1.5;color:#eef3db;">${safeSubject}</p>
          </div>
          <div style="margin-bottom:30px;padding:24px;border-radius:18px;background:#083840;border:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0 0 12px;font-size:14px;color:#8fb0b4;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Message</p>
            <p style="margin:0;font-size:20px;line-height:1.85;color:#d8e6df;">${safeMessage}</p>
          </div>
          <div style="text-align:center;">
            <a href="${replyHref}" style="display:inline-block;padding:18px 28px;border-radius:16px;background:#dff780;color:#06353c;text-decoration:none;font-size:22px;font-weight:800;">
              Reply to ${safeSenderName}
            </a>
          </div>
        </div>
        <div style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.08);background:#08353a;">
          <p style="margin:0;font-size:15px;color:#8fb0b4;">Sent from your portfolio contact form.</p>
        </div>
      </div>
    </div>
  `;

  const text = [
    `Hello ${input.receiverName},`,
    "",
    "You received a new contact message from your portfolio website.",
    "",
    `Name: ${input.senderName}`,
    `Email: ${input.senderEmail}`,
    `Subject: ${input.subject}`,
    "",
    "Message:",
    input.message,
    "",
    `Reply: ${input.senderEmail}`,
  ].join("\n");

  return { html, text };
}
