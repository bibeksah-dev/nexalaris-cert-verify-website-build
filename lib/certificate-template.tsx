export interface CertificateData {
  cert_code: string
  holder_name: string
  program_name: string
  issued_at: string
  expires_at: string | null
  signature_hash: string | null
  qr_code_data_url: string
  logo_url: string
}

export function generateCertificateHTML(data: CertificateData): string {
  const formattedIssueDate = new Date(data.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedExpiryDate = data.expires_at
    ? new Date(data.expires_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No Expiry"

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            width: 1122px;
            height: 794px;
            background: linear-gradient(135deg, #0B0C10 0%, #1a1d29 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            position: relative;
            overflow: hidden;
          }

          /* Animated background effect */
          .bg-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.05;
            background-image: 
              radial-gradient(circle at 20% 30%, #12E8D5 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, #8E2DE2 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, #FF6B35 0%, transparent 50%);
          }

          /* Glass container */
          .container {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 60px 80px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          /* Header with logo */
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .logo {
            width: 180px;
            height: auto;
          }

          .cert-id {
            font-size: 14px;
            color: rgba(243, 247, 250, 0.5);
            font-family: monospace;
            letter-spacing: 1px;
          }

          /* Main content */
          .content {
            text-align: center;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 30px;
          }

          .title {
            font-size: 48px;
            font-weight: 700;
            background: linear-gradient(90deg, #12E8D5 0%, #8E2DE2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: 2px;
            margin-bottom: 20px;
          }

          .subtitle {
            font-size: 20px;
            color: rgba(243, 247, 250, 0.7);
            margin-bottom: 40px;
          }

          .holder-name {
            font-size: 56px;
            font-weight: 800;
            color: #F3F7FA;
            margin: 20px 0;
            text-shadow: 0 0 30px rgba(18, 232, 213, 0.3);
          }

          .program-name {
            font-size: 32px;
            font-weight: 600;
            color: #12E8D5;
            margin-bottom: 30px;
          }

          .dates {
            display: flex;
            justify-content: center;
            gap: 60px;
            margin-top: 20px;
          }

          .date-block {
            text-align: center;
          }

          .date-label {
            font-size: 14px;
            color: rgba(243, 247, 250, 0.5);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }

          .date-value {
            font-size: 18px;
            color: #F3F7FA;
            font-weight: 600;
          }

          /* Footer */
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }

          .signature-section {
            max-width: 400px;
          }

          .signature-label {
            font-size: 12px;
            color: rgba(243, 247, 250, 0.5);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }

          .signature-hash {
            font-size: 10px;
            color: rgba(243, 247, 250, 0.4);
            font-family: monospace;
            word-break: break-all;
            line-height: 1.6;
          }

          .issuer {
            font-size: 16px;
            color: #F3F7FA;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .qr-section {
            text-align: center;
          }

          .qr-code {
            width: 120px;
            height: 120px;
            padding: 8px;
            background: white;
            border-radius: 8px;
            margin-bottom: 8px;
          }

          .qr-label {
            font-size: 11px;
            color: rgba(243, 247, 250, 0.5);
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          /* Decorative elements */
          .corner-decoration {
            position: absolute;
            width: 100px;
            height: 100px;
            border: 2px solid;
            border-image: linear-gradient(135deg, #12E8D5, #8E2DE2) 1;
          }

          .corner-tl {
            top: 40px;
            left: 40px;
            border-right: none;
            border-bottom: none;
          }

          .corner-tr {
            top: 40px;
            right: 40px;
            border-left: none;
            border-bottom: none;
          }

          .corner-bl {
            bottom: 40px;
            left: 40px;
            border-right: none;
            border-top: none;
          }

          .corner-br {
            bottom: 40px;
            right: 40px;
            border-left: none;
            border-top: none;
          }
        </style>
      </head>
      <body>
        <div class="bg-pattern"></div>
        <div class="corner-decoration corner-tl"></div>
        <div class="corner-decoration corner-tr"></div>
        <div class="corner-decoration corner-bl"></div>
        <div class="corner-decoration corner-br"></div>
        
        <div class="container">
          <div class="header">
            <img src="${data.logo_url}" alt="Nexalaris Logo" class="logo" />
            <div class="cert-id">${data.cert_code}</div>
          </div>

          <div class="content">
            <div class="title">CERTIFICATE OF ACHIEVEMENT</div>
            <div class="subtitle">This is to certify that</div>
            <div class="holder-name">${data.holder_name}</div>
            <div class="subtitle">has successfully completed</div>
            <div class="program-name">${data.program_name}</div>
            
            <div class="dates">
              <div class="date-block">
                <div class="date-label">Issued On</div>
                <div class="date-value">${formattedIssueDate}</div>
              </div>
              <div class="date-block">
                <div class="date-label">Valid Until</div>
                <div class="date-value">${formattedExpiryDate}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="signature-section">
              <div class="issuer">Nexalaris Tech Private Limited</div>
              <div class="signature-label">Digital Signature</div>
              <div class="signature-hash">${data.signature_hash || "N/A"}</div>
            </div>
            
            <div class="qr-section">
              <img src="${data.qr_code_data_url}" alt="QR Code" class="qr-code" />
              <div class="qr-label">Scan to Verify</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}
