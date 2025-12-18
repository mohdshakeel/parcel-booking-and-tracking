// lib/sendMail.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing");
    }

    if (!to || !subject || !html) {
      throw new Error("Missing required email parameters");
    }

    const response = await resend.emails.send({
      from: "Eagle Parcel Book and Track <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("❌ Email send failed:", error);

    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}
