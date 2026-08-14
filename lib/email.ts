import { Resend } from "resend"
import { escapeHtml } from "./certificate-template"

const resend = new Resend(process.env.RESEND_API_KEY)

const SENDER_EMAIL = "noreply@nexalaris.com"
const DEFAULT_SITE_URL = "https://verifycert.nexalaris.com"

function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!envUrl) return DEFAULT_SITE_URL

  // Ensure URL has protocol
  if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
    return envUrl
  }
  // For localhost, use http; for production, use https
  if (envUrl.includes("localhost") || envUrl.startsWith("127.0.0.1")) {
    return `http://${envUrl}`
  }
  return `https://${envUrl}`
}

interface CertificateEmailParams {
  holder_name: string
  holder_email: string
  cert_code: string
  program_name: string
}

export async function sendCertificateIssuedEmail({
  holder_name,
  holder_email,
  cert_code,
  program_name,
}: CertificateEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!holder_email) {
    return { success: false, error: "No email address provided" }
  }

  const siteUrl = getSiteUrl()
  const verificationUrl = `${siteUrl}/c/${cert_code}`

  // The email body is HTML: escape every interpolated field so a holder name
  // like `<img onerror=...>` cannot inject markup into the message.
  const safeHolderName = escapeHtml(holder_name)
  const safeProgramName = escapeHtml(program_name)
  const safeCertCode = escapeHtml(cert_code)

  console.log(`Generating email with verification URL: ${verificationUrl}`)

  try {
    const { error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: holder_email,
      subject: `Your Certificate Has Been Issued - ${program_name}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Certificate Has Been Issued</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #020617;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #020617;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #0F172A; border-radius: 12px;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #1E293B;">
              <h1 style="margin: 0; color: #12E8D5; font-size: 24px; font-weight: 700;">Nexalaris Tech</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #F3F7FA; font-size: 24px; font-weight: 600;">
                Congratulations, ${safeHolderName}!
              </h2>

              <p style="margin: 0 0 25px; color: #94A3B8; font-size: 16px; line-height: 1.6;">
                We are pleased to inform you that your certificate has been successfully issued for completing:
              </p>

              <p style="margin: 0 0 30px; color: #FF8A00; font-size: 20px; font-weight: 600;">
                ${safeProgramName}
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px; background-color: #1E293B; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 5px; color: #94A3B8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Certificate ID</p>
                    <p style="margin: 0; color: #12E8D5; font-size: 18px; font-family: monospace; font-weight: 600;">${safeCertCode}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 25px; color: #94A3B8; font-size: 16px; line-height: 1.6;">
                You can view, download, and share your certificate anytime using the button below:
              </p>

              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td>
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; background-color: #12E8D5; color: #020617; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">View Certificate</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748B; font-size: 14px;">
                Or copy this link: <a href="${verificationUrl}" target="_blank" style="color: #12E8D5; text-decoration: none;">${verificationUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #1E293B;">
              <p style="margin: 0 0 10px; color: #64748B; font-size: 14px;">
                Thank you for choosing Nexalaris Tech.
              </p>
              <p style="margin: 0; color: #475569; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Nexalaris Tech Private Limited. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    if (error) {
      console.error("Failed to send certificate email:", error)
      return { success: false, error: error.message }
    }

    console.log(`Certificate email sent successfully to ${holder_email} for ${cert_code}`)
    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.error("Error sending certificate email:", errorMessage)
    return { success: false, error: errorMessage }
  }
}
