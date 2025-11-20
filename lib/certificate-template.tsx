export interface CertificateData {
  cert_code: string
  holder_name: string
  program_name: string
  issued_at: string
  expires_at: string | null
  signature_hash: string | null
  qr_code_data_url: string
  logo_url: string

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
<title>Nexalaris Certificate</title>

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
  background: radial-gradient(circle at 0% 0%, #0c1524 0%, #020617 45%, #020617 100%);
  font-family: "Space Grotesk", system-ui, sans-serif;
  position: relative;
  overflow: hidden;
  color: #F3F7FA;
}

/* ===== SECURITY LAYERS ===== */
.security-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

/* Guilloche pattern */
.security-layer::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image:
    radial-gradient(circle at 40% 35%, rgba(18, 232, 213, 0.22) 0%, transparent 55%),
    radial-gradient(circle at 65% 65%, rgba(142, 45, 226, 0.20) 0%, transparent 60%);
  filter: blur(0.8px);
}

/* Grid network pattern */
.security-layer::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image:
    linear-gradient(135deg, rgba(18, 232, 213, 0.28) 1px, transparent 1px),
    linear-gradient(225deg, rgba(142, 45, 226, 0.28) 1px, transparent 1px);
  background-size: 70px 70px;
}

/* ===== TRIPLE BORDER ===== */
.outer-frame {
  width: 100%;
  height: 100%;
  padding: 26px;
  position: relative;
  z-index: 1;
}

.border-teal {
  border-radius: 32px;
  border: 2px solid #12E8D5;
  width: 100%;
  height: 100%;
  padding: 8px;
}

.border-purple {
  border-radius: 28px;
  border: 2px solid #8E2DE2;
  width: 100%;
  height: 100%;
  padding: 8px;
}

.border-orange {
  border-radius: 24px;
  border: 2px solid #FF8A00;
  width: 100%;
  height: 100%;
  padding: 40px 60px;
  background:
    radial-gradient(circle at 20% 0%, rgba(18, 232, 213, 0.16), transparent 60%),
    radial-gradient(circle at 80% 100%, rgba(142, 45, 226, 0.24), transparent 60%),
    #020617;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ===== WATERMARK LOGO B ===== */
.watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
  pointer-events: none;
}

.watermark img {
  width: 360px;
  height: auto;
  opacity: 0.28;
  filter: blur(0.4px);
}

/* ===== HEADER ===== */
.header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
}

.header-logo {
  width: 360px;
  height: auto;
}

.title-bar {
  display: flex;
  justify-content: center;
}

.title-bar-inner {
  padding: 0;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #12E8D5;
}

/* ===== MAIN CONTENT ===== */
.content {
  flex: 1;
  position: relative;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding-top: 20px;
  padding-bottom: 20px;
}

.eyebrow {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(243, 247, 250, 0.7);
}

.holder-name {
  font-size: 56px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.04em;
  line-height: 1.1;
  text-shadow:
    0 0 16px rgba(18, 232, 213, 0.45),
    0 0 26px rgba(142, 45, 226, 0.3);
}

.subtitle {
  font-size: 16px;
  font-weight: 400;
  color: rgba(243, 247, 250, 0.72);
}

/* PROGRAM BAR */
.program-bar {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

.program-bar-inner {
  padding: 0;
}

.program-text {
  font-size: 30px;
  font-weight: 600;
  color: #FF8A00;
  line-height: 1.2;
}

/* ===== FOOTER ===== */
.footer {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: end;
  position: relative;
  z-index: 2;
  gap: 20px;
  padding-top: 8px;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: end;
}

.footer-label {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.14em;
  color: rgba(243, 247, 250, 0.65);
  text-transform: uppercase;
  line-height: 1;
}

.footer-value {
  font-size: 15px;
  font-weight: 600;
  color: #F3F7FA;
  line-height: 1.4;
}

.cert-id {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.14em;
  color: rgba(243, 247, 250, 0.6);
  text-transform: uppercase;
  line-height: 1;
}

.cert-id-value {
  font-size: 13px;
  font-family: monospace;
  color: #12E8D5;
  margin-top: 4px;
  line-height: 1.4;
}

.qr-block {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.qr-img {
  width: 120px;
  height: 120px;
  padding: 10px;
  border-radius: 16px;
  background: #0F172A;
  border: 1px solid rgba(18, 232, 213, 0.7);
  margin: 0 auto 8px auto;
  box-shadow:
    0 0 12px rgba(18, 232, 213, 0.4),
    0 0 24px rgba(142, 45, 226, 0.25);
  display: block;
}

.qr-label {
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.14em;
  color: rgba(243, 247, 250, 0.6);
  text-transform: uppercase;
  line-height: 1.2;
}

.qr-url {
  margin-top: 3px;
  font-size: 10px;
  font-family: monospace;
  color: rgba(243, 247, 250, 0.45);
  line-height: 1.3;
  max-width: 180px;
  word-break: break-all;
}

.sig-block {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
}

.sig-img {
  width: 180px;
  height: auto;
  filter: brightness(2);
  margin-bottom: 6px;
  margin-left: auto;
}

.sig-line {
  width: 180px;
  height: 1px;
  background: linear-gradient(90deg, rgba(18, 232, 213, 0.4), rgba(142, 45, 226, 0.4));
  margin-bottom: 6px;
  margin-left: auto;
}

.sig-name {
  font-size: 13px;
  font-weight: 600;
  color: #F3F7FA;
  line-height: 1.4;
  letter-spacing: 0.02em;
}

.sig-title {
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(243, 247, 250, 0.7);
  line-height: 1.4;
  margin-top: 2px;
}
</style>
</head>

<body>

<div class="security-layer"></div>

<div class="outer-frame">
  <div class="border-teal">
    <div class="border-purple">
      <div class="border-orange">

        <div class="watermark">
          <img src="${symbolLogoUrl}">
        </div>

        <div class="header">
          <img src="${data.logo_url}" class="header-logo">
          <div class="title-bar">
            <div class="title-bar-inner">
              <div class="title-text">CERTIFICATE OF COMPLETION</div>
            </div>
          </div>
        </div>

        <div class="content">
          <div class="eyebrow">THIS CERTIFIES THAT</div>

          <div class="holder-name">${data.holder_name}</div>

          <div class="subtitle">has successfully completed</div>

          <div class="program-bar">
            <div class="program-bar-inner">
              <div class="program-text">${data.program_name}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <!-- LEFT -->
          <div class="footer-left">
            <div class="footer-label">Issued By</div>
            <div class="footer-value">${issuerName}</div>
            <div class="cert-id" style="margin-top: 8px;">Issued On</div>
            <div class="footer-value">${formattedIssueDate}</div>
            <div class="cert-id">Certificate ID</div>
            <div class="cert-id-value">${data.cert_code}</div>
          </div>

          <!-- CENTER: QR -->
          <div class="qr-block">
            <img src="${data.qr_code_data_url}" class="qr-img">
            <div class="qr-label">Scan to Verify</div>
            <div class="qr-url">https://verify.nexalaris.com/c/${data.cert_code}</div>
          </div>

          <!-- RIGHT: SIGNATURE -->
          <div class="sig-block">
            <img src="${signatureImageUrl}" class="sig-img">
            <div class="sig-line"></div>
            <div class="sig-name">BIBEK KUMAR SAH</div>
            <div class="sig-title">CEO, CTO & FOUNDER</div>
          </div>

        </div>

      </div>
    </div>
  </div>
</div>

</body>
</html>
`
}
