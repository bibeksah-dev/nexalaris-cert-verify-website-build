export interface CertificateData {
  cert_code: string
  holder_name: string
  program_name: string
  issued_at: string
  expires_at: string | null // kept for compatibility; not rendered
  signature_hash: string | null
  qr_code_data_url: string
  logo_url: string

  // Optional – for future flexibility
  logo_symbol_url?: string
  signature_image_url?: string
  issuer_name?: string
}

export function generateCertificateHTML(data: CertificateData): string {
  const formattedIssueDate = new Date(data.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const issuerName = data.issuer_name || "Nexalaris Tech Private Limited"
  const symbolLogoUrl = data.logo_symbol_url || data.logo_url
  const signatureImageUrl = data.signature_image_url || "/signature.png"

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Nexalaris Tech Certificate</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body {
            width: 1122px;
            height: 794px;
          }
          
          body {
            background: radial-gradient(circle at 0% 0%, #111827 0%, #020617 40%, #020617 100%);
            font-family: "Space Grotesk", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            position: relative;
            overflow: hidden;
            color: #F3F7FA;
          }

          /* Security background layers */
          .security-layer {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 0;
          }

          /* Guilloche-style pattern */
          .security-layer::before {
            content: "";
            position: absolute;
            inset: 8%;
            opacity: 0.10;
            background-image:
              radial-gradient(circle at 50% 50%, transparent 0, transparent 30%, rgba(18, 232, 213, 0.5) 31%, transparent 32%),
              repeating-conic-gradient(
                from 0deg,
                rgba(18, 232, 213, 0.16) 0deg 4deg,
                rgba(142, 45, 226, 0.16) 4deg 8deg
              );
            mix-blend-mode: screen;
            filter: blur(1px);
          }

          /* Circuit / polygon network */
          .security-layer::after {
            content: "";
            position: absolute;
            inset: 10%;
            opacity: 0.14;
            background-image:
              linear-gradient(135deg, rgba(18, 232, 213, 0.4) 1px, transparent 1px),
              linear-gradient(225deg, rgba(142, 45, 226, 0.4) 1px, transparent 1px);
            background-size: 70px 70px;
            mask-image: radial-gradient(circle at 50% 20%, transparent 0, #000 40%, #000 70%, transparent 100%);
          }

          /* Triple border container */
          .outer-frame {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 26px;
            z-index: 1;
          }

          .border-teal {
            width: 100%;
            height: 100%;
            border-radius: 32px;
            border: 2px solid #12E8D5;
            padding: 10px;
          }

          .border-purple {
            width: 100%;
            height: 100%;
            border-radius: 26px;
            border: 2px solid #8E2DE2;
            padding: 10px;
          }

          .border-orange {
            width: 100%;
            height: 100%;
            border-radius: 22px;
            border: 2px solid #FF8A00;
            padding: 40px 60px;
            background: radial-gradient(circle at 20% 0%, rgba(18, 232, 213, 0.15), transparent 60%),
                        radial-gradient(circle at 80% 100%, rgba(142, 45, 226, 0.22), transparent 60%),
                        #020617;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
          }

          /* Watermark logo */
          .watermark-logo {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 0;
            pointer-events: none;
          }

          .watermark-logo img {
            width: 420px;
            opacity: 0.30;
            filter: blur(0.3px);
          }

          /* Layout sections */
          .header {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .logo-full {
            max-width: 520px;
            height: auto;
          }

          .cert-title {
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            background: linear-gradient(90deg, #12E8D5 0%, #8E2DE2 50%, #FF8A00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .divider {
            width: 220px;
            height: 2px;
            border-radius: 999px;
            background: linear-gradient(90deg, #12E8D5, #8E2DE2, #FF8A00);
            margin-top: 4px;
          }

          .content {
            position: relative;
            z-index: 1;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 18px;
          }

          .eyebrow {
            font-size: 16px;
            font-weight: 400;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: rgba(243, 247, 250, 0.64);
          }

          .holder-name {
            font-size: 58px;
            font-weight: 700;
            letter-spacing: 0.06em;
            color: #FFFFFF;
            text-shadow:
              0 0 16px rgba(18, 232, 213, 0.35),
              0 0 32px rgba(142, 45, 226, 0.2);
          }

          .subtitle {
            font-size: 18px;
            color: rgba(243, 247, 250, 0.78);
          }

          .program-name {
            font-size: 40px;
            font-weight: 600;
            margin-top: 6px;
            background: linear-gradient(90deg, #12E8D5 0%, #8E2DE2 60%, #FF8A00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .meta-row {
            margin-top: 22px;
            display: flex;
            justify-content: center;
            gap: 80px;
          }

          .meta-block {
            text-align: center;
          }

          .meta-label {
            font-size: 13px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: rgba(243, 247, 250, 0.55);
            margin-bottom: 4px;
          }

          .meta-value {
            font-size: 16px;
            font-weight: 500;
            color: #F9FAFB;
          }

          .footer {
            position: relative;
            z-index: 1;
            display: grid;
            grid-template-columns: 1.1fr 0.9fr 1.1fr;
            align-items: end;
            column-gap: 40px;
          }

          .issuer-block {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .issuer-label {
            font-size: 12px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: rgba(243, 247, 250, 0.6);
          }

          .issuer-name {
            font-size: 16px;
            font-weight: 600;
          }

          .cert-id {
            font-size: 12px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: rgba(243, 247, 250, 0.6);
            margin-top: 10px;
          }

          .cert-id-value {
            font-size: 14px;
            font-family: monospace;
            color: #12E8D5;
          }

          .qr-section {
            text-align: center;
          }

          .qr-code {
            width: 120px;
            height: 120px;
            padding: 10px;
            background: #0F172A;
            border-radius: 16px;
            border: 1px solid rgba(18, 232, 213, 0.7);
            box-shadow:
              0 0 12px rgba(18, 232, 213, 0.4),
              0 0 24px rgba(142, 45, 226, 0.3);
            margin: 0 auto 8px auto;
          }

          .qr-label {
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: rgba(243, 247, 250, 0.7);
          }

          .qr-url {
            margin-top: 2px;
            font-size: 10px;
            color: rgba(243, 247, 250, 0.45);
            font-family: monospace;
            max-width: 200px;
            margin-left: auto;
            margin-right: auto;
            word-break: break-all;
          }

          .signature-block {
            text-align: right;
          }

          .signature-image {
            width: 180px;
            height: auto;
            margin-bottom: 6px;
            filter: invert(1) brightness(2);
          }

          .signature-line {
            width: 180px;
            height: 1px;
            background: linear-gradient(90deg, rgba(18, 232, 213, 0.2), rgba(142, 45, 226, 0.7));
            margin-bottom: 6px;
            margin-left: auto;
          }

          .signature-name {
            font-size: 13px;
            font-weight: 600;
          }

          .signature-title {
            font-size: 11px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: rgba(243, 247, 250, 0.7);
          }

          .signature-hash-label {
            margin-top: 8px;
            font-size: 10px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: rgba(243, 247, 250, 0.5);
          }

          .signature-hash {
            margin-top: 2px;
            font-size: 9px;
            color: rgba(243, 247, 250, 0.42);
            font-family: monospace;
            max-width: 260px;
            word-break: break-all;
            margin-left: auto;
          }
        </style>
      </head>
      <body>
        <div class="security-layer"></div>

        <div class="outer-frame">
          <div class="border-teal">
            <div class="border-purple">
              <div class="border-orange">
                <div class="watermark-logo">
                  <img src="${symbolLogoUrl}" alt="Nexalaris Symbol Watermark" />
                </div>

                <!-- HEADER -->
                <header class="header">
                  <img src="${data.logo_url}" alt="Nexalaris Logo" class="logo-full" />
                  <div class="cert-title">CERTIFICATE OF COMPLETION</div>
                  <div class="divider"></div>
                </header>

                <!-- MAIN CONTENT -->
                <main class="content">
                  <div class="eyebrow">THIS CERTIFIES THAT</div>
                  <div class="holder-name">${data.holder_name}</div>
                  <div class="subtitle">has successfully completed</div>
                  <div class="program-name">${data.program_name}</div>

                  <div class="meta-row">
                    <div class="meta-block">
                      <div class="meta-label">Issued On</div>
                      <div class="meta-value">${formattedIssueDate}</div>
                    </div>
                  </div>
                </main>

                <!-- FOOTER -->
                <footer class="footer">
                  <div class="issuer-block">
                    <div class="issuer-label">Issued By</div>
                    <div class="issuer-name">${issuerName}</div>
                    <div class="cert-id">Certificate ID</div>
                    <div class="cert-id-value">${data.cert_code}</div>
                  </div>

                  <div class="qr-section">
                    <img src="${data.qr_code_data_url}" alt="Verification QR Code" class="qr-code" />
                    <div class="qr-label">Scan to Verify</div>
                    <div class="qr-url">https://verify.nexalaris.com/c/${data.cert_code}</div>
                  </div>

                  <div class="signature-block">
                    <img src="${signatureImageUrl}" alt="Authorized Signature" class="signature-image" />
                    <div class="signature-line"></div>
                    <div class="signature-name">Bibek Kumar Sah</div>
                    <div class="signature-title">Founder & CTO, Nexalaris Tech</div>
                    ${
                      data.signature_hash
                        ? `<div class="signature-hash-label">Digital Signature Hash</div>
                           <div class="signature-hash">${data.signature_hash}</div>`
                        : ""
                    }
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}
