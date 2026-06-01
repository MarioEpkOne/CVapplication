import { Resend } from "resend";
import { toPlainText } from "./sanitize";

let resendClient: Resend | null = null;
let warnedNoKey = false;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (!warnedNoKey) {
      console.warn(
        "[email] RESEND_API_KEY is not set — email notifications disabled. Messages will still be stored in the DB."
      );
      warnedNoKey = true;
    }
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  company?: string;
}

export interface EmailResult {
  sent: boolean;
  reason?: string;
}

/**
 * Sends a contact notification email to Mario.
 *
 * This function NEVER throws — email failure is tolerated so that a successful
 * DB insert is not undone. Callers should check `sent` and log if needed.
 */
export async function sendContactNotification(payload: ContactPayload): Promise<EmailResult> {
  const client = getClient();
  if (!client) {
    return { sent: false, reason: "no-api-key" };
  }

  const from =
    process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const to = process.env.CONTACT_NOTIFY_TO ?? "mario.alina11@gmail.com";

  // Derive plaintext (un-escaped) values for the email only. The DB keeps the
  // HTML-escaped values; here we want a human to read `Mario's`, not `Mario&#x27;s`.
  // The subject must be single-line (a newline in name would mangle it).
  const name = toPlainText(payload.name, 120, { singleLine: true });
  const email = toPlainText(payload.email, 254, { singleLine: true });
  const company = payload.company
    ? toPlainText(payload.company, 200, { singleLine: true })
    : null;
  const message = toPlainText(payload.message, 5000); // keep newlines

  const body = [
    `New contact form submission`,
    ``,
    `Name:    ${name}`,
    `Email:   ${email}`,
    company ? `Company: ${company}` : null,
    ``,
    `Message:`,
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const result = await client.emails.send({
      from,
      to,
      subject: `[CV Contact] Message from ${name}`,
      text: body,
    });

    if (result.error) {
      console.error("[email] Resend API error:", result.error);
      return { sent: false, reason: result.error.message };
    }

    return { sent: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[email] Unexpected error sending notification:", reason);
    return { sent: false, reason };
  }
}
