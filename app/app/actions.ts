"use server";

import { prisma } from "@/lib/prisma";
import { buildContactEmailTemplate } from "@/lib/contact-email-template";
import { sendMail } from "@/lib/mailer";
import type { ContactFormState } from "./contact-form-state";

function getField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContactFormAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const profileId = getField(formData, "profileId");
  const senderName = getField(formData, "name");
  const senderEmail = getField(formData, "email");
  const subject = getField(formData, "subject");
  const message = getField(formData, "message");

  if (!profileId || !senderName || !senderEmail || !subject || !message) {
    return {
      status: "error",
      message: "Please fill in all contact form fields.",
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(senderEmail)) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { contactInfo: true },
    });

    const receiverEmail = profile?.contactInfo?.email ?? process.env.CONTACT_TO_EMAIL ?? "";
    const receiverName =
      profile?.fullName ??
      process.env.CONTACT_RECEIVER_NAME ??
      "Portfolio Owner";

    if (!receiverEmail) {
      return {
        status: "error",
        message: "Contact email is not configured yet.",
      };
    }

    const { html, text } = buildContactEmailTemplate({
      receiverName,
      senderName,
      senderEmail,
      subject,
      message,
    });

    await sendMail({
      to: receiverEmail,
      replyTo: senderEmail,
      subject: `Portfolio Contact: ${subject}`,
      html,
      text,
    });

    return {
      status: "success",
      message: "Your message was sent successfully.",
    };
  } catch (error) {
    console.error("Contact form email failed", error);

    return {
      status: "error",
      message: "Something went wrong while sending your message.",
    };
  }
}
